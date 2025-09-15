import React, { useState } from 'react';
import { registerUser } from '../services/api';

const Register = ({ onRegistrationSuccess, onShowLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await registerUser(email, password);
      // On successful registration, call the prop to switch to the login view
      onRegistrationSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">Register New User</h2>
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 disabled:bg-gray-400"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          {success && (
            <p className="mt-4 text-center text-sm text-green-600 p-3 bg-green-50 rounded-lg border border-green-200">
              {success}
            </p>
          )}
          {error && (
            <p className="mt-4 text-center text-sm text-red-600 p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button onClick={onShowLogin} className="font-semibold text-blue-600 hover:text-blue-800 focus:outline-none">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;