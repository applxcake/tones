
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
}

const SearchBar = ({ onSearch, className }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };
  
  const clearSearch = () => {
    setQuery('');
  };
  
  // Click outside to unfocus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <form 
      ref={searchRef}
      onSubmit={handleSubmit}
      className={cn(
        "relative transition-all duration-300",
        "w-full max-w-2xl mx-auto", // Center the search bar
        className
      )}
    >
      <div className={cn(
        "flex items-center h-12 px-4 rounded-full transition-all duration-300",
        "glass-panel",
        isFocused ? "neon-glow-blue" : "hover:neon-glow-blue"
      )}>
        <Search className="h-5 w-5 flex-shrink-0 text-gray-400" />
        
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for music or users..."
          className="border-none bg-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-full py-0 px-3"
        />
        
        {query && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={clearSearch}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <Button 
          type="submit" 
          variant="ghost"
          className="ml-2 px-4 h-8 bg-neon-purple/20 hover:bg-neon-purple/40 text-white"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
