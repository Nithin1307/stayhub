import { useEffect, useState } from "react";
import axios from "axios";

function Admin() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [staff, setStaff] = useState([]);

    const [dashboard, setDashboard] = useState({
        rooms: 0,
        bookings: 0,
        activeBookings: 0,
        revenue: 0
    });

    const [hotelName, setHotelName] = useState("");
    const [hotelLocation, setHotelLocation] = useState("");
    const [hotelDescription, setHotelDescription] = useState("");
    const [hotelImage, setHotelImage] = useState(null);

    const [roomNo, setRoomNo] = useState("");
    const [type, setType] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState("available");
    const [image, setImage] = useState([]);

    const [editingRoom, setEditingRoom] = useState(null);

    const [staffName, setStaffName] = useState("");
    const [staffEmail, setStaffEmail] = useState("");
    const [staffPassword, setStaffPassword] = useState("");

    const [customerEmail, setCustomerEmail] = useState("");
    const [bookingRoom, setBookingRoom] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("pending");

    const [loading, setLoading] = useState(true);

    const getHotel = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/hotel/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                setHotel(response.data);
                setHotelName(response.data.name || "");
                setHotelLocation(response.data.location || "");
                setHotelDescription(response.data.description || "");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getRooms = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/room/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setRooms(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getDashboard = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setDashboard(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getStaff = async () => {
        if (role !== "hotel_admin") {
            return;
        }

        try {
            const response = await axios.get(
                "http://localhost:5000/staff",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStaff(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const loadAdminData = async () => {
        setLoading(true);

        await Promise.all([
            getHotel(),
            getRooms(),
            getDashboard(),
            getStaff()
        ]);

        setLoading(false);
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    const createHotel = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append("name", hotelName);
            formData.append("location", hotelLocation);
            formData.append("description", hotelDescription);

            if (hotelImage) {
                formData.append("image", hotelImage);
            }

            await axios.post(
                "http://localhost:5000/hotel",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Hotel created successfully");

            setHotelImage(null);
            loadAdminData();
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed to create hotel"
            );
        }
    };

    const updateHotel = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append("name", hotelName);
            formData.append("location", hotelLocation);
            formData.append("description", hotelDescription);

            if (hotelImage) {
                formData.append("image", hotelImage);
            }

            await axios.put(
                `http://localhost:5000/hotel/${hotel.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Hotel updated successfully");

            setHotelImage(null);
            loadAdminData();
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed to update hotel"
            );
        }
    };

    const saveRoom = async (e) => {
        e.preventDefault();

        try {
            if (editingRoom) {
                await axios.put(
                    `http://localhost:5000/room/${editingRoom.id}`,
                    {
                        room_no: roomNo,
                        type: type,
                        price: price,
                        status: status
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                alert("Room updated successfully");
            } else {
                const formData = new FormData();

                formData.append("room_no", roomNo);
                formData.append("type", type);
                formData.append("price", price);

                if (image.length > 0) {
                    for (const file of image) {
                        formData.append("images", file);
                    }
                }

                await axios.post(
                    "http://localhost:5000/room",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                alert("Room added successfully");
            }

            clearRoomForm();
            loadAdminData();
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed to save room"
            );
        }
    };

    const editRoom = (room) => {
        setEditingRoom(room);
        setRoomNo(room.room_no);
        setType(room.type);
        setPrice(room.price);
        setStatus(room.status);
        setImage([]);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const deleteRoom = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this room?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:5000/room/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Room deleted successfully");
            loadAdminData();
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete room"
            );
        }
    };

    const clearRoomForm = () => {
        setEditingRoom(null);
        setRoomNo("");
        setType("");
        setPrice("");
        setStatus("available");
        setImage([]);
    };

    const addReceptionist = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                "http://localhost:5000/staff/receptionist",
                {
                    name: staffName,
                    email: staffEmail,
                    password: staffPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Receptionist added successfully");

            setStaffName("");
            setStaffEmail("");
            setStaffPassword("");

            getStaff();
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed to add receptionist"
            );
        }
    };

    const deleteReceptionist = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to remove this receptionist?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:5000/staff/receptionist/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Receptionist removed successfully");
            getStaff();
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed to remove receptionist"
            );
        }
    };

    const createReceptionistBooking = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:5000/booking/receptionist",
                {
                    customer_email: customerEmail,
                    room_id: bookingRoom,
                    check_in: checkIn,
                    check_out: checkOut,
                    payment_status: paymentStatus
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(
                `Booking created successfully\nBooking ID: ${response.data.booking_id}`
            );

            setCustomerEmail("");
            setBookingRoom("");
            setCheckIn("");
            setCheckOut("");
            setPaymentStatus("pending");

            loadAdminData();
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed to create booking"
            );
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    <h2>Loading Dashboard...</h2>
                    <p>Please wait while we load your hotel information.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                <div className="admin-header">
                    <div>
                        <p className="admin-small-title">HOTEL MANAGEMENT</p>

                        <h1>
                            {role === "hotel_admin"
                                ? "Hotel Admin Dashboard"
                                : "Receptionist Dashboard"}
                        </h1>

                        <p>
                            Manage your hotel, rooms and bookings from one place.
                        </p>
                    </div>

                    <button
                        className="refresh-button"
                        onClick={loadAdminData}
                    >
                        Refresh
                    </button>
                </div>

                <section className="dashboard-section">
                    <div className="dashboard-stats">
                        <div className="dashboard-card">
                            <span>Total Rooms</span>
                            <strong>{dashboard.rooms}</strong>
                        </div>

                        <div className="dashboard-card">
                            <span>Total Bookings</span>
                            <strong>{dashboard.bookings}</strong>
                        </div>

                        <div className="dashboard-card">
                            <span>Active Bookings</span>
                            <strong>{dashboard.activeBookings}</strong>
                        </div>

                        <div className="dashboard-card">
                            <span>Total Revenue</span>
                            <strong>₹{dashboard.revenue}</strong>
                        </div>
                    </div>
                </section>

                {role === "hotel_admin" && (
                    <section className="admin-section">
                        <div className="admin-section-header">
                            <div>
                                <p>HOTEL INFORMATION</p>

                                <h2>
                                    {hotel
                                        ? "My Hotel"
                                        : "Create Your Hotel"}
                                </h2>
                            </div>
                        </div>

                        <form
                            className="admin-form"
                            onSubmit={hotel ? updateHotel : createHotel}
                        >
                            <div className="admin-form-grid">
                                <div className="admin-input">
                                    <label>Hotel Name</label>
                                    <input type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="Hotel name" required />
                                </div>

                                <div className="admin-input">
                                    <label>Location</label>
                                    <input type="text" value={hotelLocation} onChange={(e) => setHotelLocation(e.target.value)} placeholder="Hotel location" required />
                                </div>

                                <div className="admin-input admin-full">
                                    <label>Description</label>
                                    <textarea value={hotelDescription} onChange={(e) => setHotelDescription(e.target.value)} placeholder="Describe your hotel" rows="4" />
                                </div>

                                <div className="admin-input admin-full">
                                    <label>Hotel Image</label>
                                    <input type="file" accept="image/*" onChange={(e) => setHotelImage(e.target.files[0])} />
                                </div>
                            </div>

                            <button
                                className="admin-primary-button"
                                type="submit"
                            >
                                {hotel ? "Update Hotel" : "Create Hotel"}
                            </button>
                        </form>
                    </section>
                )}

                <section className="admin-section">
                    <div className="admin-section-header">
                        <div>
                            <p>ROOM MANAGEMENT</p>

                            <h2>
                                {editingRoom
                                    ? "Edit Room"
                                    : "Add New Room"}
                            </h2>
                        </div>

                        {editingRoom && (
                            <button
                                className="admin-cancel-button"
                                onClick={clearRoomForm}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <form className="admin-form" onSubmit={saveRoom}>
                        <div className="admin-form-grid">
                            <div className="admin-input">
                                <label>Room Number</label>
                                <input type="number" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} placeholder="101" required />
                            </div>

                            <div className="admin-input">
                                <label>Room Type</label>
                                <select value={type} onChange={(e) => setType(e.target.value)} required>
                                    <option value="">Select Type</option>
                                    <option value="Single">Single</option>
                                    <option value="Double">Double</option>
                                    <option value="Deluxe">Deluxe</option>
                                    <option value="Suite">Suite</option>
                                </select>
                            </div>

                            <div className="admin-input">
                                <label>Price Per Night</label>
                                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2500" required />
                            </div>

                            <div className="admin-input">
                                <label>Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="available">Available</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>

                            {!editingRoom && (
                                <div className="admin-input admin-full">
                                    <label>Room Photos</label>
                                    <input type="file" accept="image/*" multiple onChange={(e) => setImage(Array.from(e.target.files))} />
                                    <small>You can select up to 5 photos.</small>
                                </div>
                            )}
                        </div>

                        <button
                            className="admin-primary-button"
                            type="submit"
                        >
                            {editingRoom ? "Update Room" : "Add Room"}
                        </button>
                    </form>
                </section>

                {role === "receptionist" && (
                    <section className="admin-section">
                        <div className="admin-section-header">
                            <div>
                                <p>BOOKING MANAGEMENT</p>
                                <h2>Create Booking</h2>
                            </div>
                        </div>

                        <form
                            className="admin-form"
                            onSubmit={createReceptionistBooking}
                        >
                            <div className="admin-form-grid">
                                <div className="admin-input">
                                    <label>Customer Email</label>
                                    <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="customer@gmail.com" required />
                                </div>

                                <div className="admin-input">
                                    <label>Room</label>
                                    <select value={bookingRoom} onChange={(e) => setBookingRoom(e.target.value)} required>
                                        <option value="">Select Room</option>

                                        {rooms
                                            .filter((room) => room.status === "available")
                                            .map((room) => (
                                                <option key={room.id} value={room.id}>
                                                    Room {room.room_no} - {room.type} - ₹{room.price}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="admin-input">
                                    <label>Check-in</label>
                                    <input
                                        type="date"
                                        value={checkIn}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="admin-input">
                                    <label>Check-out</label>
                                    <input
                                        type="date"
                                        value={checkOut}
                                        min={checkIn || new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="admin-input">
                                    <label>Payment Status</label>
                                    <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                className="admin-primary-button"
                                type="submit"
                            >
                                Create Booking
                            </button>
                        </form>
                    </section>
                )}

                <section className="admin-section">
                    <div className="admin-section-header">
                        <div>
                            <p>ROOM LIST</p>
                            <h2>My Rooms</h2>
                        </div>
                    </div>

                    {rooms.length === 0 ? (
                        <div className="admin-empty">
                            <h3>No Rooms Added</h3>
                            <p>Add your first room using the form above.</p>
                        </div>
                    ) : (
                        <div className="admin-room-list">
                            {rooms.map((room) => (
                                <div className="admin-room-card" key={room.id}>
                                    <div className="admin-room-image">
                                        {room.image ? (
                                            <img src={room.image} alt={`Room ${room.room_no}`} />
                                        ) : (
                                            <span>No Image</span>
                                        )}
                                    </div>

                                    <div className="admin-room-content">
                                        <div>
                                            <p className="admin-room-number">
                                                Room {room.room_no}
                                            </p>

                                            <h3>{room.type}</h3>
                                        </div>

                                        <p className="admin-room-price">
                                            ₹{room.price}
                                            <span> / night</span>
                                        </p>

                                        <span
                                            className={
                                                room.status === "available"
                                                    ? "admin-room-status available"
                                                    : "admin-room-status maintenance"
                                            }
                                        >
                                            {room.status}
                                        </span>

                                        {role === "hotel_admin" && (
                                            <div className="admin-room-actions">
                                                <button
                                                    className="edit-room-button"
                                                    onClick={() => editRoom(room)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-room-button"
                                                    onClick={() => deleteRoom(room.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {role === "hotel_admin" && (
                    <section className="admin-section">
                        <div className="admin-section-header">
                            <div>
                                <p>STAFF MANAGEMENT</p>
                                <h2>Receptionists</h2>
                            </div>
                        </div>

                        <form className="admin-form" onSubmit={addReceptionist}>
                            <div className="admin-form-grid">
                                <div className="admin-input">
                                    <label>Name</label>
                                    <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Receptionist name" required />
                                </div>

                                <div className="admin-input">
                                    <label>Email</label>
                                    <input type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} placeholder="Receptionist email" required />
                                </div>

                                <div className="admin-input">
                                    <label>Password</label>
                                    <input type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} placeholder="Create password" required />
                                </div>
                            </div>

                            <button
                                className="admin-primary-button"
                                type="submit"
                            >
                                Add Receptionist
                            </button>
                        </form>

                        {staff.length === 0 ? (
                            <div className="admin-empty">
                                <h3>No Receptionists</h3>
                                <p>
                                    Add receptionists who can manage bookings for your hotel.
                                </p>
                            </div>
                        ) : (
                            <div className="admin-room-list">
                                {staff.map((member) => (
                                    <div
                                        className="admin-room-card"
                                        key={member.id}
                                    >
                                        <div className="admin-room-content">
                                            <div>
                                                <p className="admin-room-number">
                                                    {member.name}
                                                </p>

                                                <h3>Receptionist</h3>
                                            </div>

                                            <p>{member.email}</p>

                                            <div className="admin-room-actions">
                                                <button
                                                    className="delete-room-button"
                                                    onClick={() =>
                                                        deleteReceptionist(member.id)
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}

export default Admin;