/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { firebaseService } from './services/firebaseService';

function AppContent() {
  const { user, loading } = useAuth();

  useEffect(() => {
    firebaseService.testConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-industrial-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-industrial-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
