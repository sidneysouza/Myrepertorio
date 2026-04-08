export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  chords: string;
}

export interface Playlist {
  id: string;
  name: string;
  icon: string;
}
