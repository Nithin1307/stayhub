import { useEffect, useState } from "react";
import axios from "axios";

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const getBookings = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/booking/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setBookings(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    const getNights = (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const difference = end - start;
        return Math.ceil(difference / (1000 * 60 * 60 * 24));
    };

    useEffect(() => {
        getBookings();
    }, []);

    const totalBookings = bookings.length;
    const activeBookings = bookings.filter((booking) => booking.status === "booked").length;
    const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled").length;

    return (
        <div className="admin-bookings">
            <div className="admin-bookings-heading">
                <p className="small-title">BOOKING MANAGEMENT</p>
                <h1>All Bookings</h1>
                <p>View bookings made for your hotel.</p>
            </div>
            <div className="admin-booking-stats">
                <div className="admin-booking-stat">
                    <p>Total Bookings</p>
                    <h2>{totalBookings}</h2>
                </div>
                <div className="admin-booking-stat">
                    <p>Active Bookings</p>
                    <h2>{activeBookings}</h2>
                </div>
                <div className="admin-booking-stat">
                    <p>Cancelled</p>
                    <h2>{cancelledBookings}</h2>
                </div>
            </div>
            {loading ? (
                <p className="admin-booking-message">Loading bookings...</p>
            ) : bookings.length === 0 ? (
                <div className="admin-booking-message">
                    <h2>No Bookings Yet</h2>
                    <p>Customers have not booked any rooms yet.</p>
                </div>
            ) : (
                <div className="admin-booking-list">
                    {bookings.map((booking) => {
                        const nights = getNights(booking.check_in, booking.check_out);
                        return (
                            <div className="admin-booking-card" key={booking.id}>
                                <div className="admin-booking-top">
                                    <div>
                                        <p className="small-title">BOOKING #{booking.id}</p>
                                        <h2>{booking.hotel_name}</h2>
                                        <p>📍 {booking.hotel_location}</p>
                                    </div>
                                    <span className={booking.status === "booked" ? "booking-status booked" : "booking-status cancelled"}>{booking.status}</span>
                                </div>
                                <div className="admin-booking-details">
                                    <div>
                                        <span>Customer</span>
                                        <strong>{booking.user_name}</strong>
                                        <small>{booking.user_email}</small>
                                    </div>
                                    <div>
                                        <span>Room</span>
                                        <strong>Room {booking.room_no}</strong>
                                        <small>{booking.type} Room</small>
                                    </div>
                                    <div>
                                        <span>Check-in</span>
                                        <strong>{new Date(booking.check_in).toLocaleDateString()}</strong>
                                    </div>
                                    <div>
                                        <span>Check-out</span>
                                        <strong>{new Date(booking.check_out).toLocaleDateString()}</strong>
                                    </div>
                                    <div>
                                        <span>Nights</span>
                                        <strong>{nights}</strong>
                                    </div>
                                    <div>
                                        <span>Room Price</span>
                                        <strong>₹{booking.price}</strong>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AdminBookings;