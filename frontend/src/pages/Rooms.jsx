import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

function Rooms() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const hotelId = searchParams.get("hotel");
    const [rooms, setRooms] = useState([]);
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roomType, setRoomType] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [status, setStatus] = useState("");
    const getRooms = async () => {
        try {
            let url = `${import.meta.env.VITE_API_URL}/room`;

            if (hotelId) {
                url += `?hotel=${hotelId}`;
            }
            const response = await axios.get(url);
            setRooms(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    const getHotel = async () => {
        if (!hotelId) {
            return;
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/hotel`);
            const selectedHotel = response.data.find(
                (item) => item.id === Number(hotelId)
            );
            setHotel(selectedHotel);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        setLoading(true);
        getRooms();
        getHotel();
    }, [hotelId]);

    const filteredRooms = rooms.filter((room) => {
        const searchValue = search.toLowerCase();
        const matchesSearch =
            room.room_no.toString().includes(searchValue) ||
            room.type.toLowerCase().includes(searchValue) ||
            room.hotel_name.toLowerCase().includes(searchValue);
        const matchesType =
            roomType === "" ||
            room.type.toLowerCase() === roomType.toLowerCase();
        const matchesPrice =
            maxPrice === "" ||
            Number(room.price) <= Number(maxPrice);
        const matchesStatus =
            status === "" ||
            room.status.toLowerCase() === status.toLowerCase();

        return matchesSearch && matchesType && matchesPrice && matchesStatus;
    });

    const clearFilters = () => {
        setSearch("");
        setRoomType("");
        setMaxPrice("");
        setStatus("");
    };

    if (loading) {
        return (
            <div className="rooms-page">
                <div className="rooms-message">
                    <h2>Loading Rooms...</h2>
                    <p>Please wait while we find available rooms.</p>
                </div>
            </div>
        );
    }
    return (
        <div className="rooms-page">
            <div className="rooms-container">
                {hotel && (
                    <div className="rooms-header">
                        <h1>{hotel.name}</h1>
                        <p>📍 {hotel.location}</p>
                        <span>Choose a room that suits your stay.</span>
                    </div>
                )}
                {!hotelId && (
                    <div className="rooms-header">
                        <h1>Available Rooms</h1>
                        <p>Find the perfect room for your stay.</p>
                    </div>
                )}
                <div className="room-filters">
                    <div className="filter-group">
                        <label>Search</label>
                        <input type="text" placeholder="Room number or type" value={search} onChange={(e) => setSearch(e.target.value)}/>
                    </div>
                    <div className="filter-group">
                        <label>Room Type</label>
                        <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                            <option value="">All Types</option>
                            <option value="single">Single</option>
                            <option value="double">Double</option>
                            <option value="deluxe">Deluxe</option>
                            <option value="suite">Suite</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Maximum Price</label>
                        <input type="number" placeholder="₹5000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}/>
                    </div>
                    <div className="filter-group">
                        <label>Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="">All</option>
                            <option value="available">Available</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    <button className="clear-filter-button" onClick={clearFilters}>Clear</button>
                </div>
                <div className="rooms-result">
                    <p>
                        {filteredRooms.length} room
                        {filteredRooms.length !== 1 ? "s" : ""} found
                    </p>
                </div>
                {filteredRooms.length === 0 ? (
                    <div className="rooms-message">
                        <h2>No Rooms Found</h2>
                        <p>Try changing your search or filters.</p>
                        <button onClick={clearFilters}>Clear Filters</button>
                    </div>
                ) : (
                    <div className="rooms-grid">
                        {filteredRooms.map((room) => (
                            <div className="room-card" key={room.id}>
                                <div className="room-image">
                                    {room.image ? (
                                        <img src={room.image} alt={`Room ${room.room_no}`} />
                                    ) : (
                                        <div className="room-no-image">No Image</div>
                                    )}
                                </div>
                                <div className="room-content">
                                    {!hotelId && (
                                        <p className="room-hotel-name">{room.hotel_name}</p>
                                    )}
                                    <h3>Room {room.room_no}</h3>
                                    <p className="room-type">{room.type} Room</p>
                                    <p className="room-status">
                                        Status:{" "}
                                        <span className={room.status === "available" ? "available" : "maintenance"}>{room.status}</span>
                                    </p>
                                    <div className="room-bottom">
                                        <div className="room-price">
                                            ₹{room.price}<span> / night</span>
                                        </div>
                                        <button onClick={() => navigate(`/room/${room.id}`)}>View Room</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Rooms;