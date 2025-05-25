import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../utils/useTheme';

const ChapterSelector = ({ chapters, currentChapter, onSelectChapter, isLoading }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChapters, setFilteredChapters] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    if (chapters && chapters.length > 0) {
      setFilteredChapters(chapters);
    }
  }, [chapters]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredChapters(chapters);
      return;
    }
    
    const filtered = chapters.filter(chapter => 
      chapter.englishName.toLowerCase().includes(query.toLowerCase()) ||
      chapter.englishNameTranslation.toLowerCase().includes(query.toLowerCase()) ||
      chapter.number.toString() === query
    );
    
    setFilteredChapters(filtered);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.chapterItem,
        currentChapter && currentChapter.number === item.number && {
          backgroundColor: theme.colors.primary + '20',
        },
      ]}
      onPress={() => {
        onSelectChapter(item);
        setModalVisible(false);
      }}
    >
      <View style={styles.chapterNumber}>
        <Text style={[styles.chapterNumberText, { color: theme.colors.primary }]}>
          {item.number}
        </Text>
      </View>
      <View style={styles.chapterInfo}>
        <Text style={[styles.chapterName, { color: theme.colors.onBackground }]}>
          {item.englishName}
        </Text>
        <Text style={[styles.chapterTranslation, { color: theme.colors.textSecondary }]}>
          {item.englishNameTranslation}
        </Text>
      </View>
      <Text style={[styles.verseCount, { color: theme.colors.textSecondary }]}>
        {item.numberOfAyahs} verses
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.selectorButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => setModalVisible(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            Loading...
          </Text>
        ) : (
          <>
            <Icon name="menu-book" size={20} color={theme.colors.primary} style={styles.buttonIcon} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              {currentChapter ? `${currentChapter.englishName} (${currentChapter.number})` : 'Select Chapter'}
            </Text>
            <Icon name="arrow-drop-down" size={24} color={theme.colors.textSecondary} />
          </>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.onBackground }]}>
              Select Chapter
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
            <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search chapters..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Icon name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <FlatList
            data={filteredChapters}
            renderItem={renderItem}
            keyExtractor={(item) => item.number.toString()}
            contentContainerStyle={styles.listContent}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  chapterNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chapterNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chapterInfo: {
    flex: 1,
    marginRight: 12,
  },
  chapterName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  chapterTranslation: {
    fontSize: 14,
    opacity: 0.8,
  },
  verseCount: {
    fontSize: 14,
  },
});

export default ChapterSelector;
