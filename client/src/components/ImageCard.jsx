import { FileImage, HardDrive } from 'lucide-react';
import { formatBytes } from '../lib/utils';

const ImageCard = ({ image, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-200 select-none shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md active:scale-[0.99]"
      title="Click to view details"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full bg-muted/30 overflow-hidden flex items-center justify-center border-b border-border/40">
        {image.imageUrl ? (
          <img
            src={image.imageUrl}
            alt={image.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fail-safe if image fails to render
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Placeholder Fallback Icon */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-muted/40 text-muted-foreground/60 hidden"
        >
          <FileImage className="h-8 w-8" />
        </div>
      </div>

      {/* Info Body */}
      <div className="p-3">
        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {image.name}
        </p>
        <div className="flex items-center space-x-1 mt-1 text-[10px] text-muted-foreground">
          <HardDrive className="h-3 w-3 shrink-0 opacity-70" />
          <span>{formatBytes(image.size)}</span>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
