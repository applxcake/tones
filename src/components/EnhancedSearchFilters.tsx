
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar, Clock, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SearchFilters {
  genre?: string;
  duration?: 'short' | 'medium' | 'long';
  uploadDate?: 'today' | 'week' | 'month' | 'year';
  quality?: 'any' | 'hd';
  sortBy?: 'relevance' | 'date' | 'viewCount' | 'rating';
}

interface EnhancedSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

const EnhancedSearchFilters = ({ onFiltersChange, className }: EnhancedSearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const genres = [
    'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Classical', 'Jazz', 
    'Country', 'R&B', 'Reggae', 'Blues', 'Folk', 'Punk'
  ];

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-500 hover:text-red-600"
          >
            <X size={14} className="mr-1" />
            Clear
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-background/50 backdrop-blur-sm border rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Genre Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Music size={14} />
                  Genre
                </label>
                <Select value={filters.genre || ''} onValueChange={(value) => updateFilter('genre', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any genre</SelectItem>
                    {genres.map(genre => (
                      <SelectItem key={genre} value={genre.toLowerCase()}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Clock size={14} />
                  Duration
                </label>
                <Select value={filters.duration || ''} onValueChange={(value) => updateFilter('duration', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any length</SelectItem>
                    <SelectItem value="short">Short (&lt; 4 minutes)</SelectItem>
                    <SelectItem value="medium">Medium (4-20 minutes)</SelectItem>
                    <SelectItem value="long">Long (&gt; 20 minutes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar size={14} />
                  Upload Date
                </label>
                <Select value={filters.uploadDate || ''} onValueChange={(value) => updateFilter('uploadDate', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={filters.sortBy || 'relevance'} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Upload date</SelectItem>
                    <SelectItem value="viewCount">View count</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quality</label>
                <Select value={filters.quality || 'any'} onValueChange={(value) => updateFilter('quality', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any quality</SelectItem>
                    <SelectItem value="hd">HD only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSearchFilters;
