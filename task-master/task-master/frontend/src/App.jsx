import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import CategoryPage from "./pages/CategoryPage";
import AddTaskPage from "./pages/task/AddTaskPage";
import EditTaskPage from "./pages/task/EditTaskPage";
import AddCategoryPage from "./pages/category/AddCategoryPage";
import EditCategoryPage from "./pages/category/EditCategoryPage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
    return (
        <Router>
            <ToastContainer />

            <Routes>
                {/* Public Routes */}
                <Route element={<PublicRoute />}>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/category/:id" element={<CategoryPage />} />
                    <Route path="/add-category" element={<AddCategoryPage />} />
                    <Route path="/edit-category/:categoryId" element={<EditCategoryPage />} />
                    <Route path="/add-task" element={<AddTaskPage />} />
                    <Route path="/edit-task/:taskId" element={<EditTaskPage />} />
                    <Route path="/search/:searchTerm" element={<SearchPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;
