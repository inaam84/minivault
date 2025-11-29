// /src/components/PublicRoute.jsx
import { Navigate } from 'react-router-dom';

export default function PublicRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.token;

    if (token) {
        // Already logged in → redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
