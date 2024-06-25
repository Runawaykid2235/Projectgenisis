// src/Components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Sidenav from './sidenav';

function Home() {
  return (
    <div className="main-container">
      <Sidenav />
      <div className="content">
        <h1>Home Page</h1>
        <p>Welcome to the Home Page! HOME HOME HOME HOME</p>
        <Link to="/">
          <button>Back to Main App</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
