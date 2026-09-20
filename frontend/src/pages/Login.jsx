import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/user/login`,
                {
                    email,
                    password
                }
            );
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.user.role);
            navigate("/");
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Login failed");
        }
    };
    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>Welcome Back</h1>
                <p className="auth-text">Login to continue to StayHub.</p>
                <form onSubmit={loginUser}>
                    <label>Email</label>
                    <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                    <label>Password</label>
                    <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    <button type="submit">Login</button>
                </form>
                <p className="auth-bottom-text">
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/register")}>Register</span>
                </p>
            </div>
        </div>
    );
}

export default Login;