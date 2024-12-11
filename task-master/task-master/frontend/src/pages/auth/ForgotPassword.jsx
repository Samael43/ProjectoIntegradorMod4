import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = `Forgot Password - Task Master`;
    }, []);

    // Function to validate email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendResetLink = async (e) => {

        e.preventDefault();

        // Validate email format
        if (!email) {
            toast.error("Please enter your email.", {
                position: "bottom-right",
            });
            return;
        }

        if (!isValidEmail(email)) {
            toast.error("Please enter a valid email address.", {
                position: "bottom-right",
            });
            return;
        }

        setLoading(true); // Start loader

        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/user/forgot-password`, {
                email,
            });

            if (response.data.message) {
                toast.success(response.data.message, {
                    position: "bottom-right",
                });

                setEmail("")

            } else {
                throw new Error(response.data.message || "Failed to send reset link.");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message,
                {
                    position: "bottom-right",
                }
            );
        } finally {
            setLoading(false); // Stop loader
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-lg p-6">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Reset Your Password
                </h1>

                <form onSubmit={handleSendResetLink}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="Enter your email"
                        />
                    </div>

                    <button
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            "Loading..."
                        ) : (
                            "Send Reset Link"
                        )}
                    </button>
                </form>

                <div className="mt-4 text-sm text-center">
                    Remember your password?{" "}
                    <Link to="/" className="hover:underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
