import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { toast } from "react-toastify";
import api from "../../api/api"

const AddCategoryPage = () => {

    useEffect(() => {
        document.title = `Add Category - Task Master`
    }, [])

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [categoryInput, setCategoryInput] = useState({
        categoryName: "",
        description: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCategoryInput({ ...categoryInput, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!categoryInput.categoryName.trim()) newErrors.categoryName = "Category name is required."

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setErrors({});
            setLoading(true);

            try {
                await api.post('/category/create', {
                    name: categoryInput.categoryName,
                    description: categoryInput.description,
                });

                toast.success("Category added successfully!", {
                    position: "bottom-right"
                });

                setCategoryInput({
                    categoryName: "",
                    description: "",
                });

            } catch (error) {
                // Check if there is an error message for the 'name' field
                const errorMessage = error.response?.data?.name ? error.response.data.name[0] : "Category not added.";

                toast.error(errorMessage, {
                    position: "bottom-right"
                });
            } finally {
                setLoading(false);
            }
        } else {
            toast.error("Please enter category name.", {
                position: "bottom-right"
            });
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
                <div className="max-w-5xl mx-auto">

                    <h1 className="text-2xl font-bold mb-8">Add Category</h1>

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

                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            {loading ? "Adding.." : "Add Category"}
                        </button>

                    </form>

                </div>
            </div>
            <Footer />
        </>
    );
};

export default AddCategoryPage;
