import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../utils/useTheme';

const VoiceButton = ({ isListening, onPress, style }) => {
  const theme = useTheme();
  const [pulseAnim] = useState(new Animated.Value(1));
  
  useEffect(() => {
    if (isListening) {
      startPulse();
    } else {
      stopPulse();
    }
  }, [isListening]);
  
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  };
  
  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };
  
  const buttonScale = isListening ? pulseAnim : 1;
  const buttonColor = isListening ? theme.colors.error : theme.colors.primary;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        style,
        {
          transform: [{ scale: buttonScale }],
          backgroundColor: isListening ? 'rgba(207, 102, 121, 0.1)' : 'transparent',
          borderRadius: 30,
        },
      ]}
    >
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: buttonColor }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Icon 
          name={isListening ? 'mic' : 'mic-none'} 
          size={24} 
          color="white" 
        />
      </TouchableOpacity>
      
      {isListening && (
        <Text style={[styles.listeningText, { color: theme.colors.error }]}>
          Listening...
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listeningText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default VoiceButton;
