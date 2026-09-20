import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Hotels() {
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const getHotels = async () => {
        try {
            const response = await axios.get("http://localhost:5000/hotel");
            setHotels(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getHotels();
    }, []);
    const filteredHotels = hotels.filter((hotel) => {
        const searchValue = search.toLowerCase();
        return (
            hotel.name.toLowerCase().includes(searchValue) ||
            hotel.location.toLowerCase().includes(searchValue)
        );
    });
    const clearSearch = () => {
        setSearch("");
    };
    if (loading) {
        return (
            <div className="hotels-page">
                <div className="hotels-message">
                    <h2>Loading Hotels...</h2>
                    <p>Please wait while we load the hotels.</p>
                </div>
            </div>
        );
    }
    return (
        <div className="hotels-page">
            <div className="hotels-container">
                <div className="hotels-header">
                    <h1>Explore Hotels</h1>
                    <p>Find a comfortable hotel for your stay.</p>
                </div>
                <div className="hotel-search">
                    <input type="text" placeholder="Search by hotel name or location" value={search} onChange={(e) => setSearch(e.target.value)} />
                    {search && (
                        <button onClick={clearSearch}>Clear</button>
                    )}
                </div>
                <div className="hotel-result">
                    <p>
                        {filteredHotels.length} hotel
                        {filteredHotels.length !== 1 ? "s" : ""} found
                    </p>
                </div>
                {filteredHotels.length === 0 ? (
                    <div className="hotels-message">
                        <h2>No Hotels Found</h2>
                        <p>Try searching for another hotel or location.</p>
                        <button onClick={clearSearch}>Clear Search</button>
                    </div>
                ) : (
                    <div className="hotels-grid">
                        {filteredHotels.map((hotel) => (
                            <div className="hotel-card" key={hotel.id}>
                                <div className="hotel-image">
                                    {hotel.image ? (
                                        <img src={hotel.image} alt={hotel.name} />
                                    ) : (
                                        <div className="hotel-no-image">No Image</div>
                                    )}
                                </div>
                                <div className="hotel-content">
                                    <h2>{hotel.name}</h2>
                                    <p className="hotel-location">📍 {hotel.location}</p>
                                    <p className="hotel-description">
                                        {hotel.description || "Enjoy a comfortable stay with quality rooms and services."}
                                    </p>
                                    <button onClick={() => navigate(`/rooms?hotel=${hotel.id}`)}>View Rooms</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Hotels;