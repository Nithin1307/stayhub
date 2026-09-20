import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    if (
        role !== "hotel_admin" &&
        role !== "receptionist"
    ) {
        return <Navigate to="/" replace />;
    }
    return children;
}

export default AdminRoute;