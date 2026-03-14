import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import VerifyOtp from './pages/verify-otp';
import NewSecret from './pages/NewSecret';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />

                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/verify-otp"
                    element={
                        <PublicRoute>
                            <VerifyOtp />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/secrets/new"
                    element={
                        <PrivateRoute>
                            <NewSecret />
                        </PrivateRoute>
                    }
                />

                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
);
