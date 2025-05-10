
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Heart, Music, Sparkle, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmojiParticle {
  id: number;
  x: number;
  y: number;
  emoji: string | React.ReactNode;
  size: number;
  speed: number;
  rotation: number;
  opacity: number;
}

interface EmojiReactionsProps {
  className?: string;
  onReact?: (emoji: string) => void;
}

const EMOJIS = [
  { icon: <Heart className="text-red-500" />, value: '❤️' },
  { icon: <Music className="text-blue-500" />, value: '🎵' },
  { icon: <Sparkle className="text-yellow-500" />, value: '✨' },
  { icon: <Smile className="text-green-500" />, value: '😊' },
];

const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  className,
  onReact,
}) => {
  const [particles, setParticles] = useState<EmojiParticle[]>([]);
  const [activeEmoji, setActiveEmoji] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  // Add particle when emoji is clicked
  const addParticle = useCallback((emoji: string | React.ReactNode, x: number, y: number) => {
    const newParticle: EmojiParticle = {
      id: nextId.current++,
      x,
      y,
      emoji,
      size: Math.random() * 20 + 20,
      speed: Math.random() * 2 + 1,
      rotation: Math.random() * 40 - 20,
      opacity: 1,
    };
    
    setParticles(prev => [...prev, newParticle]);
    
    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 2000);
  }, []);

  // Handle emoji button click
  const handleEmojiClick = useCallback((emoji: string, emojiIcon: React.ReactNode) => {
    if (!containerRef.current) return;
    
    setActiveEmoji(emoji);
    setTimeout(() => setActiveEmoji(null), 500);
    
    // Get button position
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.random() * rect.width;
    const y = rect.height - 40;
    
    // Add multiple particles for a burst effect
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        addParticle(emojiIcon, x + (Math.random() * 40 - 20), y + (Math.random() * 20 - 10));
      }, i * 50);
    }
    
    if (onReact) {
      onReact(emoji);
    }
  }, [addParticle, onReact]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;
    
    const animateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          y: particle.y - particle.speed,
          x: particle.x + (Math.random() - 0.5), // slight horizontal drift
          rotation: particle.rotation + (Math.random() - 0.5) * 2,
          opacity: particle.y > 20 ? particle.opacity : particle.opacity - 0.02,
        }))
      );
    };
    
    const interval = setInterval(animateParticles, 16);
    return () => clearInterval(interval);
  }, [particles]);

  return (
    <div 
      className={cn(
        "relative h-16 glass-panel rounded-full overflow-hidden px-4",
        className
      )}
      ref={containerRef}
    >
      {/* Floating emoji particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            transition: 'opacity 0.3s ease',
            zIndex: 10,
          }}
        >
          {typeof particle.emoji === 'string' ? (
            <span className="text-xl">{particle.emoji}</span>
          ) : (
            particle.emoji
          )}
        </div>
      ))}
      
      {/* Emoji buttons */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-evenly h-16">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji.value}
            className={cn(
              "p-2 rounded-full transition-transform hover-scale hover-bright",
              activeEmoji === emoji.value && "scale-150 animate-pulse"
            )}
            onClick={() => handleEmojiClick(emoji.value, emoji.icon)}
            aria-label={`React with ${emoji.value}`}
          >
            <div className="w-6 h-6">
              {emoji.icon}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiReactions;
