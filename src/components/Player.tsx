import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MoreVertical, Play, Square, Minus, Plus, Volume2, Youtube, Music, X, Info } from 'lucide-react';
import { Song } from '../types';
import { transpose, formatChords, extractUniqueChords } from '../utils';
import { useMetronome, MetronomeSoundType } from '../hooks/useMetronome';
import YouTube, { YouTubeProps } from 'react-youtube';

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
  const [isYoutubePlaying, setIsYoutubePlaying] = useState(false);
  const [youtubeProgress, setYoutubeProgress] = useState(0);
  const [youtubeDuration, setYoutubeDuration] = useState(0);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  
  const { isPlaying, toggle, stop, isTick, currentBeat } = useMetronome(song?.bpm || 120, soundType);
  const youtubePlayerRef = useRef<any>(null);

  useEffect(() => {
    setKeyOffset(0);
    stop();
    setIsYoutubePlaying(false);
    setViewMode('chords');
    setYoutubeProgress(0);
  }, [song, stop]);

  useEffect(() => {
    let interval: number;
    if (isYoutubePlaying && youtubePlayerRef.current) {
      interval = window.setInterval(() => {
        const currentTime = youtubePlayerRef.current.getCurrentTime();
        setYoutubeProgress(currentTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isYoutubePlaying]);

  if (!song) return null;

  const transposedChords = transpose(song.chords, keyOffset);
  const uniqueChords = extractUniqueChords(transposedChords);

  const onYoutubeReady: YouTubeProps['onReady'] = (event) => {
    youtubePlayerRef.current = event.target;
    setYoutubeDuration(event.target.getDuration());
  };

  const onYoutubeStateChange: YouTubeProps['onStateChange'] = (event) => {
    setIsYoutubePlaying(event.data === 1);
  };

  const toggleYoutube = () => {
    if (isYoutubePlaying) {
      youtubePlayerRef.current?.pauseVideo();
    } else {
      youtubePlayerRef.current?.playVideo();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    youtubePlayerRef.current?.seekTo(time);
    setYoutubeProgress(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {song && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-[#121314] z-50 flex flex-col p-6 pb-safe overflow-hidden"
        >
          {/* YouTube Player (Hidden) */}
          {song.youtubeId && (
            <div className="hidden">
              <YouTube 
                videoId={song.youtubeId} 
                opts={{ height: '0', width: '0', playerVars: { autoplay: 0, controls: 0 } }}
                onReady={onYoutubeReady}
                onStateChange={onYoutubeStateChange}
              />
            </div>
          )}

          <nav className="flex justify-between items-center mb-6">
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

          <div className="mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold tracking-tight truncate max-w-[200px]">{song.title}</h2>
              <p className="text-primary text-sm font-medium">{song.artist}</p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {song.youtubeId && (
                <div className="flex flex-col items-end bg-[#1C1B1F] p-3 rounded-2xl border border-[#49454F]/30 w-48">
                  <div className="flex items-center justify-between w-full mb-2">
                    <button 
                      onClick={toggleYoutube}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isYoutubePlaying ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {isYoutubePlaying ? <Square size={14} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <span className="text-[10px] font-mono text-gray-500">
                      {formatTime(youtubeProgress)} / {formatTime(youtubeDuration)}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max={youtubeDuration}
                    value={youtubeProgress}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <div className="bg-[#1C1B1F] rounded-[28px] p-4 border border-[#49454F]/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Metrônomo</p>
                    <p className="font-bold text-xl">
                      {song.bpm} <span className="text-xs text-gray-500">BPM</span>
                    </p>
                  </div>
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isPlaying 
                      ? isTick ? 'bg-white text-red-500 scale-110' : 'bg-red-500 text-white' 
                      : 'bg-primary text-on-primary'
                  }`}
                >
                  {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <Volume2 size={14} className="text-gray-500 shrink-0" />
                {SOUND_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSoundType(type.id)}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold whitespace-nowrap transition-all border ${
                      soundType === type.id 
                        ? 'bg-primary/20 border-primary text-primary' 
                        : 'bg-transparent border-[#49454F] text-gray-400'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chord Dictionary Quick Access */}
          {uniqueChords.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 py-1">
              {uniqueChords.map(chord => (
                <button
                  key={chord}
                  onClick={() => setSelectedChord(chord)}
                  className="px-3 py-1 bg-[#1C1B1F] border border-[#49454F]/30 rounded-lg text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors"
                >
                  {chord}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto rounded-[32px] bg-[#1C1B1F]/50 p-6 border border-[#49454F]/20 mb-4">
            {viewMode === 'chords' ? (
              <pre 
                className="text-gray-300 whitespace-pre font-mono leading-relaxed text-sm overflow-x-auto"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.classList.contains('chord-trigger')) {
                    setSelectedChord(target.getAttribute('data-chord'));
                  }
                }}
                dangerouslySetInnerHTML={{ __html: formatChords(transposedChords) }}
              />
            ) : (
              <div className="text-gray-300 whitespace-pre-wrap font-sans leading-relaxed text-lg">
                {song.lyrics || "Letra não disponível."}
              </div>
            )}
          </div>

          {/* Chord Dictionary Modal */}
          <AnimatePresence>
            {selectedChord && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedChord(null)}
              >
                <div 
                  className="bg-[#1C1B1F] rounded-[32px] p-8 border border-[#49454F] max-w-xs w-full relative"
                  onClick={e => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setSelectedChord(null)}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                  <h3 className="text-3xl font-bold text-primary mb-6 text-center">{selectedChord}</h3>
                  <div className="aspect-square bg-white rounded-2xl p-4 flex items-center justify-center">
                    <img 
                      src={`https://studiosol-a.akamaihd.net/cifra/chords/guitar/${selectedChord.toLowerCase().replace('#', 's')}.png`}
                      alt={`Diagrama do acorde ${selectedChord}`}
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/chord/200/200?blur=2';
                      }}
                    />
                  </div>
                  <p className="text-center text-gray-500 mt-6 text-sm font-medium">
                    Diagrama de violão para o acorde {selectedChord}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
