import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
    const isAuthenticated = !!localStorage.getItem("accessToken"); // Replace with your auth logic

    return isAuthenticated ? <Navigate to="/home" /> : <Outlet />;
};

export default PublicRoute;
