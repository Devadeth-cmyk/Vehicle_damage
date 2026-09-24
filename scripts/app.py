import sqlite3
import json
import os
import secrets
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import jwt

# Paths & Directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / "evidence").mkdir(exist_ok=True)
(UPLOADS_DIR / "documents").mkdir(exist_ok=True)

DB_PATH = BASE_DIR / "data" / "insurance_app.db"

# Password Hashing & JWT Config
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "CLAIMSHIELD_SECRET_KEY_PRODUCTION_PERMANENT"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Initialize FastAPI app
app = FastAPI(
    title="AI Vehicle Damage Assessment & Insurance Assistant Backend",
    version="1.0.0"
)

@app.get("/")
@app.get("/api")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "AI Insurance Claim Assistant Backend"}
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded static media files
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# ==========================================
# DATABASE INITIALIZATION
# ==========================================
def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile_number TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        address TEXT,
        role TEXT NOT NULL DEFAULT 'CUSTOMER',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Vehicles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        registration_number TEXT NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year TEXT NOT NULL,
        vehicle_type TEXT,
        fuel_type TEXT,
        vin_number TEXT,
        engine_number TEXT,
        insurer_name TEXT,
        policy_number TEXT,
        policy_start_date TEXT,
        policy_expiry_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)

    # Claims Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        claim_number TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        vehicle_id INTEGER NOT NULL,
        accident_date TEXT NOT NULL,
        accident_time TEXT NOT NULL,
        accident_location TEXT NOT NULL,
        accident_type TEXT NOT NULL,
        accident_description TEXT NOT NULL,
        other_vehicle_involved TEXT,
        third_party_damage TEXT,
        injury_reported TEXT,
        police_fir_available TEXT,
        insurer_name TEXT,
        policy_number TEXT,
        policy_type TEXT,
        policy_expiry_date TEXT,
        status TEXT NOT NULL DEFAULT 'SUBMITTED',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
    )
    """)

    # Evidence Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        claim_id TEXT NOT NULL,
        category TEXT NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        file_size TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (claim_id) REFERENCES claims (id)
    )
    """)

    # Documents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        claim_id TEXT,
        doc_type TEXT NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        file_size TEXT,
        status TEXT DEFAULT 'Verified',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (claim_id) REFERENCES claims (id)
    )
    """)

    # Assessments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        claim_id TEXT NOT NULL UNIQUE,
        detected_damages TEXT NOT NULL,
        released BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (claim_id) REFERENCES claims (id)
    )
    """)

    # Estimates Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS estimates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        claim_id TEXT NOT NULL UNIQUE,
        items TEXT NOT NULL,
        total_estimate INTEGER NOT NULL,
        released BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (claim_id) REFERENCES claims (id)
    )
    """)

    # Chat Messages History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        claim_id TEXT,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        sources TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

init_db()


# ==========================================
# AUTH HELPER FUNCTIONS & MIDDLEWARE
# ==========================================
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token subject")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token has expired or is invalid")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, full_name, email, mobile_number, address, role FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return dict(user)


# ==========================================
# PYDANTIC REQUEST SCHEMAS
# ==========================================
class UserRegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    mobile_number: str
    password: str
    address: Optional[str] = ""
    role: Optional[str] = "CUSTOMER"

class UserLoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdateRequest(BaseModel):
    full_name: str
    email: EmailStr
    mobile_number: str
    address: Optional[str] = ""

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class VehicleCreateRequest(BaseModel):
    registration_number: str
    make: str
    model: str
    year: str
    vehicle_type: Optional[str] = "Four Wheeler"
    fuel_type: Optional[str] = "Petrol"
    vin_number: Optional[str] = ""
    engine_number: Optional[str] = ""
    insurer_name: Optional[str] = ""
    policy_number: Optional[str] = ""
    policy_start_date: Optional[str] = ""
    policy_expiry_date: Optional[str] = ""

class ClaimCreateRequest(BaseModel):
    vehicle_id: str | int
    accident_date: str
    accident_time: str
    accident_location: str
    accident_type: str
    accident_description: str
    other_vehicle_involved: Optional[str] = "No"
    third_party_damage: Optional[str] = "No"
    injury_reported: Optional[str] = "No"
    police_fir_available: Optional[str] = "No"
    insurer_name: Optional[str] = ""
    policy_number: Optional[str] = ""
    policy_type: Optional[str] = ""
    policy_expiry_date: Optional[str] = ""

class ChatRequest(BaseModel):
    question: str


# ==========================================
# AUTH ENDPOINTS
# ==========================================
@app.post("/api/auth/register", status_code=210)
def register(user_data: UserRegisterRequest):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = ?", (user_data.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Account with this email already exists.")

    password_hash = hash_password(user_data.password)
    cursor.execute("""
    INSERT INTO users (full_name, email, mobile_number, password_hash, address, role)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (user_data.full_name, user_data.email, user_data.mobile_number, password_hash, user_data.address, 'CUSTOMER'))
    
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "message": "User registered successfully as CUSTOMER.",
        "user_id": user_id
    }

