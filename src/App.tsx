import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';

// Supabase client import
import { supabase } from './supabaseClient'; // Adjust the path if needed

// Page components
import Maps from './pages/Maps';
import Drivers from './pages/Drivers';
import Account from './pages/Account';
import Heatmap from './pages/Heatmap';
import DataAnalytics from './pages/DataAnalytics';
import PickUpDropOff from './pages/PickUpDropOff';
import Login from './pages/Login';
import AdminCreation from './pages/AdminCreation';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Null until we check auth status

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session?.user);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    checkAuthStatus();
  }, []);

  // While we check authentication status, show loading state
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Redirect logged-in users away from the login page */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/maps" /> : <Login />} />

        {/* Protected Routes */}
        <Route path="/maps" element={isAuthenticated ? <Maps /> : <Navigate to="/" />} />
        <Route path="/drivers" element={isAuthenticated ? <Drivers /> : <Navigate to="/" />} />
        <Route path="/account" element={isAuthenticated ? <Account /> : <Navigate to="/" />} />
        <Route path="/heatmap" element={isAuthenticated ? <Heatmap /> : <Navigate to="/" />} />
        <Route path="/data-analytics" element={isAuthenticated ? <DataAnalytics /> : <Navigate to="/" />} />
        <Route path="/pickup-dropoff" element={isAuthenticated ? <PickUpDropOff /> : <Navigate to="/" />} />
        <Route path="/admin-creation" element={<AdminCreation />} />
      </Routes>
    </Router>
  );
};

export default App;
