import Sound from 'react-native-sound';
import { getVerseAudio } from './api';

// Enable playback in silence mode (iOS only)
Sound.setCategory('Playback');

let currentSound = null;
let isPlaying = false;
let playbackListener = null;

export const initializePlayer = async () => {
  // Nothing to initialize with react-native-sound
  return true;
};

export const playVerse = async (verseKey) => {
  try {
    console.log('Attempting to play verse:', verseKey);
    
    // Stop any currently playing audio
    if (currentSound) {
      stopPlayback();
    }
    
    // Get the audio URL
    const audioUrl = getVerseAudio(verseKey);
    
    if (!audioUrl) {
      console.error('No valid audio URL generated for verse key:', verseKey);
      if (playbackListener) {
        playbackListener(false);
      }
      return false;
    }
    
    console.log('Loading audio from URL:', audioUrl);
    
    // For remote URLs, the second parameter should be an empty string
    // According to react-native-sound docs: 
    // If sound is a network file, the second argument must be an empty string
    console.log('Setting up sound object with remote URL');
    currentSound = new Sound(audioUrl, '', (error) => {
      if (error) {
        console.error('Failed to load sound:', error);
        if (playbackListener) {
          playbackListener(false);
        }
        return;
      }
      
      console.log('Sound loaded successfully, starting playback');
      
      // Start playing
      currentSound.play((success) => {
        if (success) {
          console.log('Successfully finished playing');
        } else {
          console.error('Playback failed due to audio decoding errors');
        }
        isPlaying = false;
        
        // Notify listeners if any
        if (playbackListener) {
          playbackListener(false);
        }
      });
      
      isPlaying = true;
      
      // Notify listeners if any
      if (playbackListener) {
        playbackListener(true);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error playing verse:', error);
    // Notify listeners about the error
    if (playbackListener) {
      playbackListener(false);
    }
    return false;
  }
};

export const pausePlayback = () => {
  try {
    if (currentSound && isPlaying) {
      currentSound.pause();
      isPlaying = false;
      
      // Notify listeners if any
      if (playbackListener) {
        playbackListener(false);
      }
    }
    return true;
  } catch (error) {
    console.error('Error pausing playback:', error);
    return false;
  }
};

export const stopPlayback = () => {
  try {
    if (currentSound) {
      currentSound.stop();
      currentSound.release();
      currentSound = null;
      isPlaying = false;
      
      // Notify listeners if any
      if (playbackListener) {
        playbackListener(false);
      }
    }
    return true;
  } catch (error) {
    console.error('Error stopping playback:', error);
    return false;
  }
};

export const getPlaybackState = () => {
  return isPlaying;
};

export const setPlaybackListener = (callback) => {
  playbackListener = callback;
};

// Clean up resources when the app is closed
export const cleanup = () => {
  stopPlayback();
  playbackListener = null;
};
