import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Square, Volume2 } from 'lucide-react';
import { useMetronome, MetronomeSoundType } from '../hooks/useMetronome';

const SOUND_TYPES: { id: MetronomeSoundType; label: string }[] = [
  { id: 'sine', label: 'Suave' },
  { id: 'square', label: 'Afiado' },
  { id: 'triangle', label: 'Médio' },
  { id: 'sawtooth', label: 'Zumbido' },
  { id: 'woodblock', label: 'Madeira' },
];

const MIN_BPM = 40;
const MAX_BPM = 280;

const TIME_SIGNATURES = [
  { top: 2, bottom: 4, label: '2/4' },
  { top: 3, bottom: 4, label: '3/4' },
  { top: 4, bottom: 4, label: '4/4' },
  { top: 6, bottom: 8, label: '6/8' },
  { top: 5, bottom: 4, label: '5/4' },
  { top: 7, bottom: 8, label: '7/8' },
];

export default function MetronomePage() {
  const [bpm, setBpm] = useState(120);
  const [soundType, setSoundType] = useState<MetronomeSoundType>('sine');
  const [timeSignature, setTimeSignature] = useState(TIME_SIGNATURES[2]); // Default 4/4
  
  const { isPlaying, toggle, isTick, currentBeat } = useMetronome(bpm, soundType, timeSignature.top);
  const circleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ... (rest of the logic remains similar)

  const lastYRef = useRef<number | null>(null);

  const calculateBpmFromVerticalDrag = useCallback((clientY: number) => {
    if (lastYRef.current !== null) {
      const deltaY = lastYRef.current - clientY; // Up is positive change
      
      // Sensitivity: 5 pixels = 1 BPM change
      const sensitivity = 0.2;
      const bpmChange = deltaY * sensitivity;

      setBpm(prev => {
        const nextBpm = prev + bpmChange;
        return Math.min(MAX_BPM, Math.max(MIN_BPM, nextBpm));
      });
    }
    lastYRef.current = clientY;
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastYRef.current = e.clientY;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    lastYRef.current = e.touches[0].clientY;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) calculateBpmFromVerticalDrag(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        calculateBpmFromVerticalDrag(e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      lastYRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, calculateBpmFromVerticalDrag]);

  // SVG Progress Ring calculations
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progress = (bpm - MIN_BPM) / (MAX_BPM - MIN_BPM);
  const strokeDashoffset = circumference - progress * circumference;

  // Visual rotation for the handle (can be infinite visually too, but here we map to BPM range)
  const visualRotation = (progress * 360) - 90;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32 select-none">
      <h1 className="text-4xl font-bold tracking-tight mb-12">Metrônomo</h1>

      {/* Time Signature Selection */}
      <div className="w-full max-w-xs mb-8">
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-3 text-center">Compasso</p>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {TIME_SIGNATURES.map((sig) => (
            <button
              key={sig.label}
              onClick={() => setTimeSignature(sig)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                timeSignature.label === sig.label 
                  ? 'bg-primary text-on-primary border-primary' 
                  : 'bg-[#1C1B1F] border-[#49454F] text-gray-400'
              }`}
            >
              {sig.label}
            </button>
          ))}
        </div>
      </div>

      {/* Beat Indicators */}
      <div className="flex gap-3 mb-12">
        {Array.from({ length: timeSignature.top }).map((_, i) => (
          <div 
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-75 ${
              isPlaying && currentBeat === i
                ? i === 0 ? 'bg-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-primary scale-110'
                : 'bg-[#1C1B1F] border border-[#49454F]'
            }`}
          />
        ))}
      </div>

      <div 
        ref={circleRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`relative w-72 h-72 flex items-center justify-center mb-12 cursor-ns-resize group transition-transform ${isDragging ? 'scale-95' : ''}`}
      >
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="144"
            cy="144"
            r={radius}
            fill="transparent"
            stroke="#1C1B1F"
            strokeWidth="12"
          />
          {/* Progress Ring */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            fill="transparent"
            stroke={isPlaying && isTick ? '#FFFFFF' : '#00E676'}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75"
          />
        </svg>

        {/* Drag Hints */}
        <div className="absolute inset-0 flex flex-col items-center justify-between py-8 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity">
          <div className="w-8 h-1 bg-white rounded-full" />
          <div className="w-8 h-1 bg-white rounded-full" />
        </div>

        {/* Pulsing Visualizer */}
        <div className={`absolute inset-0 rounded-full transition-all duration-75 ${
          isPlaying && isTick ? 'bg-primary/10 scale-105 shadow-[0_0_40px_rgba(0,230,118,0.2)]' : ''
        }`} />
        
        <div className="text-center z-10 pointer-events-none">
          <div className="text-7xl font-bold mb-1">{Math.round(bpm)}</div>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">BPM</p>
        </div>

        {/* Handle */}
        <div 
          className="absolute w-6 h-6 bg-white rounded-full shadow-lg border-4 border-primary transition-transform"
          style={{
            transform: `rotate(${visualRotation}deg) translate(${radius}px) rotate(${-visualRotation}deg)`
          }}
        />
      </div>

      <div className="flex items-center gap-8 mb-12">
        <button 
          onClick={() => setBpm(prev => Math.max(MIN_BPM, prev - 1))}
          className="w-12 h-12 rounded-full bg-[#1C1B1F] border border-[#49454F] flex items-center justify-center text-2xl font-bold active:scale-90 transition-transform"
        >
          -
        </button>
        
        <button 
          onClick={toggle}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
            isPlaying ? 'bg-red-500 text-white' : 'bg-primary text-on-primary'
          }`}
        >
          {isPlaying ? <Square size={32} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
        </button>

        <button 
          onClick={() => setBpm(prev => Math.min(MAX_BPM, prev + 1))}
          className="w-12 h-12 rounded-full bg-[#1C1B1F] border border-[#49454F] flex items-center justify-center text-2xl font-bold active:scale-90 transition-transform"
        >
          +
        </button>
      </div>

      <div className="w-full max-w-xs bg-[#1C1B1F] rounded-3xl p-4 border border-[#49454F]/30">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Volume2 size={16} className="text-gray-500 shrink-0" />
          {SOUND_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSoundType(type.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
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
  );
}
