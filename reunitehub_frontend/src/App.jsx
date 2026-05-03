import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './app/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';

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
              <div className="p-10 text-2xl font-bold text-gray-800">
                Reports Dashboard
              </div>
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