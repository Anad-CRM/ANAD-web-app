import React from "react";
import { X } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";

interface AudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  fileSize?: number | string;
  initialDuration?: number | string;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  isOpen,
  onClose,
  src,
  fileSize,
  initialDuration,
}) => {



  console.log("src from audio player-------------", { src })

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 text-white"
        >
          <X size={20} />
        </button>
        <AudioPlayer
          src={src}
          fileSize={fileSize}
          initialDuration={initialDuration}
          className="w-full !border-0"
        />
      </div>
    </div>
  );
};
