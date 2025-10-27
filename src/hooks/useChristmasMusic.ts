import { useCallback } from 'react';

// Christmas carol melodies (note frequencies and durations)
const christmasMelodies = [
  // Jingle Bells
  {
    name: 'Jingle Bells',
    notes: [
      { freq: 329.63, duration: 200 }, // E
      { freq: 329.63, duration: 200 }, // E
      { freq: 329.63, duration: 400 }, // E
      { freq: 329.63, duration: 200 }, // E
      { freq: 329.63, duration: 200 }, // E
      { freq: 329.63, duration: 400 }, // E
      { freq: 329.63, duration: 200 }, // E
      { freq: 392.00, duration: 200 }, // G
      { freq: 261.63, duration: 300 }, // C
      { freq: 293.66, duration: 100 }, // D
      { freq: 329.63, duration: 600 }, // E
    ],
  },
  // We Wish You a Merry Christmas
  {
    name: 'Merry Christmas',
    notes: [
      { freq: 293.66, duration: 200 }, // D
      { freq: 392.00, duration: 200 }, // G
      { freq: 392.00, duration: 200 }, // G
      { freq: 440.00, duration: 200 }, // A
      { freq: 392.00, duration: 200 }, // G
      { freq: 349.23, duration: 200 }, // F#
      { freq: 329.63, duration: 200 }, // E
      { freq: 329.63, duration: 200 }, // E
      { freq: 329.63, duration: 200 }, // E
      { freq: 440.00, duration: 200 }, // A
      { freq: 440.00, duration: 200 }, // A
      { freq: 493.88, duration: 200 }, // B
    ],
  },
  // Deck the Halls
  {
    name: 'Deck the Halls',
    notes: [
      { freq: 392.00, duration: 200 }, // G
      { freq: 349.23, duration: 200 }, // F
      { freq: 329.63, duration: 200 }, // E
      { freq: 293.66, duration: 200 }, // D
      { freq: 261.63, duration: 200 }, // C
      { freq: 293.66, duration: 200 }, // D
      { freq: 329.63, duration: 400 }, // E
      { freq: 293.66, duration: 400 }, // D
      { freq: 329.63, duration: 200 }, // E
      { freq: 349.23, duration: 200 }, // F
      { freq: 329.63, duration: 200 }, // E
      { freq: 293.66, duration: 200 }, // D
    ],
  },
  // Silent Night
  {
    name: 'Silent Night',
    notes: [
      { freq: 392.00, duration: 400 }, // G
      { freq: 440.00, duration: 200 }, // A
      { freq: 392.00, duration: 400 }, // G
      { freq: 329.63, duration: 600 }, // E
      { freq: 392.00, duration: 400 }, // G
      { freq: 440.00, duration: 200 }, // A
      { freq: 392.00, duration: 400 }, // G
      { freq: 329.63, duration: 600 }, // E
      { freq: 493.88, duration: 400 }, // B
      { freq: 493.88, duration: 400 }, // B
      { freq: 293.66, duration: 600 }, // D
    ],
  },
  // Joy to the World
  {
    name: 'Joy to the World',
    notes: [
      { freq: 523.25, duration: 300 }, // C5
      { freq: 493.88, duration: 150 }, // B
      { freq: 440.00, duration: 150 }, // A
      { freq: 392.00, duration: 300 }, // G
      { freq: 349.23, duration: 150 }, // F
      { freq: 329.63, duration: 300 }, // E
      { freq: 293.66, duration: 150 }, // D
      { freq: 261.63, duration: 300 }, // C
      { freq: 392.00, duration: 200 }, // G
      { freq: 349.23, duration: 200 }, // F
      { freq: 329.63, duration: 400 }, // E
    ],
  },
];

export const useChristmasMusic = () => {
  const playRandomMelody = useCallback(() => {
    // Select random melody
    const melody = christmasMelodies[Math.floor(Math.random() * christmasMelodies.length)];
    
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    let startTime = audioContext.currentTime;
    
    // Play each note in sequence
    melody.notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = note.freq;
      oscillator.type = 'triangle'; // Softer sound than sine
      
      // Fade in and out
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, startTime + note.duration / 1000);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + note.duration / 1000);
      
      startTime += note.duration / 1000;
    });
    
    // Clean up
    setTimeout(() => {
      audioContext.close();
    }, startTime * 1000 + 1000);
  }, []);

  return { playRandomMelody };
};
