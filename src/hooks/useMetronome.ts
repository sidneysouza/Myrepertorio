import { useState, useEffect, useRef, useCallback } from 'react';

export type MetronomeSoundType = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'woodblock';

export function useMetronome(bpm: number, soundType: MetronomeSoundType = 'sine', beatsPerMeasure: number = 4) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextTickTimeRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const currentBeatRef = useRef<number>(0);
  
  // Refs to avoid stale closures in the scheduler loop
  const bpmRef = useRef(bpm);
  const soundTypeRef = useRef(soundType);
  const isPlayingRef = useRef(isPlaying);
  const beatsPerMeasureRef = useRef(beatsPerMeasure);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { soundTypeRef.current = soundType; }, [soundType]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { beatsPerMeasureRef.current = beatsPerMeasure; }, [beatsPerMeasure]);

  // Visual feedback state
  const [isTick, setIsTick] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);

  const scheduleTick = useCallback((time: number, type: MetronomeSoundType, beatIndex: number) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.connect(g);
    g.connect(masterGainRef.current);

    const isFirstBeat = beatIndex === 0;

    if (type === 'woodblock') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFirstBeat ? 2000 : 1500, time);
      osc.frequency.exponentialRampToValueAtTime(500, time + 0.04);
      g.gain.setValueAtTime(isFirstBeat ? 1.0 : 0.7, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    } else {
      osc.type = type as OscillatorType;
      const freq = isFirstBeat ? (type === 'sine' ? 1320 : 880) : (type === 'sine' ? 880 : 440);
      osc.frequency.setValueAtTime(freq, time);
      g.gain.setValueAtTime(isFirstBeat ? 0.8 : 0.5, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    }

    osc.start(time);
    osc.stop(time + 0.1);

    // Visual feedback sync
    const delay = (time - ctx.currentTime) * 1000;
    setTimeout(() => {
      setIsTick(true);
      setCurrentBeat(beatIndex);
      setTimeout(() => setIsTick(false), 50);
    }, Math.max(0, delay));
  }, []);

  const scheduler = useCallback(() => {
    if (!audioCtxRef.current || !isPlayingRef.current) return;

    const ctx = audioCtxRef.current;

    while (nextTickTimeRef.current < ctx.currentTime + 0.1) {
      scheduleTick(nextTickTimeRef.current, soundTypeRef.current, currentBeatRef.current);
      
      const secondsPerBeat = 60.0 / bpmRef.current;
      nextTickTimeRef.current += secondsPerBeat;
      
      currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasureRef.current;
    }
    
    timerIDRef.current = window.setTimeout(scheduler, 25);
  }, [scheduleTick]);

  const stop = useCallback(() => {
    if (timerIDRef.current) {
      window.clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    currentBeatRef.current = 0;
    setCurrentBeat(0);
  }, []);

  const start = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
        masterGainRef.current = audioCtxRef.current.createGain();
        masterGainRef.current.connect(audioCtxRef.current.destination);
      }
      
      const ctx = audioCtxRef.current;

      if (ctx.state !== 'running') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.01);

      nextTickTimeRef.current = ctx.currentTime + 0.05;
      currentBeatRef.current = 0;
      setIsPlaying(true);
      isPlayingRef.current = true;
      
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
      scheduler();
    } catch (err) {
      console.error("Metronome error:", err);
    }
  }, [scheduler]);

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  useEffect(() => {
    return () => {
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return { isPlaying, toggle, stop, isTick, currentBeat };
}
