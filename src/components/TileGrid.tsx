
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TileGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
}

const TileGrid = ({ children, className, columns = 5 }: TileGridProps) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "grid gap-4 auto-rows-fr",
        `${gridCols[columns]} sm:${gridCols[Math.min(columns, 3)]} md:${gridCols[Math.min(columns, 4)]} lg:${gridCols[columns]}`,
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default TileGrid;
