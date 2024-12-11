import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import api from "../api/api";

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = "Home - Task Master";

        const fetchCategories = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("accessToken");
                const response = await api.get(`/category/read`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCategories(response.data); // Update state with fetched categories
            } catch (err) {
                setError(err.response?.data?.detail || "Failed to fetch categories.");
                toast.error(err.response?.data?.detail || "Failed to load categories.", {
                    position: "bottom-right",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-100 text-gray-900 py-4 px-2 md:p-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Tasks</h1>

                    {/* Show loading spinner or error message */}
                    {loading && <p>Loading categories...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    {/* Show message if no categories */}
                    {!loading && !error && categories.length === 0 && (
                        <p className="text-gray-500">No categories found. Please add new ones.</p>
                    )}

                    {/* Categories Display */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 mb-8">
                        {categories.map((category) => (
                            <div key={category.id}>
                                <Link
                                    to={`/category/${category.id}`}
                                    className="bg-white w-full inline-block p-6 rounded-lg text-center duration-100 hover:scale-105"
                                >
                                    <h2 className="text-lg font-semibold" title={category.description}>{category.name}</h2>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Home;
