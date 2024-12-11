import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/api";

const EditCategoryPage = () => {
    const { categoryId } = useParams(); // Get the category ID from the URL
    const navigate = useNavigate(); // For navigation after deletion
    useEffect(() => {
        document.title = `Edit Category - Task Master`;
    }, []);

    const [categoryInput, setCategoryInput] = useState({
        categoryName: "",
        description: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Fetch category data on component load
    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const response = await api.get(`/category/${categoryId}`);
                setCategoryInput({
                    categoryName: response.data.name,
                    description: response.data.description,
                });
            } catch (error) {
                toast.error("Failed to load category details.", {
                    position: "bottom-right",
                });
            }
        };

        fetchCategoryData();
    }, [categoryId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCategoryInput({ ...categoryInput, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!categoryInput.categoryName.trim())
            newErrors.categoryName = "Category name is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setErrors({});
            setLoading(true);

            try {
                const token = localStorage.getItem("accessToken");

                await api.post(`/category/edit`, {
                    id: categoryId,
                    name: categoryInput.categoryName,
                    description: categoryInput.description,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                toast.success("Category updated successfully!", {
                    position: "bottom-right",
                });
            } catch (error) {
                const errorMessage = error.response?.data?.error || "Failed to update category.";
                toast.error(errorMessage, {
                    position: "bottom-right",
                });
            } finally {
                setLoading(false);
            }
        } else {
            toast.error("Please correct the form errors.", {
                position: "bottom-right",
            });
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                const token = localStorage.getItem("accessToken");

                await api.post(
                    `/category/delete`,
                    { id: categoryId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                toast.success("Category deleted successfully!", {
                    position: "bottom-right",
                });

                navigate("/home"); // Navigate back to home or category list
            } catch (error) {
                const errorMessage = error.response?.data?.error || "Failed to delete category.";
                toast.error(errorMessage, {
                    position: "bottom-right",
                });
            }
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-bold mb-8">Edit Category</h1>
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded-lg"
                    >
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Category Name
                            </label>
                            <input
                                type="text"
                                name="categoryName"
                                value={categoryInput.categoryName}
                                onChange={handleInputChange}
                                className="input w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Category name"
                            />
                            {errors.categoryName && (
                                <p className="text-red-600 text-sm">{errors.categoryName}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={categoryInput.description}
                                onChange={handleInputChange}
                                className="input w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Category description"
                            />
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="submit"
                                className="btn btn-success"
                            >
                                {loading ? "Saving..." : "Save Category"}
                            </button>

                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EditCategoryPage;
