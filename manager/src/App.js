import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ManagerPanel from './components/ManagerPanel';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard/*" element={<ManagerPanel />} /> {/* ✅ This line is updated */}
      
    </Routes>
  );
}

export default App;
