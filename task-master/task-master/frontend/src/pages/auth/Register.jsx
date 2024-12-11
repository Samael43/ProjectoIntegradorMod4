import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {

    useEffect(() => {
        document.title = `Register - Task Master`;
    }, []);

    const navigate = useNavigate();

    const [input, setInput] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!input.name.trim()) newErrors.name = "Name is required.";
        if (!input.email.trim()) newErrors.email = "Email is required.";
        if (!input.password.trim()) newErrors.password = "Password is required.";
        if (!input.confirmPassword.trim())
            newErrors.confirmPassword = "Confirm Password is required.";

        if (
            input.password &&
            input.confirmPassword &&
            input.password !== input.confirmPassword
        ) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);

            setErrors({});

            try {
                await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/user/create`, {
                    full_name: input.name,
                    email: input.email,
                    password: input.password,
                });

                // Redirect to login page with a success message
                navigate("/", { state: { successMessage: "Registration successful! Please log in." } });
            } catch (error) {
                const serverErrors =
                    error.response?.data || { error: "An unexpected error occurred." };
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
                    Register on <span>Task Master</span>
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="input"
                            placeholder="Enter your name"
                            value={input.name}
                            onChange={handleInputChange}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            className="input"
                            name="email"
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
                            className="input"
                            name="password"
                            placeholder="Create a password"
                            value={input.password}
                            autoComplete="new-password"
                            onChange={handleInputChange}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            className="input"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={input.confirmPassword}
                            autoComplete="new-password"
                            onChange={handleInputChange}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <button
                        className="btn btn-primary w-full"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <div className="mt-4 text-sm text-center">
                    Already have an account?{" "}
                    <Link to="/" className="hover:underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
