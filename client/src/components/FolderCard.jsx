import { useNavigate } from 'react-router-dom';
import { Folder, Trash2, Loader2, HardDrive } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { formatBytes } from '../lib/utils';

const FolderCard = ({ folder }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/folders/${folder._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderContents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      // Invalidate root contents to update storage indicator size
      queryClient.invalidateQueries({ queryKey: ['folderContents', 'root'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete folder');
    },
  });

  const handleDoubleClick = () => {
    navigate(`/folder/${folder._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (
      confirm(
        `Are you sure you want to delete "${folder.name}" and ALL its subfolders and files? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate();
    }
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="group flex items-center justify-between rounded-xl border border-border/60 bg-card p-4 hover:border-primary/50 hover:bg-muted/10 transition-all duration-200 select-none shadow-sm cursor-pointer hover:shadow-md active:scale-[0.99]"
      title="Double click to open"
    >
      <div className="flex items-center space-x-3.5 truncate">
        {/* Amber Folder Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
          <Folder className="h-5.5 w-5.5 fill-amber-500/10" />
        </div>
        
        <div className="truncate">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {folder.name}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center space-x-1 mt-0.5">
            <HardDrive className="h-3 w-3 shrink-0 opacity-70" />
            <span>{formatBytes(folder.totalSize)}</span>
          </p>
        </div>
      </div>

      {/* Delete Trigger */}
      <button
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="rounded-lg p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer shrink-0"
        title="Delete folder and contents"
      >
        {deleteMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default FolderCard;
