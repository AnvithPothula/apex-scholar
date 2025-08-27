import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File, AlertCircle } from 'lucide-react';
import { Button } from '../ui/UIComponents';

export function FileUpload({ onFileUpload, onFileRemove, uploadedFiles = [] }) {
  // Simplified to a single button per user request
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Drag/drop removed for simplicity per requirement

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    setUploadError('');
    
    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`File type ${file.type} is not supported. Please upload PDF, image, or document files.`);
        return;
      }
      
      if (file.size > maxFileSize) {
        setUploadError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      onFileUpload(file);
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (fileType.includes('image')) return <Image className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.gif,.txt,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        className="gap-2 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-4 h-4" /> Add File
      </Button>

      {/* Error Message */}
      {uploadError && (
  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

  {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div
              key={`file-${index}-${file.name}-${file.size}`}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="text-slate-500">
                  {getFileIcon(file.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onFileRemove(index)}
                className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
