import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TaskItem from "../components/TaskItem";
import { toast } from "react-toastify";
import api from "../api/api";

const CategoryPage = () => {
    const { id } = useParams(); // Get the category ID from the URL
    const [tasks, setTasks] = useState([]);
    const [categoryName, setCategoryName] = useState(""); // State to store category name
    const [categoryDesc, setCategoryDesc] = useState(""); // State to store category name
    const [filter, setFilter] = useState("all"); // Manage task filtering by status
    const [priorityFilter, setPriorityFilter] = useState("all"); // Manage priority filtering

    const [sortCriteria, setSortCriteria] = useState({
        field: "", // "title" or "dueDate"
        direction: "asc", // "asc" or "desc"
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryAndTasks = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("accessToken"); // Retrieve the token

                // Fetch category details
                const categoryResponse = await api.get(`/category/${id}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCategoryName(categoryResponse.data.name);
                setCategoryDesc(categoryResponse.data.description);

                // Fetch tasks for the category
                const tasksResponse = await api.get(`/category/${id}/tasks/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setTasks(tasksResponse.data);
            } catch (err) {
                setError(err.response?.data?.detail || "Failed to fetch data.");
                toast.error(err.response?.data?.detail || "Failed to load data.", {
                    position: "bottom-right",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryAndTasks();
    }, [id]);

    // Update document title with category name
    useEffect(() => {
        if (categoryName) {
            document.title = `${categoryName} Tasks - Task Master`;
        }
    }, [categoryName]);

    // Filter tasks based on status and priority
    const filteredTasks = tasks.filter((task) => {
        const statusMatch = filter === "all" || task.status === filter;
        const priorityMatch = priorityFilter === "all" || task.priority === priorityFilter;
        return statusMatch && priorityMatch;
    });

    // Sort tasks based on selected criteria
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortCriteria.field === "dueDate") {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return sortCriteria.direction === "asc" ? dateA - dateB : dateB - dateA;
        }
        if (sortCriteria.field === "title") {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            if (sortCriteria.direction === "asc") {
                return titleA.localeCompare(titleB);
            } else {
                return titleB.localeCompare(titleA);
            }
        }
        return 0; // No sorting if no criteria is selected
    });

    // Function to handle task deletion
    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center gap-10 mb-3">
                        <h1 className="text-2xl font-bold">
                            {`${categoryName} Tasks`}
                        </h1>
                        <Link to={`/edit-category/${id}`} className="btn btn-sm btn-success">
                            Edit Category
                        </Link>
                    </div>

                    <p className="mb-8 text-gray-600">{categoryDesc}</p>

                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap gap-5">
                        <Link to="/add-task" className="btn btn-primary">
                            Add Task
                        </Link>

                        {/* Status Filter */}
                        <div className="max-w-[200px]">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="input"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div className="max-w-[200px]">
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="input"
                            >
                                <option value="all">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        {/* Sorting Dropdown */}
                        <div className="max-w-[200px]">
                            <select
                                value={`${sortCriteria.field}-${sortCriteria.direction}`}
                                onChange={(e) => {
                                    const [field, direction] = e.target.value.split("-");
                                    setSortCriteria({ field, direction });
                                }}
                                className="input"
                            >
                                <option value="">Sort by</option>
                                <option value="dueDate-asc">Due Date (Ascending)</option>
                                <option value="dueDate-desc">Due Date (Descending)</option>
                                <option value="title-asc">Title (Ascending)</option>
                                <option value="title-desc">Title (Descending)</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading and Error Handling */}
                    {loading && <p>Loading tasks...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    {/* Task List */}
                    {!loading && !error && (
                        <div className="space-y-4">
                            {sortedTasks.map((task) => (
                                <TaskItem key={task.id} task={task} onDelete={handleDeleteTask} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CategoryPage;
