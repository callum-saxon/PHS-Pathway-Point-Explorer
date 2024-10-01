import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/useThemeColor';

type RootStackParamList = {
  AudioPlayerScreen: { landmark: { id: string; title: string; image: any, audio: any } };
};

type AudioPlayerScreenRouteProp = RouteProp<RootStackParamList, 'AudioPlayerScreen'>;

const AudioPlayerScreen = () => {
  const route = useRoute<AudioPlayerScreenRouteProp>();
  const navigation = useNavigation();
  const { landmark } = route.params;

  const [audio, setAudio] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    (async () => {
      try {
        if (!landmark.audio) {
          throw new Error('Audio source is null');
        }
        const { sound } = await Audio.Sound.createAsync(landmark.audio);
        setAudio(sound);
        const status = await sound.getStatusAsync();
        setDuration(status.durationMillis || 0);
        sound.setOnPlaybackStatusUpdate(updateStatus);
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    })();

    return () => {
      if (audio) {
        audio.unloadAsync();
      }
    };
  }, [landmark.audio]);

  const updateStatus = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const handlePlayPausePress = async () => {
    if (audio) {
      if (isPlaying) {
        await audio.pauseAsync();
      } else {
        await audio.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRewind = async () => {
    if (audio) {
      let newPosition = position - 15000; // Rewind 15 seconds
      if (newPosition < 0) newPosition = 0;
      await audio.setPositionAsync(newPosition);
    }
  };

  const handleFastForward = async () => {
    if (audio) {
      let newPosition = position + 15000; // Fast forward 15 seconds
      if (newPosition > duration) newPosition = duration;
      await audio.setPositionAsync(newPosition);
    }
  };

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ImageBackground source={landmark.image} style={styles.image}>
        <LinearGradient
          colors={['transparent', backgroundColor]}
          style={styles.imageGradient}
        />
      </ImageBackground>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: textColor }]}>{landmark.title}</Text>
        <View style={styles.audioControls}>
          <TouchableOpacity onPress={handleRewind}>
            <Ionicons name="play-back" size={36} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePlayPausePress}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFastForward}>
            <Ionicons name="play-forward" size={36} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.progressContainer}>
          <Text style={[styles.timeText, { color: textColor }]}>{formatTime(position)}</Text>
          <Text style={[styles.timeText, { color: textColor }]}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
  },
  contentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginVertical: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  timeText: {
    fontSize: 16,
  },
});

export default AudioPlayerScreen;
