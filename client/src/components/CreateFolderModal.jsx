import { useState } from 'react';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const CreateFolderModal = ({ isOpen, onClose, currentFolderId }) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createFolderMutation = useMutation({
    mutationFn: async (name) => {
      const res = await api.post('/folders', {
        name,
        parentFolder: currentFolderId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderContents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setFolderName('');
      setError('');
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create folder');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    createFolderMutation.mutate(folderName.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md scale-95 rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all duration-300 z-50 glass">
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <FolderPlus className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Create folder</h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Folder name
            </label>
            <input
              type="text"
              placeholder="Untitled folder"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                if (error) setError('');
              }}
              autoFocus
              className="h-10 w-full rounded-lg border border-border bg-muted/20 px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
            />
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createFolderMutation.isPending}
              className="flex items-center space-x-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 text-sm font-semibold shadow-md disabled:opacity-50 cursor-pointer transition-colors"
            >
              {createFolderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
