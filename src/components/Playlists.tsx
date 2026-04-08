import { Search, Plus } from 'lucide-react';

export default function Playlists() {
  return (
    <div className="flex-1 overflow-y-auto p-6 pb-32">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Playlists</h1>
        <button className="p-2 bg-primary/10 text-primary rounded-full">
          <Search size={24} />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-square bg-[#1C1B1F] rounded-3xl border border-[#49454F]/30 flex flex-col items-center justify-center gap-2 border-dashed">
          <Plus size={32} className="text-primary" />
          <span className="text-xs font-bold text-gray-400">Nova Playlist</span>
        </div>
        
        <PlaylistCard title="Favoritas" count={12} color="bg-green-500" />
        <PlaylistCard title="Ensaio Domingo" count={8} color="bg-blue-500" />
        <PlaylistCard title="Casamento Juliano" count={24} color="bg-purple-500" />
      </div>
    </div>
  );
}

function PlaylistCard({ title, count, color }: { title: string, count: number, color: string }) {
  return (
    <div className="aspect-square bg-[#1C1B1F] rounded-3xl border border-[#49454F]/30 overflow-hidden flex flex-col">
      <div className={`flex-1 ${color} opacity-20`} />
      <div className="p-4">
        <h3 className="font-bold text-sm truncate">{title}</h3>
        <p className="text-[10px] text-gray-500">{count} músicas</p>
      </div>
    </div>
  );
}
