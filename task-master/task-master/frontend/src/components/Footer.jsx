import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-200 text-gray-900 text-center py-4">
      <p>&copy; {new Date().getFullYear()} TaskMaster. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
