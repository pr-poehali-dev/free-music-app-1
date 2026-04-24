import Icon from "@/components/ui/icon";
import { SECTIONS } from "./types";

interface SidebarProps {
  section: string;
  onSectionChange: (id: string) => void;
  onUploadClick: () => void;
}

export default function Sidebar({ section, onSectionChange, onUploadClick }: SidebarProps) {
  return (
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
            onClick={() => onSectionChange(s.id)}
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
          onClick={onUploadClick}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
        >
          <Icon name="Upload" size={18} />
          Загрузить треки
        </button>
      </div>
    </aside>
  );
}
