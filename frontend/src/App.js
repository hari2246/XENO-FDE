import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (token) {
      setIsAuthReady(true);
    } else {
      setIsAuthReady(true);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleToggleForm = () => {
    setShowRegister(!showRegister);
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 p-6 sm:p-10">
      {token ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : showRegister ? (
        <Register onRegistrationSuccess={handleToggleForm} onShowLogin={handleToggleForm} />
      ) : (
        <Login onLoginSuccess={setToken} onShowRegister={handleToggleForm} />
      )}
    </div>
  );
};

export default App;