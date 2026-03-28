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
import Organisation from './pages/Organisation';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />

                <Route path="/login" element={
                    <PublicRoute><Login /></PublicRoute>
                } />

                <Route path="/signup" element={
                    <PublicRoute><Signup /></PublicRoute>
                } />

                <Route path="/verify-otp" element={
                    <PublicRoute><VerifyOtp /></PublicRoute>
                } />

                <Route path="/dashboard" element={
                    <PrivateRoute><Dashboard /></PrivateRoute>
                } />

                <Route path="/secrets/new" element={
                    <PrivateRoute><NewSecret /></PrivateRoute>
                } />

                <Route path="/organisation" element={
                    <PrivateRoute><Organisation /></PrivateRoute>
                } />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
);
