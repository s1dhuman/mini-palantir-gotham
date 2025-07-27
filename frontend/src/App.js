import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <div className="App min-h-screen bg-dark-900 text-white">
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;