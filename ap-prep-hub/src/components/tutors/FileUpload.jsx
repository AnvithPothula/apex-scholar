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
    if (fileType.includes('pdf')) return <FileText strokeWidth={1.5} className="w-4 h-4" />;
    if (fileType.includes('image')) return <Image strokeWidth={1.5} className="w-4 h-4" />;
    return <File strokeWidth={1.5} className="w-4 h-4" />;
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
        className="gap-2 bg-base-850 hover:bg-base-800 text-content-primary border-border-strong"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload strokeWidth={1.5} className="w-4 h-4" /> Add File
      </Button>

      {/* Error Message */}
      {uploadError && (
  <div className="flex items-center gap-2 p-3 bg-error-900/20 border border-error-500/30 rounded-sm">
          <AlertCircle strokeWidth={1.5} className="w-4 h-4 text-error-500" />
          <p className="text-sm text-error-400">{uploadError}</p>
        </div>
      )}

  {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-content-primary">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div
              key={`file-${index}-${file.name}-${file.size}`}
              className="flex items-center justify-between p-3 bg-base-850 rounded-sm border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="text-content-muted">
                  {getFileIcon(file.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-content-primary">{file.name}</p>
                  <p className="text-xs text-content-muted">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onFileRemove(index)}
                className="h-8 w-8 text-content-muted hover:text-error-500"
              >
                <X strokeWidth={1.5} className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
