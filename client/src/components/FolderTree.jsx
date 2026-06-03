import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Folder, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';
import { cn } from '../lib/utils';

// Helper to structure flat list into nested tree
const buildFolderTree = (folders, parentId = null) => {
  return folders
    .filter((f) => {
      const parentVal = f.parentFolder ? f.parentFolder.toString() : null;
      const targetVal = parentId ? parentId.toString() : null;
      return parentVal === targetVal;
    })
    .map((f) => ({
      ...f,
      children: buildFolderTree(folders, f._id),
    }));
};

const FolderNode = ({ node, activeFolderId, expandedFolders, toggleExpand }) => {
  const navigate = useNavigate();
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedFolders[node._id];
  const isActive = activeFolderId === node._id;

  const handleClick = (e) => {
    e.stopPropagation();
    navigate(`/folder/${node._id}`);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleExpand(node._id);
  };

  return (
    <div className="pl-3">
      <div
        onClick={handleClick}
        className={cn(
          "group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer select-none",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <div className="flex items-center space-x-2 truncate">
          {/* Collapse/Expand indicator */}
          <button
            onClick={handleToggle}
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-sm hover:bg-muted text-muted-foreground/70 transition-colors",
              !hasChildren && "opacity-0 pointer-events-none"
            )}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
          
          {/* Folder icon */}
          {isActive ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-amber-500/80 group-hover:text-amber-500" />
          )}
          
          <span className="truncate pr-2">{node.name}</span>
        </div>

        {/* Dynamic size tooltip or small text indicator */}
        {node.totalSize > 0 && (
          <span className="text-[10px] text-muted-foreground font-normal shrink-0 hidden group-hover:inline opacity-80">
            {node.totalSize > 1024 * 1024 
              ? `${(node.totalSize / (1024 * 1024)).toFixed(1)}M`
              : `${(node.totalSize / 1024).toFixed(0)}K`}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-0.5 border-l border-border/30 ml-2">
          {node.children.map((child) => (
            <FolderNode
              key={child._id}
              node={child}
              activeFolderId={activeFolderId}
              expandedFolders={expandedFolders}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderTree = ({ folders = [] }) => {
  const { folderId } = useParams();
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleExpand = (id) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const tree = buildFolderTree(folders, null);

  if (folders.length === 0) {
    return (
      <div className="px-6 py-4 text-xs italic text-muted-foreground/60">
        No folders created yet
      </div>
    );
  }

  return (
    <div className="space-y-1 py-2 pr-2">
      {tree.map((node) => (
        <FolderNode
          key={node._id}
          node={node}
          activeFolderId={folderId}
          expandedFolders={expandedFolders}
          toggleExpand={toggleExpand}
        />
      ))}
    </div>
  );
};

export default FolderTree;
