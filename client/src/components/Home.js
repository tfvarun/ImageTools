import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Convert, Resize & Crop Images</h1>
            <p className="hero-subtitle">
              Free online tool to convert images between formats, resize them, and crop with precision.
              Support for PNG, JPEG, WebP, HEIC, SVG, and more.
            </p>
            <div className="hero-buttons">
              <Link to="/convert" className="btn btn-primary">
                Convert Images
              </Link>
              <Link to="/resize" className="btn btn-secondary">
                Resize Images
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How to Convert Section */}
      <section className="how-to-section section">
        <div className="container">
          <h2 className="section-title">How to Convert Images</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Your Image</h3>
              <p>Click the "Choose Files" button or drag and drop your image file into the upload area. 
                 We support PNG, JPEG, WebP, HEIC, JFIF, and SVG formats.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Select Conversion Options</h3>
              <p>Choose your target format from the available options. Our smart converter will show 
                 you all compatible formats based on your uploaded file type.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Download Your Converted Image</h3>
              <p>Once the conversion is complete, click the download button to save your converted 
                 image to your device. Files are automatically deleted after processing for your privacy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/icon/convert.gif" alt="Conversion" className="feature-icon-img" />
              </div>
              <h3>Image Conversion</h3>
              <p>Convert between PNG, JPEG, WebP, HEIC, JFIF, and SVG formats with high quality preservation.</p>
              <Link to="/convert" className="feature-link">Try Converter →</Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/icon/resize.gif" alt="Resizing" className="feature-icon-img" />
              </div>
              <h3>Image Resizing</h3>
              <p>Resize single or multiple images with precise dimensions. Maintain aspect ratio or customize freely.</p>
              <Link to="/resize" className="feature-link">Try Resizer →</Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/icon/crop.gif" alt="Cropping" className="feature-icon-img" />
              </div>
              <h3>Image Cropping</h3>
              <p>Crop images with pixel-perfect precision. Select the exact area you want to keep.</p>
              <Link to="/crop" className="feature-link">Try Cropper →</Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/icon/security.gif" alt="Privacy & Security" className="feature-icon-img" />
              </div>
              <h3>Privacy & Security</h3>
              <p>Your files are processed securely and automatically deleted after conversion. No storage, no tracking.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/icon/fast.gif" alt="Fast Processing" className="feature-icon-img" />
              </div>
              <h3>Fast Processing</h3>
              <p>Lightning-fast image processing powered by advanced algorithms. Get results in seconds.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/icon/works.gif" alt="Works Everywhere" className="feature-icon-img" />
              </div>
              <h3>Works Everywhere</h3>
              <p>No software installation needed. Works on Windows, Mac, Linux, and mobile devices in any browser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="formats-section section">
        <div className="container">
          <h2 className="section-title">Supported Formats</h2>
          <div className="formats-list">
            <div className="format-item">PNG</div>
            <div className="format-item">JPEG / JPG</div>
            <div className="format-item">WebP</div>
            <div className="format-item">HEIC</div>
            <div className="format-item">JFIF</div>
            <div className="format-item">SVG</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;





