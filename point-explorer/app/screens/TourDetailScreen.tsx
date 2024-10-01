import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TourDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { tour } = route.params;

  const colorScheme = useColorScheme();
  const TextColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const landmarkCardColor = colorScheme === 'light' ? '#e6e6e6' : '#101010';

  const handleLandmarkPress = (landmark) => {
    navigation.navigate('map', { initialLandmark: landmark });
  };

  const handleTourDirectionsPress = () => {
    navigation.navigate('map', { initialLandmarks: tour.landmarks });
  };

  const handleLearnMorePress = (landmark) => {
    navigation.navigate('screens/landmarkdetailsScreen', { landmark });
  };

  const renderLandmarkItem = ({ item }) => {
    return (
      <View style={[styles.landmarkItem, { backgroundColor: landmarkCardColor }]}>
        <View style={styles.landmarkItemContent}>
          <Image source={item.image} style={styles.landmarkItemImage} />
          <View style={styles.landmarkItemTextContainer}>
            <View style={styles.landmarkItemTitleContainer}>
              <Text style={[styles.landmarkItemTitle, { color: TextColor }]} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
              <MaterialIcons name="star" size={16} color="#00BF6E" style={styles.ratingIcon} />
              <Text style={[styles.landmarkItemRating, { color: TextColor }]}>{item.rating?.toFixed(1)}</Text>
            </View>
            <View style={styles.landmarkItemDescriptionContainer}>
              <Text style={[styles.landmarkItemDescription, { color: TextColor }]} numberOfLines={3} ellipsizeMode='tail'>{item.description}</Text>
              <TouchableOpacity style={styles.directionsButton} onPress={() => handleLandmarkPress(item)}>
                <MaterialIcons name="location-on" size={24} color="#00BF6E" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.learnMoreContainer}>
          <TouchableOpacity style={styles.learnMoreButton} onPress={() => handleLearnMorePress(item)}>
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>{tour.title}</ThemedText>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={handleTourDirectionsPress}>
          <MaterialCommunityIcons name="transit-detour" size={24} color={TextColor} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.description, { color: TextColor }]}>{tour.description}</Text>
      <FlatList
        data={tour.landmarks}
        keyExtractor={(item) => item.id}
        renderItem={renderLandmarkItem}
        contentContainerStyle={styles.landmarkList}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    marginBottom: 20,
  },
  headerRight: {
    position: 'absolute',
    right: 20,
    top: 60,
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
  },
  landmarkList: {
    paddingBottom: 20,
  },
  landmarkItem: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  landmarkItemContent: {
    flexDirection: 'row',
    padding: 10,
  },
  landmarkItemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  landmarkItemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  landmarkItemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  landmarkItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  ratingIcon: {
    marginLeft: 5,
    marginRight: 2,
  },
  landmarkItemRating: {
    fontSize: 14,
  },
  landmarkItemDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  landmarkItemDescription: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  directionsButton: {
    padding: 10,
    borderRadius: 360,
  },
  learnMoreContainer: {
    padding: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnMoreButton: {
    alignItems: 'center',
  },
  learnMoreText: {
    color: '#00BF6E',
    fontSize: 16,
  },
});
