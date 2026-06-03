import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ paths = [] }) => {
  const navigate = useNavigate();

  const handleNavigate = (pathId) => {
    if (pathId === 'root' || !pathId) {
      navigate('/');
    } else {
      navigate(`/folder/${pathId}`);
    }
  };

  if (!paths || paths.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1 py-3 px-1 text-sm font-medium select-none overflow-x-auto whitespace-nowrap scrollbar-none">
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const isRoot = path.id === 'root' || !path.id;

        return (
          <React.Fragment key={path.id || 'root'}>
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />}
            
            <button
              onClick={() => handleNavigate(path.id)}
              disabled={isLast}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                isLast
                  ? 'text-foreground font-semibold cursor-default'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {isRoot && <Home className="h-3.5 w-3.5" />}
              <span>{path.name}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
