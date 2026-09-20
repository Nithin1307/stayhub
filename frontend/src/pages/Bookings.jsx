import { useEffect, useState } from "react";
import axios from "axios";

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const getBookings = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/booking`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setBookings(response.data);
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Failed to get bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBookings();
    }, []);

    const getNights = (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const difference = end - start;
        return Math.ceil(difference / (1000 * 60 * 60 * 24));
    };
    const cancelBooking = async (id) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmCancel) {
            return;
        }
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/booking/${id}/cancel`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert("Booking cancelled successfully");
            getBookings();
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Failed to cancel booking");
        }
    };
    const downloadInvoice = async (id) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/invoice/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: "blob"
                }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `booking-invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log(error);
            alert("Failed to download invoice");
        }
    };
    if (loading) {
        return (
            <div className="bookings-page">
                <div className="bookings-message">
                    <h2>Loading Bookings...</h2>
                    <p>Please wait while we load your bookings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bookings-page">
            <div className="bookings-container">
                <div className="bookings-header">
                    <h1>My Bookings</h1>
                    <p>View and manage your hotel bookings.</p>
                </div>
                {bookings.length === 0 ? (
                    <div className="bookings-message">
                        <h2>No Bookings Yet</h2>
                        <p>You have not made any hotel bookings yet.</p>
                        <button onClick={() => window.location.href = "/hotels"}>Explore Hotels</button>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {bookings.map((booking) => {
                            const nights = getNights(booking.check_in, booking.check_out);
                            return (
                                <div className="booking-card" key={booking.id}>
                                    <div className="booking-card-header">
                                        <div>
                                            <p className="booking-label">Booking ID</p>
                                            <h3>#{booking.id}</h3>
                                        </div>
                                        <span className={booking.status === "booked" ? "booking-status booked" : "booking-status cancelled"}>{booking.status}</span>
                                    </div>
                                    <div className="booking-hotel">
                                        <div>
                                            <h2>{booking.hotel_name}</h2>
                                            <p>📍 {booking.hotel_location}</p>
                                        </div>
                                    </div>
                                    <div className="booking-room-details">
                                        <div>
                                            <span>Room</span>
                                            <strong>{booking.room_no}</strong>
                                        </div>
                                        <div>
                                            <span>Room Type</span>
                                            <strong>{booking.type}</strong>
                                        </div>
                                        <div>
                                            <span>Price</span>
                                            <strong>₹{booking.price} / night</strong>
                                        </div>
                                    </div>
                                    <div className="booking-dates">
                                        <div>
                                            <span>Check-in</span>
                                            <strong>{booking.check_in}</strong>
                                        </div>
                                        <div>
                                            <span>Check-out</span>
                                            <strong>{booking.check_out}</strong>
                                        </div>
                                        <div>
                                            <span>Stay</span>
                                            <strong>{nights} {nights === 1 ? "Night" : "Nights"}</strong>
                                        </div>
                                    </div>
                                    <div className="booking-payment">
                                        <div>
                                            <span>Amount Paid</span>
                                            <strong>₹{booking.payment_amount || 0}</strong>
                                        </div>
                                        <div>
                                            <span>Payment</span>
                                            <strong className={booking.payment_status === "paid" ? "payment-paid" : "payment-pending"}>{booking.payment_status || "Pending"}</strong>
                                        </div>
                                    </div>
                                    <div className="booking-actions">
                                        <button className="invoice-button" onClick={() => downloadInvoice(booking.id)}>Download Invoice</button>
                                        {booking.status === "booked" && (
                                            <button className="cancel-button" onClick={() => cancelBooking(booking.id)}>Cancel Booking</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Bookings;