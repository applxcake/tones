
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to the home page
    navigate('/home');
  }, [navigate]);

  // Render a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Tones Music</h1>
        <p className="text-xl text-muted-foreground mb-6">Loading your music experience...</p>
        <div className="flex justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i}
              className="w-3 h-3 bg-neon-purple rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
