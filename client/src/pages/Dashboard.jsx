import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FolderPlus, 
  Upload, 
  Search, 
  Inbox,
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import FolderCard from '../components/FolderCard';
import ImageCard from '../components/ImageCard';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadImageModal from '../components/UploadImageModal';
import ImagePreviewModal from '../components/ImagePreviewModal';

const Dashboard = () => {
  const { folderId = 'root' } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // Modal states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadImageOpen, setUploadImageOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch folder contents (only when NOT in search mode)
  const { 
    data: contentData, 
    isLoading: isContentsLoading,
    error: contentsError
  } = useQuery({
    queryKey: ['folderContents', folderId],
    queryFn: async () => {
      const res = await api.get(`/folders/${folderId}`);
      return res.data;
    },
    enabled: !searchQuery, // Disable if search is active
    refetchOnWindowFocus: false
  });

  // Fetch search results (only when in search mode)
  const { 
    data: searchData, 
    isLoading: isSearchLoading,
    error: searchError
  } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      const res = await api.get(`/search?q=${searchQuery}`);
      return res.data;
    },
    enabled: !!searchQuery, // Only run when searching
    refetchOnWindowFocus: false
  });

  const isLoading = searchQuery ? isSearchLoading : isContentsLoading;
  const isError = searchQuery ? searchError : contentsError;

  const breadcrumbs = contentData?.breadcrumbs || [];

  // Determine items to display
  const folders = searchQuery ? (searchData?.folders || []) : (contentData?.subfolders || []);
  const images = searchQuery ? (searchData?.images || []) : (contentData?.images || []);

  const hasItems = folders.length > 0 || images.length > 0;

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setPreviewOpen(true);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Navbar Header */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          onCreateFolder={() => setCreateFolderOpen(true)}
          onUploadImage={() => setUploadImageOpen(true)}
        />

        {/* Main Drive Workspace */}
        <main className="flex-1 overflow-y-auto p-6 bg-muted/5">
          {/* Header section (Breadcrumbs or Search Header) */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
            <div>
              {searchQuery ? (
                <div className="flex items-center space-x-2 py-3 px-1">
                  <Search className="h-5 w-5 text-primary shrink-0" />
                  <h1 className="text-lg font-bold">
                    Search results for <span className="text-primary">"{searchQuery}"</span>
                  </h1>
                </div>
              ) : (
                <Breadcrumbs paths={breadcrumbs} />
              )}
            </div>
          </div>

          {/* Error Message banner */}
          {isError && (
            <div className="mb-6 flex items-center space-x-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive border border-destructive/20 max-w-2xl">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{isError.response?.data?.message || 'Something went wrong while loading drive contents.'}</span>
            </div>
          )}

          {/* Loading States Skeleton */}
          {isLoading && (
            <div className="space-y-8 animate-pulse">
              {/* Folders skeleton */}
              <div>
                <div className="h-5 w-24 bg-muted rounded-md mb-4" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-xl" />
                  ))}
                </div>
              </div>

              {/* Images skeleton */}
              <div>
                <div className="h-5 w-24 bg-muted rounded-md mb-4" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-video bg-muted rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty States */}
          {!isLoading && !isError && !hasItems && (
            <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground/60 mb-5">
                <Inbox className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {searchQuery ? 'No search results found' : 'This folder is empty'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {searchQuery 
                  ? 'Try checking spelling or using more generic keywords.' 
                  : 'Start nesting your assets by creating a folder or dragging and dropping images here.'}
              </p>
              
              {!searchQuery && (
                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={() => setCreateFolderOpen(true)}
                    className="flex items-center space-x-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted cursor-pointer transition-colors"
                  >
                    <FolderPlus className="h-4 w-4 text-amber-500" />
                    <span>New Folder</span>
                  </button>
                  <button
                    onClick={() => setUploadImageOpen(true)}
                    className="flex items-center space-x-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 text-xs font-semibold shadow-md cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Image</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Grid Sections */}
          {!isLoading && !isError && hasItems && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Subfolders Section */}
              {folders.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Folders ({folders.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {folders.map((folder) => (
                      <FolderCard key={folder._id} folder={folder} />
                    ))}
                  </div>
                </div>
              )}

              {/* Images Section */}
              {images.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Images ({images.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {images.map((image) => (
                      <ImageCard 
                        key={image._id} 
                        image={image} 
                        onClick={() => handleImageClick(image)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals & Dialog overlays */}
      <CreateFolderModal 
        isOpen={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        currentFolderId={folderId === 'root' ? null : folderId}
      />
      <UploadImageModal 
        isOpen={uploadImageOpen}
        onClose={() => setUploadImageOpen(false)}
        currentFolderId={folderId === 'root' ? null : folderId}
      />
      <ImagePreviewModal 
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedImage(null);
        }}
        image={selectedImage}
      />
    </div>
  );
};

export default Dashboard;
