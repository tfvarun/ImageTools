# Quick Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation Steps

1. **Install Backend Dependencies**
   ```bash
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```
   Or use the npm script:
   ```bash
   npm run install-client
   ```

## Running the Application

### Development Mode (Recommended)

**Terminal 1 - Backend Server:**
```bash
npm run dev
```
This starts the Express server on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run client
```
This starts the React development server on `http://localhost:3000`

Open your browser and navigate to `http://localhost:3000`

### Production Mode

1. Build the React app:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:5000`

## Features Overview

### Image Converter
- Navigate to `/convert` or click "Convert" in the navbar
- Upload an image to see all available conversion formats
- Select target format and convert
- Quick conversion buttons for common formats

### Image Resizer
- Navigate to `/resize` or click "Resize" in the navbar
- Choose single or bulk resize mode
- Enter width and height
- Option to maintain aspect ratio
- Format-specific resizers available

### Image Cropper
- Navigate to `/crop` or click "Crop" in the navbar
- Upload an image
- Drag to select crop area
- Use preset crops (Square, Center, Portrait, Landscape)
- Format-specific croppers available

## Notes

- Files are automatically deleted after processing for privacy
- Maximum file size: 100MB
- Supported formats: PNG, JPEG, JPG, WebP, HEIC, JFIF, SVG
- HEIC support may require additional system libraries on some platforms

## Troubleshooting

**Port already in use:**
- Change the PORT in `.env` file or set `PORT=5001 npm start`

**Sharp installation issues:**
- On Linux, you may need: `sudo apt-get install libvips-dev`
- On macOS: `brew install vips`
- On Windows: Usually works out of the box

**CORS errors:**
- Make sure the backend is running on port 5000
- Check that the frontend proxy is set correctly in `client/package.json`





