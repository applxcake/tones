
import React from 'react';
import { Disc3, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarHeaderProps {
  onSearch: () => void;
}

const SidebarHeader = ({ onSearch }: SidebarHeaderProps) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <Disc3 className="h-8 w-8 text-neon-purple animate-pulse-glow" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink text-transparent bg-clip-text">
          Tones
        </h1>
      </div>
      <p className="text-sm text-gray-400 mb-8">Music made free!</p>
      
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-start gap-2 mb-4"
        onClick={onSearch}
      >
        <Search className="h-4 w-4" />
        Search...
      </Button>
    </div>
  );
};

export default SidebarHeader;
