// VideoPlayer.js - Custom Video Player Component for src/pages/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Button,
  Slider,
  Dropdown,
  Menu,
  Tooltip,
  Progress,
  Grid,
  Typography,
  Space,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseOutlined,
  SoundOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SettingOutlined,
  LoadingOutlined,
  ReloadOutlined,
  FileTextOutlined, // Using FileTextOutlined instead of ClosedCaptionOutlined
} from '@ant-design/icons';

const { Text } = Typography;
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

const VideoPlayer = ({
  src,
  poster,
  title,
  autoPlay = false,
  muted = false,
  loop = false,
  captions = null, // Array of caption objects: [{src: 'url', label: 'English', default: true}]
  onLoadStart,
  onLoadedData,
  onError,
  onPlay,
  onPause,
  onEnded,
  style = {},
  className = '',
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState(null);

  // Initialize captions
  useEffect(() => {
    if (captions && captions.length > 0) {
      const defaultCaption = captions.find(cap => cap.default) || captions[0];
      setSelectedCaption(defaultCaption);
    }
  }, [captions]);

  // Format time helper
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Video event handlers
  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart && onLoadStart();
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      setVolume(video.volume);
      setIsMuted(video.muted);
    }
    onLoadedData && onLoadedData();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      
      // Update buffered progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setBufferedProgress(bufferedPercent);
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    onPlay && onPlay();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPause && onPause();
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onEnded && onEnded();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError && onError();
  };

  // Control handlers
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  }, [isPlaying]);

  const handleProgressChange = useCallback((value) => {
    const video = videoRef.current;
    if (video && duration) {
      const newTime = (value / 100) * duration;
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  const handleVolumeChange = useCallback((value) => {
    const video = videoRef.current;
    if (video) {
      const newVolume = value / 100;
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handlePlaybackRateChange = useCallback((rate) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  const toggleCaptions = useCallback(() => {
    const video = videoRef.current;
    if (video && video.textTracks.length > 0) {
      const track = video.textTracks[0];
      const newState = !captionsEnabled;
      track.mode = newState ? 'showing' : 'hidden';
      setCaptionsEnabled(newState);
    }
  }, [captionsEnabled]);

  // Hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setShowControls(true);
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Mouse movement handler
  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (!videoRef.current) return;

    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        videoRef.current.currentTime = Math.max(0, currentTime - 10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        videoRef.current.currentTime = Math.min(duration, currentTime + 10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        handleVolumeChange(Math.min(100, volume * 100 + 10));
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume * 100 - 10));
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'c':
        e.preventDefault();
        toggleCaptions();
        break;
      default:
        break;
    }
  }, [togglePlay, currentTime, duration, volume, handleVolumeChange, toggleMute, toggleFullscreen, toggleCaptions]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Playback rate menu
  const playbackRateMenu = (
    <Menu
      selectedKeys={[playbackRate.toString()]}
      onClick={({ key }) => handlePlaybackRateChange(parseFloat(key))}
    >
      <Menu.Item key="0.5">0.5x</Menu.Item>
      <Menu.Item key="0.75">0.75x</Menu.Item>
      <Menu.Item key="1">Normal</Menu.Item>
      <Menu.Item key="1.25">1.25x</Menu.Item>
      <Menu.Item key="1.5">1.5x</Menu.Item>
      <Menu.Item key="2">2x</Menu.Item>
    </Menu>
  );

  // Captions menu
  const captionsMenu = captions && captions.length > 0 ? (
    <Menu
      selectedKeys={selectedCaption ? [selectedCaption.label] : []}
      onClick={({ key }) => {
        const caption = captions.find(cap => cap.label === key);
        setSelectedCaption(caption);
        // Update video track
        const video = videoRef.current;
        if (video && video.textTracks.length > 0) {
          Array.from(video.textTracks).forEach((track, index) => {
            track.mode = captions[index]?.label === key ? 'showing' : 'hidden';
          });
        }
      }}
    >
      <Menu.Item key="off">Off</Menu.Item>
      {captions.map((caption) => (
        <Menu.Item key={caption.label}>{caption.label}</Menu.Item>
      ))}
    </Menu>
  ) : null;

  if (hasError) {
    return (
      <div
        style={{
          width: '100%',
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #d9d9d9',
          ...style,
        }}
        className={className}
      >
        <Text type="secondary" style={{ marginBottom: '16px' }}>
          Failed to load video
        </Text>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setHasError(false);
            if (videoRef.current) {
              videoRef.current.load();
            }
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        ...style,
      }}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        onClick={isMobile ? togglePlay : undefined}
      >
        {/* Captions/Subtitles */}
        {captions && captions.map((caption, index) => (
          <track
            key={index}
            kind="subtitles"
            src={caption.src}
            srcLang={caption.lang || 'en'}
            label={caption.label}
            default={caption.default}
          />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Loading Spinner */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '24px',
          }}
        >
          <LoadingOutlined />
        </div>
      )}

      {/* Play Button Overlay (for mobile) */}
      {!isPlaying && !isLoading && isMobile && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '48px',
            cursor: 'pointer',
          }}
          onClick={togglePlay}
        >
          <PlayCircleOutlined />
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          padding: isMobile ? '12px' : '16px',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Progress Bar */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              position: 'relative',
              height: '4px',
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = ((e.clientX - rect.left) / rect.width) * 100;
              handleProgressChange(percent);
            }}
          >
            {/* Buffered Progress */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${bufferedProgress}%`,
                backgroundColor: 'rgba(255,255,255,0.5)',
                borderRadius: '2px',
              }}
            />
            {/* Current Progress */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: colors.primary,
                borderRadius: '2px',
              }}
            />
            {/* Progress Handle */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${progressPercent}%`,
                transform: 'translate(-50%, -50%)',
                width: '12px',
                height: '12px',
                backgroundColor: colors.primary,
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left Controls */}
          <Space size="small">
            {/* Play/Pause */}
            <Button
              type="text"
              icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
              onClick={togglePlay}
              style={{ color: 'white', border: 'none' }}
            />

            {/* Volume */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  type="text"
                  icon={<SoundOutlined />}
                  onClick={toggleMute}
                  style={{ color: 'white', border: 'none' }}
                />
                <div style={{ width: '60px' }}>
                  <Slider
                    value={isMuted ? 0 : volumePercent}
                    onChange={handleVolumeChange}
                    tooltip={{ formatter: null }}
                    trackStyle={{ backgroundColor: colors.primary }}
                    handleStyle={{ borderColor: colors.primary }}
                  />
                </div>
              </div>
            )}

            {/* Time Display */}
            <Text style={{ color: 'white', fontSize: '14px' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </Space>

          {/* Right Controls */}
          <Space size="small">
            {/* Captions */}
            {captions && captions.length > 0 && (
              <Dropdown overlay={captionsMenu} trigger={['click']}>
                <Button
                  type="text"
                  icon={<FileTextOutlined />}
                  style={{ 
                    color: captionsEnabled ? colors.primary : 'white', 
                    border: 'none' 
                  }}
                />
              </Dropdown>
            )}

            {/* Playback Rate */}
            {!isMobile && (
              <Dropdown overlay={playbackRateMenu} trigger={['click']}>
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  style={{ color: 'white', border: 'none' }}
                />
              </Dropdown>
            )}

            {/* Fullscreen */}
            <Button
              type="text"
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
              style={{ color: 'white', border: 'none' }}
            />
          </Space>
        </div>

        {/* Title */}
        {title && (
          <div style={{ marginTop: '8px' }}>
            <Text style={{ color: 'white', fontSize: '12px' }}>
              {title}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;