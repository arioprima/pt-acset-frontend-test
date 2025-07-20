import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SetupMachinePage from './pages/SetupMachinePage/SetupMachinePage';
import CustomerPage from './pages/CustomerPage/CustomerPage';
import AdminPage from './pages/AdminPage/AdminPage';
import { useEffect, useState } from 'react';

export default function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = () => {
    const branchId = localStorage.getItem('branch_id');
    const counterId = localStorage.getItem('counter_id');
    setIsSetupComplete(!!(branchId && counterId));
    setIsChecking(false);
  };

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isSetupComplete
              ? <CustomerPage />
              : <Navigate to="/setup" replace />
          }
        />
        <Route
          path="/setup"
          element={
            isSetupComplete
              ? <Navigate to="/" replace />
              : <SetupMachinePage onSetupComplete={checkSetupStatus} />
          }
        />

        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}