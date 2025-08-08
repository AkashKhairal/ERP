import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Pages
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import TeamDashboard from './pages/Teams/TeamDashboard';
import Finance from './pages/Finance/Finance';
import Analytics from './pages/Analytics/Analytics';
import Content from './pages/Content/Content';
import Integrations from './pages/Integrations/Integrations';
import Profile from './pages/Profile/Profile';
import RolesPermissions from './pages/RolesPermissions/RolesPermissions';

// HR Pages
import HRDashboard from './pages/HR/HRDashboard';
import EmployeeManagement from './pages/HR/EmployeeManagement';
import AttendanceTracking from './pages/HR/AttendanceTracking';
import LeaveManagement from './pages/HR/LeaveManagement';
import PayrollManagement from './pages/HR/PayrollManagement';

// Project Pages
import ProjectList from './pages/Projects/ProjectList';
import ProjectDashboard from './pages/Projects/ProjectDashboard';
import ProjectCreate from './pages/Projects/ProjectCreate';

// Task Pages
import KanbanBoard from './pages/Tasks/KanbanBoard';

// Sprint Pages
import SprintPlanning from './pages/Sprints/SprintPlanning';

// Styles
import './index.css';

function App() {
  return (
    <GoogleOAuthProvider clientId="852792982943-iadr4llqoiigtpkqc2blcfq25q00plv6.apps.googleusercontent.com">
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="teams" element={<TeamDashboard />} />
              <Route path="finance" element={<Finance />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="content" element={<Content />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="profile" element={<Profile />} />
              <Route path="roles-permissions" element={<RolesPermissions />} />
              
              {/* HR routes */}
              <Route path="hr" element={<HRDashboard />} />
              <Route path="hr/employees" element={<EmployeeManagement />} />
              <Route path="hr/attendance" element={<AttendanceTracking />} />
              <Route path="hr/leaves" element={<LeaveManagement />} />
              <Route path="hr/payroll" element={<PayrollManagement />} />
              
              {/* Project routes */}
              <Route path="projects" element={<ProjectList />} />
              <Route path="projects/:id" element={<ProjectDashboard />} />
              <Route path="projects/create" element={<ProjectCreate />} />
              
              {/* Task routes */}
              <Route path="tasks" element={<KanbanBoard />} />
              
              {/* Sprint routes */}
              <Route path="sprints" element={<SprintPlanning />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App; 