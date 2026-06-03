import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Download, Trash2, Calendar, FileText, HardDrive, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { formatBytes } from '../lib/utils';

const ImagePreviewModal = ({ isOpen, onClose, image }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/images/${image._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderContents'] });
      // Invalidate root contents to update storage indicator size
      queryClient.invalidateQueries({ queryKey: ['folderContents', 'root'] });
      onClose();
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete image');
    },
  });

  if (!isOpen || !image) return null;

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this image?')) {
      deleteMutation.mutate();
    }
  };

  const handleDownload = () => {
    // Open in a new tab for native saving
    window.open(image.imageUrl, '_blank');
  };

  const formattedDate = new Date(image.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200">
      {/* Close button top-right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-black/60 hover:bg-black/90 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
        title="Close preview"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Main Container */}
      <div className="flex h-full w-full flex-col lg:flex-row items-center justify-between gap-6 py-12 lg:py-6">
        {/* Left Side: Image Canvas */}
        <div className="flex flex-1 items-center justify-center max-h-[60vh] lg:max-h-full w-full select-none">
          <img
            src={image.imageUrl}
            alt={image.name}
            className="max-h-[60vh] lg:max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl border border-white/10"
          />
        </div>

        {/* Right Side: Metadata Details Panel */}
        <div className="w-full lg:w-96 rounded-2xl bg-slate-900 border border-white/10 p-6 text-white shrink-0 shadow-2xl flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold truncate tracking-tight pb-3 border-b border-white/10">
              Details
            </h3>

            {/* Details List */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-400">File Name</p>
                  <p className="text-sm font-medium break-all text-slate-100">{image.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <HardDrive className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">File Size</p>
                  <p className="text-sm font-medium text-slate-100">{formatBytes(image.size)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">Upload Date</p>
                  <p className="text-sm font-medium text-slate-100">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-3 pt-8 mt-8 border-t border-white/10">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 py-3 text-sm font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center justify-center rounded-xl bg-red-650 hover:bg-red-700 text-white p-3 shadow-md disabled:opacity-50 transition-all active:scale-[0.98] cursor-pointer"
              title="Delete file"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
