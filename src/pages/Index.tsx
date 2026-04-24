import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const COVERS = {
  purple: "https://cdn.poehali.dev/projects/669d8ab5-92ef-4b40-aa2e-525ecb4da125/files/03bccacc-c2ad-4fac-98a8-388bd1b2ff9f.jpg",
  green: "https://cdn.poehali.dev/projects/669d8ab5-92ef-4b40-aa2e-525ecb4da125/files/9e6a165f-239a-4630-848a-413f771f718c.jpg",
  amber: "https://cdn.poehali.dev/projects/669d8ab5-92ef-4b40-aa2e-525ecb4da125/files/250e1b2e-d09a-4f75-88db-d651b61b5cb5.jpg",
  cyan: "https://cdn.poehali.dev/projects/669d8ab5-92ef-4b40-aa2e-525ecb4da125/files/dfa10f29-7425-444e-9e14-b4ca4e09c227.jpg",
};

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  offline?: boolean;
  liked?: boolean;
  file?: File;
  url?: string;
}

const DEMO_TRACKS: Track[] = [
  { id: 1, title: "Ночной город", artist: "Артём Волк", album: "Тени", duration: "3:42", cover: COVERS.purple, liked: true },
  { id: 2, title: "Электрическая душа", artist: "Neon Drive", album: "Pulse", duration: "4:15", cover: COVERS.green, liked: false },
  { id: 3, title: "Джазовый вечер", artist: "Мирон Квартет", album: "Амбар", duration: "5:01", cover: COVERS.amber, liked: true },
  { id: 4, title: "Синтволна", artist: "CyberMood", album: "Retro Future", duration: "3:28", cover: COVERS.cyan, liked: false },
  { id: 5, title: "Тихий берег", artist: "Артём Волк", album: "Тени", duration: "4:52", cover: COVERS.purple, liked: false },
  { id: 6, title: "Рассвет", artist: "Mira Sound", album: "Утро", duration: "3:10", cover: COVERS.amber, liked: true },
];

const PLAYLISTS = [
  { id: 1, name: "Мой микс #1", count: 24, cover: COVERS.purple },
  { id: 2, name: "Ночные треки", count: 12, cover: COVERS.cyan },
  { id: 3, name: "Рабочий фокус", count: 18, cover: COVERS.green },
  { id: 4, name: "Утренняя пробежка", count: 30, cover: COVERS.amber },
];

