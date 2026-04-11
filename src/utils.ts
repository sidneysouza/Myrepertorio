import { NOTES } from './constants';

export function transpose(text: string, steps: number): string {
  return text.replace(/\[([A-G][#b]?)\]/g, (match, note) => {
    let normalizedNote = note;
    if (note.endsWith('b')) {
      const flatToSharp: Record<string, string> = { 
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' 
      };
      normalizedNote = flatToSharp[note] || note;
    }
    
    let idx = NOTES.indexOf(normalizedNote);
    if (idx === -1) return match;
    
    let newIdx = (idx + steps) % 12;
    while (newIdx < 0) newIdx += 12;
    
    return `[${NOTES[newIdx]}]`;
  });
}

export function formatChords(text: string): string {
  // Replace [Chord] with a styled span that is clickable
  // We use a specific class to identify chords for the dictionary
  return text.replace(/\[(.*?)\]/g, '<span class="chord-trigger text-primary font-bold cursor-pointer hover:underline" data-chord="$1">$1</span>');
}

export function extractUniqueChords(text: string): string[] {
  const matches = text.match(/\[(.*?)\]/g);
  if (!matches) return [];
  const chords = matches.map(m => m.replace(/[\[\]]/g, ''));
  return Array.from(new Set(chords));
}
