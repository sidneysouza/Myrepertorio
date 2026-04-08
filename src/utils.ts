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
  // Replace [Chord] with a styled span
  return text.replace(/\[(.*?)\]/g, '<span class="text-primary font-bold bg-primary/10 px-1 rounded mx-0.5">$1</span>');
}
