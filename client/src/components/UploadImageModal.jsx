import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, FileImage, Loader2, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { formatBytes } from '../lib/utils';

const UploadImageModal = ({ isOpen, onClose, currentFolderId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setError('');
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files (JPEG, PNG, GIF, WebP, SVG, etc.) are allowed');
      return;
    }
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Maximum size allowed is 10MB.');
      return;
    }
    setSelectedFile(file);
  };

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', currentFolderId || 'root');

      const response = await api.post('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderContents'] });
      // Invalidate root contents to update storage indicator size
      queryClient.invalidateQueries({ queryKey: ['folderContents', 'root'] });
      setSelectedFile(null);
      setUploadProgress(0);
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to upload image');
      setUploadProgress(0);
    },
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or drop an image first');
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md scale-95 rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all duration-300 z-50 glass">
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <Upload className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Upload image</h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} className="mt-5 space-y-4">
          {/* Drag & Drop Area */}
          {!selectedFile && (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/10'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-10 w-10 text-muted-foreground/60 mb-3 animate-bounce" />
              <p className="text-sm font-semibold text-foreground">
                Drag and drop your image here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Or click to browse files (max 10MB)
              </p>
            </div>
          )}

          {/* Selected File Details */}
          {selectedFile && (
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center space-x-3 truncate">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <FileImage className="h-5 w-5" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(selectedFile.size)}
                  </p>
                </div>
              </div>
              {!uploadMutation.isPending && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="rounded-lg p-1 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-xs font-semibold text-destructive bg-destructive/10 rounded-lg p-3 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Progress bar */}
          {uploadMutation.isPending && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div 
                  className="h-full rounded-full bg-primary transition-all duration-150" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploadMutation.isPending}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || uploadMutation.isPending}
              className="flex items-center space-x-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 text-sm font-semibold shadow-md disabled:opacity-50 cursor-pointer transition-colors"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadImageModal;
