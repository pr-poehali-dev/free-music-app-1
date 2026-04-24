import Icon from "@/components/ui/icon";
import { Track } from "./types";

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackClick: (t: Track) => void;
  onLike: (id: number) => void;
  showDate?: boolean;
}

const DATES = ["Сегодня", "Вчера", "3 дня назад", "Неделю назад", "2 недели назад"];

export default function TrackList({ tracks, currentTrack, isPlaying, onTrackClick, onLike, showDate }: TrackListProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {tracks.map((track, i) => {
        const isActive = currentTrack?.id === track.id;
        return (
          <div key={track.id}>
            {showDate && i % 2 === 0 && (
              <p className="text-xs font-semibold px-2 py-2 mt-2" style={{ color: "var(--text-muted)" }}>
                {DATES[Math.floor(i / 2)] || "Ранее"}
              </p>
            )}
            <div
              className="group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-white/5"
              style={{ background: isActive ? "rgba(255,255,255,0.07)" : undefined }}
              onClick={() => onTrackClick(track)}
            >
              <div className="w-10 h-10 relative shrink-0">
                <img src={track.cover} alt={track.title} className="w-full h-full rounded object-cover" />
                {isActive && isPlaying && (
                  <div className="absolute inset-0 flex items-end justify-center gap-0.5 pb-1.5 rounded bg-black/50">
                    <div className="w-1 rounded-full equalizer-bar" style={{ background: "var(--green)" }} />
                    <div className="w-1 rounded-full equalizer-bar" style={{ background: "var(--green)" }} />
                    <div className="w-1 rounded-full equalizer-bar" style={{ background: "var(--green)" }} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: isActive ? "var(--green)" : "white" }}>
                  {track.title}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {track.artist}
                  {track.offline && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(29,185,84,0.15)", color: "var(--green)" }}>офлайн</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onLike(track.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  style={{ color: track.liked ? "var(--green)" : "var(--text-muted)" }}
                >
                  <Icon name="Heart" size={15} style={{ fill: track.liked ? "var(--green)" : "none" }} />
                </button>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{track.duration}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
