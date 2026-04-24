import Icon from "@/components/ui/icon";
import { Track, formatTime } from "./types";

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  isRepeated: boolean;
  progressStyle: string;
  volumeStyle: string;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onProgressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLike: (id: number) => void;
}

export default function PlayerBar({
  currentTrack,
  isPlaying,
  progress,
  duration,
  volume,
  isShuffled,
  isRepeated,
  progressStyle,
  volumeStyle,
  onPlayPause,
  onNext,
  onPrev,
  onProgressChange,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
}: PlayerBarProps) {
  return (
    <div className="h-[88px] flex items-center px-6 gap-4 shrink-0 border-t border-white/5" style={{ background: "var(--bg-player)" }}>
      {/* Track info */}
      <div className="w-56 flex items-center gap-3 shrink-0">
        {currentTrack && (
          <>
            <img src={currentTrack.cover} alt={currentTrack.title} className="w-14 h-14 rounded-lg object-cover shrink-0 shadow-md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{currentTrack.artist}</p>
              {currentTrack.offline && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(29,185,84,0.15)", color: "var(--green)" }}>
                  <Icon name="WifiOff" size={10} /> Офлайн
                </span>
              )}
            </div>
            <button onClick={() => onToggleLike(currentTrack.id)} className="shrink-0 hover:scale-110 transition-transform">
              <Icon name="Heart" size={16} style={{ color: currentTrack.liked ? "var(--green)" : "var(--text-muted)", fill: currentTrack.liked ? "var(--green)" : "none" }} />
            </button>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-2 max-w-xl mx-auto">
        <div className="flex items-center gap-5">
          <button onClick={onToggleShuffle} className="hover:scale-110 transition-transform" style={{ color: isShuffled ? "var(--green)" : "var(--text-muted)" }}>
            <Icon name="Shuffle" size={18} />
          </button>
          <button onClick={onPrev} className="hover:scale-110 transition-all text-white/60 hover:text-white">
            <Icon name="SkipBack" size={22} />
          </button>
          <button onClick={onPlayPause} className="w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform" style={{ background: "var(--green)" }}>
            <Icon name={isPlaying ? "Pause" : "Play"} size={18} className="text-white ml-0.5" />
          </button>
          <button onClick={onNext} className="hover:scale-110 transition-all text-white/60 hover:text-white">
            <Icon name="SkipForward" size={22} />
          </button>
          <button onClick={onToggleRepeat} className="hover:scale-110 transition-transform" style={{ color: isRepeated ? "var(--green)" : "var(--text-muted)" }}>
            <Icon name="Repeat" size={18} />
          </button>
        </div>
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] w-9 text-right shrink-0" style={{ color: "var(--text-muted)" }}>{formatTime(progress)}</span>
          <input type="range" min={0} max={duration || 100} value={progress} onChange={onProgressChange} className="progress-bar flex-1" style={{ background: progressStyle }} />
          <span className="text-[11px] w-9 shrink-0" style={{ color: "var(--text-muted)" }}>
            {duration > 0 ? formatTime(duration) : currentTrack?.duration || "--:--"}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="w-36 flex items-center gap-2 shrink-0 justify-end">
        <Icon name="Volume2" size={16} style={{ color: "var(--text-muted)" }} />
        <input type="range" min={0} max={100} value={volume} onChange={onVolumeChange} className="volume-bar w-24" style={{ background: volumeStyle }} />
      </div>
    </div>
  );
}
