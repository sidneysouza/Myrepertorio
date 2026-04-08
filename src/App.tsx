/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Home from './components/Home';
import Player from './components/Player';
import BottomNav, { PageId } from './components/BottomNav';
import Playlists from './components/Playlists';
import MetronomePage from './components/MetronomePage';
import SettingsPage from './components/SettingsPage';
import { INITIAL_SONGS } from './constants';
import { Song } from './types';

export default function App() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [activePage, setActivePage] = useState<PageId>('songs');

  const renderPage = () => {
    switch (activePage) {
      case 'songs':
        return (
          <Home 
            songs={INITIAL_SONGS} 
            onSelectSong={(song) => setSelectedSong(song)} 
          />
        );
      case 'playlists':
        return <Playlists />;
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
        onClose={() => setSelectedSong(null)} 
      />

      {/* Bottom Navigation */}
      <BottomNav 
        activePage={activePage} 
        onPageChange={(page) => setActivePage(page)} 
      />
    </div>
  );
}
