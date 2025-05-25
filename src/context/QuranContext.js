import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { getChapters, getVerses, searchVerses } from '../services/api';
import { playVerse, pausePlayback, getPlaybackState } from '../services/audioService';
import { initializeVoiceRecognition, startVoiceRecognition, stopVoiceRecognition } from '../services/voiceService';

export const QuranContext = createContext();

export const QuranProvider = ({ children }) => {
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Cache for preloaded verses
  const verseCache = useRef(new Map());

  // Initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load chapters
        const chaptersData = await getChapters();
        setChapters(chaptersData);
        
        // Set default chapter (Al-Fatiha)
        if (chaptersData.length > 0) {
          await loadChapter(chaptersData[0].number);
        }
        
        // Initialize voice recognition
        initializeVoiceRecognition(
          handleVoiceResults,
          handleVoiceError
        );
        
      } catch (err) {
        setError('Failed to initialize app. Please try again.');
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Cleanup
    return () => {
      // Cleanup voice recognition
      stopVoiceRecognition();
    };
  }, []);

  // Load a specific chapter
  const loadChapter = async (chapter) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading chapter:', chapter);
      
      // Handle if the input is just a chapter number instead of a chapter object
      let chapterObj = chapter;
      let chapterNumber = chapter;
      
      if (typeof chapter === 'object') {
        chapterNumber = chapter.number;
        chapterObj = chapter;
      } else if (typeof chapter === 'number') {
        // Find the chapter object if only number provided
        chapterObj = chapters.find(c => c.number === chapterNumber);
      }
      
      if (!chapterObj) {
        console.error('Chapter not found:', chapterNumber);
        return;
      }
      
      console.log('Setting current chapter:', chapterObj);
      setCurrentChapter(chapterObj);
      
      // Load verses
      console.log('Fetching verses for chapter:', chapterNumber);
      const versesData = await getVerses(chapterNumber);
      console.log('Verses data received:', versesData?.length || 0, 'verses');
      
      if (versesData && versesData.length > 0) {
        setVerses(versesData);
        
        // Set first verse as current
        console.log('Setting current verse:', versesData[0]);
        setCurrentVerse(versesData[0]);
        
        // Preload next verses
        preloadVerses(chapterNumber, 1, 2);
      } else {
        console.error('No verses found for chapter:', chapterNumber);
      }
      
    } catch (err) {
      setError(`Failed to load chapter ${typeof chapter === 'object' ? chapter.number : chapter}`);
      console.error('Error loading chapter:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Preload verses for smooth navigation
  const preloadVerses = async (chapterNumber, startVerse, count) => {
    try {
      const endVerse = Math.min(startVerse + count, 286); // Maximum verses in a surah
      
      for (let i = startVerse + 1; i <= endVerse; i++) {
        const verseKey = `${chapterNumber}:${i}`;
        if (!verseCache.current.has(verseKey)) {
          const verseData = await getVerses(chapterNumber, i - 1, 1);
          if (verseData && verseData.length > 0) {
            verseCache.current.set(verseKey, verseData[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error preloading verses:', err);
    }
  };

  // Navigate to a specific verse
  const navigateToVerse = (verse) => {
    setCurrentVerse(verse);
    
    // If the verse is from a different chapter, load that chapter
    if (currentChapter && verse.surah.number !== currentChapter.number) {
      loadChapter(verse.surah.number);
    }
    
    // Preload adjacent verses
    preloadVerses(verse.surah.number, verse.numberInSurah - 1, 2);
  };

  // Navigate to next verse
  const nextVerse = async () => {
    if (!currentVerse || !currentChapter) return;
    
    const nextVerseNumber = currentVerse.numberInSurah + 1;
    const nextVerseKey = `${currentChapter.number}:${nextVerseNumber}`;
    
    // Check if next verse is in the current chapter
    if (nextVerseNumber <= currentChapter.numberOfAyahs) {
      // Try to get from cache first
      const cachedVerse = verseCache.current.get(nextVerseKey);
      if (cachedVerse) {
        navigateToVerse(cachedVerse);
        return;
      }
      
      // Otherwise, load from API
      try {
        const verses = await getVerses(currentChapter.number, nextVerseNumber - 1, 1);
        if (verses && verses.length > 0) {
          navigateToVerse(verses[0]);
        }
      } catch (error) {
        console.error('Error loading next verse:', error);
        setError('Failed to load next verse. Please try again.');
      }
    }
  };

  // Navigate to previous verse
  const prevVerse = async () => {
    if (!currentVerse || !currentChapter || currentVerse.numberInSurah <= 1) return;
    
    const prevVerseNumber = currentVerse.numberInSurah - 1;
    const prevVerseKey = `${currentChapter.number}:${prevVerseNumber}`;
    
    // Try to get from cache first
    const cachedVerse = verseCache.current.get(prevVerseKey);
    if (cachedVerse) {
      navigateToVerse(cachedVerse);
      return;
    }
    
    // Otherwise, load from API
    try {
      const verses = await getVerses(currentChapter.number, prevVerseNumber - 1, 1);
      if (verses && verses.length > 0) {
        navigateToVerse(verses[0]);
      }
    } catch (error) {
      console.error('Error loading previous verse:', error);
      setError('Failed to load previous verse. Please try again.');
    }
  };

  // Toggle play/pause for current verse
  const togglePlayback = () => {
    if (!currentVerse) return;
    
    try {
      if (isPlaying) {
        pausePlayback();
        setIsPlaying(false);
      } else {
        // Register playback listener to update UI state
        import('../services/audioService').then(audioService => {
          audioService.setPlaybackListener((playing) => {
            setIsPlaying(playing);
          });
          
          // Play the verse
          audioService.playVerse(`${currentVerse.surah.number}:${currentVerse.numberInSurah}`);
          setIsPlaying(true);
        });
      }
    } catch (err) {
      console.error('Error toggling playback:', err);
      setError('Failed to play audio. Please try again.');
    }
  };

  // Handle voice recognition results
  const handleVoiceResults = (result) => {
    console.log('Voice result:', result);
    // Process voice command
    const lowerResult = result.toLowerCase();
    
    if (lowerResult.includes('next') || lowerResult.includes('after')) {
      nextVerse();
    } else if (lowerResult.includes('previous') || lowerResult.includes('before') || lowerResult.includes('back')) {
      prevVerse();
    } else if (lowerResult.includes('play') || lowerResult.includes('start')) {
      togglePlayback();
    } else if (lowerResult.includes('stop') || lowerResult.includes('pause')) {
      if (isPlaying) {
        togglePlayback();
      }
    }
    
    // Stop listening after processing command
    stopVoiceRecognition();
    setIsListening(false);
  };

  // Handle voice recognition errors
  const handleVoiceError = (error) => {
    console.error('Voice recognition error:', error);
    setError('Voice command failed. Please try again.');
    setIsListening(false);
  };

  // Toggle voice recognition
  const toggleVoiceRecognition = async () => {
    try {
      if (isListening) {
        await stopVoiceRecognition();
        setIsListening(false);
      } else {
        const started = await startVoiceRecognition();
        setIsListening(started);
        
        // Auto-stop after 5 seconds
        setTimeout(async () => {
          if (isListening) {
            await stopVoiceRecognition();
            setIsListening(false);
          }
        }, 5000);
      }
    } catch (err) {
      console.error('Error toggling voice recognition:', err);
      setError('Voice recognition is not available.');
      setIsListening(false);
    }
  };

  // Search for verses
  const search = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const results = await searchVerses(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <QuranContext.Provider
      value={{
        chapters,
        verses,
        currentChapter,
        currentVerse,
        isLoading,
        isPlaying,
        isListening,
        error,
        searchQuery,
        setSearchQuery,
        searchResults,
        loadChapter,
        navigateToVerse,
        nextVerse,
        prevVerse,
        togglePlayback,
        toggleVoiceRecognition,
        search,
      }}
    >
      {children}
    </QuranContext.Provider>
  );
};
