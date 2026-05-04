import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './app/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Reports from './pages/Reports';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/reports" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/reports" />} />
        
        {/* Protected Routes */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to={user ? "/reports" : "/login"} />} />
        <Route path="*" element={<div className="p-10">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;