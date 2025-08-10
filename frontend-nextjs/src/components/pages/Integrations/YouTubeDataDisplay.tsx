'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { YouTubeData } from '@/services/integrationService'

interface YouTubeDataDisplayProps {
  data: YouTubeData
}

const YouTubeDataDisplay: React.FC<YouTubeDataDisplayProps> = ({ data }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Channel Statistics */}
      {data.channels && data.channels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>Channel Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(data.subscribers || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(data.totalViews || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.totalVideos || 0}
                </div>
                <div className="text-sm text-muted-foreground">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.playlists?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Playlists</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Videos */}
      {data.videos && data.videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🎥</span>
              <span>Recent Videos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.videos.slice(0, 5).map((video: any, index: number) => (
                <div key={video.id?.videoId || index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <img 
                      src={video.snippet?.thumbnails?.default?.url || '/placeholder-video.svg'} 
                      alt={video.snippet?.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {video.snippet?.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {video.snippet?.channelTitle} • {formatDate(video.snippet?.publishedAt)}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {video.snippet?.liveBroadcastContent === 'live' ? 'LIVE' : 'VIDEO'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playlists */}
      {data.playlists && data.playlists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📋</span>
              <span>Playlists</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.playlists.slice(0, 6).map((playlist: any, index: number) => (
                <div key={playlist.id || index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <img 
                      src={playlist.snippet?.thumbnails?.default?.url || '/placeholder-playlist.svg'} 
                      alt={playlist.snippet?.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {playlist.snippet?.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {playlist.snippet?.channelTitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default YouTubeDataDisplay 