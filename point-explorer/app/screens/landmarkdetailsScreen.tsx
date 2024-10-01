import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Dimensions, TouchableOpacity, Share } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';  // Import Colors

type RootStackParamList = {
  LandmarkDetailsScreen: { landmark: { id: string; title: string; description: string; image: any, address: string, rating: number, audio: any } };
};

type LandmarkDetailsScreenRouteProp = RouteProp<RootStackParamList, 'LandmarkDetailsScreen'>;

const LandmarkDetailsScreen = () => {
  const route = useRoute<LandmarkDetailsScreenRouteProp>();
  const navigation = useNavigation();
  const { landmark } = route.params;

  const [isFavorite, setIsFavorite] = useState(false);
  const [audio, setAudio] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isFocused = useIsFocused();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({ light: Colors.light.highlight, dark: Colors.dark.highlight }, 'highlight');  // Use highlight color from Colors

  useEffect(() => {
    (async () => {
      try {
        const favorites = await AsyncStorage.getItem('favorites');
        const favoriteList = favorites ? JSON.parse(favorites) : [];
        setIsFavorite(favoriteList.includes(landmark.id));
      } catch (error) {
        console.error('Error loading favorites', error);
      }
    })();
  }, [landmark.id, isFocused]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this landmark: ${landmark.title} - ${landmark.description}`,
      });
    } catch (error) {
      alert('Error sharing the landmark');
    }
  };

  const handleFavoritePress = () => {
    setIsFavorite(!isFavorite);
  };

  const handleHeadphonesPress = () => {
    navigation.navigate('screens/AudioPlayerScreen', { landmark });
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, index) => (
          <Ionicons key={`full-${index}`} name="star" size={18} color={highlightColor} />
        ))}
        {halfStar && <Ionicons name="star-half" size={18} color={highlightColor} />}
        {[...Array(emptyStars)].map((_, index) => (
          <Ionicons key={`empty-${index}`} name="star-outline" size={18} color={highlightColor} />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.imageContainer}>
        <ImageBackground source={landmark.image} style={styles.image}>
          <LinearGradient
            colors={['transparent', backgroundColor]}
            style={styles.imageGradient}
          />
        </ImageBackground>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor, flex: 1, flexWrap: 'wrap' }]}>{landmark.title}</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={handleFavoritePress}>
              <MaterialIcons
                name={isFavorite ? 'favorite' : 'favorite-outline'}
                size={24}
                color={isFavorite ? highlightColor : textColor}
                style={isFavorite && styles.glow}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(landmark.rating)}
          <Text style={[styles.ratingText, { color: textColor }]}>{landmark.rating.toFixed(1)}</Text>
        </View>
        <Text style={[styles.description, { color: textColor }]}>{landmark.description}</Text>
      </View>
      <TouchableOpacity style={[styles.audioPlayer, { backgroundColor: highlightColor }]} onPress={handleHeadphonesPress}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="white" />
        <Text style={styles.audioPlayerText}>{isPlaying ? 'Pause' : 'Play'} Audio Tour</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  contentContainer: {
    padding: 16,
    paddingVertical: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    flexWrap: 'wrap',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  ratingText: {
    fontSize: 18,
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    marginTop: 30,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    padding: 10,
  },
  shareButton: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    padding: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  glow: {
    shadowColor: Colors.light.highlight, // Updated to use new color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    margin: 16,
  },
  audioPlayerText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  headphonesIcon: {
    marginLeft: 10,
  },
});

export default LandmarkDetailsScreen;
