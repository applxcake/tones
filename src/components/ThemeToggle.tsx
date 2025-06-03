
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative overflow-hidden rounded-full transition-colors",
        "bg-gradient-to-br",
        theme === 'dark' 
          ? "from-indigo-500/20 via-purple-500/20 to-pink-500/20"
          : "from-blue-300/20 via-yellow-100/20 to-orange-300/20",
        className
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="transition-transform duration-500 ease-in-out">
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-yellow-300 animate-pulse" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-700" />
        )}
      </div>
      
      {/* Sun rays animation */}
      {theme === 'dark' && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-yellow-300 w-[1px] h-4 opacity-60"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 45}deg) translateX(6px)`,
                transformOrigin: 'left center'
              }}
            />
          ))}
        </div>
      )}
      
      {/* Stars animation */}
      {theme === 'light' && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-indigo-300 rounded-full opacity-60"
              style={{
                width: '2px',
                height: '2px',
                top: `${30 + Math.random() * 40}%`,
                left: `${30 + Math.random() * 40}%`,
                animation: `twinkle ${1 + Math.random()}s infinite ease-in-out`
              }}
            />
          ))}
        </div>
      )}
    </Button>
  );
};

export default ThemeToggle;
