import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiCopy, FiCheck } from 'react-icons/fi';

const Preview = ({ markdown, onReset }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        // Add BOM for Windows compatibility
        const blob = new Blob(['\uFEFF', markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full space-y-4"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-normal text-[#202124]">Converted Markdown</h2>
                <div className="flex space-x-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        className="btn-secondary flex items-center gap-2 text-sm"
                    >
                        {copied ? <FiCheck className="text-green-600" /> : <FiCopy />}
                        {copied ? "Copied!" : "Copy"}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        className="btn-primary flex items-center gap-2 text-sm"
                    >
                        <FiDownload /> Download .md
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onReset}
                        className="btn-secondary text-sm"
                    >
                        Convert Another
                    </motion.button>
                </div>
            </div>

            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-6 overflow-auto max-h-[600px] text-left">
                <pre className="font-mono text-sm text-[#202124] whitespace-pre-wrap">
                    {markdown}
                </pre>
            </div>
        </motion.div>
    );
};

export default Preview;
