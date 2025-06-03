
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoPlayToggleProps {
  onToggle: (enabled: boolean) => void;
  className?: string;
}

const AutoPlayToggle = ({ onToggle, className }: AutoPlayToggleProps) => {
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
    return localStorage.getItem('autoPlay') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('autoPlay', autoPlayEnabled.toString());
    onToggle(autoPlayEnabled);
  }, [autoPlayEnabled, onToggle]);

  const handleToggle = () => {
    setAutoPlayEnabled(!autoPlayEnabled);
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleToggle}
      className={cn(
        "w-8 h-8 text-zinc-400 hover:text-white transition-colors",
        autoPlayEnabled && "text-green-500",
        className
      )}
      title={autoPlayEnabled ? "Disable Auto-play" : "Enable Auto-play"}
    >
      <Shuffle className="w-4 h-4" />
    </Button>
  );
};

export default AutoPlayToggle;
