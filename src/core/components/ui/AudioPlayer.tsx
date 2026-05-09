import React, { useEffect, useState, useRef, useCallback } from "react";
import { PlayCircle, PauseCircle, Headphones, Loader2 } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { api } from "@/core/api/axios";
import { Text } from "@/core/components/ui/Text";

interface AudioPlayerProps {
  src: string;
  initialDuration?: number | string;
  fileSize?: number | string;
  className?: string;
}

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

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadAudio() {
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
    if (!audioRef.current || !blobUrl) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleLoadedMetadata = () => {
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
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50/80 border border-slate-100 ${className}`}
    >
      {blobUrl && (
        <audio
          ref={audioRef}
          src={blobUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setErrored(true)}
        />
      )}

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        disabled={loading || errored || !blobUrl}
        className="focus:outline-none disabled:opacity-50 flex-shrink-0"
      >
        {loading ? (
          <Loader2 size={18} color={COLORS.primary} className="animate-spin" />
        ) : playing ? (
          <PauseCircle size={18} color={COLORS.primary} className="hover:opacity-80 transition-opacity" />
        ) : (
          <PlayCircle size={18} color={COLORS.primary} className="hover:opacity-80 transition-opacity" />
        )}
      </button>

      {/* Progress & Info */}
      <div className="flex flex-col flex-1 min-w-[200px]">
        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={audioDuration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={loading || errored || !blobUrl}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed bg-slate-200"
          style={{
            background: `linear-gradient(to right, ${COLORS.primary} ${(currentTime / (audioDuration || 1)) * 100}%, #E2E8F0 ${(currentTime / (audioDuration || 1)) * 100}%)`,
          }}
        />

        {/* Timestamps and Size */}
        <div className="flex justify-between items-center mt-1">
          <Text weight="medium" style={{ fontSize: '10px', color: COLORS.primaryDark || COLORS.primary }}>
            {errored
              ? "Failed to load audio"
              : `${fmtTime(currentTime)} / ${fmtTime(audioDuration)}`}
          </Text>
          {Number(fileSize) > 0 && (
            <Text weight="medium" className="text-slate-400 tracking-wide" style={{ fontSize: '10px' }}>
              {fmtFileSize(fileSize)}
            </Text>
          )}
        </div>
      </div>

      <Headphones size={14} color={COLORS.primary} className="flex-shrink-0 opacity-50 ml-1" />
    </div>
  );
};
