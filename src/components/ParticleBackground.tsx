
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
  lifespan: number;
  currentLife: number;
}

interface ParticleBackgroundProps {
  className?: string;
  density?: number;
  colors?: string[];
  interactive?: boolean;
  mood?: 'calm' | 'energetic' | 'melancholy' | 'happy';
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  className,
  density = 20,
  colors = ['#9b87f5', '#D946EF', '#0EA5E9'],
  interactive = true,
  mood = 'calm',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const animationRef = useRef<number>(0);

  // Set up configuration based on mood
  const getMoodConfig = () => {
    switch (mood) {
      case 'energetic':
        return {
          speed: 1.5,
          turbulence: 0.3,
          size: [2, 4],
          colors: colors.length ? colors : ['#ff5555', '#ffaa00', '#ff00aa'],
          density: density * 1.5
        };
      case 'melancholy':
        return {
          speed: 0.4,
          turbulence: 0.1,
          size: [1, 3],
          colors: colors.length ? colors : ['#4477aa', '#445588', '#333366'],
          density: density * 0.8
        };
      case 'happy':
        return {
          speed: 0.8,
          turbulence: 0.2,
          size: [1, 3],
          colors: colors.length ? colors : ['#ffcc00', '#88cc33', '#33aaff'],
          density: density
        };
      default: // calm
        return {
          speed: 0.6,
          turbulence: 0.05,
          size: [1, 2],
          colors: colors.length ? colors : ['#9b87f5', '#D946EF', '#0EA5E9'],
          density: density
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = getMoodConfig();
    
    // Resize canvas
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    const initParticles = () => {
      const particles: Particle[] = [];
      const particleCount = Math.floor(config.density * (canvas.width * canvas.height) / 100000);
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * (config.size[1] - config.size[0]) + config.size[0];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size,
          speedX: (Math.random() - 0.5) * config.speed,
          speedY: (Math.random() - 0.5) * config.speed,
          color: config.colors[Math.floor(Math.random() * config.colors.length)],
          opacity: Math.random() * 0.6 + 0.2,
          lifespan: Math.random() * 200 + 50,
          currentLife: 0
        });
      }
      
      particlesRef.current = particles;
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Add some randomness to movement
        if (Math.random() < config.turbulence) {
          particle.speedX += (Math.random() - 0.5) * 0.1;
          particle.speedY += (Math.random() - 0.5) * 0.1;
        }
        
        // Limit speed
        particle.speedX = Math.max(-1, Math.min(1, particle.speedX));
        particle.speedY = Math.max(-1, Math.min(1, particle.speedY));
        
        // Handle mouse interaction
        if (interactive && mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = particle.x - mouseRef.current.x;
          const dy = particle.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 500;
            particle.speedX += dx * force;
            particle.speedY += dy * force;
          }
        }
        
        // Boundary check with wrap-around
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Update lifespan
        particle.currentLife++;
        if (particle.currentLife >= particle.lifespan) {
          // Reset particle
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.speedX = (Math.random() - 0.5) * config.speed;
          particle.speedY = (Math.random() - 0.5) * config.speed;
          particle.currentLife = 0;
        }
        
        // Calculate opacity based on life
        let opacity = particle.opacity;
        if (particle.currentLife < 10) {
          opacity = (particle.currentLife / 10) * particle.opacity;
        } else if (particle.currentLife > particle.lifespan - 10) {
          opacity = ((particle.lifespan - particle.currentLife) / 10) * particle.opacity;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
        ctx.fill();
        
        // Draw connection lines between close particles
        for (let j = index + 1; j < particlesRef.current.length; j++) {
          const otherParticle = particlesRef.current[j];
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = particle.color.replace(')', `, ${0.1 * (1 - distance / 100)})`).replace('rgb', 'rgba');
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        }
      });
      
      animationRef.current = requestAnimationFrame(drawParticles);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    window.addEventListener('resize', handleResize);
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }
    
    handleResize();
    drawParticles();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [density, colors, interactive, mood]);

  return (
    <canvas 
      ref={canvasRef}
      className={cn(
        "absolute inset-0 z-0",
        className
      )}
    />
  );
};

export default ParticleBackground;
