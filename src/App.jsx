import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SetupMachinePage from './pages/SetupMachinePage/SetupMachinePage';
import CustomerPage from './pages/CustomerPage/CustomerPage';
import AdminPage from './pages/AdminPage/AdminPage';
import { useEffect, useState } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Auth/LoginPage';

function AppRoutes() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const branchId = localStorage.getItem('branch_id');
    const counterId = localStorage.getItem('counter_id');
    if (!branchId || !counterId) {
      navigate('/setup');
    }

    setIsChecking(false);
  }, [navigate]);

  if (isChecking) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<CustomerPage />} />
      <Route path="/setup" element={<SetupMachinePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
