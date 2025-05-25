import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../utils/useTheme';

const { width } = Dimensions.get('window');

const VerseCard = ({ verse, isPlaying, onPlayPress, onSwipeLeft, onSwipeRight }) => {
  const theme = useTheme();
  
  if (!verse) return null;
  
  // Safe access to verse properties with null checks
  const surahName = verse.surah?.englishName || 'Unknown Chapter';
  const surahTranslation = verse.surah?.englishNameTranslation || '';
  const verseNumber = verse.numberInSurah || '?';
  const surahNumber = verse.surah?.number || '?';
  
  // For debugging
  console.log('Verse data:', JSON.stringify(verse, null, 2));
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.surahName, { color: theme.colors.primary }]}>
          {surahName} {surahTranslation ? `(${surahTranslation})` : ''}
        </Text>
        <Text style={[styles.verseNumber, { color: theme.colors.textSecondary }]}>
          Verse {verseNumber}
        </Text>
      </View>
      
      <View style={styles.arabicContainer}>
        <Text style={[styles.arabicText, { color: theme.colors.onBackground }]}>
          {verse.text || 'No text available'}
        </Text>
      </View>
      
      <View style={styles.translationContainer}>
        <Text style={[styles.translation, { color: theme.colors.text }]}>
          {verse.translation && verse.translation !== '' ? verse.translation : 'Translation not available'}
        </Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.navButton, { borderColor: theme.colors.border }]}
          onPress={onSwipeRight}
        >
          <Icon name="skip-previous" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
          onPress={onPlayPress}
        >
          <Icon 
            name={isPlaying ? 'pause' : 'play-arrow'} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, { borderColor: theme.colors.border }]}
          onPress={onSwipeLeft}
        >
          <Icon name="skip-next" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.verseReference, { color: theme.colors.textSecondary }]}>
          {surahName} {surahNumber}:{verseNumber}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
  },
  verseNumber: {
    fontSize: 14,
  },
  arabicContainer: {
    marginBottom: 20,
  },
  arabicText: {
    fontSize: 24,
    fontFamily: 'Scheherazade',
    textAlign: 'right',
    lineHeight: 40,
  },
  translationContainer: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  translation: {
    fontSize: 16,
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    alignItems: 'center',
  },
  verseReference: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default VerseCard;
