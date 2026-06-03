import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Cloud, 
  FolderPlus, 
  Upload, 
  HardDrive, 
  ChevronDown, 
  Plus 
} from 'lucide-react';
import FolderTree from './FolderTree';
import api from '../lib/api';
import { formatBytes, cn } from '../lib/utils';

const Sidebar = ({ onCreateFolder, onUploadImage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch flat folders list for the tree
  const { data: folders = [] } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const res = await api.get('/folders');
      return res.data;
    },
    refetchOnWindowFocus: false
  });

  // Fetch root details to get total storage usage
  const { data: rootData } = useQuery({
    queryKey: ['folderContents', 'root'],
    queryFn: async () => {
      const res = await api.get('/folders/root');
      return res.data;
    },
    refetchOnWindowFocus: false
  });

  const totalUsedSize = rootData?.folder?.totalSize || 0;
  const storageLimit = 100 * 1024 * 1024; // 100 MB Limit
  const percentUsed = Math.min((totalUsedSize / storageLimit) * 100, 100);

  const isMyDriveActive = location.pathname === '/' || location.pathname.startsWith('/folder');

  return (
    <aside className="w-64 border-r border-border/40 bg-background flex flex-col h-[calc(100vh-4rem)] shrink-0">
      {/* "New" Actions Button */}
      <div className="p-4 relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98] duration-200 cursor-pointer w-full justify-center"
        >
          <Plus className="h-5 w-5" />
          <span>New</span>
          <ChevronDown className="h-4 w-4 opacity-80" />
        </button>

        {dropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute left-4 right-4 mt-2 w-[calc(100%-2rem)] rounded-xl border border-border/60 bg-card p-1.5 shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onCreateFolder();
                }}
                className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <FolderPlus className="h-4 w-4 text-amber-500" />
                <span>New folder</span>
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onUploadImage();
                }}
                className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4 text-indigo-500" />
                <span>Upload image</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Navigation Items */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => navigate('/')}
          className={cn(
            "flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
            isMyDriveActive 
              ? "bg-secondary text-primary font-semibold" 
              : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
          )}
        >
          <HardDrive className={cn("h-4 w-4", isMyDriveActive ? "text-primary" : "text-muted-foreground")} />
          <span>My Drive</span>
        </button>
      </div>

      {/* Nested Folder Tree Section */}
      <div className="flex-1 overflow-y-auto px-3 sidebar-scroll">
        <p className="px-3 text-[11px] font-bold tracking-wider text-muted-foreground/60 uppercase mb-2">
          Folders
        </p>
        <FolderTree folders={folders} />
      </div>

      {/* Storage Indicator */}
      <div className="p-4 border-t border-border/40 bg-muted/10">
        <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground mb-2">
          <Cloud className="h-4 w-4 text-primary" />
          <span>Storage</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden mb-1.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500" 
            style={{ width: `${percentUsed}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatBytes(totalUsedSize)} used</span>
          <span>{formatBytes(storageLimit)}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
