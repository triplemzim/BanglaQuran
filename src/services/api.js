import axios from 'axios';

const API_BASE_URL = 'https://api.alquran.cloud/v1';
const BANGLA_TRANSLATION_ID = 'bn.bengali';

export const getChapters = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/surah`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching chapters:', error);
    throw error;
  }
};

export const getChapterInfo = async (chapterNumber) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/surah/${chapterNumber}/en.sahih`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching chapter info:', error);
    throw error;
  }
};

export const getVerses = async (chapterNumber, offset = 0, limit = 10) => {
  try {
    // First get the chapter information
    const chapterResponse = await axios.get(`${API_BASE_URL}/surah/${chapterNumber}`);
    const surahInfo = chapterResponse.data.data;
    
    // Then get the verses
    const versesResponse = await axios.get(
      `${API_BASE_URL}/surah/${chapterNumber}/bn.bengali?offset=${offset}&limit=${limit}`
    );
    
    // Enrich each verse with surah information
    const verses = versesResponse.data.data.ayahs.map(verse => ({
      ...verse,
      surah: {
        number: surahInfo.number,
        name: surahInfo.name,
        englishName: surahInfo.englishName,
        englishNameTranslation: surahInfo.englishNameTranslation,
        numberOfAyahs: surahInfo.numberOfAyahs,
        revelationType: surahInfo.revelationType
      }
    }));
    
    console.log('Enriched verses:', JSON.stringify(verses[0], null, 2));
    return verses;
  } catch (error) {
    console.error('Error fetching verses:', error);
    throw error;
  }
};

export const getVerseAudio = (verseKey) => {
  // Format: https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3
  // The API expects the full number, e.g., Surah 2, Verse 62 = 262
  try {
    console.log('Generating audio URL for verse key:', verseKey);
    if (!verseKey || typeof verseKey !== 'string') {
      console.error('Invalid verse key:', verseKey);
      return '';
    }
    
    const [surah, ayah] = verseKey.split(':');
    
    if (!surah || !ayah) {
      console.error('Invalid verse key format:', verseKey);
      return '';
    }
    
    // Ensure both are numbers
    const surahNum = parseInt(surah, 10);
    const ayahNum = parseInt(ayah, 10);
    
    if (isNaN(surahNum) || isNaN(ayahNum)) {
      console.error('Invalid surah or ayah number:', verseKey);
      return '';
    }
    
    // Correct format for the API
    // For example, for the 5th verse of Surah 1, we need 1/5
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNum}/${ayahNum}.mp3`;
    console.log('Generated audio URL:', audioUrl);
    return audioUrl;
  } catch (error) {
    console.error('Error generating audio URL:', error);
    return '';
  }
};

export const searchVerses = async (query) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/search/${encodeURIComponent(query)}/all/bn.bengali`
    );
    return response.data.data.matches;
  } catch (error) {
    console.error('Error searching verses:', error);
    throw error;
  }
};
