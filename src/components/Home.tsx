import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Calendar, ChevronRight, User, Search, Loader2, Plus, X, Check } from 'lucide-react';
import { Song, Playlist } from '../types';
import { INITIAL_PLAYLISTS } from '../constants';
import { getSongFromUrl } from '../services/lyricsService';

interface HomeProps {
  songs: Song[];
  playlists: Playlist[];
  onSelectSong: (song: Song) => void;
  onAddSong: (song: Song) => void;
  onTogglePlaylist: (songId: string, playlistId: string) => void;
}

export default function Home({ songs, playlists, onSelectSong, onAddSong, onTogglePlaylist }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if it's a Cifra Club URL
    if (!searchQuery.includes('cifraclub.com.br')) {
      setError('Por favor, cole uma URL válida do Cifra Club.');
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const details = await getSongFromUrl(searchQuery);
      onAddSong(details as Song);
      setSearchQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar a URL.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-24">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-medium tracking-tight">Repertório</h1>
        <div className="w-12 h-12 rounded-full bg-[#49454F] flex items-center justify-center text-white shadow-lg">
          <User size={24} />
        </div>
      </header>

      {/* API Key Warning */}
      {!process.env.GEMINI_API_KEY && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <p className="text-xs font-bold">GEMINI_API_KEY não detectada. A busca não funcionará.</p>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Cole a URL do Cifra Club aqui..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="w-full bg-[#1C1B1F] border border-[#49454F]/30 rounded-2xl py-4 pl-12 pr-4 text-white text-base focus:outline-none focus:border-primary transition-colors"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          {isSearching ? <Loader2 size={20} className="animate-spin text-primary" /> : <Search size={20} />}
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <section>
        <h2 className="text-xs font-bold text-gray-500 mb-5 uppercase tracking-[0.2em]">Minhas Músicas</h2>
        <div className="space-y-4">
          {songs.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <p className="text-sm">Nenhuma música salva.</p>
              <p className="text-[10px] mt-1">Cole uma URL acima para começar.</p>
            </div>
          ) : (
            songs.map((song) => (
              <div 
                key={song.id}
                className="bg-[#1C1B1F] p-5 flex justify-between items-center rounded-[28px] border border-transparent hover:border-[#49454F]/50 active:bg-[#2B2930] transition-all cursor-pointer group"
              >
                <div onClick={() => onSelectSong(song)} className="flex-1">
                  <h3 className="font-medium text-xl mb-1 group-hover:text-primary transition-colors">{song.title}</h3>
                  <p className="text-gray-500 text-sm font-medium">
                    {song.artist} <span className="mx-2 opacity-30">•</span> {song.bpm} BPM
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlaylistModal(song.id);
                    }}
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                  <div onClick={() => onSelectSong(song)} className="text-gray-600 group-hover:text-primary transition-colors">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Playlist Selection Modal */}
      <AnimatePresence>
        {showPlaylistModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1C1B1F] rounded-[32px] p-6 border border-[#49454F] max-w-xs w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Adicionar à Playlist</h3>
                <button onClick={() => setShowPlaylistModal(null)} className="text-gray-500"><X size={20} /></button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                {playlists.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">Nenhuma playlist criada.</p>
                ) : (
                  playlists.map(p => {
                    const isSelected = songs.find(s => s.id === showPlaylistModal)?.playlistIds?.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => onTogglePlaylist(showPlaylistModal, p.id)}
                        className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${
                          isSelected ? 'bg-primary/20 border-primary text-primary' : 'bg-[#121314] border-[#49454F]/30 text-gray-400'
                        }`}
                      >
                        <span className="font-bold">{p.name}</span>
                        {isSelected && <Check size={18} />}
                      </button>
                    );
                  })
                )}
              </div>
              <button 
                onClick={() => setShowPlaylistModal(null)}
                className="w-full mt-6 py-3 bg-primary text-on-primary rounded-2xl font-bold"
              >
                CONCLUÍDO
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
