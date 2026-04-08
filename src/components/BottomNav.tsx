import { Music2, PlaySquare, Plus, Timer, Settings } from 'lucide-react';
import { ReactNode } from 'react';

export type PageId = 'songs' | 'playlists' | 'metronome' | 'settings';

interface BottomNavProps {
  activePage: PageId;
  onPageChange: (page: PageId) => void;
}

export default function BottomNav({ activePage, onPageChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 w-full h-20 bg-[#1C1B1F] border-t border-[#49454F]/50 flex justify-around items-center px-6 pb-2 z-40">
      <NavItem 
        icon={<Music2 size={24} />} 
        label="Músicas" 
        active={activePage === 'songs'} 
        onClick={() => onPageChange('songs')}
      />
      <NavItem 
        icon={<PlaySquare size={24} />} 
        label="Playlists" 
        active={activePage === 'playlists'} 
        onClick={() => onPageChange('playlists')}
      />
      
      <div className="relative">
        <button className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center -translate-y-6 shadow-2xl active:scale-90 transition-transform">
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      <NavItem 
        icon={<Timer size={24} />} 
        label="Metrônomo" 
        active={activePage === 'metronome'} 
        onClick={() => onPageChange('metronome')}
      />
      <NavItem 
        icon={<Settings size={24} />} 
        label="Ajustes" 
        active={activePage === 'settings'} 
        onClick={() => onPageChange('settings')}
      />
    </nav>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center cursor-pointer transition-colors ${active ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
    >
      {icon}
      <span className={`text-[10px] mt-1 font-bold ${active ? 'italic' : ''}`}>{label}</span>
    </div>
  );
}
