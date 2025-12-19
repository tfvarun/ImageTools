import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="logo">
            <img
              src={isDarkMode ? '/assets/dark_logo.png' : '/assets/light_logo.png'}
              alt="ImageConverter"
              className="logo-icon"
            />
            <span className="logo-text">ImageConverter</span>
          </Link>
          
          <div className="nav-right">
            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              <li>
                <Link 
                  to="/" 
                  className={isActive('/') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/convert" 
                  className={isActive('/convert') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Convert
                </Link>
              </li>
              <li>
                <Link 
                  to="/resize" 
                  className={isActive('/resize') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Resize
                </Link>
              </li>
              <li>
                <Link 
                  to="/crop" 
                  className={isActive('/crop') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Crop
                </Link>
              </li>
              <li>
                <Link 
                  to="/compress" 
                  className={isActive('/compress') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Compress
                </Link>
              </li>
            </ul>
            
            <div className="nav-actions">
              <button 
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              <button 
                className="menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
