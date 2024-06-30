import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import Sidenav from './sidenav';
import './main.css';

const Superimposer = () => {
  const [message, setMessage] = useState('');
  const [files1, setFiles1] = useState([]);
  const [files2, setFiles2] = useState([]);
  const [amount, setAmount] = useState("40");

  const handleFileChange = (event, setFiles) => {
    const selectedFiles = event.target.files;
    const filesArray = Array.from(selectedFiles);

    const filesData = filesArray.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result.split(',')[1];
          resolve({ filename: file.name, data: base64Data });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filesData).then((results) => {
      setFiles(results);
    });
  };

  const handleSubmit = async () => {
    if (files1.length === 0 && files2.length === 0) {
      setMessage('Please select files for at least one set.');
      return;
    }

    const maxLength = Math.max(files1.length, files2.length);
    const combinedFiles = [];

    for (let i = 0; i < maxLength; i++) {
      combinedFiles.push({
        filename: files1[i] ? files1[i].filename : "",
        data: files1[i] ? files1[i].data : "",
        filename2: files2[i] ? files2[i].filename : "",
        data2: files2[i] ? files2[i].data : "",
        amount: amount
      });
    }

    try {
      await invoke('superimpose_user_images', { fileUploadsSuperimpose: combinedFiles });
      setMessage('Files successfully sent.');
    } catch (error) {
      console.error('Error superimposing files:', error);
      setMessage('Failed to send files.');
    }
  };

  return (
    <div className='main/container'>
      <Sidenav />
      <div className='content'>
        <h1>Superimpose User Images</h1>
        <div>
          <h2>Images you wish to superimpose</h2>
          <input type="file" multiple onChange={(e) => handleFileChange(e, setFiles1)} />
        </div>
        <div>
          <h2>Background images you wish to superimpose onto</h2>
          <input type="file" multiple onChange={(e) => handleFileChange(e, setFiles2)} />
        </div>
        <div>
          <h2>Amount</h2>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
          />
        </div>
        <button onClick={handleSubmit}>Send Files</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Superimposer;
