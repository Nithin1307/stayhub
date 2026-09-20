import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
    const token = localStorage.getItem("token");
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const getProfile = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/user/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setProfile(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <h2>Loading Profile...</h2>
                </div>
            </div>
        );
    }
    if (!profile) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <h2>Profile not found</h2>
                </div>
            </div>
        );
    }
    const roleName =
        profile.role === "hotel_admin"
            ? "Hotel Admin"
            : profile.role === "receptionist"
                ? "Receptionist"
                : "Customer";
    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="profile-small-title">MY PROFILE</p>
                        <h1>{profile.name}</h1>
                        <p>{roleName}</p>
                    </div>
                </div>
                <div className="profile-details">
                    <div className="profile-item">
                        <span>Name</span>
                        <strong>{profile.name}</strong>
                    </div>
                    <div className="profile-item">
                        <span>Email</span>
                        <strong>{profile.email}</strong>
                    </div>
                    <div className="profile-item">
                        <span>Role</span>
                        <strong>{roleName}</strong>
                    </div>
                    <div className="profile-item">
                        <span>Hotel</span>
                        <strong>{profile.hotel_name || "Not assigned"}</strong>
                    </div>
                    {profile.hotel_location && (
                        <div className="profile-item">
                            <span>Hotel Location</span>
                            <strong>{profile.hotel_location}</strong>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;