import { useNavigate } from "react-router-dom";
import axios from "axios";

const useLogout = () => {
    const navigate = useNavigate();

    const logout = async () => {
        try {
            // Retrieve the refresh token from localStorage
            const refreshToken = localStorage.getItem("refreshToken");

            // Make the API call to invalidate the token
            await axios.post(
                `${import.meta.env.VITE_APP_API_BASE_URL}/user/logout`,
                { refresh_token: refreshToken },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            // Clear tokens and user data from localStorage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            // Redirect to login page
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);

            // Ensure tokens are cleared even if the API call fails
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            // Redirect to login page
            navigate("/");
        }
    };

    return logout;
};

export default useLogout;
