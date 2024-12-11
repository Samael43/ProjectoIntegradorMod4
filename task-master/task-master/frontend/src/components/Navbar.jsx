import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate("/search/" + searchTerm);
            console.log("Search term:", searchTerm);
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="bg-black text-white px-4 py-2 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-10">
                    {/* Logo and Home Link */}
                    <h1 className="text-2xl font-semibold">
                        <Link to="/home">Task<span className="text-gray-300 font-bold -tracking-tighter">Master</span></Link>
                    </h1>

                    {/* Navigation Links */}
                    <ul className="hidden md:flex space-x-4">
                        <li>
                            <Link
                                to="/add-task"
                                className="inline-block px-3 py-2 w-full text-white hover:no-underline hover:bg-gray-700 rounded-md"
                            >
                                Add Tasks
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/add-category"
                                className="inline-block px-3 py-2 w-full text-white hover:no-underline hover:bg-gray-700 rounded-md"
                            >
                                Add Category
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/home"
                                className="inline-block px-3 py-2 w-full text-white hover:no-underline hover:bg-gray-700 rounded-md"
                            >
                                Tasks
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/profile"
                                className="inline-block px-3 py-2 w-full text-white hover:no-underline hover:bg-gray-700 rounded-md"
                            >
                                Profile
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex items-center space-x-2">
                    <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search Tasks..."
                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white focus:outline-none"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Mobile Menu Hamburger */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={toggleMenu}
                        className="text-white focus:outline-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {menuOpen && (
                <div className="md:hidden flex flex-col space-y-4 mt-4 bg-gray-800 p-4 rounded-lg">
                    {/* Navigation Links */}
                    <ul>
                        <li>
                            <Link
                                to="/add-category"
                                className="inline-block px-3 py-2 w-full text-white hover:no-underline hover:bg-gray-700 rounded-md"
                            >
                                Add Category
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/add-task"
                                className="inline-block px-3 py-2 w-full text-white hover:no-underline hover:bg-gray-700 rounded-md"
                            >
                                Add Tasks
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/home"
                                className="inline-block px-3 py-2 w-full text-white hover:no-underline hover:bg-gray-700 rounded-md"
                            >
                                Tasks
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/profile"
                                className="inline-block px-3 py-2 w-full text-white hover:no-underline hover:bg-gray-700 rounded-md"
                            >
                                Profile
                            </Link>
                        </li>
                    </ul>

                    {/* Search Bar (Mobile) */}
                    <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 mt-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search Tasks..."
                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white focus:outline-none"
                        >
                            Search
                        </button>
                    </form>
                </div>
            )}

        </nav>
    );
};

export default Navbar;
