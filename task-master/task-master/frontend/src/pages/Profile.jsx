import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import useLogout from "../pages/auth/Logout";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
    const logout = useLogout();

    // State for user data and form inputs
    const [user, setUser] = useState({
        full_name: "",
        email: "",
        profile_picture: "",
    });

    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: "",
    });

    // State for form validation
    const [errors, setErrors] = useState({
        full_name: "",
        currentPassword: "",
        newPassword: "",
    });

    // Utility function to refresh token
    const refreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const response = await axios.post(
                `${import.meta.env.VITE_APP_API_BASE_URL}/auth/refresh-token`,
                { refreshToken }, // Sent in request body
                {
                    headers: {
                        "Content-Type": "application/json", // Ensure correct Content-Type
                    },
                }
            );

            const { accessToken } = response.data;

            localStorage.setItem("accessToken", accessToken);

            return accessToken;
        } catch (error) {
            console.error("Token refresh failed:", error.response?.data || error);
            // Handle error appropriately
            return null;
        }
    };

    // Utility function to make API request with token refresh handling
    const makeApiRequest = async (url, method, data = {}) => {
        let accessToken = localStorage.getItem("accessToken");

        try {
            const response = await axios({
                method,
                url,
                data,
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Token expired, refresh it
                accessToken = await refreshToken();
                if (!accessToken) return null;

                // Retry the request with new access token
                return await axios({
                    method,
                    url,
                    data,
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }
            throw error; // Other errors
        }
    };

    useEffect(() => {
        document.title = `Profile - Task Master`;

        // Load user data from localStorage
        const localUser = JSON.parse(localStorage.getItem("user"));
        if (localUser) {
            setUser({
                ...user,
                full_name: localUser.full_name,
                email: localUser.email,
                profile_picture: "/public/user.png", // Placeholder for now
            });
        }
    }, []);

    // Validate profile form fields
    const validateProfileForm = () => {
        let valid = true;
        let tempErrors = {};

        if (!user.full_name) {
            tempErrors.full_name = "Full name is required.";
            valid = false;
        }

        setErrors(tempErrors);
        return valid;
    };

    // Handle profile update
    const handleProfileUpdate = async () => {
        if (!validateProfileForm()) return;

        try {
            const response = await makeApiRequest(
                `${import.meta.env.VITE_APP_API_BASE_URL}/user/profile/update-info`,
                "POST",
                {
                    full_name: user.full_name,
                    profile_picture: user.profile_picture,
                }
            );

            // Update localStorage with updated user data
            const updatedUser = { ...user, full_name: user.full_name };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            toast.success('Profile updated successfully!', {
                position: "bottom-right",
            });

        } catch (error) {
            toast.error('Failed to update profile.', {
                position: "bottom-right"
            });
        }
    };

    // Handle password change
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!password.currentPassword || !password.newPassword) {

            toast.error('Please fill in both fields.', {
                position: "bottom-right",
            });

            return;
        }

        try {
            const response = await makeApiRequest(
                `${import.meta.env.VITE_APP_API_BASE_URL}/user/profile/change-password`,
                "POST",
                {
                    currentPassword: password.currentPassword,
                    newPassword: password.newPassword,
                }
            );

            toast.success('Password changed successfully!', {
                position: "bottom-right",
            });

        } catch (error) {
            toast.error(error.response.data.error || "An error occurred.", {
                position: "bottom-right",
            });
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-bold mb-8">Profile</h1>

                    <div className="bg-white p-6 rounded-lg flex flex-col md:flex-row items-center md:items-start md:space-x-8">
                        {/* Avatar Section */}
                        <div className="relative group w-32 h-32 rounded-full overflow-hidden">
                            <img
                                src={user.profile_picture || "/public/user.png"}
                                alt="User Avatar"
                                className="object-cover w-full h-full"
                            />
                        </div>

                        {/* User Information Section */}
                        <div className="flex-1 mt-6 md:mt-0 w-full">
                            <h2 className="text-lg font-semibold mb-4">User Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={user.full_name}
                                        onChange={(e) =>
                                            setUser({ ...user, full_name: e.target.value })
                                        }
                                    />
                                    {errors.full_name && (
                                        <span className="text-red-500 text-sm">{errors.full_name}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={user.email}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-4 mt-6">
                                <button className="btn btn-sm btn-success" onClick={handleProfileUpdate}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Update Password Section */}
                    <div className="bg-white p-6 rounded-lg mt-6">
                        <h2 className="text-lg font-semibold mb-4">Update Password</h2>

                        <form onSubmit={handleChangePassword}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Enter your current password"
                                        autoComplete="new-password"
                                        value={password.currentPassword}
                                        onChange={(e) =>
                                            setPassword({ ...password, currentPassword: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Enter a new password"
                                        autoComplete="new-password"
                                        value={password.newPassword}
                                        onChange={(e) =>
                                            setPassword({ ...password, newPassword: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-4 mt-6">
                                <button className="btn btn-sm btn-success" type="submit">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-lg mt-6">
                        <button
                            className="btn btn-danger"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Profile;
