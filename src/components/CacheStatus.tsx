import React from 'react';
import { useYouTubeCacheStats } from '../hooks/useYouTube';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export const CacheStatus: React.FC = () => {
  const { stats } = useYouTubeCacheStats();

  const cacheEfficiency = stats.videoCacheSize + stats.searchCacheSize > 0 
    ? Math.round(((stats.videoCacheSize + stats.searchCacheSize) / (stats.videoCacheSize + stats.searchCacheSize + stats.pendingRequests)) * 100)
    : 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Cache Status
          <Badge variant={stats.availableAPIKeys > 0 ? "default" : "destructive"}>
            {stats.availableAPIKeys}/{stats.totalAPIKeys} APIs
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Cache Efficiency</span>
            <span>{cacheEfficiency}%</span>
          </div>
          <Progress value={cacheEfficiency} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Video Cache</div>
            <div className="text-muted-foreground">{stats.videoCacheSize} items</div>
          </div>
          <div>
            <div className="font-medium">Search Cache</div>
            <div className="text-muted-foreground">{stats.searchCacheSize} items</div>
          </div>
          <div>
            <div className="font-medium">Pending Requests</div>
            <div className="text-muted-foreground">{stats.pendingRequests}</div>
          </div>
          <div>
            <div className="font-medium">API Keys</div>
            <div className="text-muted-foreground">
              {stats.availableAPIKeys} available
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Cache automatically expires after 5-15 minutes depending on content type.
        </div>
      </CardContent>
    </Card>
  );
}; 