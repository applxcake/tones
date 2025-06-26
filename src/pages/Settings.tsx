
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Trash2, Shield, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Settings = () => {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      // In a real app, you would call an API to delete the account
      toast({
        title: "Account Deletion",
        description: "This feature is not implemented in the demo. In a real app, this would permanently delete your account.",
        variant: "destructive"
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
        </div>

        {/* Profile Settings */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  defaultValue={user?.username || ''}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  defaultValue={user?.email || ''}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Enter email"
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-white">Avatar URL</Label>
              <Input
                id="avatar"
                defaultValue={user?.avatarUrl || ''}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter avatar URL"
              />
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="h-5 w-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Notifications</Label>
                <p className="text-sm text-gray-400">
                  Receive notifications about new releases and updates
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <Separator className="bg-white/10" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Auto-play</Label>
                <p className="text-sm text-gray-400">
                  Automatically play similar songs when queue ends
                </p>
              </div>
              <Switch
                checked={autoPlay}
                onCheckedChange={setAutoPlay}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-950/20 border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Shield className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-white">Delete Account</h3>
              <p className="text-sm text-gray-400">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mt-2">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      This will permanently delete your account and remove all your data including playlists, liked songs, and preferences. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Settings;
