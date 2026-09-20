import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    };
    const isActive = (path) => {
        return location.pathname === path;
    };
    return (
        <nav className="navbar">
            <Link to="/" className="hotel-logo">StayHub</Link>
            <div className="navbar-links">
                <Link to="/" className={isActive("/") ? "active" : ""}>Home</Link>
                {(!token || role === "customer") && (
                    <Link to="/hotels" className={isActive("/hotels") ? "active" : ""}>Hotels</Link>
                )}
                {token && role === "customer" && (
                    <Link to="/bookings" className={isActive("/bookings") ? "active" : ""}>My Bookings</Link>
                )}
                {token && (role === "hotel_admin" || role === "receptionist") && (
                    <>
                        <Link to="/admin" className={isActive("/admin") ? "active" : ""}>Dashboard</Link>
                        <Link to="/admin/bookings" className={isActive("/admin/bookings") ? "active" : ""}>Bookings</Link>
                    </>
                )}
                {token && (
                    <Link to="/profile" className={isActive("/profile") ? "active" : ""}>Profile</Link>
                )}
                {!token ? (
                    <>
                        <Link to="/login" className={isActive("/login") ? "active" : ""}>Login</Link>
                        <Link to="/register" className={`register-link ${isActive("/register") ? "active" : ""}`}>Register</Link>
                    </>
                ) : (
                    <button className="logout-button" onClick={logout}>Logout</button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;