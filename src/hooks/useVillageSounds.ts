import { useCallback } from "react";

export const useVillageSounds = () => {
  const playSound = useCallback((type: string) => {
    const audioContext = new AudioContext();
    const now = audioContext.currentTime;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sounds for different characters
    switch (type) {
      case "dog":
        // Bark: quick descending tone
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case "cat":
        // Meow: ascending then descending
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.linearRampToValueAtTime(600, now + 0.1);
        oscillator.frequency.linearRampToValueAtTime(400, now + 0.25);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case "bird":
        // Chirp: quick high notes
        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.frequency.setValueAtTime(1400, now + 0.05);
        oscillator.frequency.setValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;

      case "rabbit":
        // Squeak: very high quick tone
        oscillator.frequency.setValueAtTime(1500, now);
        oscillator.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        oscillator.start(now);
        oscillator.stop(now + 0.12);
        break;

      case "squirrel":
        // Chitter: rapid oscillating tone
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.linearRampToValueAtTime(1200, now + 0.05);
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.1);
        oscillator.frequency.linearRampToValueAtTime(1200, now + 0.15);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        oscillator.start(now);
        oscillator.stop(now + 0.18);
        break;

      default:
        // People sounds: cheerful bell-like tones
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523, now); // C5
        oscillator.frequency.setValueAtTime(659, now + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, now + 0.2); // G5
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        oscillator.start(now);
        oscillator.stop(now + 0.35);
    }

    // Clean up
    setTimeout(() => {
      audioContext.close();
    }, 1000);
  }, []);

  return { playSound };
};