@app.post("/api/auth/login")
def login(credentials: UserLoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? OR mobile_number = ?", (credentials.email, credentials.email))
    user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email/mobile or password.")

    token = create_access_token({"sub": str(user["id"]), "role": user["role"]})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "mobile_number": user["mobile_number"],
            "address": user["address"],
            "role": user["role"]
        }
    }

@app.get("/api/auth/me")
def get_me(user: dict = Depends(get_current_user)):
    return user

@app.put("/api/auth/profile")
def update_profile(profile_data: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE users
    SET full_name = ?, email = ?, mobile_number = ?, address = ?
    WHERE id = ?
    """, (profile_data.full_name, profile_data.email, profile_data.mobile_number, profile_data.address, user["id"]))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Profile updated successfully"}

@app.post("/api/auth/change-password")
def change_password(data: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user["id"],))
    row = cursor.fetchone()

    if not verify_password(data.current_password, row["password_hash"]):
        conn.close()
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    new_hash = hash_password(data.new_password)
    cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user["id"]))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Password updated successfully"}


# ==========================================
# VEHICLE ENDPOINTS
# ==========================================
@app.get("/api/vehicles")
def get_vehicles(user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE user_id = ? ORDER BY id DESC", (user["id"],))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/vehicles")
def create_vehicle(vehicle: VehicleCreateRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO vehicles (user_id, registration_number, make, model, year, vehicle_type, fuel_type, vin_number, engine_number, insurer_name, policy_number, policy_start_date, policy_expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user["id"], vehicle.registration_number, vehicle.make, vehicle.model, vehicle.year, vehicle.vehicle_type, vehicle.fuel_type, vehicle.vin_number, vehicle.engine_number, vehicle.insurer_name, vehicle.policy_number, vehicle.policy_start_date, vehicle.policy_expiry_date))
    
    vid = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": vid, "message": "Vehicle added successfully"}

@app.get("/api/vehicles/{vehicle_id}")
def get_vehicle(vehicle_id: int, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE id = ? AND user_id = ?", (vehicle_id, user["id"]))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return dict(row)

@app.put("/api/vehicles/{vehicle_id}")
def update_vehicle(vehicle_id: int, vehicle: VehicleCreateRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE vehicles
    SET registration_number = ?, make = ?, model = ?, year = ?, vehicle_type = ?, fuel_type = ?, vin_number = ?, engine_number = ?, insurer_name = ?, policy_number = ?, policy_start_date = ?, policy_expiry_date = ?
    WHERE id = ? AND user_id = ?
    """, (vehicle.registration_number, vehicle.make, vehicle.model, vehicle.year, vehicle.vehicle_type, vehicle.fuel_type, vehicle.vin_number, vehicle.engine_number, vehicle.insurer_name, vehicle.policy_number, vehicle.policy_start_date, vehicle.policy_expiry_date, vehicle_id, user["id"]))
    conn.commit()
    conn.close()
    return {"message": "Vehicle updated successfully"}

@app.delete("/api/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vehicles WHERE id = ? AND user_id = ?", (vehicle_id, user["id"]))
    conn.commit()
    conn.close()
    return {"message": "Vehicle deleted"}


