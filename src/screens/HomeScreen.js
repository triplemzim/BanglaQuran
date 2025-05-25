import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Keyboard,
  Animated,
  PanResponder,
  ActivityIndicator,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../utils/useTheme';
import { useQuran } from '../hooks/useQuran';
import VerseCard from '../components/VerseCard';
import ChapterSelector from '../components/ChapterSelector';
import VoiceButton from '../components/VoiceButton';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const {
    currentVerse,
    currentChapter,
    chapters,
    isLoading,
    isPlaying,
    isListening,
    loadChapter,
    nextVerse,
    prevVerse,
    togglePlayback,
    toggleVoiceRecognition,
    search,
  } = useQuran();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);
  
  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
      },
      onPanResponderMove: (_, gestureState) => {
        position.x.setValue(gestureState.dx);
        // Fade out as we drag further
        fadeAnim.setValue(1 - Math.min(Math.abs(gestureState.dx) / 200, 0.5));
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        
        // Reset position with animation
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 10,
        }).start();
        
        // Fade back in
        Animated.spring(fadeAnim, {
          toValue: 1,
          useNativeDriver: false,
        }).start();
        
        // Check if swipe threshold was reached
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          if (dx > 0) {
            // Swiped right - previous verse
            prevVerse();
          } else {
            // Swiped left - next verse
            nextVerse();
          }
        }
      },
    })
  ).current;
  
  // Handle search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const delayDebounce = setTimeout(() => {
        search(searchQuery);
      }, 500);
      
      return () => clearTimeout(delayDebounce);
    }
  }, [searchQuery, search]);
  
  // Handle search focus/blur
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSearchResults(true);
  };
  
  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    if (!searchQuery) {
      setShowSearchResults(false);
    }
  };
  
  // Navigate to search screen
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
      setSearchQuery('');
      Keyboard.dismiss();
    }
  };
  
  // Render loading state
  if (isLoading && !currentVerse) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading Quran...
        </Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with search */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View style={styles.searchContainer}>
          <View 
            style={[
              styles.searchInputContainer, 
              { 
                backgroundColor: theme.colors.surface,
                borderColor: isSearchFocused ? theme.colors.primary : theme.colors.border,
              }
            ]}
          >
            <Icon 
              name="search" 
              size={20} 
              color={isSearchFocused ? theme.colors.primary : theme.colors.textSecondary} 
              style={styles.searchIcon} 
            />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search Quran..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity 
                onPress={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                style={styles.clearButton}
              >
                <Icon name="close" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <VoiceButton 
            isListening={isListening}
            onPress={toggleVoiceRecognition}
            style={styles.voiceButton}
          />
        </View>
        
        <ChapterSelector 
          chapters={chapters}
          currentChapter={currentChapter}
          onSelectChapter={loadChapter}
          isLoading={isLoading}
        />
      </View>
      
      {/* Main content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateX: position.x },
                { scale: fadeAnim.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [0.95, 1],
                }) },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {currentVerse ? (
            <VerseCard
              verse={currentVerse}
              isPlaying={isPlaying}
              onPlayPress={togglePlayback}
              onSwipeLeft={nextVerse}
              onSwipeRight={prevVerse}
            />
          ) : (
            <View style={[styles.noVerseContainer, { backgroundColor: theme.colors.surface }]}>
              <Icon name="menu-book" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.noVerseText, { color: theme.colors.textSecondary }]}>
                Select a chapter to begin
              </Text>
            </View>
          )}
        </Animated.View>
        
        {/* Navigation controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: theme.colors.surface }]}
            onPress={prevVerse}
            disabled={!currentVerse || (currentVerse?.numberInSurah <= 1)}
          >
            <Icon 
              name="skip-previous" 
              size={28} 
              color={currentVerse?.numberInSurah > 1 ? theme.colors.primary : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
            onPress={togglePlayback}
            disabled={!currentVerse}
          >
            <Icon 
              name={isPlaying ? 'pause' : 'play-arrow'} 
              size={36} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: theme.colors.surface }]}
            onPress={nextVerse}
            disabled={!currentVerse || !currentChapter || (currentVerse?.numberInSurah >= currentChapter?.numberOfAyahs)}
          >
            <Icon 
              name="skip-next" 
              size={28} 
              color={currentVerse && currentChapter && currentVerse.numberInSurah < currentChapter.numberOfAyahs 
                ? theme.colors.primary 
                : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  voiceButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  noVerseContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  noVerseText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});

export default HomeScreen;
