import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Retrieve the query parameters
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token"); // Get the token from the query parameter

    const navigate = useNavigate();

    const handleResetPassword = async (e) => {

        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in all fields.", {
                position: "bottom-right"
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.", {
                position: "bottom-right"
            });
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/user/reset-password`, {
                token,
                new_password: newPassword,
            });

            toast.success("Password reset successfully!");

            setTimeout(() => {
                navigate("/", { state: { successMessage: "Your password has been reset. You can now log in with your new password." } });
            }, 1000);

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to reset password. Try again!", {
                position: "bottom-right"
            }
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-lg p-6">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Set New Password
                </h1>

                <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                            className="input"
                            placeholder="Enter your new password"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            className="input"
                            placeholder="Confirm your new password"
                        />
                    </div>

                    <button className="btn btn-primary w-full">
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
