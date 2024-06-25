import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidenav from './sidenav';
import { dialog } from '@tauri-apps/api';
import { invoke } from '@tauri-apps/api/tauri';

function Profile() {
  const [superimposeDir, setSuperimposeDir] = useState('');
  const [augmentationDir, setAugmentationDir] = useState('');

  const selectDirectory = async (setDirectory) => {
    const selectedPath = await dialog.open({ directory: true });
    if (selectedPath) {
      setDirectory(selectedPath);
    }
  };

  const saveDirectories = async () => {
    try {
      await invoke('save_user_directories', {
        directories: {
          directoryforsuperimposing: superimposeDir,
          directoryforaugmentation: augmentationDir,
        },
      });
      alert('Directories saved successfully!');
    } catch (error) {
      console.error('Failed to save directories:', error);
    }
  };

  const readDirectories = async () => {
    try {
      const result = await invoke('read_user_directories');


      // Update state with fetched directories
      setSuperimposeDir(result[0] || '');
      setAugmentationDir(result[1] || '');

      
    } catch (e) {
      console.error('Error reading directories:', e);
    }
  };

  useEffect(() => {
    readDirectories(); // Trigger readDirectories when the component mounts
  }, []);

  return (
    <div className="main-container">
      <Sidenav />
      <div className="content">
        <h1>Profile Page</h1>
        <p>Welcome to the Profile Page!</p>

        <div>
          <button onClick={() => selectDirectory(setSuperimposeDir)}>
            Select Superimpose Directory
          </button>
          {superimposeDir && (
            <p>Currently superimpose directory is: {superimposeDir}</p>
          )}
        </div>

        <div>
          <button onClick={() => selectDirectory(setAugmentationDir)}>
            Select Augmentation Directory
          </button>
          {augmentationDir && (
            <p>Currently augmentation directory is: {augmentationDir}</p>
          )}
        </div>

        <button onClick={saveDirectories}>Save Directories</button>

        <Link to="/">
          <button>Back to Main App</button>
        </Link>
      </div>
    </div>
  );
}

export default Profile;
