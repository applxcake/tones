
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const SectionHeader = ({ title, subtitle, showViewAll, onViewAll }: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        {subtitle && (
          <p className="text-zinc-400 text-sm">{subtitle}</p>
        )}
      </div>
      
      {showViewAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="text-zinc-400 hover:text-white group"
        >
          Show all
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      )}
    </motion.div>
  );
};

export default SectionHeader;
