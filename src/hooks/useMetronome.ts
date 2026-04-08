import { useState, useEffect, useRef, useCallback } from 'react';

export type MetronomeSoundType = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'woodblock';

export function useMetronome(bpm: number, soundType: MetronomeSoundType = 'sine') {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextTickTimeRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Visual feedback state
  const [isTick, setIsTick] = useState(false);

  const scheduleTick = useCallback((time: number) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;

    const osc = audioCtxRef.current.createOscillator();
    const g = audioCtxRef.current.createGain();

    // Connect to master gain instead of direct destination
    osc.connect(g);
    g.connect(masterGainRef.current);

    if (soundType === 'woodblock') {
      // More aggressive percussive sound for woodblock
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500, time);
      osc.frequency.exponentialRampToValueAtTime(500, time + 0.04);
      
      g.gain.setValueAtTime(0.8, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    } else {
      osc.type = soundType as OscillatorType;
      // Use slightly lower frequencies for better audibility on small speakers
      const freq = soundType === 'sine' ? 880 : 440;
      osc.frequency.setValueAtTime(freq, time);
      
      g.gain.setValueAtTime(0.5, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    }

    osc.start(time);
    osc.stop(time + 0.1);

    // Visual feedback sync
    const delay = (time - audioCtxRef.current.currentTime) * 1000;
    setTimeout(() => {
      setIsTick(true);
      setTimeout(() => setIsTick(false), 50);
    }, Math.max(0, delay));
  }, [soundType]);

  const scheduler = useCallback(() => {
    if (!audioCtxRef.current) return;

    // Schedule ticks for the next 100ms
    while (nextTickTimeRef.current < audioCtxRef.current.currentTime + 0.1) {
      scheduleTick(nextTickTimeRef.current);
      const secondsPerBeat = 60.0 / bpm;
      nextTickTimeRef.current += secondsPerBeat;
    }
    
    timerIDRef.current = window.setTimeout(scheduler, 25);
  }, [bpm, scheduleTick]);

  const stop = useCallback(() => {
    if (timerIDRef.current) {
      window.clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const start = useCallback(async () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        masterGainRef.current = audioCtxRef.current.createGain();
        masterGainRef.current.connect(audioCtxRef.current.destination);
        masterGainRef.current.gain.value = 1.0;
      }
      
      // Force resume on every start to handle browser auto-suspend
      if (audioCtxRef.current.state !== 'running') {
        await audioCtxRef.current.resume();
      }

      // IMMEDIATE KICKSTART BEEP
      // This is triggered directly in the click handler's call stack
      const kickOsc = audioCtxRef.current.createOscillator();
      const kickGain = audioCtxRef.current.createGain();
      kickOsc.type = 'square'; // Louder than sine
      kickOsc.connect(kickGain);
      kickGain.connect(audioCtxRef.current.destination);
      kickGain.gain.setValueAtTime(0.4, audioCtxRef.current.currentTime);
      kickGain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.1);
      kickOsc.start();
      kickOsc.stop(audioCtxRef.current.currentTime + 0.1);

      nextTickTimeRef.current = audioCtxRef.current.currentTime + 0.1;
      scheduler();
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to start metronome:", err);
    }
  }, [scheduler]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  useEffect(() => {
    return () => {
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return { isPlaying, toggle, stop, isTick };
}
