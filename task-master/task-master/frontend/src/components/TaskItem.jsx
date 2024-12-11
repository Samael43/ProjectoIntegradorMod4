import React from 'react';
import { Link } from "react-router-dom";
import api from '../api/api';  // Make sure to import axios for HTTP requests
import { toast } from 'react-toastify';  // Optional: for showing success/error messages

const TaskItem = ({ task, onDelete }) => {
    const handleDelete = async (taskId) => {

        if (!confirm("are you sure to delete the task parmanently?"))
            return;

        try {
            const token = localStorage.getItem("accessToken"); // Get token from local storage
            const response = await api.post(
                '/task/delete',
                { id: taskId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 204) {
                // Notify success and trigger callback to remove task from UI
                toast.success('Task deleted successfully!', { position: 'bottom-right' });
                onDelete(taskId);  // Assuming onDelete is a function passed from the parent component
            }
        } catch (error) {
            toast.error('Failed to delete task.', { position: 'bottom-right' });
            console.error(error);
        }
    };

    return (
        <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-xl mb-2">{task.title}</h3>
            <p className="mb-3">{task.description}</p>

            <div className="flex gap-3 flex-wrap">
                {task.due_date == null ? "" : (
                    <p className="text-sm text-gray-900 border px-3 py-1 bg-gray-100 border-gray-300 rounded-md">Due: {task.due_date}</p>
                )}

                <p className="text-sm text-gray-900 border px-3 py-1 bg-gray-100 border-gray-300 rounded-md">Priority: {task.priority}</p>
                <p className="text-sm text-gray-900 border px-3 py-1 bg-gray-100 border-gray-300 rounded-md">Status: {task.status}</p>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
                <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(task.id)} // Call handleDelete on button click
                >
                    Delete
                </button>
                <Link to={`/edit-task/${task.id}`} className="btn btn-sm btn-success">
                    Edit
                </Link>
            </div>
        </div>
    );
};

export default TaskItem;
