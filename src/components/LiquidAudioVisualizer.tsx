
import React, { useRef, useEffect, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';

interface LiquidAudioVisualizerProps {
  className?: string;
  color?: string;
  height?: number;
}

const LiquidAudioVisualizer: React.FC<LiquidAudioVisualizerProps> = ({ 
  className,
  color = "#0EA5E9",
  height = 60
}) => {
  const { isPlaying } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<number[]>([]);
  const animationRef = useRef<number>();
  
  // Initialize points for the wave
  useEffect(() => {
    const numPoints = 40;
    const initialPoints = Array.from({ length: numPoints }, () => Math.random() * 0.3 + 0.2);
    setPoints(initialPoints);
  }, []);

  // Animation logic
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const updatePoints = () => {
      if (!isPlaying) {
        // Smoother waves when not playing
        setPoints(prev => 
          prev.map(point => {
            const change = (Math.random() - 0.5) * 0.03;
            return Math.max(0.05, Math.min(0.4, point + change));
          })
        );
      } else {
        // More dynamic waves when playing
        setPoints(prev => 
          prev.map(point => {
            const change = (Math.random() - 0.5) * 0.12;
            return Math.max(0.1, Math.min(0.8, point + change));
          })
        );
      }
    };
    
    const drawWave = () => {
      if (!canvas || !ctx) return;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set up gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      if (isPlaying) {
        gradient.addColorStop(0, '#0EA5E9');   // Ocean Blue
        gradient.addColorStop(0.5, '#33C3F0'); // Sky Blue
        gradient.addColorStop(1, '#1EAEDB');   // Bright Blue
      } else {
        gradient.addColorStop(0, '#0EA5E980'); // Semi-transparent Ocean Blue
        gradient.addColorStop(1, '#1EAEDB80'); // Semi-transparent Bright Blue
      }
      
      // Draw the wave
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      // Draw the wave path
      const numPoints = points.length;
      const segmentWidth = canvas.width / (numPoints - 1);
      
      // First quarter - rising
      for (let i = 0; i < numPoints / 4; i++) {
        const x = i * segmentWidth;
        const heightFactor = points[i];
        const y = canvas.height - (canvas.height * heightFactor);
        
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = (i - 1) * segmentWidth;
          const prevHeightFactor = points[i - 1];
          const prevY = canvas.height - (canvas.height * prevHeightFactor);
          
          // Calculate control points for the curve
          const cpX = (prevX + x) / 2;
          const cpY1 = prevY;
          const cpY2 = y;
          
          // Draw a curved line
          ctx.bezierCurveTo(cpX, cpY1, cpX, cpY2, x, y);
        }
      }
      
      // Middle half - peaking and falling
      for (let i = Math.floor(numPoints / 4); i < Math.floor(numPoints * 3 / 4); i++) {
        const x = i * segmentWidth;
        const heightFactor = points[i];
        const y = canvas.height - (canvas.height * heightFactor);
        
        const prevX = (i - 1) * segmentWidth;
        const prevHeightFactor = points[i - 1];
        const prevY = canvas.height - (canvas.height * prevHeightFactor);
        
        // Calculate control points for the curve
        const cpX = (prevX + x) / 2;
        const cpY1 = prevY;
        const cpY2 = y;
        
        // Draw a curved line
        ctx.bezierCurveTo(cpX, cpY1, cpX, cpY2, x, y);
      }
      
      // Last quarter - falling to baseline
      for (let i = Math.floor(numPoints * 3 / 4); i < numPoints; i++) {
        const x = i * segmentWidth;
        const heightFactor = points[i];
        const y = canvas.height - (canvas.height * heightFactor);
        
        const prevX = (i - 1) * segmentWidth;
        const prevHeightFactor = points[i - 1];
        const prevY = canvas.height - (canvas.height * prevHeightFactor);
        
        // Calculate control points for the curve
        const cpX = (prevX + x) / 2;
        const cpY1 = prevY;
        const cpY2 = y;
        
        // Draw a curved line
        ctx.bezierCurveTo(cpX, cpY1, cpX, cpY2, x, y);
      }
      
      // Complete the path
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      
      // Fill the wave
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add a subtle glow effect when playing
      if (isPlaying) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };
    
    const animate = () => {
      updatePoints();
      drawWave();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, color, points]);
  
  // Resize canvas to container
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (canvasRef.current) {
          const { width } = entry.contentRect;
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
      }
    });
    
    resizeObserver.observe(canvasRef.current.parentElement!);
    
    return () => {
      if (canvasRef.current?.parentElement) {
        resizeObserver.unobserve(canvasRef.current.parentElement);
      }
    };
  }, [height]);
  
  return (
    <div className={cn("w-full relative overflow-hidden", className)}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
        style={{ height: `${height}px` }}
      />
      
      {/* Add subtle bubble effect when playing */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-blue-300/20 animate-float-liquid"
              style={{
                width: `${Math.random() * 15 + 5}px`,
                height: `${Math.random() * 15 + 5}px`,
                left: `${Math.random() * 100}%`,
                bottom: '0',
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LiquidAudioVisualizer;
