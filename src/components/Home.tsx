import { Heart, Calendar, ChevronRight, User } from 'lucide-react';
import { Song, Playlist } from '../types';
import { INITIAL_PLAYLISTS } from '../constants';

interface HomeProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

export default function Home({ songs, onSelectSong }: HomeProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 pb-24">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-medium tracking-tight">Repertório</h1>
        <div className="w-12 h-12 rounded-full bg-[#49454F] flex items-center justify-center text-white shadow-lg">
          <User size={24} />
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-xs font-bold text-gray-500 mb-5 uppercase tracking-[0.2em]">Minhas Playlists</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar">
          {INITIAL_PLAYLISTS.map((playlist) => (
            <div 
              key={playlist.id}
              className="bg-[#1C1B1F] p-5 min-w-[150px] rounded-[28px] border border-[#49454F]/30 active:scale-95 transition-transform cursor-pointer"
            >
              <div className="text-primary mb-3">
                {playlist.icon === 'Heart' ? <Heart size={24} /> : <Calendar size={24} />}
              </div>
              <p className="font-medium text-lg">{playlist.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold text-gray-500 mb-5 uppercase tracking-[0.2em]">Todas as Músicas</h2>
        <div className="space-y-4">
          {songs.map((song) => (
            <div 
              key={song.id}
              onClick={() => onSelectSong(song)}
              className="bg-[#1C1B1F] p-5 flex justify-between items-center rounded-[28px] border border-transparent hover:border-[#49454F]/50 active:bg-[#2B2930] transition-all cursor-pointer group"
            >
              <div>
                <h3 className="font-medium text-xl mb-1 group-hover:text-primary transition-colors">{song.title}</h3>
                <p className="text-gray-500 text-sm font-medium">
                  {song.artist} <span className="mx-2 opacity-30">•</span> {song.bpm} BPM
                </p>
              </div>
              <div className="text-gray-600 group-hover:text-primary transition-colors">
                <ChevronRight size={24} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
