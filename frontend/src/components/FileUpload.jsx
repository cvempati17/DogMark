import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUpload } from 'react-icons/fi';

const FileUpload = ({ onFileUpload, isUploading }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            onFileUpload(acceptedFiles[0]);
        }
    }, [onFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc']
        },
        multiple: false,
        disabled: isUploading
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
            <motion.div
                {...getRootProps()}
                whileHover={{ backgroundColor: '#f8f9fa' }}
                whileTap={{ scale: 0.99 }}
                className={`upload-area p-16 text-center cursor-pointer min-h-[300px] flex flex-col items-center justify-center
          ${isDragActive ? 'border-[#4285f4] bg-blue-50' : ''}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="w-12 h-12 bg-[#e8f0fe] rounded-full flex items-center justify-center">
                        <FiUpload className="w-6 h-6 text-[#4285f4]" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-[#202124]">
                            Upload sources
                        </h3>
                        <p className="text-[#5f6368]">
                            Drag and drop or <span className="text-[#1a73e8] hover:underline">choose file</span> to upload
                        </p>
                    </div>
                </div>
            </motion.div>
            <p className="mt-4 text-xs text-[#9aa0a6] text-center">
                Supported file types: .docx, .doc
            </p>
        </motion.div>
    );
};

export default FileUpload;
