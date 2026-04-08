/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Home from './components/Home';
import Player from './components/Player';
import BottomNav from './components/BottomNav';
import { INITIAL_SONGS } from './constants';
import { Song } from './types';

export default function App() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Main Content */}
      <Home 
        songs={INITIAL_SONGS} 
        onSelectSong={(song) => setSelectedSong(song)} 
      />

      {/* Player Overlay */}
      <Player 
        song={selectedSong} 
        onClose={() => setSelectedSong(null)} 
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
