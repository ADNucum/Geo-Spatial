import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';


import Maps from './pages/Maps';
import Drivers from './pages/Drivers';
import Account from './pages/Account';
import Heatmap from './pages/Heatmap';
import DataAnalytics from './pages/DataAnalytics';
import PickUpDropOff from './pages/PickUpDropOff';
import Login from './pages/Login';
import AdminCreation from './pages/AdminCreation';
import Ratings from './pages/Ratings';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session?.user);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    checkAuthStatus();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/maps" /> : <Login />} />
        <Route path="/maps" element={isAuthenticated ? <Maps /> : <Navigate to="/" />} />
        <Route path="/drivers" element={isAuthenticated ? <Drivers /> : <Navigate to="/" />} />
        <Route path="/account" element={isAuthenticated ? <Account /> : <Navigate to="/" />} />
        <Route path="/heatmap" element={isAuthenticated ? <Heatmap /> : <Navigate to="/" />} />
        <Route path="/data-analytics" element={isAuthenticated ? <DataAnalytics /> : <Navigate to="/" />} />
        <Route path="/pickup-dropoff" element={isAuthenticated ? <PickUpDropOff /> : <Navigate to="/" />} />
        <Route path="/ratings" element={isAuthenticated ? <Ratings /> : <Navigate to="/" />} />
        <Route path="/admin-creation" element={<AdminCreation />} />
      </Routes>
    </Router>
  );
};

export default App;
