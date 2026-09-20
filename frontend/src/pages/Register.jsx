import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");

    const registerUser = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/user/register`,
                {
                    name,
                    email,
                    password,
                    role
                }
            );

            const loginResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/user/login`,
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "token",
                loginResponse.data.token
            );

            localStorage.setItem(
                "role",
                loginResponse.data.user.role
            );

            if (loginResponse.data.user.role === "hotel_admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>Create Account</h1>

                <p className="auth-text">
                    Create your StayHub account.
                </p>

                <form onSubmit={registerUser}>

                    <label>Name</label>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <label>Account Type</label>

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="customer">
                            Customer
                        </option>

                        <option value="hotel_admin">
                            Hotel Admin
                        </option>
                    </select>

                    <button type="submit">
                        Register
                    </button>
                </form>

                <p className="auth-bottom-text">
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")}>
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Register;