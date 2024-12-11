import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams for URL parameters
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { toast } from "react-toastify";
import api from "../../api/api";

const EditTaskPage = () => {
    const { taskId } = useParams(); // Get the taskId from URL
    const navigate = useNavigate(); // For navigation after updating

    useEffect(() => {
        document.title = `Edit Task - Task Master`;
    }, []);

    const [taskInput, setTaskInput] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "low",
        category: "",
        status: "pending",
    });

    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [updating, setUpdating] = useState(false);

    // Fetch categories for the task form
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const response = await api.get("/category/read", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCategories(response.data);
            } catch (error) {
                setErrors(error.response?.data?.detail || "Failed to fetch categories.");
                toast.error(error.response?.data?.detail || "Failed to load categories.", {
                    position: "bottom-right",
                });
            }
        };

        fetchCategories();
    }, []);

    // Fetch task data by taskId
    useEffect(() => {
        const fetchTask = async () => {
            try {
                const token = localStorage.getItem("accessToken");

                const response = await api.get(
                    `/task/${taskId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }

                );

                setTaskInput({
                    title: response.data.title,
                    description: response.data.description,
                    dueDate: response.data.due_date,
                    priority: response.data.priority,
                    status: response.data.status,
                    category: response.data.category_id,
                }); // Set the fetched task data
            } catch (error) {
                toast.error("Failed to fetch task data.", {
                    position: "bottom-right",
                });
            }
        };

        fetchTask();
    }, [taskId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTaskInput({ ...taskInput, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!taskInput.title.trim()) newErrors.title = "Title is required.";
        if (!taskInput.category) newErrors.category = "Category is required.";
        if (!taskInput.priority) newErrors.priority = "Priority is required.";
        if (!taskInput.status) newErrors.status = "Status is required.";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setErrors({});
            setUpdating(true);

            try {
                const token = localStorage.getItem("accessToken");
                const user = JSON.parse(localStorage.getItem("user"));

                await api.post(
                    `/task/edit`,
                    {
                        id: taskId,
                        title: taskInput.title,
                        description: taskInput.description,
                        due_date: taskInput.dueDate,
                        priority: taskInput.priority,
                        status: taskInput.status,
                        category: taskInput.category,
                        author: user.id,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                toast.success("Task updated successfully!", {
                    position: "bottom-right",
                });

                navigate(`/category/${taskInput.category}`); // Redirect to the task details page

            } catch (error) {
                toast.error("Failed to update task. Please try again.", {
                    position: "bottom-right",
                });
            } finally {
                setUpdating(false);
            }
        } else {
            toast.error("Please correct the form errors.", {
                position: "bottom-right",
            });
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-bold mb-8">Edit Task</h1>
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg">

                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Task Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={taskInput.title}
                                onChange={handleInputChange}
                                className="input w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Task title"
                            />
                            {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Task Description
                            </label>
                            <textarea
                                name="description"
                                value={taskInput.description}
                                onChange={handleInputChange}
                                className="input w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Task description"
                            ></textarea>
                            {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
                        </div>

                        <div className="md:flex md:space-x-4 mb-4">
                            <div className="md:w-1/2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={taskInput.dueDate}
                                    onChange={handleInputChange}
                                    className="input w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="md:w-1/2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Priority</label>
                                <select
                                    name="priority"
                                    value={taskInput.priority}
                                    onChange={handleInputChange}
                                    className="input w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="md:flex md:space-x-4 mb-4">
                            <div className="md:w-1/2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                                <select
                                    name="category"
                                    value={taskInput.category}
                                    onChange={handleInputChange}
                                    className="input w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-red-600 text-sm">{errors.category}</p>}
                            </div>

                            <div className="md:w-1/2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                                <select
                                    name="status"
                                    value={taskInput.status}
                                    onChange={handleInputChange}
                                    className="input w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="inprogress">In progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-success"
                        >
                            {updating ? "Updating..." : "Save Task"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EditTaskPage;
