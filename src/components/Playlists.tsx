import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Playlist } from '../types';

const PLAYLISTS_STORAGE_KEY = 'stitch_player_playlists';

interface PlaylistsProps {
  playlists: Playlist[];
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

export default function Playlists({ playlists, setPlaylists, songs, onSelectSong }: PlaylistsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  }, [playlists]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      icon: 'PlaySquare'
    };
    setPlaylists([...playlists, newPlaylist]);
    setNewName('');
    setIsAdding(false);
  };

  const handleUpdate = (id: string) => {
    if (!newName.trim()) return;
    setPlaylists(playlists.map(p => p.id === id ? { ...p, name: newName } : p));
    setEditingId(null);
    setNewName('');
  };

  const handleDelete = (id: string) => {
    setPlaylists(playlists.filter(p => p.id !== id));
    if (expandedPlaylistId === id) setExpandedPlaylistId(null);
  };

  const startEdit = (playlist: Playlist) => {
    setEditingId(playlist.id);
    setNewName(playlist.name);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-32">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Playlists</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-3 bg-primary text-on-primary rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {isAdding && (
          <div className="bg-[#1C1B1F] p-4 rounded-3xl border border-primary/50 flex flex-col gap-4">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome da playlist..."
              className="bg-transparent border-b border-gray-700 py-2 text-white focus:outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAdding(false)} className="p-2 text-gray-500"><X size={20} /></button>
              <button onClick={handleCreate} className="p-2 text-primary font-bold">CRIAR</button>
            </div>
          </div>
        )}

        {playlists.length === 0 && !isAdding && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-sm">Nenhuma playlist criada.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-4 text-primary text-xs font-bold uppercase tracking-widest"
            >
              Criar minha primeira playlist
            </button>
          </div>
        )}

        {playlists.map((playlist) => {
          const playlistSongs = songs.filter(s => s.playlistIds?.includes(playlist.id));
          const isExpanded = expandedPlaylistId === playlist.id;

          return (
            <div key={playlist.id} className="flex flex-col gap-2">
              <div 
                className={`bg-[#1C1B1F] p-5 rounded-[28px] border transition-all flex justify-between items-center group cursor-pointer ${
                  isExpanded ? 'border-primary/50' : 'border-[#49454F]/30'
                }`}
                onClick={() => setExpandedPlaylistId(isExpanded ? null : playlist.id)}
              >
                {editingId === playlist.id ? (
                  <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-transparent border-b border-primary flex-1 py-1 text-white focus:outline-none"
                    />
                    <button onClick={() => handleUpdate(playlist.id)} className="text-primary"><Check size={20} /></button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500"><X size={20} /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{playlist.name}</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                        {playlistSongs.length} {playlistSongs.length === 1 ? 'música' : 'músicas'}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button onClick={() => startEdit(playlist)} className="p-2 text-gray-400 hover:text-white">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(playlist.id)} className="p-2 text-red-500/70 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Expanded Songs List */}
              <AnimatePresence>
                {isExpanded && playlistSongs.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col gap-2 pl-4"
                  >
                    {playlistSongs.map(song => (
                      <div 
                        key={song.id}
                        onClick={() => onSelectSong(song)}
                        className="bg-[#1C1B1F]/50 p-4 flex justify-between items-center rounded-2xl border border-[#49454F]/20 active:bg-[#2B2930] transition-all cursor-pointer group"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{song.title}</h4>
                          <p className="text-gray-500 text-[10px]">{song.artist}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-primary" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
