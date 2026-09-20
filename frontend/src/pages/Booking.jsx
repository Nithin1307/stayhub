import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function Booking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const today = new Date().toISOString().split("T")[0];
    const role = localStorage.getItem("role");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to book a room");
            navigate("/login");
            return;
        }
        getRoom();
    }, [id]);
    const getRoom = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/room/${id}`);
            setRoom(response.data);
        } catch (error) {
            console.log(error);
            setRoom(null);
        } finally {
            setLoading(false);
        }
    };
    const getNights = () => {
        if (!checkIn || !checkOut) {
            return 0;
        }
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const difference = end - start;
        return Math.ceil(difference / (1000 * 60 * 60 * 24));
    };
    const nights = getNights();
    const totalPrice = nights * Number(room?.price || 0);
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };
    const bookRoom = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to book a room");
            navigate("/login");
            return;
        }
        if (checkIn < today) {
            alert("Check-in date cannot be in the past");
            return;
        }
        if (checkOut <= checkIn) {
            alert("Check-out date must be after check-in date");
            return;
        }
        if (nights <= 0 || totalPrice <= 0) {
            alert("Please select valid dates");
            return;
        }
        try {
            setPaymentLoading(true);
            const availabilityResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/booking/availability?room_id=${room.id}&check_in=${checkIn}&check_out=${checkOut}`
            );
            if (!availabilityResponse.data.available) {
                alert(
                    availabilityResponse.data.message ||
                    "Room is not available for these dates"
                );
                setPaymentLoading(false);
                return;
            }
            const orderResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/payment/create-order`,
                { amount: totalPrice },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const loaded = await loadRazorpay();
            if (!loaded) {
                alert("Razorpay failed to load");
                setPaymentLoading(false);
                return;
            }
            const options = {
                key: orderResponse.data.key_id,
                amount: orderResponse.data.amount,
                currency: orderResponse.data.currency,
                name: "StayHub",
                description: `Room ${room.room_no} Booking`,
                order_id: orderResponse.data.order_id,
                handler: async function (response) {
                    try {
                        const verifyResponse = await axios.post(
                            `${import.meta.env.VITE_API_URL}/payment/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                room_id: room.id,
                                check_in: checkIn,
                                check_out: checkOut,
                                amount: totalPrice
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );
                        if (
                            verifyResponse.data.message ===
                            "Payment verified and booking confirmed"
                        ) {
                            alert("Payment successful. Booking confirmed!");
                            navigate("/bookings");
                        }
                    } catch (error) {
                        alert(
                            error.response?.data?.message ||
                            "Payment verification failed"
                        );
                    } finally {
                        setPaymentLoading(false);
                    }
                },
                prefill: {
                    name: "",
                    email: ""
                },
                theme: {
                    color: "#2563eb"
                },
                modal: {
                    ondismiss: function () {
                        setPaymentLoading(false);
                    }
                }
            };
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.log(error);
            alert(
                error.response?.data?.message ||
                "Payment could not be started"
            );
            setPaymentLoading(false);
        }
    };
    if (loading) {
        return (
            <div className="booking-page">
                <div className="booking-error">
                    <h2>Loading Room...</h2>
                    <p>Please wait while we load the room details.</p>
                </div>
            </div>
        );
    }
    if (role === "hotel_admin" || role === "receptionist") {
        return (
            <div className="booking-page">
                <div className="booking-container">
                    <div className="booking-error">
                        <h2>Booking Not Available</h2>
                        <p>Hotel staff cannot use the customer booking page.</p>
                        <button className="back-button" onClick={() => navigate("/admin")}>Go to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }
    if (!room) {
        return (
            <div className="booking-page">
                <div className="booking-error">
                    <h2>Room Not Found</h2>
                    <p>This room does not exist or is no longer available.</p>
                    <button onClick={() => navigate("/hotels")}>View Hotels</button>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="booking-container">
                <div className="booking-room">
                    {room.image ? (
                        <img src={room.image} alt={`Room ${room.room_no}`} />
                    ) : (
                        <div className="booking-image">No Image</div>
                    )}
                    <div className="booking-room-content">
                        <p className="small-title">{room.hotel_name}</p>
                        <p className="booking-location">📍 {room.hotel_location}</p>
                        <h2>Room {room.room_no}</h2>
                        <p className="booking-type">{room.type} Room</p>
                        <div className="booking-price">
                            ₹{room.price}<span> / night</span>
                        </div>
                        <p className="booking-info">
                            {room.hotel_description ||
                                "Enjoy a comfortable stay in one of our carefully maintained rooms."}
                        </p>
                    </div>
                </div>
                <div className="booking-form">
                    <h1>Book Your Stay</h1>
                    <p className="booking-text">Select your check-in and check-out dates.</p>
                    <form onSubmit={bookRoom}>
                        <label>Check-in</label>
                        <input type="date" min={today} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(""); }} required/>
                        <label>Check-out</label>
                        <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required/>
                        {nights > 0 && (
                            <div className="booking-summary">
                                <div>
                                    <span>Room Price</span>
                                    <span>₹{room.price} / night</span>
                                </div>
                                <div>
                                    <span>Number of Nights</span>
                                    <span>{nights}</span>
                                </div>
                                <div className="booking-total">
                                    <span>Total Price</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                            </div>
                        )}
                        <button type="submit" disabled={paymentLoading}>{paymentLoading ? "Processing..." : "Proceed to Payment"}</button>
                    </form>
                    <button className="back-button" onClick={() => navigate(room.hotel_id ? `/rooms?hotel=${room.hotel_id}` : "/hotels")}>Back to Rooms</button>
                </div>
            </div>
        </div>
    );
}

export default Booking;