import React, { useEffect, useState, useRef, useCallback } from "react";
import { Play, Pause, Headphones, Loader2 } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";
import { api } from "@/core/api/axios";

interface AudioPlayerProps {
  src: string;
  initialDuration?: number | string;
  fileSize?: number | string;
  className?: string;
}

const SPEEDS = [1.0, 1.5, 2.0, 3.0];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  initialDuration = 0,
  fileSize = 0,
  className = "",
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errored, setErrored] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(Number(initialDuration) || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadAudio() {
      if (!src || !src.trim()) {
        setLoading(false);
        return;
      }

      let directUrl = src.trim();
      // console.log("direct url ---------------", directUrl);
      if (src.includes("digitaloceanspaces.com")) {
        const match = src.match(/([a-zA-Z0-9-.]+\.digitaloceanspaces\.com.*)/);
        if (match) {
          directUrl = `https://${match[1]}`;
        }
      }

      if (directUrl.startsWith("http")) {
        if (!cancelled) {
          setBlobUrl(directUrl);
          setErrored(false);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(src, { responseType: "blob" });
        if (!cancelled) {
          objectUrl = URL.createObjectURL(response.data);
          setBlobUrl(objectUrl);
          setErrored(false);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setErrored(true);
          setLoading(false);
          console.error("Failed to load audio:", error);
        }
      }
    }

    Promise.resolve().then(() => {
      setBlobUrl(null);
      setErrored(false);
      loadAudio();
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  const animationRef = useRef<number | null>(null);

  const updateProgress = useCallback(function update() {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
    animationRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    if (playing) {
      animationRef.current = requestAnimationFrame(updateProgress);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playing, updateProgress]);



  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Playback error:", error);
          setPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  };

  const handleLoadedMetadata = () => {
    setLoading(false);
    if (audioRef.current && audioRef.current.duration !== Infinity) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const fmtTime = (sec: number): string => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const fmtFileSize = (bytes: number | string): string => {
    const size = Number(bytes);
    if (!size || isNaN(size)) return "";
    return `${(size / 1024).toFixed(1)}KB`;
  };

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 ${className}`}>
      {blobUrl && (
        <audio
          key={blobUrl}
          ref={audioRef}
          preload="auto"
          autoPlay
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => setLoading(false)}
          onEnded={handleEnded}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={(e) => {
            const err = e.currentTarget.error;
            console.error("Audio element error code:", err?.code, err?.message);
            if (err?.code === 4) {
              // Attempt to reload with <source> fallback
              setErrored(true);
            }
            setErrored(true);
            setLoading(false);
          }}
        >
          <source src={blobUrl} type="audio/mpeg" />
        </audio>
      )}

      {/* Header Info */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${COLORS.primary}1A` }} // 10% opacity
        >
          <Headphones size={24} color={COLORS.primary} />
        </div>
        <div className="flex-1 min-w-0">
          <Text weight="bold" className="text-slate-800" style={{ fontSize: '15px' }}>
            Call Recording
          </Text>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Text className="text-slate-500" style={{ fontSize: '12px' }}>
              {fmtTime(audioDuration)}
            </Text>
            {Number(fileSize) > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <Text className="text-slate-500" style={{ fontSize: '12px' }}>
                  {fmtFileSize(fileSize)}
                </Text>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Timestamps */}
      <div className="mt-1">
        <input
          type="range"
          min={0}
          max={audioDuration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={loading || errored}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed bg-slate-100 mb-2"
          style={{
            background: `linear-gradient(to right, ${COLORS.primary} ${(currentTime / (audioDuration || 1)) * 100}%, #F1F5F9 ${(currentTime / (audioDuration || 1)) * 100}%)`,
          }}
        />
        <div className="flex justify-between items-center">
          <Text className="text-slate-500" style={{ fontSize: '11px' }}>
            {fmtTime(currentTime)}
          </Text>
          <Text className="text-slate-500" style={{ fontSize: '11px' }}>
            {fmtTime(audioDuration)}
          </Text>
        </div>
      </div>

      {/* Controls & Speed Chips */}
      <div className="flex items-center justify-between mt-1">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={loading || errored}
          className="w-12 h-12 rounded-full flex items-center justify-center focus:outline-none disabled:opacity-50 flex-shrink-0 transition-transform active:scale-95 shadow-md"
          style={{ backgroundColor: COLORS.primary, boxShadow: `0 4px 14px 0 ${COLORS.primary}59` }}
        >
          {loading ? (
            <Loader2 size={24} color="white" className="animate-spin" />
          ) : playing ? (
            <Pause size={24} color="white" fill="white" />
          ) : (
            <Play size={24} color="white" fill="white" className="ml-1" />
          )}
        </button>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5">
          {SPEEDS.map((speed) => {
            const isSelected = playbackSpeed === speed;
            return (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${isSelected
                  ? "text-white"
                  : "bg-slate-50"
                  }`}
                style={{
                  backgroundColor: isSelected ? COLORS.primary : undefined,
                  borderColor: isSelected ? COLORS.primary : '#E2E8F0',
                  color: isSelected ? 'white' : COLORS.primary,
                }}
              >
                {speed === 1.0 ? '1x' : `${speed}x`}
              </button>
            );
          })}
        </div>
      </div>

      {errored && (
        <Text className="text-red-500 text-center mt-2" style={{ fontSize: '11px' }}>
          Failed to load audio
        </Text>
      )}
    </div>
  );
};
