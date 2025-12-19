import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Compressor.css';

const Compressor = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [quality, setQuality] = useState(70);
  const [mode, setMode] = useState('quality');
  const [maxSizeKb, setMaxSizeKb] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [estimateBytes, setEstimateBytes] = useState(null);

  const debounceRef = useRef(null);
  const rangeRef = useRef(null);
  

  

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

  useEffect(() => {
    if (!file) {
      setEstimateBytes(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (mode === 'quality') {
          formData.append('quality', quality);
        } else {
          formData.append('maxSizeKb', maxSizeKb || '');
        }
        const response = await axios.post('/api/compress-preview', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEstimateBytes(response.data?.bytes || null);
      } catch (err) {
        setEstimateBytes(null);
      }
    }, 400);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [file, quality, mode, maxSizeKb]);

  const handleCompress = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (mode === 'quality') {
        formData.append('quality', quality);
      } else {
        formData.append('maxSizeKb', maxSizeKb);
      }

      const response = await axios.post('/api/compress', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const cd = response.headers['content-disposition'] || '';
      const match = cd.match(/filename="?([^";]+)"?/i);
      const suggested = match ? match[1] : null;
      const ext = (suggested?.split('.').pop() || file.name.split('.').pop() || 'jpg').toLowerCase();
      link.setAttribute('download', suggested || `compressed-${Date.now()}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Image successfully compressed!');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Compression failed. Please try again.');
      setLoading(false);
    }
  };
    const MIN = 5;
  const MAX = 100;
  const percent = ((quality - MIN) / (MAX - MIN)) * 100;
  return (
    <div className="compressor-page">
      <div className="container">
        <div className="page-header">
          <h1>Image Compressor</h1>
          <p>Reduce file size while maintaining visual quality</p>
        </div>

        <div className="card">
          <h2>Universal Image Compressor</h2>
          <p className="section-description">Upload any image and choose compression quality.</p>

          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('compress-file-input')?.click()}
          >
            <input
              id="compress-file-input"
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
            {preview ? (
              <div className="preview-container">
                <img src={preview} alt="Preview" className="preview-image" />
                <p className="file-info">{file.name}</p>
              </div>
            ) : (
              <div>
                <div className="upload-icon">📁</div>
                <p className="upload-text">Click to upload or drag and drop</p>
                <p className="upload-hint">PNG, JPEG, WebP, HEIC, and more</p>
                <p className="upload-hint">Max file: 10 MB</p>
              </div>
            )}
          </div>

          <div className="compression-options">
            <div className="mode-group">
              <label>
                <input
                  type="radio"
                  name="compress-mode"
                  value="quality"
                  checked={mode === 'quality'}
                  onChange={() => setMode('quality')}
                />
                Use quality
              </label>
              <label>
                <input
                  type="radio"
                  name="compress-mode"
                  value="size"
                  checked={mode === 'size'}
                  onChange={() => setMode('size')}
                />
                Use file size
              </label>
            </div>

            {mode === 'quality' && (
              <div className="input-group">
                <label>Quality</label>
                <div className="quality-slider" style={{ '--percent': `${percent}%` }}>
                  <div className="slider-label" style={{ left: 'var(--percent)' }}>{quality}%</div>
                  <input
                    ref={rangeRef}
                    type="range"
                    min={MIN}
                    max={MAX}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}

            {mode === 'size' && (
              <div className="input-group">
                <label>Max file size (KB)</label>
                <input
                  type="number"
                  className="text-input"
                  min="1"
                  value={maxSizeKb}
                  onChange={(e) => setMaxSizeKb(e.target.value)}
                  placeholder="e.g. 200"
                />
              </div>
            )}

            {file && (
              <div className="size-readout">
                <span>Original: {(file.size / 1024).toFixed(2)} KB</span>
                {estimateBytes !== null && (
                  <span>
                    {' '}· Estimated: {(estimateBytes / 1024).toFixed(2)} KB ({
                      ((1 - (estimateBytes / file.size)) * 100).toFixed(0)
                    }%)
                  </span>
                )}
              </div>
            )}

            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={handleCompress}
                disabled={loading || !file || (mode === 'size' && !maxSizeKb)}
              >
                {loading ? 'Compressing...' : 'Compress Image'}
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </div>
      </div>
    </div>
  );
};

export default Compressor;