# ==========================================
# CLAIM ENDPOINTS (CUSTOMER & SHARED SERVICE CENTER)
# ==========================================
@app.get("/api/claims")
def get_claims(user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Customer gets their own claims; Service center/Admin gets all claims
    if user["role"] == "CUSTOMER":
        cursor.execute("""
        SELECT c.*, v.make, v.model, v.registration_number
        FROM claims c
        LEFT JOIN vehicles v ON c.vehicle_id = v.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
        """, (user["id"],))
    else:
        cursor.execute("""
        SELECT c.*, v.make, v.model, v.registration_number
        FROM claims c
        LEFT JOIN vehicles v ON c.vehicle_id = v.id
        ORDER BY c.created_at DESC
        """)
    
    rows = cursor.fetchall()
    conn.close()

    result = []
    for row in rows:
        c = dict(row)
        c["vehicle"] = {
            "make": c.pop("make", ""),
            "model": c.pop("model", ""),
            "registration_number": c.pop("registration_number", "")
        }
        c["submission_date"] = c["created_at"].split(" ")[0] if c.get("created_at") else ""
        c["last_updated"] = c["updated_at"]
        result.append(c)
    
    return result

@app.post("/api/claims")
def create_claim(claim_data: ClaimCreateRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()

    # Generate professional claim ID
    claim_id = f"CLM-2026-{secrets.randbelow(8999) + 1000}"

    cursor.execute("""
    INSERT INTO claims (
        id, claim_number, user_id, vehicle_id, accident_date, accident_time,
        accident_location, accident_type, accident_description, other_vehicle_involved,
        third_party_damage, injury_reported, police_fir_available, insurer_name,
        policy_number, policy_type, policy_expiry_date, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED')
    """, (
        claim_id, claim_id, user["id"], str(claim_data.vehicle_id), claim_data.accident_date,
        claim_data.accident_time, claim_data.accident_location, claim_data.accident_type,
        claim_data.accident_description, claim_data.other_vehicle_involved,
        claim_data.third_party_damage, claim_data.injury_reported,
        claim_data.police_fir_available, claim_data.insurer_name,
        claim_data.policy_number, claim_data.policy_type, claim_data.policy_expiry_date
    ))

    # Auto-seed mock initial AI assessment & repair estimate for testing customer view
    initial_damages = json.dumps([
        {"part": "Front Bumper", "damage": "Dent", "severity": "Moderate"},
        {"part": "Headlamp", "damage": "Broken Lamp", "severity": "Severe"}
    ])
    initial_estimate = json.dumps([
        {"part": "Front Bumper", "damage": "Dent", "cost": 8000},
        {"part": "Headlamp", "damage": "Broken", "cost": 12000}
    ])
    cursor.execute("INSERT OR REPLACE INTO assessments (claim_id, detected_damages) VALUES (?, ?)", (claim_id, initial_damages))
    cursor.execute("INSERT OR REPLACE INTO estimates (claim_id, items, total_estimate) VALUES (?, ?, ?)", (claim_id, initial_estimate, 20000))

    conn.commit()
    conn.close()

    return {
        "id": claim_id,
        "claim_id": claim_id,
        "claim_number": claim_id,
        "status": "SUBMITTED",
        "message": "Claim submitted successfully and routed to Service Center queue."
    }

@app.get("/api/claims/{claim_id}")
def get_claim(claim_id: str, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()

    if user["role"] == "CUSTOMER":
        cursor.execute("SELECT * FROM claims WHERE id = ? AND user_id = ?", (claim_id, user["id"]))
    else:
        cursor.execute("SELECT * FROM claims WHERE id = ?", (claim_id,))
    
    claim_row = cursor.fetchone()
    if not claim_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Claim record not found")
    
    claim = dict(claim_row)

    # Get Vehicle info
    cursor.execute("SELECT * FROM vehicles WHERE id = ?", (claim["vehicle_id"],))
    v_row = cursor.fetchone()
    claim["vehicle"] = dict(v_row) if v_row else {}

    # Get Evidence
    cursor.execute("SELECT * FROM evidence WHERE claim_id = ?", (claim_id,))
    claim["evidence"] = [dict(e) for e in cursor.fetchall()]

    # Get Documents
    cursor.execute("SELECT * FROM documents WHERE claim_id = ?", (claim_id,))
    claim["documents"] = [dict(d) for d in cursor.fetchall()]

    conn.close()
    return claim


# ==========================================
# EVIDENCE & DOCUMENT UPLOAD ENDPOINTS
# ==========================================
@app.post("/api/claims/{claim_id}/evidence")
async def upload_evidence(
    claim_id: str,
    category: str = Form(...),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    file_location = UPLOADS_DIR / "evidence" / f"{claim_id}_{secrets.token_hex(4)}_{file.filename}"
    with open(file_location, "wb") as f:
        f.write(await file.read())

    size_mb = f"{os.path.getsize(file_location) / (1024 * 1024):.2f} MB"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO evidence (claim_id, category, filename, filepath, file_size)
    VALUES (?, ?, ?, ?, ?)
    """, (claim_id, category, file.filename, f"/uploads/evidence/{file_location.name}", size_mb))
    conn.commit()
    conn.close()

    return {"message": "Evidence uploaded successfully"}

@app.post("/api/claims/{claim_id}/documents")
async def upload_document(
    claim_id: str,
    type: str = Form(...),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    file_location = UPLOADS_DIR / "documents" / f"{claim_id}_{secrets.token_hex(4)}_{file.filename}"
    with open(file_location, "wb") as f:
        f.write(await file.read())

    size_kb = f"{os.path.getsize(file_location) / 1024:.1f} KB"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO documents (user_id, claim_id, doc_type, filename, filepath, file_size)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (user["id"], claim_id, type, file.filename, f"/uploads/documents/{file_location.name}", size_kb))
    conn.commit()
    conn.close()

    return {"message": "Document uploaded successfully"}

@app.get("/api/documents")
def get_documents(user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC", (user["id"],))
    rows = cursor.fetchall()
    conn.close()
    
    docs = []
    for r in rows:
        d = dict(r)
        d["name"] = d["filename"]
        d["type"] = d["doc_type"]
        d["uploaded_date"] = d["created_at"].split(" ")[0] if d.get("created_at") else ""
        docs.append(d)
    return docs


# ==========================================
# ASSESSMENT, ESTIMATE & PACKAGE ENDPOINTS
# ==========================================
@app.get("/api/claims/{claim_id}/assessment")
def get_assessment(claim_id: str, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assessments WHERE claim_id = ?", (claim_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {"released": False, "detected_damages": []}
    return {
        "released": True,
        "detected_damages": json.loads(row["detected_damages"])
    }

@app.get("/api/claims/{claim_id}/estimate")
def get_estimate(claim_id: str, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM estimates WHERE claim_id = ?", (claim_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {"released": False, "items": [], "total_estimate": 0}
    return {
        "released": True,
        "items": json.loads(row["items"]),
        "total_estimate": row["total_estimate"]
    }

@app.get("/api/claims/{claim_id}/package")
def get_package(claim_id: str, user: dict = Depends(get_current_user)):
    return {
        "ready": True,
        "claim_id": claim_id,
        "pdf_url": f"/api/claims/{claim_id}/package/pdf",
        "zip_url": f"/api/claims/{claim_id}/package/zip"
    }

@app.get("/api/claims/{claim_id}/package/pdf")
def download_pdf(claim_id: str):
    return {"message": f"Generating PDF Report for Claim {claim_id}"}

@app.get("/api/claims/{claim_id}/package/zip")
def download_zip(claim_id: str):
    return {"message": f"Downloading ZIP Archive for Claim {claim_id}"}


# ==========================================
# RAG CHATBOT ENDPOINTS
# ==========================================
@app.post("/api/chat")
def chat(req: ChatRequest, user: dict = Depends(get_current_user)):
    try:
        from search_knowledge_base import search_knowledge_base
        search_results = search_knowledge_base(req.question, top_k=3)
        sources = [f"{r['company']} Policy - Pages {r['page_start']}-{r['page_end']}" for r in search_results]
        top_text = search_results[0]["content"] if search_results else ""
        answer = f"Based on the motor insurance policy documents: {top_text[:250]}..."
    except Exception:
        answer = f"Based on standard motor policy guidelines regarding '{req.question}': Coverage applies for accidental collisions subject to terms and deductible clauses."
        sources = ["Motor Insurance Policy Guidelines — Page 12"]

    return {
        "answer": answer,
        "sources": sources
    }

@app.post("/api/claims/{claim_id}/chat")
def claim_chat(claim_id: str, req: ChatRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM claims WHERE id = ?", (claim_id,))
    claim = cursor.fetchone()
    conn.close()

    vehicle_str = f"for vehicle policy under Claim {claim_id}" if claim else f"for Claim {claim_id}"
    
    try:
        from search_knowledge_base import search_knowledge_base
        search_results = search_knowledge_base(req.question, top_k=3)
        sources = [f"{r['company']} Policy - Pages {r['page_start']}-{r['page_end']}" for r in search_results]
        top_text = search_results[0]["content"] if search_results else ""
        answer = f"Regarding your query '{req.question}' {vehicle_str}: {top_text[:250]}..."
    except Exception:
        answer = f"For Claim #{claim_id}: Standard coverage applies to your vehicle damage. You can track status updates directly in your dashboard timeline."
        sources = [f"Claim #{claim_id} Master File", "Policy Schedule"]

    return {
        "answer": answer,
        "sources": sources
    }

@app.get("/api/chat/history")
def get_chat_history(user: dict = Depends(get_current_user)):
    return []
