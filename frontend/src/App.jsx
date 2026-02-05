import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PatientProfile from './pages/PatientProfile';
import Analyze from './pages/Analyze';
import Patients from './pages/Patients'; // ✅ ADD
import ExecuteAnalysis from './pages/ExecuteAnalysis';

const ProtectedRoute = ({ children }) => {
  const user = useStore((state) => state.user);
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Layout = ({ children }) => (
  <div className="flex h-screen bg-background overflow-hidden">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  </div>
);

function App() {
  const fetchPatients = useStore((state) => state.fetchPatients);

  React.useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/patients" element={           /* ✅ ADD */
          <ProtectedRoute>
            <Layout><Patients /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/patient/:id" element={
          <ProtectedRoute>
            <Layout><PatientProfile /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/analyze" element={            /* ✅ ADD */
          <ProtectedRoute>
            <Layout><Analyze /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/analyze/:patientId" element={
          <ProtectedRoute>
            <Layout><ExecuteAnalysis /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
