import { Song, Playlist } from './types';

export const INITIAL_SONGS: Song[] = [
  { 
    id: '1',
    title: "Maria Maria", 
    artist: "Milton Nascimento", 
    bpm: 95, 
    chords: "[D] Maria [A] Maria é o [Bm] dom, é a [G] cor, é o suor" 
  },
  { 
    id: '2',
    title: "Tempo Perdido", 
    artist: "Legião Urbana", 
    bpm: 124, 
    chords: "[C] Todos os [Am] dias [Bm] quando acordo..." 
  },
  { 
    id: '3',
    title: "Wonderwall", 
    artist: "Oasis", 
    bpm: 87, 
    chords: "[Em7] Today is [G] gonna be the day [Dsus4] that they're..." 
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  { id: 'fav', name: 'Favoritas', icon: 'Heart' },
  { id: 'show', name: 'Show Sábado', icon: 'Calendar' }
];

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
