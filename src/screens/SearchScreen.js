import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../utils/useTheme';
import { useQuran } from '../hooks/useQuran';

const SearchScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { search, searchResults, isLoading, navigateToVerse } = useQuran();
  const [searchQuery, setSearchQuery] = useState(route.params?.query || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = React.useRef(null);

  // Focus search input when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      searchInputRef.current?.focus();
    });
    return unsubscribe;
  }, [navigation]);

  // Search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const delayDebounce = setTimeout(() => {
        search(searchQuery);
      }, 500);
      
      return () => clearTimeout(delayDebounce);
    }
  }, [searchQuery, search]);

  // Handle verse press
  const handleVersePress = useCallback((verse) => {
    navigateToVerse(verse);
    navigation.goBack();
  }, [navigateToVerse, navigation]);

  // Render search result item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
      onPress={() => handleVersePress(item)}
    >
      <View style={styles.verseNumberContainer}>
        <Text style={[styles.verseNumber, { color: theme.colors.primary }]}>
          {item.surah.number}:{item.numberInSurah}
        </Text>
      </View>
      <View style={styles.verseContent}>
        <Text 
          style={[styles.arabicText, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {item.text}
        </Text>
        <Text 
          style={[styles.translationText, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.translation || 'Loading translation...'}
        </Text>
      </View>
      <Icon 
        name="chevron-right" 
        size={24} 
        color={theme.colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : searchQuery ? (
        <>
          <Icon name="search-off" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No results found for "{searchQuery}"
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            Try different keywords or check your spelling
          </Text>
        </>
      ) : (
        <>
          <Icon name="search" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Search the Quran
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            Type any word or phrase to search in the Quran
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View 
          style={[
            styles.searchContainer, 
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
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
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
      </View>
      
      {/* Search results */}
      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.surah.number}:${item.numberInSurah}`}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={renderEmptyComponent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButtonContainer: {
    marginRight: 8,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
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
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  verseNumberContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  verseContent: {
    flex: 1,
    marginRight: 12,
  },
  arabicText: {
    fontSize: 16,
    fontFamily: 'Scheherazade',
    textAlign: 'right',
    marginBottom: 4,
  },
  translationText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default SearchScreen;
