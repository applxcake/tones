import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, getCurrentUser } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { User as UserIcon, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (id) {
        try {
          // Get the profile we're viewing
          const userData = await getUserById(id);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: "Error",
            description: "Could not load user profile",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Not found",
        description: "User profile not found",
        variant: "destructive"
      });
      navigate('/explore');
    }
  }, [user, navigate, loading]);

  if (loading) {
    return (
      <div className="pt-6 pb-24 animate-slide-in">
        <div className="flex justify-center py-12">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <Button 
        variant="ghost" 
        className="flex items-center mb-6 animate-fade-in"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="glass-panel rounded-lg p-6 mb-8 animate-scale-in">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 hover-scale">
            <AvatarImage 
              src={user.avatar} 
              alt={user.username} 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <AvatarFallback className="bg-neon-purple/20 text-white">
              <UserIcon className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="animate-fade-in">
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <p className="text-gray-400 mt-1">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {user.bio && (
              <p className="mt-3 text-gray-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>{user.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-8 justify-center md:justify-start mt-4">
              <div className="text-center hover-scale animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <p className="text-xl font-bold">{user.followers?.length || 0}</p>
                <p className="text-sm text-gray-400">Followers</p>
              </div>
              <div className="text-center hover-scale animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <p className="text-xl font-bold">{user.following?.length || 0}</p>
                <p className="text-sm text-gray-400">Following</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 text-center glass-panel rounded-lg animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <p className="text-gray-400">This user hasn't shared any playlists yet.</p>
      </div>
    </div>
  );
};

export default UserProfile;
