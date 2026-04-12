/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Home from './components/Home';
import Player from './components/Player';
import BottomNav, { PageId } from './components/BottomNav';
import Playlists from './components/Playlists';
import MetronomePage from './components/MetronomePage';
import SettingsPage from './components/SettingsPage';
import { Song } from './types';

const STORAGE_KEY = 'stitch_player_songs';
const PLAYLISTS_STORAGE_KEY = 'stitch_player_playlists';

export default function App() {
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [activePage, setActivePage] = useState<PageId>('songs');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  }, [playlists]);

  const handleAddSong = (newSong: Song) => {
    setSongs(prev => [newSong, ...prev]);
    setSelectedSong(newSong);
  };

  const handleToggleSongInPlaylist = (songId: string, playlistId: string) => {
    setSongs(prev => prev.map(song => {
      if (song.id === songId) {
        const playlistIds = song.playlistIds || [];
        if (playlistIds.includes(playlistId)) {
          return { ...song, playlistIds: playlistIds.filter(id => id !== playlistId) };
        } else {
          return { ...song, playlistIds: [...playlistIds, playlistId] };
        }
      }
      return song;
    }));
  };

  const renderPage = () => {
    switch (activePage) {
      case 'songs':
        return (
          <Home 
            songs={songs} 
            playlists={playlists}
            onSelectSong={(song) => setSelectedSong(song)}
            onAddSong={handleAddSong}
            onTogglePlaylist={handleToggleSongInPlaylist}
          />
        );
      case 'playlists':
        return <Playlists playlists={playlists} setPlaylists={setPlaylists} songs={songs} onSelectSong={setSelectedSong} />;
      case 'metronome':
        return <MetronomePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Main Content */}
      {renderPage()}

      {/* Player Overlay */}
      <Player 
        song={selectedSong} 
        playlists={playlists}
        onClose={() => setSelectedSong(null)} 
        onTogglePlaylist={handleToggleSongInPlaylist}
      />

      {/* Bottom Navigation */}
      <BottomNav 
        activePage={activePage} 
        onPageChange={(page) => setActivePage(page)} 
      />
    </div>
  );
}
