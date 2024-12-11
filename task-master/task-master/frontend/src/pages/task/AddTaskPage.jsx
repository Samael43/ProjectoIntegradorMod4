import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { toast } from "react-toastify";
import api from "../../api/api";

const AddTaskPage = () => {

    useEffect(() => {
        document.title = `Add Task - Task Master`
    }, [])

    const [taskInput, setTaskInput] = useState({
        title: "",
        description: "",
        dueDate: null,
        priority: "low",
        category: "",
        status: "pending",
    });

    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [adding, setAdding] = useState(false);

    // Fetch categories for the task form
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("accessToken")
                const response = await api.get("/category/read", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                setCategories(response.data)
            } catch (error) {
                setErrors(error.response?.data?.detail || "Failed to fetch categories.");
                toast.error(error.response?.data?.detail || "Failed to load categories.", {
                    position: "bottom-right",
                });
            }
        }

        fetchCategories();

    }, [])

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

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setErrors({});

            setAdding(true);

            try {
                const token = localStorage.getItem("accessToken")
                const user = JSON.parse(localStorage.getItem("user"))
                console.log(taskInput)
                await api.post(
                    "/task/create",
                    {
                        title: taskInput.title,
                        description: taskInput.description,
                        due_date: taskInput.dueDate,
                        priority: taskInput.priority,
                        status: taskInput.status,
                        category: taskInput.category,
                        author: user.id
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                    }
                );

                setTaskInput({
                    title: "",
                    description: "",
                    dueDate: taskInput.dueDate,
                    status: taskInput.status,
                    category: taskInput.category,
                    priority: taskInput.priority,
                })

                toast.success("Task added successfully!", {
                    position: "bottom-right"
                })
            } catch (error) {
                toast.error("Failed to add task. Please try again.", {
                    position: "bottom-right"
                })
            } finally {
                setAdding(false)
            }
        } else {
            toast.error("Please correct the form errors.", {
                position: "bottom-right"
            })
        }
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-bold mb-8">Add Task</h1>
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded-lg"
                    >
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
                        </div>

                        <div className="md:flex md:space-x-4">
                            <div className="mb-4 md:w-1/2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={taskInput.dueDate}
                                    onChange={handleInputChange}
                                    className="input w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="mb-4 md:w-1/2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Priority <span className="text-red-500">*</span>
                                </label>
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
                                {errors.priority && <p className="text-red-600 text-sm">{errors.priority}</p>}
                            </div>
                        </div>


                        <div className="md:flex md:space-x-4">
                            <div className="mb-4 md:w-1/2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Category <span className="text-red-500">*</span>
                                </label>
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

                            <div className="mb-4 md:w-1/2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Status <span className="text-red-500">*</span>
                                </label>
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
                                {errors.status && <p className="text-red-600 text-sm">{errors.status}</p>}
                            </div>
                        </div>


                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            {adding ? "Adding..." : "Create Task"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AddTaskPage;
