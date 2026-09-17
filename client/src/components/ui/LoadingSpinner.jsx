import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, size = 'default' }) => {
  const sizeClass = size === 'small' ? 'w-5 h-5' : 'w-8 h-8';

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className={`${sizeClass} animate-spin text-primary-600`} />
      </div>
    );
  }

  return <Loader2 className={`${sizeClass} animate-spin text-primary-600`} />;
};

export default LoadingSpinner;
