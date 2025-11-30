import React, { useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import Preview from './components/Preview';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

function App() {
  const [markdown, setMarkdown] = useState(null);
  const [filename, setFilename] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use environment variable for API URL, fallback to localhost for dev
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/convert`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMarkdown(response.data.markdown);
      setFilename(response.data.filename);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred during conversion.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMarkdown(null);
    setFilename(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-left"
        >
          <h1 className="text-3xl font-normal text-[#202124] mb-4">
            Add <span className="text-[#5f6368] text-xl font-normal">Word document</span>
          </h1>

        </motion.div>

        <div className="w-full z-10">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-4 py-20"
              >
                <FiLoader className="w-10 h-10 text-[#4285f4] animate-spin" />
                <p className="text-[#5f6368]">Processing your document...</p>
              </motion.div>
            ) : markdown ? (
              <Preview key="preview" markdown={markdown} filename={filename} onReset={handleReset} />
            ) : (
              <div className="space-y-6">
                <FileUpload key="upload" onFileUpload={handleFileUpload} isUploading={loading} />
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-600 text-center bg-red-50 p-4 rounded-lg border border-red-100 max-w-xl mx-auto text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;