const SECTIONS = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "search", label: "Поиск", icon: "Search" },
  { id: "library", label: "Библиотека", icon: "Library" },
  { id: "history", label: "История", icon: "History" },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Index() {
  const [section, setSection] = useState("home");
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(DEMO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [searchQuery, setSearchQuery] = useState("");
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Track[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrackClick = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      if (track.url) {
        audioRef.current.src = track.url;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        audioRef.current.src = "";
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
    setProgress(val);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
  };

  const handleNext = () => {
    const allTracks = [...tracks, ...uploadedFiles];
    const idx = allTracks.findIndex((t) => t.id === currentTrack?.id);
    const next = allTracks[(idx + 1) % allTracks.length];
    handleTrackClick(next);
  };

  const handlePrev = () => {
    const allTracks = [...tracks, ...uploadedFiles];
    const idx = allTracks.findIndex((t) => t.id === currentTrack?.id);
    const prev = allTracks[(idx - 1 + allTracks.length) % allTracks.length];
    handleTrackClick(prev);
  };

  const toggleLike = (id: number) => {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, liked: !t.liked } : t)));
    setUploadedFiles((prev) => prev.map((t) => (t.id === id ? { ...t, liked: !t.liked } : t)));
    if (currentTrack?.id === id) {
      setCurrentTrack((prev) => prev ? { ...prev, liked: !prev.liked } : prev);
    }
  };

  const handleFileDrop = useCallback((files: FileList | null) => {
    if (!files) return;
    const audioFiles = Array.from(files).filter((f) => f.type.startsWith("audio/"));
    const newTracks: Track[] = audioFiles.map((file, i) => {
      const url = URL.createObjectURL(file);
      const name = file.name.replace(/\.[^.]+$/, "");
      const parts = name.split(" - ");
      return {
        id: Date.now() + i,
        title: parts[1] || name,
        artist: parts[0] || "Неизвестный исполнитель",
        album: "Загруженное",
        duration: "--:--",
        cover: COVERS.cyan,
        offline: true,
        liked: false,
        file,
        url,
      };
    });
    setUploadedFiles((prev) => [...prev, ...newTracks]);
    if (newTracks.length > 0) setSection("library");
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileDrop(e.dataTransfer.files);
  };

  const allTracks = [...tracks, ...uploadedFiles];
  const likedTracks = allTracks.filter((t) => t.liked);
  const filteredTracks = searchQuery
    ? allTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allTracks;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const progressStyle = `linear-gradient(to right, #1DB954 ${progressPercent}%, #404040 ${progressPercent}%)`;
  const volumeStyle = `linear-gradient(to right, #1DB954 ${volume}%, #404040 ${volume}%)`;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "var(--bg-main)", fontFamily: "'Golos Text', sans-serif" }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-60 flex flex-col gap-2 p-3 overflow-y-auto shrink-0" style={{ background: "var(--bg-sidebar)" }}>
          <div className="flex items-center gap-2 px-3 py-4 mb-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--green)" }}>
              <Icon name="Music2" size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Волна</span>
          </div>

          <nav className="flex flex-col gap-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  section === s.id ? "text-white bg-white/10" : "text-[var(--text-secondary)]"
                }`}
              >
                <Icon name={s.icon} size={20} style={{ color: section === s.id ? "var(--green)" : undefined }} />
                {s.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-white/5">
            <button
              onClick={() => { setSection("library"); fileInputRef.current?.click(); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
            >
              <Icon name="Upload" size={18} />
              Загрузить треки
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in" key={section}>

          {/* HOME */}
          {section === "home" && (
            <div>
              <h1 className="text-3xl font-bold mb-1 text-white">Добрый вечер</h1>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Продолжай слушать</p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {DEMO_TRACKS.slice(0, 4).map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handleTrackClick(track)}
                    className="group flex items-center gap-3 rounded-lg overflow-hidden transition-all hover:bg-white/10"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <img src={track.cover} alt={track.title} className="w-14 h-14 object-cover shrink-0" />
                    <span className="text-sm font-semibold text-white text-left pr-2 line-clamp-2 flex-1">{track.title}</span>
                    <div className="mr-3 w-9 h-9 rounded-full flex items-center justify-center play-btn-overlay shrink-0 shadow-lg" style={{ background: "var(--green)" }}>
                      <Icon name="Play" size={15} className="text-white ml-0.5" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Моя волна — баннер */}
              <button
                onClick={() => setSection("mywave")}
                className="w-full flex items-center gap-5 rounded-2xl p-5 mb-6 text-left transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #0d0a2e 0%, #12103a 40%, #080818 100%)" }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg" style={{ background: "linear-gradient(135deg, #7c5cfc, #3b82f6)" }}>
                  <Icon name="Radio" size={26} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white">Моя волна</p>
                  <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Бесконечный поток музыки под твоё настроение</p>
                </div>
                <Icon name="ChevronRight" size={20} style={{ color: "rgba(255,255,255,0.5)" }} />
              </button>
            </div>
          )}

          {/* MY WAVE */}
          {section === "mywave" && (
            <MyWave tracks={allTracks} currentTrack={currentTrack} isPlaying={isPlaying} onTrackClick={handleTrackClick} onLike={toggleLike} />
          )}

          {/* SEARCH */}
          {section === "search" && (
            <div>
              <h1 className="text-3xl font-bold mb-4 text-white">Поиск</h1>
              <div className="relative mb-6">
                <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Исполнитель, трек, альбом..."
                  className="w-full pl-11 pr-4 py-3 rounded-full text-sm outline-none text-white placeholder:text-[var(--text-muted)] border-none"
                  style={{ background: "var(--bg-card)" }}
                  autoFocus
                />
              </div>
              {searchQuery ? (
                <>
                  <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                    Результаты для «{searchQuery}»: {filteredTracks.length}
                  </p>
                  <TrackList tracks={filteredTracks} currentTrack={currentTrack} isPlaying={isPlaying} onTrackClick={handleTrackClick} onLike={toggleLike} />
                </>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold mb-3 text-white">Обзор жанров</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {["Поп", "Рок", "Электронная", "Джаз", "Классика", "Hip-Hop"].map((g, i) => (
                      <div key={g} className="rounded-xl overflow-hidden cursor-pointer hover:brightness-110 transition-all relative aspect-[2/1]">
                        <img src={[COVERS.purple, COVERS.green, COVERS.cyan, COVERS.amber, COVERS.purple, COVERS.green][i]} alt={g} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-end p-4">
                          <p className="font-bold text-white text-xl">{g}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LIBRARY */}
          {section === "library" && (
            <LibrarySection
              allTracks={allTracks}
              likedTracks={likedTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isDragging={isDragging}
              onTrackClick={handleTrackClick}
              onLike={toggleLike}
              onUploadClick={() => fileInputRef.current?.click()}
            />
          )}

          {/* RECOMMENDATIONS */}
          {/* HISTORY */}
          {section === "history" && (
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">История</h1>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Последние прослушивания</p>
              <TrackList tracks={[...DEMO_TRACKS].reverse()} currentTrack={currentTrack} isPlaying={isPlaying} onTrackClick={handleTrackClick} onLike={toggleLike} showDate />
            </div>
          )}
        </main>

        {/* Drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 pointer-events-none" style={{ background: "rgba(18,18,18,0.88)", border: "2px dashed var(--green)", borderRadius: "12px" }}>
            <Icon name="Upload" size={56} style={{ color: "var(--green)" }} />
            <p className="text-xl font-bold text-white">Отпусти для загрузки трека</p>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={(e) => handleFileDrop(e.target.files)} />

      {/* Player bar */}
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
              <button onClick={() => toggleLike(currentTrack.id)} className="shrink-0 hover:scale-110 transition-transform">
                <Icon name="Heart" size={16} style={{ color: currentTrack.liked ? "var(--green)" : "var(--text-muted)", fill: currentTrack.liked ? "var(--green)" : "none" }} />
              </button>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-2 max-w-xl mx-auto">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsShuffled(!isShuffled)} className="hover:scale-110 transition-transform" style={{ color: isShuffled ? "var(--green)" : "var(--text-muted)" }}>
              <Icon name="Shuffle" size={18} />
            </button>
            <button onClick={handlePrev} className="hover:scale-110 transition-all text-white/60 hover:text-white">
              <Icon name="SkipBack" size={22} />
            </button>
            <button onClick={handlePlayPause} className="w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform" style={{ background: "var(--green)" }}>
              <Icon name={isPlaying ? "Pause" : "Play"} size={18} className="text-white ml-0.5" />
            </button>
            <button onClick={handleNext} className="hover:scale-110 transition-all text-white/60 hover:text-white">
              <Icon name="SkipForward" size={22} />
            </button>
            <button onClick={() => setIsRepeated(!isRepeated)} className="hover:scale-110 transition-transform" style={{ color: isRepeated ? "var(--green)" : "var(--text-muted)" }}>
              <Icon name="Repeat" size={18} />
            </button>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] w-9 text-right shrink-0" style={{ color: "var(--text-muted)" }}>{formatTime(progress)}</span>
            <input type="range" min={0} max={duration || 100} value={progress} onChange={handleProgressChange} className="progress-bar flex-1" style={{ background: progressStyle }} />
            <span className="text-[11px] w-9 shrink-0" style={{ color: "var(--text-muted)" }}>
              {duration > 0 ? formatTime(duration) : currentTrack?.duration || "--:--"}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="w-36 flex items-center gap-2 shrink-0 justify-end">
          <Icon name="Volume2" size={16} style={{ color: "var(--text-muted)" }} />
          <input type="range" min={0} max={100} value={volume} onChange={handleVolumeChange} className="volume-bar w-24" style={{ background: volumeStyle }} />
        </div>
      </div>
    </div>
  );
}

const MOODS = [
  { id: "chill", label: "Расслабленное", icon: "Moon", gradient: "linear-gradient(135deg, #0d0d2b, #12103a)" },
  { id: "focus", label: "Фокус", icon: "Target", gradient: "linear-gradient(135deg, #0a0a20, #1a0e3a)" },
  { id: "energy", label: "Энергия", icon: "Zap", gradient: "linear-gradient(135deg, #1a0a2e, #2a0050)" },
  { id: "happy", label: "Радость", icon: "Sun", gradient: "linear-gradient(135deg, #0e0a2a, #180a40)" },
];

function MyWave({ tracks, currentTrack, isPlaying, onTrackClick, onLike }: {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackClick: (t: Track) => void;
  onLike: (id: number) => void;
}) {
  const [activeMood, setActiveMood] = useState("chill");
  const [waveActive, setWaveActive] = useState(false);
  const [waveQueue, setWaveQueue] = useState<Track[]>([]);

  const startWave = () => {
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    setWaveQueue(shuffled);
    setWaveActive(true);
    if (shuffled.length > 0) onTrackClick(shuffled[0]);
  };

  return (
    <div>
      {/* Шапка */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0d0a2e 0%, #12103a 50%, #080818 100%)" }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #7c5cfc 0%, transparent 60%)" }} />
        <div className="relative z-10 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl" style={{ background: "linear-gradient(135deg, #7c5cfc, #3b82f6)" }}>
              <Icon name="Radio" size={36} className="text-white" />
            </div>
            {waveActive && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-black" style={{ background: "var(--green)", animation: "pulse-green 1.5s infinite" }} />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Персональная станция</p>
            <h1 className="text-4xl font-bold text-white mb-1">Моя волна</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>Бесконечный поток под твоё настроение</p>
          </div>
          <button
            onClick={startWave}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm hover:scale-105 transition-transform shadow-xl"
            style={{ background: "var(--green)" }}
          >
            <Icon name={waveActive ? "RefreshCw" : "Play"} size={16} />
            {waveActive ? "Обновить" : "Запустить"}
          </button>
        </div>
      </div>

      {/* Настроение */}
      <h2 className="text-base font-semibold mb-3 text-white">Выбери настроение</h2>
      <div className="grid grid-cols-4 gap-3 mb-8">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => { setActiveMood(mood.id); setWaveActive(false); }}
            className="rounded-xl p-4 text-left transition-all hover:brightness-110"
            style={{
              background: mood.gradient,
              border: activeMood === mood.id ? "2px solid var(--green)" : "2px solid transparent",
              boxShadow: activeMood === mood.id ? "0 0 12px rgba(29,185,84,0.25)" : "none",
            }}
          >
            <Icon name={mood.icon} size={22} className="mb-2" style={{ color: "var(--green)" }} />
            <p className="text-sm font-semibold text-white">{mood.label}</p>
          </button>
        ))}
      </div>

      {/* Очередь / призыв */}
      {waveActive && waveQueue.length > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-0.5">
              <div className="w-1 h-4 rounded-full equalizer-bar" style={{ background: "var(--green)" }} />
              <div className="w-1 h-4 rounded-full equalizer-bar" style={{ background: "var(--green)" }} />
              <div className="w-1 h-4 rounded-full equalizer-bar" style={{ background: "var(--green)" }} />
            </div>
            <h2 className="text-base font-semibold text-white">Сейчас в волне</h2>
          </div>
          <TrackList tracks={waveQueue} currentTrack={currentTrack} isPlaying={isPlaying} onTrackClick={onTrackClick} onLike={onLike} />
        </>
      ) : (
        <div className="text-center py-12 rounded-xl" style={{ background: "var(--bg-card)" }}>
          <Icon name="Radio" size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-semibold text-white mb-1">Нажми «Запустить»</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Мы подберём треки под выбранное настроение</p>
        </div>
      )}
    </div>
  );
}

const LIBRARY_TABS = [
  { id: "tracks", label: "Треки", icon: "Music" },
  { id: "playlists", label: "Плейлисты", icon: "ListMusic" },
  { id: "favorites", label: "Избранное", icon: "Heart" },
];

function LibrarySection({ allTracks, likedTracks, currentTrack, isPlaying, isDragging, onTrackClick, onLike, onUploadClick }: {
  allTracks: Track[];
  likedTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isDragging: boolean;
  onTrackClick: (t: Track) => void;
  onLike: (id: number) => void;
  onUploadClick: () => void;
}) {
  const [tab, setTab] = useState("tracks");

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold text-white">Библиотека</h1>
        <button onClick={onUploadClick} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white hover:brightness-110 transition-all" style={{ background: "var(--green)" }}>
          <Icon name="Plus" size={16} />
          Добавить
        </button>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "var(--bg-card)" }}>
        {LIBRARY_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? "var(--green)" : "transparent",
              color: tab === t.id ? "white" : "var(--text-secondary)",
            }}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Треки */}
      {tab === "tracks" && (
        <>
          <div
            className="mb-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 p-5 cursor-pointer transition-all"
            style={{ borderColor: isDragging ? "var(--green)" : "#2a2a2a", background: isDragging ? "rgba(124,92,252,0.05)" : "transparent" }}
            onClick={onUploadClick}
          >
            <Icon name="Upload" size={20} style={{ color: "var(--green)" }} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Перетащи треки сюда или нажми (.mp3, .flac, .wav)
            </span>
          </div>
          <TrackList tracks={allTracks} currentTrack={currentTrack} isPlaying={isPlaying} onTrackClick={onTrackClick} onLike={onLike} />
        </>
      )}

      {/* Плейлисты */}
      {tab === "playlists" && (
        <>
          <div className="flex justify-end mb-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-white/20 text-white hover:bg-white/10 transition-all">
              <Icon name="Plus" size={16} />
              Создать
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PLAYLISTS.map((pl) => (
              <div key={pl.id} className="group rounded-xl overflow-hidden card-hover cursor-pointer" style={{ background: "var(--bg-card)" }}>
                <div className="relative">
                  <img src={pl.cover} alt={pl.name} className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                  <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center play-btn-overlay shadow-xl" style={{ background: "var(--green)" }}>
                    <Icon name="Play" size={16} className="text-white ml-0.5" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-white text-sm truncate">{pl.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{pl.count} треков</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Избранное */}
      {tab === "favorites" && (
        <>
          <div className="flex items-center gap-5 mb-6">
            <div className="w-28 h-28 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #3b0080, #7c5cfc)" }}>
              <Icon name="Heart" size={40} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Плейлист</p>
              <h2 className="text-2xl font-bold text-white mb-1">Любимые треки</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{likedTracks.length} треков</p>
              {likedTracks.length > 0 && (
                <button onClick={() => onTrackClick(likedTracks[0])} className="mt-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform" style={{ background: "var(--green)" }}>
                  <Icon name="Play" size={16} className="text-white ml-0.5" />
                </button>
              )}
            </div>
          </div>
          {likedTracks.length > 0 ? (
            <TrackList tracks={likedTracks} currentTrack={currentTrack} isPlaying={isPlaying} onTrackClick={onTrackClick} onLike={onLike} />
          ) : (
            <div className="text-center py-16">
              <Icon name="Heart" size={48} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)" }}>Нажми ♥ на треке, чтобы добавить в избранное</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TrackList({
  tracks,
  currentTrack,
  isPlaying,
  onTrackClick,
  onLike,
  showDate,
}: {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackClick: (t: Track) => void;
  onLike: (id: number) => void;
  showDate?: boolean;
}) {
  const dates = ["Сегодня", "Вчера", "3 дня назад", "Неделю назад", "2 недели назад"];
  return (
    <div className="flex flex-col gap-0.5">
      {tracks.map((track, i) => {
        const isActive = currentTrack?.id === track.id;
        return (
          <div key={track.id}>
            {showDate && i % 2 === 0 && (
              <p className="text-xs font-semibold px-2 py-2 mt-2" style={{ color: "var(--text-muted)" }}>
                {dates[Math.floor(i / 2)] || "Ранее"}
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