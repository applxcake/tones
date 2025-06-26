
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Disc3, Music, Headphones, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

interface AuthProps {
  defaultTab?: 'login' | 'signup';
}

const Auth = ({ defaultTab = 'login' }: AuthProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const initialTab = location.pathname === '/signup' || defaultTab === 'signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to home');
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const tabFromPath = location.pathname === '/signup' ? 'signup' : 'login';
    setActiveTab(tabFromPath);
  }, [location.pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting to sign in with:', email);
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const { error, data } = await signIn(email, password);
    
    console.log('Sign in result:', { error, data });
    
    if (!error && data?.user) {
      console.log('Sign in successful, navigating to home');
      navigate('/home');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting to sign up with:', email);
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const usernameToUse = username.trim() || email.split('@')[0];
    
    const { error, data } = await signUp(email, password, usernameToUse);
    
    console.log('Sign up result:', { error, data });
    
    if (!error) {
      if (data.session) {
        console.log('Sign up successful with session, navigating to home');
        navigate('/home');
      } else {
        console.log('Sign up successful, but no session - user might need to verify email');
        toast({
          title: "Success",
          description: "Account created! You can now sign in.",
        });
        setActiveTab('login');
      }
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(value === 'signup' ? '/signup' : '/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex">
      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating Music Icons */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 text-purple-400/30"
        >
          <Music className="w-8 h-8" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-40 right-32 text-pink-400/30"
        >
          <Headphones className="w-6 h-6" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 3, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-40 left-32 text-blue-400/30"
        >
          <Radio className="w-7 h-7" />
        </motion.div>

        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <Disc3 className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Tones</h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Your Music, Your Way
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Discover new sounds, create perfect playlists, and enjoy your favorite tracks with friends.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Create unlimited playlists</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span>Discover new music daily</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Share with friends</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm space-y-6 bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
              <Disc3 className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Tones</h1>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {activeTab === 'login' ? 'Welcome back' : 'Join Tones'}
            </h2>
            <p className="text-gray-400 mt-2">
              {activeTab === 'login' 
                ? 'Sign in to continue your musical journey' 
                : 'Create your account and start discovering music'
              }
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger value="login" className="data-[state=active]:bg-purple-600">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-purple-600">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="music_lover" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
