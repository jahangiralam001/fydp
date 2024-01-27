// FileUpload.js
import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('pdfFile', file);

      // Replace 'YOUR_UPLOAD_ENDPOINT' with your actual backend endpoint for handling file uploads
      await axios.post('YOUR_UPLOAD_ENDPOINT', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle successful upload, e.g., show a success message
      console.log('File uploaded successfully');
    } catch (error) {
      // Handle errors, e.g., show an error message
      c~~~~~~~nsole.error('Error uploading file', error);
    }
  };

  return (
    <div>
      <h2>File Upload</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload PDF</button>
    </div>
  );
};

export default FileUpload;
