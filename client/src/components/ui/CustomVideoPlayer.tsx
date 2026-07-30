import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Loader2, RotateCcw } from 'lucide-react';

interface CustomVideoPlayerProps {
  videoUrl: string;
  title?: string;
  initialTime?: number; // Resume watched position
  onProgress?: (currentTime: number, duration: number, percent: number) => void;
  onEnded?: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export const getYoutubeId = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Check if it's already a simple 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Match common YouTube URL formats and extract the 11-character ID
  const regExp = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|live\/|shorts\/|u\/\w\/))([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  
  // Fallback parser for URL query parameters or pathname
  try {
    const urlWithProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const parsedUrl = new URL(urlWithProtocol);
    if (parsedUrl.hostname.includes('youtube') || parsedUrl.hostname.includes('youtu.be')) {
      const v = parsedUrl.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
      const pathParts = parsedUrl.pathname.split('/');
      for (const part of pathParts) {
        if (/^[a-zA-Z0-9_-]{11}$/.test(part)) {
          return part;
        }
      }
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  
  return trimmed;
};


export default function CustomVideoPlayer({
  videoUrl,
  title = 'Lecture Video',
  initialTime = 0,
  onProgress,
  onEnded
}: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerIframeRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const progressTimerRef = useRef<number | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const videoId = getYoutubeId(videoUrl);

  // Load YouTube IFrame API script if not loaded
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  // Initialize player when videoId or API ready change
  useEffect(() => {
    let player: any = null;

    const initializeYTPlayer = () => {
      if (!playerIframeRef.current || !window.YT || !window.YT.Player) return;

      // Clean up previous instance
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {
          console.error(e);
        }
      }

      player = new window.YT.Player(playerIframeRef.current, {
        videoId: videoId,
        playerVars: {
          controls: 0,            // Hide native YouTube controls
          modestbranding: 1,      // Hide YT logo
          rel: 0,                 // Hide related videos at end
          showinfo: 0,
          disablekb: 1,           // Disable keyboard controls on youtube iframe
          iv_load_policy: 3,      // Hide annotations
          fs: 0,                  // Disable native fullscreen button
          playsinline: 1,
          enablejsapi: 1
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            playerInstanceRef.current = event.target;
            
            // Set initial parameters
            event.target.setVolume(volume);
            setDuration(event.target.getDuration() || 0);

            // Seek to initial resume time if available
            if (initialTime > 0) {
              event.target.seekTo(initialTime, true);
              setCurrentTime(initialTime);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            const state = event.data;
            if (state === 1) { // Playing
              setIsPlaying(true);
              setIsBuffering(false);
            } else if (state === 2) { // Paused
              setIsPlaying(false);
              setIsBuffering(false);
            } else if (state === 3) { // Buffering
              setIsBuffering(true);
            } else if (state === 0) { // Ended
              setIsPlaying(false);
              setIsBuffering(false);
              if (onEnded) onEnded();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initializeYTPlayer();
    } else {
      // API not loaded yet, set callback
      window.onYouTubeIframeAPIReady = initializeYTPlayer;
    }

    return () => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [videoId]);

  // Track progress and trigger callbacks
  useEffect(() => {
    if (isPlaying && isReady && playerInstanceRef.current) {
      progressTimerRef.current = window.setInterval(() => {
        if (playerInstanceRef.current && typeof playerInstanceRef.current.getCurrentTime === 'function') {
          const curr = playerInstanceRef.current.getCurrentTime();
          const dur = playerInstanceRef.current.getDuration() || 0;
          setCurrentTime(curr);
          setDuration(dur);
          
          if (onProgress && dur > 0) {
            const percent = (curr / dur) * 100;
            onProgress(curr, dur, percent);
          }
        }
      }, 500);
    } else {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
    }

    return () => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
    };
  }, [isPlaying, isReady, onProgress]);

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut if user is typing in notes/discussion textarea or inputs
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if (!playerInstanceRef.current || !isReady) return;

      switch (e.key) {
        case ' ': // Space key: Play/Pause
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight': // Right Arrow: Seek forward 5 seconds
          e.preventDefault();
          seekDelta(5);
          break;
        case 'ArrowLeft': // Left Arrow: Seek backward 5 seconds
          e.preventDefault();
          seekDelta(-5);
          break;
        case 'ArrowUp': // Up Arrow: Increase volume
          e.preventDefault();
          adjustVolume(10);
          break;
        case 'ArrowDown': // Down Arrow: Decrease volume
          e.preventDefault();
          adjustVolume(-10);
          break;
        case 'f':
        case 'F': // Fullscreen
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M': // Mute
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReady, isPlaying, isMuted, volume]);

  // Handle Fullscreen state change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Control action functions
  const togglePlay = () => {
    if (!playerInstanceRef.current || !isReady) return;
    if (isPlaying) {
      playerInstanceRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerInstanceRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const seekDelta = (delta: number) => {
    if (!playerInstanceRef.current || !isReady) return;
    const current = playerInstanceRef.current.getCurrentTime() || 0;
    const dur = playerInstanceRef.current.getDuration() || 0;
    const target = Math.max(0, Math.min(dur, current + delta));
    playerInstanceRef.current.seekTo(target, true);
    setCurrentTime(target);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerInstanceRef.current || !isReady) return;
    const targetPercent = parseFloat(e.target.value);
    const targetTime = (targetPercent / 100) * duration;
    playerInstanceRef.current.seekTo(targetTime, true);
    setCurrentTime(targetTime);
  };

  const toggleMute = () => {
    if (!playerInstanceRef.current || !isReady) return;
    if (isMuted) {
      playerInstanceRef.current.unMute();
      playerInstanceRef.current.setVolume(volume);
      setIsMuted(false);
    } else {
      playerInstanceRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerInstanceRef.current || !isReady) return;
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    playerInstanceRef.current.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      playerInstanceRef.current.unMute();
      setIsMuted(false);
    } else if (newVol === 0 && !isMuted) {
      playerInstanceRef.current.mute();
      setIsMuted(true);
    }
  };

  const adjustVolume = (delta: number) => {
    const targetVol = Math.max(0, Math.min(100, volume + delta));
    setVolume(targetVol);
    if (playerInstanceRef.current && isReady) {
      playerInstanceRef.current.setVolume(targetVol);
      if (targetVol > 0 && isMuted) {
        playerInstanceRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!playerInstanceRef.current || !isReady) return;
    setPlaybackRate(rate);
    playerInstanceRef.current.setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Fullscreen request failed', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === null) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Prevent right-click inside the player area
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onContextMenu={handleContextMenu}
      className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden group select-none shadow-2xl border-2 border-slate-900 ${
        isFullscreen ? 'rounded-none border-0 h-screen w-screen' : ''
      }`}
    >
      {/* Hidden YouTube Iframe Target */}
      <div className="absolute inset-0 w-full h-full pointer-events-none scale-102">
        <div ref={playerIframeRef} className="w-full h-full" />
      </div>

      {/* Invisible Overlay Layer: Blocks raw double clicks to prevent opening YouTube directly, captures pause/play toggles */}
      <div
        onClick={togglePlay}
        className="absolute inset-0 w-full h-full cursor-pointer z-10"
      />

      {/* Buffering/Loading State */}
      {(!isReady || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 pointer-events-none">
          <Loader2 className="animate-spin text-gold" size={48} />
        </div>
      )}

      {/* Title Overlay (Fade out when playing) */}
      {!isPlaying && (
        <div className="absolute top-0 left-0 right-0 p-6 bg-linear-to-b from-black/80 to-transparent z-15 flex items-center justify-between text-white pointer-events-none transition-opacity duration-300">
          <h3 className="font-serif font-bold text-lg text-slate-100 drop-shadow-md">{title}</h3>
        </div>
      )}

      {/* Custom Control Bar Overlay (Hides when playing and mouse leaves) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/90 via-black/40 to-transparent z-20 flex flex-col gap-3 transition-opacity duration-300 opacity-100 md:opacity-0 group-hover:opacity-100">
        
        {/* Progress Timeline Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-300">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.01"
            value={progressPercent}
            onChange={handleSeekChange}
            className="grow h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-gold focus:outline-none"
            style={{
              background: `linear-gradient(to right, #F4B400 0%, #F4B400 ${progressPercent}%, #475569 ${progressPercent}%, #475569 100%)`
            }}
          />
          <span className="text-[11px] font-mono text-slate-300">{formatTime(duration)}</span>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-gold transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>

            {/* Back 5s */}
            <button
              onClick={() => seekDelta(-5)}
              className="text-white hover:text-gold transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
              title="Backward 5s (←)"
            >
              <RotateCcw size={16} />
            </button>

            {/* Volume controls */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white hover:text-gold transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-gold focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #F4B400 0%, #F4B400 ${isMuted ? 0 : volume}%, #475569 ${isMuted ? 0 : volume}%, #475569 100%)`
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* Speed settings toggle */}
            <div>
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-white hover:text-gold flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer p-1 px-2 rounded-lg hover:bg-white/10"
                title="Playback Speed"
              >
                <Settings size={16} />
                <span>{playbackRate === 1 ? 'Normal' : `${playbackRate}x`}</span>
              </button>
              
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-32 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl z-30">
                  <div className="p-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider text-center border-b border-slate-800 bg-slate-950">Speed</div>
                  {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-gold/10 transition-colors cursor-pointer ${
                        playbackRate === rate ? 'text-gold bg-gold/5' : 'text-slate-300'
                      }`}
                    >
                      {rate === 1 ? 'Normal' : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gold transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
