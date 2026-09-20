import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    return (
        <div className="home-page">
            <section className="home-hero">
                <div className="home-overlay">
                    <div className="home-content">
                        <p className="home-small-title">WELCOME TO STAYHUB</p>
                        <h1>A Comfortable Stay
                            <br />
                            Starts Here
                        </h1>
                        <p className="home-description">Find the perfect hotel, choose your room,and book your stay with ease.</p>
                        <button className="home-button" onClick={() => navigate("/hotels")}>Explore Hotels</button>
                    </div>
                </div>
            </section>
            <section className="home-features">
                <div className="home-section-title">
                    <p>WHY CHOOSE US</p>
                    <h2>Everything You Need for a Comfortable Stay</h2>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🛏️</div>
                        <h3>Comfortable Rooms</h3>
                        <p>Choose from a variety of comfortable and well-maintained rooms.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Easy Search</h3>
                        <p>Quickly find hotels and rooms using our simple search and filters.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💳</div>
                        <h3>Secure Payment</h3>
                        <p>Complete your booking using secure online payment.</p>
                    </div>
                </div>
            </section>
            <section className="home-how">
                <div className="home-section-title">
                    <p>HOW IT WORKS</p>
                    <h2>Book Your Stay in 3 Simple Steps</h2>
                </div>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Choose a Hotel</h3>
                        <p>Explore hotels and select the one that suits your needs.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>Select a Room</h3>
                        <p>View room photos, details, prices, and availability.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Book & Pay</h3>
                        <p>Select your dates and complete your booking with online payment.</p>
                    </div>
                </div>
            </section>
            <section className="home-cta">
                <div>
                    <h2>Find Your Perfect Hotel</h2>
                    <p>Start exploring hotels and plan your next comfortable stay.</p>
                    <button onClick={() => navigate("/hotels")}>Browse Hotels</button>
                </div>
            </section>
        </div>
    );
}

export default Home;