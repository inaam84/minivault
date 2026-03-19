// /src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.token;

    if (!token || isTokenExpired(token)) {
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    // Logged in → show the page
    return children;
}

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}