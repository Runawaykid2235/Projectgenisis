import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import Sidenav from './sidenav';
import './main.css';

const Superimposer = () => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [amount, setAmount] = useState(''); // Initial state for amount is empty

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    const filesArray = Array.from(selectedFiles);

    const filesData = filesArray.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result.split(',')[1]; // Extract base64 data
          resolve({ filename: file.name, data: base64Data, amount: amount }); // Include amount here
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filesData).then((results) => {
      setFiles(results);
    });
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setMessage('Please select at least one file.');
      return;
    }

    try {
      await invoke('superimpose_user_images', { fileUploadsSuperimpose: files });
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
        <input type="file" multiple onChange={handleFileChange} />
        <input 
          type="text" 
          placeholder="Enter amount" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
        />
        <button onClick={handleSubmit}>Send Files</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Superimposer;
