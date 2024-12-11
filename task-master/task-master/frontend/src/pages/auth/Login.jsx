import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    useEffect(() => {
        document.title = `Login - Task Master`;
    }, []);

    const location = useLocation();
    const navigate = useNavigate();

    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");
    const [input, setInput] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state?.successMessage) {
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!input.email.trim()) newErrors.email = "Email is required.";
        if (!input.password.trim()) newErrors.password = "Password is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);
            setErrors({});
            try {
                const response = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/user/login`, {
                    email: input.email,
                    password: input.password,
                });

                const { tokens, user } = response.data;

                // Save tokens in local storage
                localStorage.setItem("accessToken", tokens.access);
                localStorage.setItem("refreshToken", tokens.refresh);

                // Save user info in local storage 
                localStorage.setItem("user", JSON.stringify(user));

                // Redirect to home with user data
                navigate("/home");

            } catch (error) {
                const serverErrors =
                    error.response?.data || { error: "Invalid login credentials." };
                setErrors(serverErrors);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-lg p-6">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Login to <span>Task Master</span>
                </h1>

                {successMessage && (
                    <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                        {successMessage}
                    </div>
                )}

                {errors.error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                        {errors.error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="input"
                            placeholder="Enter your email"
                            value={input.email}
                            onChange={handleInputChange}
                            autoComplete="username"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="input"
                            placeholder="Enter your password"
                            value={input.password}
                            onChange={handleInputChange}
                            autoComplete="current-password"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    <button
                        className="btn btn-primary w-full"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="mt-4 flex justify-between text-sm">
                    <Link to="/forgot-password" className="hover:underline">
                        Forgot Password?
                    </Link>
                    <Link to="/register" className="hover:underline">
                        Create an Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
