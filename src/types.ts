export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  chords: string;
  lyrics?: string;
}

export interface Playlist {
  id: string;
  name: string;
  icon: string;
}
