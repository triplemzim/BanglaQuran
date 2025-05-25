import Voice from '@react-native-community/voice';

let onResultsCallback = () => {};
let onErrorCallback = () => {};
let isListening = false;

export const initializeVoiceRecognition = (onResults, onError) => {
  onResultsCallback = onResults;
  onErrorCallback = onError;

  Voice.onSpeechResults = (e) => {
    if (e.value && e.value.length > 0) {
      onResultsCallback(e.value[0]);
    }
  };

  Voice.onSpeechError = (e) => {
    onErrorCallback(e);
  };
};

export const startVoiceRecognition = async () => {
  try {
    if (isListening) return;
    
    await Voice.start('en-US');
    isListening = true;
    return true;
  } catch (error) {
    console.error('Error starting voice recognition:', error);
    onErrorCallback(error);
    return false;
  }
};

export const stopVoiceRecognition = async () => {
  try {
    if (!isListening) return;
    
    await Voice.stop();
    isListening = false;
    return true;
  } catch (error) {
    console.error('Error stopping voice recognition:', error);
    onErrorCallback(error);
    return false;
  }
};

export const isListeningForVoice = () => isListening;

export const cleanUpVoiceRecognition = () => {
  Voice.destroy().then(Voice.removeAllListeners);
  isListening = false;
};
