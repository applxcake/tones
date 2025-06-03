
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Settings, Volume2, Equalizer } from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioSettings {
  quality: 'auto' | 'high' | 'medium' | 'low';
  bass: number;
  treble: number;
  volume: number;
}

interface AudioQualityControlProps {
  onSettingsChange?: (settings: AudioSettings) => void;
  className?: string;
}

const AudioQualityControl = ({ onSettingsChange, className }: AudioQualityControlProps) => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>({
    quality: 'auto',
    bass: 50,
    treble: 50,
    volume: 75,
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('audioSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      onSettingsChange?.(parsed);
    }
  }, []);

  const updateSetting = <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('audioSettings', JSON.stringify(newSettings));
    onSettingsChange?.(newSettings);
  };

  const resetSettings = () => {
    const defaultSettings: AudioSettings = {
      quality: 'auto',
      bass: 50,
      treble: 50,
      volume: 75,
    };
    setSettings(defaultSettings);
    localStorage.setItem('audioSettings', JSON.stringify(defaultSettings));
    onSettingsChange?.(defaultSettings);
  };

  const qualityOptions = [
    { value: 'auto', label: 'Auto', description: 'Adapts to connection' },
    { value: 'high', label: 'High', description: '320kbps' },
    { value: 'medium', label: 'Medium', description: '160kbps' },
    { value: 'low', label: 'Low', description: '96kbps' },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Settings size={16} />
          <span className="sr-only">Audio Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Equalizer size={16} />
              Audio Settings
            </h4>
            <Button variant="ghost" size="sm" onClick={resetSettings}>
              Reset
            </Button>
          </div>

          {/* Quality Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Audio Quality</label>
            <div className="grid grid-cols-2 gap-2">
              {qualityOptions.map(({ value, label, description }) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateSetting('quality', value as any)}
                  className={`p-2 rounded-md border text-left transition-colors ${
                    settings.quality === value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-1">
                <Volume2 size={14} />
                Volume
              </label>
              <Badge variant="outline">{settings.volume}%</Badge>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={([value]) => updateSetting('volume', value)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Bass Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Bass</label>
              <Badge variant="outline">{settings.bass - 50 > 0 ? '+' : ''}{settings.bass - 50}</Badge>
            </div>
            <Slider
              value={[settings.bass]}
              onValueChange={([value]) => updateSetting('bass', value)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Treble Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Treble</label>
              <Badge variant="outline">{settings.treble - 50 > 0 ? '+' : ''}{settings.treble - 50}</Badge>
            </div>
            <Slider
              value={[settings.treble]}
              onValueChange={([value]) => updateSetting('treble', value)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Settings are automatically saved and applied to all audio playback.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AudioQualityControl;
