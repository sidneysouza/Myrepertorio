import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MoreVertical, Play, Square, Minus, Plus, Volume2 } from 'lucide-react';
import { Song } from '../types';
import { useState, useEffect } from 'react';
import { transpose, formatChords } from '../utils';
import { useMetronome, MetronomeSoundType } from '../hooks/useMetronome';

interface PlayerProps {
  song: Song | null;
  onClose: () => void;
}

const SOUND_TYPES: { id: MetronomeSoundType; label: string }[] = [
  { id: 'sine', label: 'Suave' },
  { id: 'square', label: 'Afiado' },
  { id: 'triangle', label: 'Médio' },
  { id: 'sawtooth', label: 'Zumbido' },
  { id: 'woodblock', label: 'Madeira' },
];

export default function Player({ song, onClose }: PlayerProps) {
  const [keyOffset, setKeyOffset] = useState(0);
  const [soundType, setSoundType] = useState<MetronomeSoundType>('sine');
  const [viewMode, setViewMode] = useState<'chords' | 'lyrics'>('chords');
  const { isPlaying, toggle, stop, isTick, currentBeat } = useMetronome(song?.bpm || 120, soundType);

  useEffect(() => {
    setKeyOffset(0);
    stop();
    setViewMode('chords');
  }, [song, stop]);

  if (!song) return null;

  const transposedChords = transpose(song.chords, keyOffset);

  return (
    <AnimatePresence>
      {song && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-[#121314] z-50 flex flex-col p-6 pb-safe"
        >
          <nav className="flex justify-between items-center mb-8">
            <button 
              onClick={() => { stop(); onClose(); }} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronDown size={32} />
            </button>
            
            <div className="flex items-center bg-[#1C1B1F] rounded-full p-1 border border-[#49454F]">
              <button 
                onClick={() => setKeyOffset(prev => prev - 1)}
                className="w-10 h-8 flex items-center justify-center hover:text-primary transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="px-4 text-sm font-bold text-primary min-w-[80px] text-center">
                TOM {keyOffset > 0 ? `+${keyOffset}` : keyOffset}
              </span>
              <button 
                onClick={() => setKeyOffset(prev => prev + 1)}
                className="w-10 h-8 flex items-center justify-center hover:text-primary transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="flex bg-[#1C1B1F] rounded-full p-1 border border-[#49454F]">
              <button 
                onClick={() => setViewMode('chords')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${viewMode === 'chords' ? 'bg-primary text-on-primary' : 'text-gray-500'}`}
              >
                CIFRA
              </button>
              <button 
                onClick={() => setViewMode('lyrics')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${viewMode === 'lyrics' ? 'bg-primary text-on-primary' : 'text-gray-500'}`}
              >
                LETRA
              </button>
            </div>
          </nav>

          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight truncate">{song.title}</h2>
            <p className="text-primary text-lg font-medium">{song.artist}</p>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <div className="bg-[#1C1B1F] rounded-[28px] p-5 border border-[#49454F]/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Metrônomo</p>
                    <p className="font-bold text-2xl">
                      {song.bpm} <span className="text-xs text-gray-500">BPM</span>
                    </p>
                  </div>
                  {/* Beat Indicators */}
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          isPlaying && currentBeat === i 
                            ? i === 0 ? 'bg-white scale-125' : 'bg-primary scale-110'
                            : 'bg-gray-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={toggle}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isPlaying 
                      ? isTick ? 'bg-white text-red-500 scale-110' : 'bg-red-500 text-white' 
                      : 'bg-primary text-on-primary'
                  }`}
                >
                  {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <Volume2 size={16} className="text-gray-500 shrink-0" />
                {SOUND_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSoundType(type.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                      soundType === type.id 
                        ? 'bg-primary/20 border-primary text-primary' 
                        : 'bg-transparent border-[#49454F] text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-[32px] bg-[#1C1B1F]/50 p-6 border border-[#49454F]/20 mb-4">
            {viewMode === 'chords' ? (
              <pre 
                className="text-gray-300 whitespace-pre-wrap font-sans leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: formatChords(transposedChords) }}
              />
            ) : (
              <div className="text-gray-300 whitespace-pre-wrap font-sans leading-relaxed text-lg">
                {song.lyrics || "Letra não disponível."}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
