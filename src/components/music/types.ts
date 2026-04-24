export interface Track {
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

export const COVERS = {
  purple: "https://cdn.poehali.dev/projects/669d8ab5-92ef-4b40-aa2e-525ecb4da125/files/03bccacc-c2ad-4fac-98a8-388bd1b2ff9f.jpg",
  green: "https://cdn.poehali.dev/projects/669d8ab5-92ef-4b40-aa2e-525ecb4da125/files/9e6a165f-239a-4630-848a-413f771f718c.jpg",
  amber: "https://cdn.poehali.dev/projects/669d8ab5-92ef-4b40-aa2e-525ecb4da125/files/250e1b2e-d09a-4f75-88db-d651b61b5cb5.jpg",
  cyan: "https://cdn.poehali.dev/projects/669d8ab5-92ef-4b40-aa2e-525ecb4da125/files/dfa10f29-7425-444e-9e14-b4ca4e09c227.jpg",
};

export const DEMO_TRACKS: Track[] = [
  { id: 1, title: "Ночной город", artist: "Артём Волк", album: "Тени", duration: "3:42", cover: COVERS.purple, liked: true },
  { id: 2, title: "Электрическая душа", artist: "Neon Drive", album: "Pulse", duration: "4:15", cover: COVERS.green, liked: false },
  { id: 3, title: "Джазовый вечер", artist: "Мирон Квартет", album: "Амбар", duration: "5:01", cover: COVERS.amber, liked: true },
  { id: 4, title: "Синтволна", artist: "CyberMood", album: "Retro Future", duration: "3:28", cover: COVERS.cyan, liked: false },
  { id: 5, title: "Тихий берег", artist: "Артём Волк", album: "Тени", duration: "4:52", cover: COVERS.purple, liked: false },
  { id: 6, title: "Рассвет", artist: "Mira Sound", album: "Утро", duration: "3:10", cover: COVERS.amber, liked: true },
];

export const PLAYLISTS = [
  { id: 1, name: "Мой микс #1", count: 24, cover: COVERS.purple },
  { id: 2, name: "Ночные треки", count: 12, cover: COVERS.cyan },
  { id: 3, name: "Рабочий фокус", count: 18, cover: COVERS.green },
  { id: 4, name: "Утренняя пробежка", count: 30, cover: COVERS.amber },
];

export const SECTIONS = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "search", label: "Поиск", icon: "Search" },
  { id: "library", label: "Библиотека", icon: "Library" },
  { id: "history", label: "История", icon: "History" },
];

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
