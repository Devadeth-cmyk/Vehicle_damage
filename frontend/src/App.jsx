import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyVehicles from './pages/MyVehicles';
import MyClaims from './pages/MyClaims';
import NewClaim from './pages/NewClaim';
import ClaimDetails from './pages/ClaimDetails';
import Documents from './pages/Documents';
import InsuranceAssistant from './pages/InsuranceAssistant';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Customer Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/vehicles"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyVehicles />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/claims"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyClaims />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/claims/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NewClaim />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/claims/:claimId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ClaimDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Assessment and Package specific direct route aliases */}
            <Route
              path="/assessment/:claimId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ClaimDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/package/:claimId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ClaimDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Documents />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/assistant"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InsuranceAssistant />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Root Default & Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
