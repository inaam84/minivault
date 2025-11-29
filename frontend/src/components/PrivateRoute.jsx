// /src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.token;

    if (!token) {
        // Not logged in → redirect to login
        return <Navigate to="/login" replace />;
    }

    // Logged in → show the page
    return children;
}
