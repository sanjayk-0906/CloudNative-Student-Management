import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import Architecture from './pages/Architecture';

// Protected Route Wrapper for College Demo
function ProtectedLayout({ children, title }) {
  const isAuth = localStorage.getItem('isAdminAuthenticated') === 'true';

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title={title} />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  // Set default demo authentication if not present to make testing seamless
  useEffect(() => {
    if (!localStorage.getItem('isAdminAuthenticated')) {
      localStorage.setItem('isAdminAuthenticated', 'true');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Academic & Cloud Routes */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedLayout title="Cloud Operations Dashboard">
              <Dashboard />
            </ProtectedLayout>
          } 
        />

        <Route 
          path="/students" 
          element={
            <ProtectedLayout title="Student Directory">
              <Students />
            </ProtectedLayout>
          } 
        />

        <Route 
          path="/students/:id" 
          element={
            <ProtectedLayout title="Student Profile & Academic Card">
              <StudentDetail />
            </ProtectedLayout>
          } 
        />

        <Route 
          path="/attendance" 
          element={
            <ProtectedLayout title="Attendance & Compliance Manager">
              <Attendance />
            </ProtectedLayout>
          } 
        />

        <Route 
          path="/marks" 
          element={
            <ProtectedLayout title="Marks & Semester Evaluation">
              <Marks />
            </ProtectedLayout>
          } 
        />

        <Route 
          path="/architecture" 
          element={
            <ProtectedLayout title="AWS Cloud Infrastructure & DA2 Mapping">
              <Architecture />
            </ProtectedLayout>
          } 
        />

        {/* Fallback to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
