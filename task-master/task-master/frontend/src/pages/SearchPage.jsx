import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TaskItem from "../components/TaskItem";
import api from "../api/api"; // Import the API utility to make requests

const SearchPage = () => {
    const { searchTerm } = useParams(); // Get the search term from the URL
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true); // Add a loading state
    const [error, setError] = useState(""); // Add an error state if the API fails

    useEffect(() => {
        document.title = `Search - ${searchTerm} - Task Master`;
    }, [searchTerm]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true); // Set loading to true when fetching
                const response = await api.get(`/tasks/search/${searchTerm}`); // Make the API call to search tasks
                setTasks(response.data); // Set the tasks to state
                setLoading(false); // Set loading to false once the data is fetched
            } catch (error) {
                setError("Failed to fetch tasks.");
                setLoading(false);
            }
        };

        fetchTasks();
    }, [searchTerm]); // Fetch tasks whenever the search term changes
  
    // Function to handle task deletion
    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };
    
    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-bold mb-8">{searchTerm} Tasks</h1>
                    {/* Loading state */}
                    {loading ? (
                        <div>Loading tasks...</div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <div className="space-y-4">
                            {/* Display the tasks */}
                            {tasks.length > 0 ? (
                                tasks.map((task) => <TaskItem key={task.id} task={task} onDelete={handleDeleteTask} />)
                            ) : (
                                <div>No tasks found for "{searchTerm}"</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
};

export default SearchPage;
