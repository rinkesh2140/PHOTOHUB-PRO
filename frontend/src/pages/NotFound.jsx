// frontend/src/pages/NotFound.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-orange-500 mb-4">404</h1>
        
        <h2 className="text-3xl font-bold text-white mb-2">
          Page Not Found
        </h2>
        
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded transition"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-8">
          Error Code: 404
        </p>
      </div>
    </div>
  );
}
