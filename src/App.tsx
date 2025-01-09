import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Page components
import Maps from './pages/Maps';
import Drivers from './pages/Drivers';
import Account from './pages/Account';
import Heatmap from './pages/Heatmap';
import DataAnalytics from './pages/DataAnalytics';
import PickUpDropOff from './pages/PickUpDropOff';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/account" element={<Account />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/data-analytics" element={<DataAnalytics />} />
            <Route path="/pickup-dropoff" element={<PickUpDropOff />} />
          </Routes>
    </Router>
  );
};

export default App;
