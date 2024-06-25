import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import Sidenav from './sidenav';
import './main.css';

function Dashboard() {
  const [fileUploads, setFileUploads] = useState([]);
  const [checkboxes, setCheckboxes] = useState({
    Rotation: false,
    Scaling: false,
    Blur: false,
  });

  const [ranges, setRanges] = useState({
    minBlur: 0,
    maxBlur: 100,
    minRotation: 0,
    maxRotation: 360,
    minScaling: 1,
    maxScaling: 10,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [blurAmount, setBlurAmount] = useState(0);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxes({
      ...checkboxes,
      [name]: checked,
    });
  };

  const handleRangeChange = (event) => {
    const { name, value } = event.target;
    setRanges({
      ...ranges,
      [name]: value,
    });
  };

  const handleFileUpload = async (files) => {
    if (!files.length) return;

    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file, index) => {
          const fileBase64 = await fileToBase64(file);

          if (index === 0) {
            generatePreview(file);
          }

          return {
            filename: file.name,
            data: fileBase64,
            options: {
              checkboxes: JSON.stringify(checkboxes),
              ranges: JSON.stringify(ranges),
            },
          };
        })
      );

      setFileUploads(uploads);
    } catch (error) {
      console.error('Error processing files:', error);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleInputFileChange = (event) => {
    const files = event.target.files;
    handleFileUpload(files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const generatePreview = async (file) => {
    const fileURL = URL.createObjectURL(file);
    setPreviewImage(fileURL);

    if (checkboxes.Blur) {
      const blurredDataURL = await applyBlurEffect(file, blurAmount);
      setPreviewImage(blurredDataURL);
    }
  };

  const applyBlurEffect = (file, blurAmount) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleBlurChange = () => {
    const { minBlur, maxBlur } = ranges;
    const calculatedBlur = (parseInt(minBlur) + parseInt(maxBlur)) / 2; // Simple average
    setBlurAmount(calculatedBlur);
  };

  const handleSubmit = async () => {
    try {
      const response = await invoke('files_send_from_front', { fileUploads });
      console.log('Response from backend:', response);
    } catch (error) {
      console.error('Error invoking backend function:', error);
    }
  };

  useEffect(() => {
    handleBlurChange();
  }, [ranges.minBlur, ranges.maxBlur]); // Run whenever minBlur or maxBlur changes

  return (
    <div className="main-container">
      <Sidenav />
      <div className="content">
        <h1>Dashboard</h1>
        <input type="file" multiple onChange={handleInputFileChange} style={{ display: 'none' }} id="fileInput" />
        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            border: '2px dashed #aaa',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <p>Drag and drop files here or click to select files</p>
          <button onClick={() => document.getElementById('fileInput').click()}>Select Files</button>
        </div>
        <button onClick={handleSubmit}>Upload Files</button>
        
        {previewImage && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', filter: `blur(${blurAmount}px)` }} />
          </div>
        )}

        <div>
          <label>
            <input
              type="checkbox"
              name="Rotation"
              checked={checkboxes.Rotation}
              onChange={handleCheckboxChange}
            />
            Rotation
          </label>
          <div>
            <label>
              Min Rotation:
              <input
                type="number"
                name="minRotation"
                value={ranges.minRotation}
                onChange={handleRangeChange}
              />
            </label>
            <label>
              Max Rotation:
              <input
                type="number"
                name="maxRotation"
                value={ranges.maxRotation}
                onChange={handleRangeChange}
              />
            </label>
          </div>
          <br />
          <label>
            <input
              type="checkbox"
              name="Scaling"
              checked={checkboxes.Scaling}
              onChange={handleCheckboxChange}
            />
            Scaling
          </label>
          <div>
            <label>
              Min Scaling:
              <input
                type="number"
                name="minScaling"
                value={ranges.minScaling}
                onChange={handleRangeChange}
              />
            </label>
            <label>
              Max Scaling:
              <input
                type="number"
                name="maxScaling"
                value={ranges.maxScaling}
                onChange={handleRangeChange}
              />
            </label>
          </div>
          <br />
          <label>
            <input
              type="checkbox"
              name="Blur"
              checked={checkboxes.Blur}
              onChange={handleCheckboxChange}
            />
            Blur
          </label>
          <div>
            <label>
              Min Blur:
              <input
                type="number"
                name="minBlur"
                value={ranges.minBlur}
                onChange={handleRangeChange}
              />
            </label>
            <label>
              Max Blur:
              <input
                type="number"
                name="maxBlur"
                value={ranges.maxBlur}
                onChange={handleRangeChange}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
