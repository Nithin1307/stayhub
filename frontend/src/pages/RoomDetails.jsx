import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function RoomDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [loading, setLoading] = useState(true);
    const getRoom = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/room/${id}`);
            setRoom(response.data);

            if (response.data.images?.length > 0) {
                setSelectedImage(response.data.images[0].image);
            } else {
                setSelectedImage("");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRoom();
    }, [id]);

    if (loading) {
        return (
            <div className="room-details-page">
                <div className="room-details-message">
                    <h2>Loading Room...</h2>
                    <p>Please wait while we load the room details.</p>
                </div>
            </div>
        );
    }
    if (!room) {
        return (
            <div className="room-details-page">
                <div className="room-details-message">
                    <h2>Room Not Found</h2>
                    <p>This room is no longer available.</p>
                    <button onClick={() => navigate("/hotels")}>View Hotels</button>
                </div>
            </div>
        );
    }
    const images = room.images?.length > 0
        ? room.images
        : room.image
            ? [{ id: 0, image: room.image }]
            : [];
    return (
        <div className="room-details-page">
            <div className="room-details-container">
                <div className="room-gallery">
                    <div className="room-main-image">
                        {selectedImage ? (
                            <img src={selectedImage} alt={`Room ${room.room_no}`} />
                        ) : (
                            <div className="room-no-image">No Image</div>
                        )}
                    </div>
                    {images.length > 0 && (
                        <div className="room-thumbnails">
                            {images.map((item) => (
                                <div
                                    className={selectedImage === item.image ? "room-thumbnail active" : "room-thumbnail"}
                                    key={item.id}
                                    onClick={() => setSelectedImage(item.image)}
                                >
                                    <img src={item.image} alt="Room" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="room-details-content">
                    <p className="small-title">{room.hotel_name}</p>
                    <h1>Room {room.room_no}</h1>
                    <p className="room-details-location">📍 {room.hotel_location}</p>
                    <div className="room-details-price">
                        ₹{room.price}<span> / night</span>
                    </div>
                    <div className="room-details-info">
                        <div>
                            <span>Room Type</span>
                            <strong>{room.type} Room</strong>
                        </div>
                        <div>
                            <span>Status</span>
                            <strong className="room-details-status">{room.status}</strong>
                        </div>
                    </div>
                    <div className="room-details-description">
                        <h3>About This Room</h3>
                        <p>{room.hotel_description || "Enjoy a comfortable and relaxing stay in this well-maintained room."}</p>
                    </div>
                    {localStorage.getItem("role") === "customer" && (
                        <button className="room-book-button" onClick={() => navigate(`/booking/${room.id}`)} disabled={room.status !== "available"}>
                            {room.status === "available" ? "Book Now" : "Room Unavailable"}
                        </button>
                    )}
                    <button className="room-back-button" onClick={() => navigate(room.hotel_id ? `/rooms?hotel=${room.hotel_id}` : "/hotels")}>Back to Rooms</button>
                </div>
            </div>
        </div>
    );
}

export default RoomDetails;