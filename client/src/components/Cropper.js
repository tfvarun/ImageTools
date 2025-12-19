import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Cropper.css';

const Cropper = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropMode, setCropMode] = useState('manual'); // 'manual' or 'preset'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(100); // percentage zoom for display
  const [isMoving, setIsMoving] = useState(false);
  const [moveStart, setMoveStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState(null);

  useEffect(() => {
    if (preview && imageRef.current) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        // Do not preselect; user will draw a selection
        setCropArea({ x: 0, y: 0, width: 0, height: 0 });
        // Fit-to-view default zoom (limit to ~800px width)
        const target = 800;
        const pct = Math.min(100, Math.round((target / img.width) * 100));
        setZoom(pct < 30 ? 30 : pct);
      };
      img.src = preview;
    }
  }, [preview]);

  const handleFileSelect = (selectedFile) => {
    setError('');
    setSuccess('');
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getImageScale = () => {
    if (!imageRef.current || !containerRef.current) return 1;
    const naturalWidth = imageDimensions.width || 1;
    const displayWidth = Math.round((zoom / 100) * naturalWidth);
    return displayWidth / naturalWidth;
  };

  const handleMouseDown = (e) => {
    if (!preview) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scale = getImageScale();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const handle = e.target.dataset && e.target.dataset.handle;
    if (handle) {
      setIsResizing(true);
      setActiveHandle(handle);
      setDragStart({ x, y });
      return;
    }

    const insideExisting =
      x >= cropArea.x &&
      y >= cropArea.y &&
      x <= cropArea.x + cropArea.width &&
      y <= cropArea.y + cropArea.height;

    if (insideExisting && cropArea.width > 0 && cropArea.height > 0) {
      setIsMoving(true);
      setMoveStart({ x, y });
    } else {
      setIsDragging(true);
      setDragStart({ x, y });
      setCropArea({ x, y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e) => {
    if ((!isDragging && !isMoving && !isResizing) || !preview || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scale = getImageScale();
    const currentX = Math.max(0, Math.min((e.clientX - rect.left) / scale, imageDimensions.width));
    const currentY = Math.max(0, Math.min((e.clientY - rect.top) / scale, imageDimensions.height));

    if (isResizing && activeHandle) {
      let x = cropArea.x;
      let y = cropArea.y;
      let w = cropArea.width;
      let h = cropArea.height;

      if (activeHandle === 'nw') {
        w = w + (x - currentX);
        h = h + (y - currentY);
        x = currentX;
        y = currentY;
      } else if (activeHandle === 'ne') {
        w = Math.abs(currentX - x);
        h = h + (y - currentY);
        y = currentY;
      } else if (activeHandle === 'sw') {
        w = w + (x - currentX);
        x = currentX;
        h = Math.abs(currentY - y);
      } else if (activeHandle === 'se') {
        w = Math.abs(currentX - x);
        h = Math.abs(currentY - y);
      }

      w = Math.max(1, Math.min(w, imageDimensions.width - x));
      h = Math.max(1, Math.min(h, imageDimensions.height - y));
      setCropArea({ x, y, width: w, height: h });
    } else if (isMoving) {
      const dx = currentX - moveStart.x;
      const dy = currentY - moveStart.y;
      let nx = cropArea.x + dx;
      let ny = cropArea.y + dy;
      nx = Math.max(0, Math.min(nx, imageDimensions.width - cropArea.width));
      ny = Math.max(0, Math.min(ny, imageDimensions.height - cropArea.height));
      setMoveStart({ x: currentX, y: currentY });
      setCropArea({ x: nx, y: ny, width: cropArea.width, height: cropArea.height });
    } else {
      const width = currentX - dragStart.x;
      const height = currentY - dragStart.y;
      const newX = width < 0 ? currentX : dragStart.x;
      const newY = height < 0 ? currentY : dragStart.y;
      const newWidth = Math.abs(width);
      const newHeight = Math.abs(height);
      const finalX = Math.max(0, Math.min(newX, imageDimensions.width - newWidth));
      const finalY = Math.max(0, Math.min(newY, imageDimensions.height - newHeight));
      const finalWidth = Math.min(newWidth, imageDimensions.width - finalX);
      const finalHeight = Math.min(newHeight, imageDimensions.height - finalY);
      setCropArea({ x: finalX, y: finalY, width: finalWidth, height: finalHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsMoving(false);
    setIsResizing(false);
    setActiveHandle(null);
  };

  useEffect(() => {
    const handleMouseMoveWrapper = (e) => handleMouseMove(e);
    const handleMouseUpWrapper = () => handleMouseUp();
    if (isDragging || isMoving || isResizing) {
      window.addEventListener('mousemove', handleMouseMoveWrapper);
      window.addEventListener('mouseup', handleMouseUpWrapper);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveWrapper);
        window.removeEventListener('mouseup', handleMouseUpWrapper);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isMoving, isResizing, dragStart, preview, cropArea, activeHandle, zoom, imageDimensions, moveStart]);

  const handleCrop = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (cropArea.width === 0 || cropArea.height === 0) {
      setError('Please select a crop area');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('x', Math.round(cropArea.x));
      formData.append('y', Math.round(cropArea.y));
      formData.append('width', Math.round(cropArea.width));
      formData.append('height', Math.round(cropArea.height));

      const response = await axios.post('/api/crop', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cropped-image.jpg');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Image successfully cropped!');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Crop failed. Please try again.');
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    if (!imageDimensions.width || !imageDimensions.height) return;
    
    const { width, height } = imageDimensions;
    let newCrop = {};

    switch (preset) {
      case 'square':
        const size = Math.min(width, height);
        newCrop = {
          x: (width - size) / 2,
          y: (height - size) / 2,
          width: size,
          height: size
        };
        break;
      case 'center':
        newCrop = {
          x: width * 0.1,
          y: height * 0.1,
          width: width * 0.8,
          height: height * 0.8
        };
        break;
      case 'portrait':
        newCrop = {
          x: 0,
          y: 0,
          width: width,
          height: height * 0.75
        };
        break;
      case 'landscape':
        newCrop = {
          x: 0,
          y: 0,
          width: width * 0.75,
          height: height
        };
        break;
      default:
        return;
    }

    setCropArea(newCrop);
  };

  const cropTypes = [
    { name: 'PNG Crop', format: 'png' },
    { name: 'JPG Crop', format: 'jpg' },
    { name: 'WebP Crop', format: 'webp' },
  ];

  const scale = getImageScale();
  const containerDisplayWidth = imageDimensions.width * scale;
  const containerDisplayHeight = imageDimensions.height * scale;
  const displayCrop = {
    x: cropArea.x * scale,
    y: cropArea.y * scale,
    width: cropArea.width * scale,
    height: cropArea.height * scale
  };
  const hasSelection = cropArea.width > 0 && cropArea.height > 0;

  return (
    <div className="cropper-page">
      <div className="container">
        <div className="page-header">
          <h1>Image Cropper</h1>
          <p>Crop images with pixel-perfect precision</p>
        </div>

        {/* Upload Area */}
            <div className="card">
          <h2>Universal Image Cropper</h2>

          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !preview && document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
            {preview ? (
              <>
                <div className="crop-scroll">
                  <div
                    className="crop-container"
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    style={{ width: imageDimensions.width ? `${Math.round((zoom/100)*imageDimensions.width)}px` : '100%' }}
                  >
                    <img
                      ref={imageRef}
                      src={preview}
                      alt="Preview"
                      className="crop-preview-image"
                      draggable={false}
                    />
                    {hasSelection && (
                      <>
                        <div className="crop-mask mask-top" style={{ left: 0, top: 0, width: `${containerDisplayWidth}px`, height: `${Math.max(0, displayCrop.y)}px` }}></div>
                        <div className="crop-mask mask-left" style={{ left: 0, top: `${displayCrop.y}px`, width: `${Math.max(0, displayCrop.x)}px`, height: `${displayCrop.height}px` }}></div>
                        <div className="crop-mask mask-right" style={{ left: `${displayCrop.x + displayCrop.width}px`, top: `${displayCrop.y}px`, width: `${Math.max(0, containerDisplayWidth - (displayCrop.x + displayCrop.width))}px`, height: `${displayCrop.height}px` }}></div>
                        <div className="crop-mask mask-bottom" style={{ left: 0, top: `${displayCrop.y + displayCrop.height}px`, width: `${containerDisplayWidth}px`, height: `${Math.max(0, containerDisplayHeight - (displayCrop.y + displayCrop.height))}px` }}></div>

                        <div
                          className="crop-overlay"
                          onMouseDown={handleMouseDown}
                          style={{
                            left: `${displayCrop.x}px`,
                            top: `${displayCrop.y}px`,
                            width: `${displayCrop.width}px`,
                            height: `${displayCrop.height}px`,
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)`,
                            backgroundSize: `${displayCrop.width/3}px ${displayCrop.height}px, ${displayCrop.width}px ${displayCrop.height/3}px`,
                            backgroundPosition: `calc(${displayCrop.width/3}px) 0, 0 calc(${displayCrop.height/3}px)`
                          }}
                        >
                          <div className="crop-handle crop-handle-nw" data-handle="nw" onMouseDown={handleMouseDown}></div>
                          <div className="crop-handle crop-handle-ne" data-handle="ne" onMouseDown={handleMouseDown}></div>
                          <div className="crop-handle crop-handle-sw" data-handle="sw" onMouseDown={handleMouseDown}></div>
                          <div className="crop-handle crop-handle-se" data-handle="se" onMouseDown={handleMouseDown}></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="zoom-toolbar">
                  <div className="zoom-pill">
                    <span className="zoom-dim">{Math.round(cropArea.width)}px × {Math.round(cropArea.height)}px</span>
                    <button className="zoom-btn" onClick={() => setZoom((z) => Math.max(30, z - 5))}>-</button>
                    <span className="zoom-percent">{zoom}%</span>
                    <button className="zoom-btn" onClick={() => setZoom((z) => Math.min(150, z + 5))}>+</button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="upload-icon">📁</div>
                <p className="upload-text">Click to upload or drag and drop</p>
                <p className="upload-hint">PNG, JPEG, WebP, and more</p>
              </div>
            )}
          </div>

          {preview && (
            <div className="crop-controls">
              <div className="crop-mode-selector">
                <button
                  className={`mode-btn ${cropMode === 'manual' ? 'active' : ''}`}
                  onClick={() => setCropMode('manual')}
                >
                  Manual Crop
                </button>
                <button
                  className={`mode-btn ${cropMode === 'preset' ? 'active' : ''}`}
                  onClick={() => setCropMode('preset')}
                >
                  Preset Crop
                </button>
              </div>

              {cropMode === 'preset' && (
                <div className="preset-buttons">
                  <button className="btn btn-secondary" onClick={() => applyPreset('square')}>
                    Square
                  </button>
                  <button className="btn btn-secondary" onClick={() => applyPreset('center')}>
                    Center
                  </button>
                  <button className="btn btn-secondary" onClick={() => applyPreset('portrait')}>
                    Portrait
                  </button>
                  <button className="btn btn-secondary" onClick={() => applyPreset('landscape')}>
                    Landscape
                  </button>
                </div>
              )}

              


              <button
                className="btn btn-primary"
                onClick={handleCrop}
                disabled={loading || cropArea.width === 0 || cropArea.height === 0}
              >
                {loading ? 'Cropping...' : 'Crop Image'}
              </button>
            </div>
          )}

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </div>

        {/* Format-Specific Croppers */}
        <div className="card">
          <h2>Format-Specific Croppers</h2>
          <div className="cropper-types">
            {cropTypes.map((type, index) => (
              <div key={index} className="cropper-type-card">
                <h3>{type.name}</h3>
                <p>Crop {type.format.toUpperCase()} images with precision</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const input = document.getElementById('file-input');
                    input.accept = `.${type.format},image/${type.format}`;
                    input.click();
                  }}
                >
                  Select {type.format.toUpperCase()} File
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cropper;
