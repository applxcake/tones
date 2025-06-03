
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { Share2, Copy, Twitter, Facebook, Instagram, Link } from 'lucide-react';
import { YouTubeVideo } from '@/services/youtubeService';
import { motion } from 'framer-motion';

interface SocialShareButtonProps {
  song: YouTubeVideo;
  className?: string;
}

const SocialShareButton = ({ song, className }: SocialShareButtonProps) => {
  const [open, setOpen] = useState(false);

  const shareUrl = `${window.location.origin}/song/${song.id}`;
  const shareText = `Check out this song: ${song.title} by ${song.channelTitle}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Song link copied to clipboard!",
        variant: "success"
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'instagram') => {
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't have direct sharing, so we copy to clipboard
        copyToClipboard();
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=550,height=420');
      setOpen(false);
    }
  };

  const shareOptions = [
    { icon: Copy, label: 'Copy Link', action: copyToClipboard, color: 'text-gray-600' },
    { icon: Twitter, label: 'Twitter', action: () => shareToSocial('twitter'), color: 'text-blue-400' },
    { icon: Facebook, label: 'Facebook', action: () => shareToSocial('facebook'), color: 'text-blue-600' },
    { icon: Instagram, label: 'Instagram', action: () => shareToSocial('instagram'), color: 'text-pink-500' },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Share2 size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Share this song</h4>
          <div className="grid gap-2">
            {shareOptions.map(({ icon: Icon, label, action, color }, index) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={action}
                className={`flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors ${color}`}
              >
                <Icon size={16} />
                <span className="text-sm">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SocialShareButton;
