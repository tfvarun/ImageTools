import React, { useState } from 'react';
import axios from 'axios';
import './Resizer.css';

const Resizer = () => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [preview, setPreview] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'

  const handleFileSelect = (selectedFile) => {
    setError('');
    setSuccess('');
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);

    // Get image dimensions for preview
    const img = new Image();
    img.onload = () => {
      if (maintainAspectRatio && !width && !height) {
        setWidth(img.width);
        setHeight(img.height);
      }
    };
    img.src = reader.result;
  };

  const handleFilesSelect = (selectedFiles) => {
    setError('');
    setSuccess('');
    const arr = Array.from(selectedFiles);
    setFiles(arr);

    // Generate object URLs for previews
    const previews = arr.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f)
    }));
    setFilePreviews(previews);
  };

  // Cleanup object URLs when files change or component unmounts
  React.useEffect(() => {
    return () => {
      filePreviews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [filePreviews]);

  const handleDrop = (e) => {
    e.preventDefault();
    if (mode === 'bulk') {
      handleFilesSelect(e.dataTransfer.files);
    } else {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleResize = async () => {
    if (mode === 'bulk') {
      if (files.length === 0) {
        setError('Please select files');
        return;
      }
    } else {
      if (!file) {
        setError('Please select a file');
        return;
      }
    }

    if (!width || !height) {
      setError('Please enter width and height');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      const endpoint = mode === 'bulk' ? '/api/bulk-resize' : '/api/resize';
      
      if (mode === 'bulk') {
        files.forEach((f) => {
          formData.append('files', f);
        });
      } else {
        formData.append('file', file);
      }

      formData.append('width', width);
      formData.append('height', height);
      formData.append('maintainAspectRatio', maintainAspectRatio);

      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      // Check if response is JSON (for bulk with multiple files)
      if (response.headers['content-type']?.includes('application/json')) {
        const text = await response.data.text();
        const data = JSON.parse(text);
        setSuccess(`Processed ${data.files?.length || files.length} file(s). Download started.`);
      } else {
        // Create download link for blob response
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const extension = file?.name.split('.').pop() || 'jpg';
        link.setAttribute('download', mode === 'bulk' 
          ? `resized-${Date.now()}.${extension}` 
          : `resized-${Date.now()}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setSuccess(mode === 'bulk' 
          ? `${files.length} image(s) successfully resized!` 
          : 'Image successfully resized!');
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Resize failed. Please try again.');
      setLoading(false);
    }
  };

  const resizeTypes = [
    { name: 'PNG Resizer', format: 'png' },
    { name: 'JPG Resizer', format: 'jpg' },
    { name: 'WebP Resizer', format: 'webp' },
  ];

  return (
    <div className="resizer-page">
      <div className="container">
        <div className="page-header">
          <h1>Image Resizer</h1>
          <p>Resize single or multiple images with precise dimensions</p>
        </div>

        {/* Mode Selection */}
        <div className="card">
          <div className="mode-selector">
            <button
              className={`mode-btn ${mode === 'single' ? 'active' : ''}`}
              onClick={() => setMode('single')}
            >
              Single Image
            </button>
            <button
              className={`mode-btn ${mode === 'bulk' ? 'active' : ''}`}
              onClick={() => setMode('bulk')}
            >
              Bulk Resize
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="card">
          <h2>{mode === 'bulk' ? 'Bulk Resizer' : 'Image Resizer'}</h2>
          
          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => {
              const input = document.getElementById(mode === 'bulk' ? 'files-input' : 'file-input');
              input.click();
            }}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <input
              id="files-input"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFilesSelect(e.target.files)}
              style={{ display: 'none' }}
            />
            {mode === 'bulk' ? (
              files.length > 0 ? (
                <div className="files-preview">
                  <p className="file-count">{files.length} file(s) selected</p>
                  <div className="files-grid">
                    {filePreviews.map((p, i) => (
                      <div key={i} className="file-thumb">
                        <img src={p.url} alt={p.name} />
                        <span className="file-thumb-name" title={p.name}>{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="upload-icon">📁</div>
                  <p className="upload-text">Click to upload or drag and drop</p>
                  <p className="upload-hint">Select multiple images</p>
                </div>
              )
            ) : (
              preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-image" />
                  <p className="file-info">{file.name}</p>
                </div>
              ) : (
                <div>
                  <div className="upload-icon">📁</div>
                  <p className="upload-text">Click to upload or drag and drop</p>
                  <p className="upload-hint">PNG, JPEG, WebP, and more</p>
                </div>
              )
            )}
          </div>

          {/* Resize Options */}
          <div className="resize-options">
            <div className="input-row">
              <div className="input-group">
                <label>Width (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => {
                    setWidth(e.target.value);
                    if (maintainAspectRatio && preview && file) {
                      const img = new Image();
                      img.onload = () => {
                        const aspectRatio = img.width / img.height;
                        setHeight(Math.round(e.target.value / aspectRatio));
                      };
                      img.src = preview;
                    }
                  }}
                  placeholder="Width"
                  min="1"
                />
              </div>
              <div className="input-group">
                <label>Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    if (maintainAspectRatio && preview && file) {
                      const img = new Image();
                      img.onload = () => {
                        const aspectRatio = img.width / img.height;
                        setWidth(Math.round(e.target.value * aspectRatio));
                      };
                      img.src = preview;
                    }
                  }}
                  placeholder="Height"
                  min="1"
                />
              </div>
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                />
                Maintain aspect ratio
              </label>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleResize}
              disabled={loading}
            >
              {loading ? 'Resizing...' : 'Resize Image(s)'}
            </button>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </div>

        {/* Format-Specific Resizers */}
        <div className="card">
          <h2>Format-Specific Resizers</h2>
          <div className="resizer-types">
            {resizeTypes.map((type, index) => (
              <div key={index} className="resizer-type-card">
                <h3>{type.name}</h3>
                <p>Resize {type.format.toUpperCase()} images with precision</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setMode('single');
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

export default Resizer;
