// Enhanced ProductImageGallery.jsx - Supports both images and videos
import React, { useState, useMemo, useEffect, memo } from 'react';
import { Card, Image, Button, Tabs, Badge, Typography, Grid, Space, Tooltip } from 'antd';
import { 
  ZoomInOutlined, 
  PlayCircleOutlined, 
  PictureOutlined, 
  VideoCameraOutlined,
  FullscreenOutlined 
} from '@ant-design/icons';
import VideoPlayer from './VideoPlayer'; // Import our custom video player

const { Text } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

// Terracotta theme colors
const colors = {
  primary: '#D2691E',
  primaryLight: '#E8A857',
  primaryDark: '#A0522D',
  secondary: '#CD853F',
  accent: '#F4A460',
  background: '#FDFCFA',
  backgroundLight: '#FFEEE6',
  text: '#2C1810',
  textSecondary: '#6B4423',
  divider: '#E8D5C4',
  success: '#8BC34A',
  warning: '#FF9800',
  error: '#F44336',
};

// Custom styles for the enhanced gallery
const customStyles = {
  imageCard: {
    borderRadius: '16px',
    overflow: 'hidden',
    border: `1px solid ${colors.divider}`,
    background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${colors.backgroundLight}30 100%)`,
    boxShadow: `0 8px 32px ${colors.primary}15`,
  },
  videoThumbnail: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    fontSize: '32px',
    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
    transition: 'all 0.3s ease',
  },
  mediaThumbnail: {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
    position: 'relative',
  },
};

// Enhanced Media Gallery Component
const ProductImageGallery = memo(({ 
  images = [], 
  videos = [], 
  productName,
  defaultMediaType = 'mixed' // 'images', 'videos', 'mixed'
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [selectedMediaType, setSelectedMediaType] = useState('image'); // 'image' or 'video'
  const [previewVisible, setPreviewVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);

  // Process and combine media items
  const mediaItems = useMemo(() => {
    const processedImages = (images || []).map((image, index) => ({
      id: `image_${index}`,
      type: 'image',
      src: image,
      thumbnail: image,
      title: `${productName} - Image ${index + 1}`,
      index: index,
    }));

    const processedVideos = (videos || []).map((video, index) => ({
      id: `video_${index}`,
      type: 'video',
      src: video.src || video,
      thumbnail: video.thumbnail || video.poster || `${video.src}#t=1`, // Get thumbnail from video at 1 second
      title: video.title || `${productName} - Video ${index + 1}`,
      poster: video.poster,
      captions: video.captions || [],
      duration: video.duration,
      index: index,
    }));

    // Combine all media items
    const allItems = [...processedImages, ...processedVideos];
    
    return {
      all: allItems,
      images: processedImages,
      videos: processedVideos,
    };
  }, [images, videos, productName]);

  // Set default selection
  useEffect(() => {
    if (mediaItems.all.length > 0) {
      const firstItem = mediaItems.all[0];
      setSelectedMediaIndex(0);
      setSelectedMediaType(firstItem.type);
    }
  }, [mediaItems.all]);

  // Get current media lists based on active tab
  const getCurrentMediaList = () => {
    switch (activeTab) {
      case 'images':
        return mediaItems.images;
      case 'videos':
        return mediaItems.videos;
      case 'all':
      default:
        return mediaItems.all;
    }
  };

  const currentMediaList = getCurrentMediaList();
  const selectedMedia = currentMediaList[selectedMediaIndex];

  // Handle media selection
  const handleMediaSelect = (index, mediaType) => {
    setSelectedMediaIndex(index);
    setSelectedMediaType(mediaType);
    setIsVideoPlayerVisible(mediaType === 'video');
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSelectedMediaIndex(0);
    
    // Set media type based on tab
    const newMediaList = key === 'images' ? mediaItems.images : 
                         key === 'videos' ? mediaItems.videos : 
                         mediaItems.all;
    
    if (newMediaList.length > 0) {
      setSelectedMediaType(newMediaList[0].type);
      setIsVideoPlayerVisible(newMediaList[0].type === 'video');
    }
  };

  // Video thumbnail component
  const VideoThumbnailCard = ({ video, index, isSelected }) => (
    <div
      style={{
        ...customStyles.mediaThumbnail,
        border: isSelected 
          ? `3px solid ${colors.primary}` 
          : `2px solid ${colors.divider}`,
      }}
      onClick={() => handleMediaSelect(index, 'video')}
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        style={{ 
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onError={(e) => {
          // Fallback for video thumbnail
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div
        style={{
          display: 'none',
          width: '100%',
          height: '100%',
          backgroundColor: colors.primaryLight,
          color: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <VideoCameraOutlined style={{ fontSize: '24px', marginBottom: '4px' }} />
        <Text style={{ color: 'white', fontSize: '10px' }}>Video</Text>
      </div>
      
      {/* Play Icon Overlay */}
      <div style={customStyles.playOverlay}>
        <PlayCircleOutlined />
      </div>
      
      {/* Duration Badge */}
      {video.duration && (
        <div style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '10px',
        }}>
          {video.duration}
        </div>
      )}
    </div>
  );

  // Image thumbnail component
  const ImageThumbnailCard = ({ image, index, isSelected }) => (
    <div
      style={{
        ...customStyles.mediaThumbnail,
        border: isSelected 
          ? `3px solid ${colors.primary}` 
          : `2px solid ${colors.divider}`,
      }}
      onClick={() => handleMediaSelect(index, 'image')}
    >
      <Image
        src={image.src}
        alt={image.title}
        style={{ 
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        preview={false}
      />
      
      {/* Primary Image Badge */}
      {index === 0 && activeTab === 'images' && (
        <div style={{
          position: 'absolute',
          bottom: '4px',
          left: '4px',
          background: 'rgba(255, 143, 0, 0.9)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          PRIMARY
        </div>
      )}
    </div>
  );

  // Mixed thumbnail component for 'all' tab
  const MixedThumbnailCard = ({ media, index, isSelected }) => {
    if (media.type === 'video') {
      return <VideoThumbnailCard video={media} index={index} isSelected={isSelected} />;
    } else {
      return <ImageThumbnailCard image={media} index={index} isSelected={isSelected} />;
    }
  };

  // No media fallback
  if (mediaItems.all.length === 0) {
    return (
      <Card style={customStyles.imageCard} bodyStyle={{ padding: '16px' }}>
        <div style={{ 
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: colors.textSecondary 
        }}>
          <PictureOutlined style={{ fontSize: '64px', marginBottom: '16px' }} />
          <Text type="secondary">No media available</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card style={customStyles.imageCard} bodyStyle={{ padding: '16px' }}>
      {/* Main Media Display */}
      <div style={{ 
        position: 'relative',
        marginBottom: '16px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#f8f9fa',
        height: isMobile ? '300px' : '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {selectedMedia && selectedMedia.type === 'video' && isVideoPlayerVisible ? (
          // Enhanced video player with better error handling
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <VideoPlayer
              src={selectedMedia.src}
              poster={selectedMedia.poster || selectedMedia.thumbnail}
              title={selectedMedia.title}
              captions={selectedMedia.captions}
              style={{ width: '100%', height: '100%' }}
              autoPlay={false}
              muted={true}
              onPlay={() => console.log('Video started playing:', selectedMedia.title)}
              onPause={() => console.log('Video paused:', selectedMedia.title)}
              onEnded={() => console.log('Video ended:', selectedMedia.title)}
              onError={() => {
                console.error('Video player error for:', selectedMedia.src);
                // Fallback to thumbnail view
                setIsVideoPlayerVisible(false);
              }}
            />
            
            {/* Video Info Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              backdropFilter: 'blur(4px)',
            }}>
              📹 {selectedMedia.title}
              {selectedMedia.duration && ` • ${selectedMedia.duration}`}
            </div>
          </div>
        ) : selectedMedia && selectedMedia.type === 'image' ? (
          // Image display (unchanged)
          <>
            <Image
              src={selectedMedia.src}
              alt={selectedMedia.title}
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
              preview={false}
              onClick={() => setPreviewVisible(true)}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<ZoomInOutlined />}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: colors.primary,
                border: 'none',
              }}
              onClick={() => setPreviewVisible(true)}
            />
          </>
        ) : selectedMedia && selectedMedia.type === 'video' && !isVideoPlayerVisible ? (
          // Video thumbnail with enhanced play button
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              height: '100%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000',
            }}
            onClick={() => {
              console.log('Video thumbnail clicked, starting player for:', selectedMedia.src);
              setIsVideoPlayerVisible(true);
            }}
          >
            {/* Video Thumbnail */}
            <img
              src={selectedMedia.thumbnail}
              alt={selectedMedia.title}
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
              onError={(e) => {
                console.error('Video thumbnail failed to load:', selectedMedia.thumbnail);
                // Create a fallback thumbnail
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            
            {/* Fallback for failed thumbnail */}
            <div
              style={{
                display: 'none',
                width: '100%',
                height: '100%',
                backgroundColor: '#333',
                color: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                borderRadius: '8px',
              }}
            >
              <VideoCameraOutlined style={{ fontSize: '64px', marginBottom: '16px' }} />
              <Text style={{ color: 'white', fontSize: '16px' }}>Video Preview</Text>
            </div>

            {/* Enhanced Play Button Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontSize: '64px',
              textShadow: '0 4px 16px rgba(0,0,0,0.8)',
              transition: 'all 0.3s ease',
              animation: 'pulse 2s infinite',
            }}>
              <PlayCircleOutlined />
            </div>

            {/* Video Info */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                📹 {selectedMedia.title}
              </div>
              {selectedMedia.duration && (
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  Duration: {selectedMedia.duration}
                </div>
              )}
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                Click to play video
              </div>
            </div>
          </div>
        ) : (
          // No media fallback
          <div style={{ textAlign: 'center', color: '#999' }}>
            <PictureOutlined style={{ fontSize: '64px', marginBottom: '16px' }} />
            <div>No media available</div>
          </div>
        )}
      </div>

      {/* Media Navigation Tabs */}
      {(mediaItems.images.length > 0 && mediaItems.videos.length > 0) && (
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          style={{ marginBottom: '16px' }}
          size={isMobile ? 'small' : 'default'}
        >
          <TabPane 
            tab={
              <Badge count={mediaItems.all.length} size="small" offset={[8, -2]}>
                <Space>
                  <PictureOutlined />
                  All Media
                </Space>
              </Badge>
            } 
            key="all" 
          />
          <TabPane 
            tab={
              <Badge count={mediaItems.images.length} size="small" offset={[8, -2]}>
                <Space>
                  <PictureOutlined />
                  Images
                </Space>
              </Badge>
            } 
            key="images" 
          />
          <TabPane 
            tab={
              <Badge count={mediaItems.videos.length} size="small" offset={[8, -2]}>
                <Space>
                  <VideoCameraOutlined />
                  Videos
                </Space>
              </Badge>
            } 
            key="videos" 
          />
        </Tabs>
      )}

      {/* Thumbnail Strip */}
      <div style={{ 
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '8px 0',
        scrollbarWidth: 'thin',
      }}>
        {currentMediaList.map((media, index) => {
          const isSelected = index === selectedMediaIndex;
          
          return (
            <div key={media.id}>
              {activeTab === 'all' ? (
                <MixedThumbnailCard 
                  media={media} 
                  index={index} 
                  isSelected={isSelected}
                />
              ) : media.type === 'video' ? (
                <VideoThumbnailCard 
                  video={media} 
                  index={index} 
                  isSelected={isSelected}
                />
              ) : (
                <ImageThumbnailCard 
                  image={media} 
                  index={index} 
                  isSelected={isSelected}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Media Info */}
      {selectedMedia && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {selectedMedia.title} • {selectedMedia.type === 'video' ? 'Video' : 'Image'}
            {activeTab === 'all' && ` • ${selectedMediaIndex + 1} of ${currentMediaList.length}`}
          </Text>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedMedia && selectedMedia.type === 'image' && (
        <Image
          style={{ display: 'none' }}
          src={selectedMedia.src}
          preview={{
            visible: previewVisible,
            onVisibleChange: setPreviewVisible,
            src: selectedMedia.src,
            mask: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FullscreenOutlined />
                <span>View Full Size</span>
              </div>
            ),
          }}
        />
      )}

      {/* Add CSS animation for pulse effect */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `
      }} />
    </Card>
  );
});

ProductImageGallery.displayName = 'ProductImageGallery';

export default ProductImageGallery;