import React from 'react';

const NotFound = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-6">Oops! The page you’re looking for doesn’t exist.</p>
                <a
                    href="/"
                    className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
};

export default NotFound;
