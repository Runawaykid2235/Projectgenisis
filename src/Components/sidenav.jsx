// src/Components/Sidenav.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './main.css'; // Ensure this is imported for consistent styling

function Sidenav() {
  return (
    <div className="sidenav">
      <Link to="/home">
        <button className="nav-button">Home</button>
      </Link>
      <Link to="/profile">
        <button className="nav-button">Profile</button>
      </Link>
      <Link to="/dashboard">
        <button className="nav-button">Dashboard</button>
      </Link>
      <Link to="/superimposer">
        <button className="nav-button">Superimposer</button>
      </Link>
    </div>
  );
}

export default Sidenav;
