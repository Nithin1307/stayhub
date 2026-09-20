import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hotels from "./pages/Hotels";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import Booking from "./pages/Booking";
import Bookings from "./pages/Bookings";
import Admin from "./pages/Admin";
import AdminBookings from "./pages/AdminBookings";
import Profile from "./pages/Profile";

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/room/:id" element={<RoomDetails />} />
                <Route path="/booking/:id" element={<Booking />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={
                        <AdminRoute>
                            <Admin />
                        </AdminRoute>
                    }
                />
                <Route path="/admin/bookings" element={
                        <AdminRoute>
                            <AdminBookings />
                        </AdminRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;