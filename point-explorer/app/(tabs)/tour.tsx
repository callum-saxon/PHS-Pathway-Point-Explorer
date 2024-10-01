import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, View, Text, FlatList, TouchableOpacity, Dimensions, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { landmarks } from '@/components/Landmarks';
import { useNavigation } from 'expo-router';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const initialTours = [
  {
    id: '1',
    title: 'Historic Sneinton Tour',
    description: 'Explore the historical landmarks of Sneinton.',
    image: landmarks[1].image,
    landmarks: [landmarks[0], landmarks[1], landmarks[2]],
    disabled: false,
  },
  {
    id: '2',
    title: 'Art and Culture Tour',
    description: 'Discover the art and cultural spots in Sneinton.',
    image: landmarks[4].image,
    landmarks: [landmarks[3], landmarks[4], landmarks[5]],
    disabled: false,
  },
  {
    id: '3',
    title: "Robin Hood's Adventure",
    description: 'Follow the footsteps of Robin Hood in this historic tour.',
    image: landmarks[6].image,
    landmarks: [landmarks[6], landmarks[7], landmarks[8]],
    disabled: true,
  },
  {
    id: '4',
    title: 'Nottingham Castle Tour',
    description: 'Visit the historic Nottingham Castle and nearby monuments.',
    image: landmarks[9].image,
    landmarks: [landmarks[9], landmarks[10], landmarks[11]],
    disabled: true,
  },
  {
    id: '5',
    title: 'Ghosts of Nottingham',
    description: 'Experience the haunted sites and ghost stories of Nottingham.',
    image: landmarks[10].image,
    landmarks: [landmarks[12], landmarks[13], landmarks[14]],
    disabled: true,
  },
];

const TourScreen = () => {
  const [userTours, setUserTours] = useState([]);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'light' ? '#e6e6e6' : '#101010';
  const textColor = colorScheme === 'light' ? '#000' : '#fff';
  const disabledBackgroundColor = colorScheme === 'light' ? '#d3d3d3' : '#2b2b2b';
  const disabledTextColor = '#666';
  const disabledImageColor = colorScheme === 'light' ? '#a9a9a9' : '#555555';

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLandmarks, setSelectedLandmarks] = useState([null, null, null]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [tourName, setTourName] = useState('');

  useEffect(() => {
    const loadUserTours = async () => {
      try {
        const storedTours = await AsyncStorage.getItem('tours');
        const tours = storedTours ? JSON.parse(storedTours) : [];
        setUserTours(tours);
      } catch (error) {
        console.error('Error loading user tours', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      loadUserTours();
    });

    loadUserTours();

    return unsubscribe;
  }, [navigation]);

  const handleTourPress = (tour) => {
    if (!tour.disabled) {
      navigation.navigate('screens/TourDetailScreen', { tour });
    }
  };

  const handleCreateCustomTourPress = () => {
    setIsModalVisible(true);
  };

  const handleOpenDropdown = (index) => {
    setOpenDropdownIndex(index === openDropdownIndex ? null : index);
  };

  const handleSelectLandmark = (index, landmarkId) => {
    setSelectedLandmarks((prevSelected) => {
      const newSelected = [...prevSelected];
      newSelected[index] = landmarkId;
      return newSelected;
    });
    setOpenDropdownIndex(null);
  };

  const handleAddLandmark = () => {
    setSelectedLandmarks((prevSelected) => [...prevSelected, null]);
  };

  const handleRemoveLandmark = (index) => {
    setSelectedLandmarks((prevSelected) => {
      const newSelected = [...prevSelected];
      newSelected.splice(index, 1);
      return newSelected;
    });
    // Update openDropdownIndex if necessary
    if (openDropdownIndex === index) {
      setOpenDropdownIndex(null);
    } else if (openDropdownIndex > index) {
      setOpenDropdownIndex(openDropdownIndex - 1);
    }
  };

  const handleSaveTour = async () => {
    const selectedLandmarksObjects = selectedLandmarks
      .filter((id) => id !== null)
      .map((id) => landmarks.find((l) => l.id === id));

    if (tourName.trim() === '') {
      Alert.alert('Error', 'Please enter a tour name.');
      return;
    }
    if (selectedLandmarksObjects.length === 0) {
      Alert.alert('Error', 'Please select at least one landmark.');
      return;
    }

    const newTour = {
      id: `${Date.now()}`,
      title: tourName,
      description: `Custom tour created on ${new Date().toLocaleDateString()}`,
      image: selectedLandmarksObjects[0].image,
      landmarks: selectedLandmarksObjects,
      disabled: false,
    };

    try {
      const storedTours = await AsyncStorage.getItem('tours');
      const tours = storedTours ? JSON.parse(storedTours) : [];
      tours.push(newTour);
      await AsyncStorage.setItem('tours', JSON.stringify(tours));

      console.log('Tour saved with name:', tourName);
      setIsModalVisible(false);
      setTourName('');
      setSelectedLandmarks([null, null, null]);
      setUserTours(tours); // Update the user tours list
    } catch (error) {
      console.error('Error saving tour', error);
      Alert.alert('Error', 'Failed to save the tour.');
    }
  };

  const renderUserTourItem = ({ item }) => {
    const firstLandmarkImage = item.landmarks[0].image;
    return (
      <TouchableOpacity
        style={[styles.userTourItem, { backgroundColor: item.disabled ? disabledBackgroundColor : backgroundColor }]}
        onPress={() => handleTourPress(item)}
        disabled={item.disabled}
      >
        <Image source={firstLandmarkImage} style={[styles.userTourImage, item.disabled && { tintColor: disabledImageColor }]} />
        <View style={styles.userTourTextContainer}>
          <Text style={[styles.userTourTitle, { color: item.disabled ? disabledTextColor : textColor }]}>{item.title}</Text>
        </View>
        {item.disabled && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockedText}>Locked</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTourItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.tourItem, { backgroundColor: item.disabled ? disabledBackgroundColor : backgroundColor }]}
      onPress={() => handleTourPress(item)}
      disabled={item.disabled}
    >
      <Image source={item.image} style={[styles.tourImage, item.disabled && { tintColor: disabledImageColor }]} />
      <View style={styles.tourTextContainer}>
        <Text style={[styles.tourTitle, { color: item.disabled ? disabledTextColor : textColor }]}>{item.title}</Text>
        <Text style={[styles.tourDescription, { color: item.disabled ? disabledTextColor : textColor }]}>{item.description}</Text>
      </View>
      {item.disabled && (
        <View style={styles.lockedOverlay}>
          <Text style={styles.lockedText}>Locked</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.screenTitle}>Itinerary</ThemedText>

      <View style={styles.myToursHeader}>
        <ThemedText type="title" style={styles.sectionTitle}>My Tours</ThemedText>
        
        {/* Save Custom Tour Button */}
        <TouchableOpacity onPress={handleCreateCustomTourPress} style={styles.saveCustomTourButton}>
          <Text style={styles.saveCustomTourText}>Save Custom Tour +</Text>
        </TouchableOpacity>
      </View>
      
      {userTours.length > 0 ? (
        <FlatList
          data={userTours}
          keyExtractor={(item) => item.id}
          renderItem={renderUserTourItem}
          contentContainerStyle={styles.userTourList}
          horizontal={true}
        />
      ) : (
        <Text style={[styles.noToursText, { color: textColor }]}>You have not saved any tours yet.</Text>
      )}

      <ThemedText type="title" style={styles.sectionTitle}>Featured Tours</ThemedText>
      <FlatList
        data={initialTours}
        keyExtractor={(item) => item.id}
        renderItem={renderTourItem}
        contentContainerStyle={styles.tourList}
      />

      {/* Modal for creating custom tour */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: backgroundColor }]}>
            <Text style={styles.modalTitle}>Create Custom Tour</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter tour name"
              placeholderTextColor="#00BF6E"
              value={tourName}
              onChangeText={setTourName}
            />
            <ScrollView style={styles.landmarkSelectionContainer}>
              {selectedLandmarks.map((landmarkId, index) => {
                // Compute available landmarks for this selector
                const alreadySelectedLandmarks = selectedLandmarks.filter((id, idx) => id !== null && idx !== index);
                const availableLandmarks = landmarks.filter(
                  (landmark) => !alreadySelectedLandmarks.includes(landmark.id)
                );

                return (
                  <View key={index} style={styles.landmarkSelector}>
                    <View style={styles.landmarkSelectorHeader}>
                      <Text style={styles.landmarkSelectorLabel}>Select Landmark {index + 1}</Text>
                      {index >= 3 && (
                        <TouchableOpacity onPress={() => handleRemoveLandmark(index)}>
                          <MaterialIcons name="close" size={24} color="#ff0000" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.landmarkSelectorInput}
                      onPress={() => handleOpenDropdown(index)}
                    >
                      <Text style={styles.landmarkSelectorText}>
                        {landmarkId ? landmarks.find((l) => l.id === landmarkId)?.title : 'Select a landmark'}
                      </Text>
                      <MaterialIcons name="arrow-drop-down" size={24} color="#00BF6E" />
                    </TouchableOpacity>
                    {openDropdownIndex === index && (
                      <View style={styles.dropdownList}>
                        {availableLandmarks.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.landmarkOption}
                            onPress={() => handleSelectLandmark(index, item.id)}
                          >
                            <Text style={styles.landmarkOptionText}>{item.title}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
              <TouchableOpacity
                style={styles.addLandmarkButton}
                onPress={handleAddLandmark}
              >
                <Text style={styles.addLandmarkButtonText}>Add Another Landmark</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveTour}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  screenTitle: {
    top: 20,
    marginBottom: 25,
  },
  myToursHeader: {
    flexDirection: 'row',  // To align items horizontally
    justifyContent: 'space-between',  // Ensures My Tours text is on the left and button is on the right
    alignItems: 'center',  // Vertically align button and text
    marginBottom: 10,  // Space between My Tours section and content
  },
  sectionTitle: {
    marginBottom: 20,
    fontSize: 22,
    fontWeight: 'bold',
  },
  tourList: {
    paddingBottom: 10,
  },
  userTourList: {
    paddingBottom: 100,
  },
  tourItem: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
  },
  userTourItem: {
    width: Dimensions.get('window').width * 0.3,
    height: 125,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
  },
  tourImage: {
    width: 100,
    height: 100,
  },
  userTourImage: {
    width: '100%',
    height: 125,
  },
  userTourTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
  },
  tourTextContainer: {
    flex: 1,
    padding: 10,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userTourTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tourDescription: {
    fontSize: 14,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  lockedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noToursText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  saveCustomTourButton: {
    backgroundColor: '#00BF6E',  // Green button
    padding: 6,  // Smaller padding for smaller button size
    borderRadius: 20,
    alignItems: 'center',
    bottom: 10,
  },
  saveCustomTourText: {
    color: 'white',
    fontSize: 14,  // Smaller font size
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00BF6E',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#00BF6E',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    color: '#00BF6E',
  },
  landmarkSelectionContainer: {
    marginBottom: 20,
  },
  landmarkSelector: {
    marginBottom: 15,
  },
  landmarkSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  landmarkSelectorLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#00BF6E',
  },
  landmarkSelectorInput: {
    borderWidth: 1,
    borderColor: '#00BF6E',
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  landmarkSelectorText: {
    fontSize: 16,
    color: '#00BF6E',
  },
  landmarkOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  landmarkOptionText: {
    fontSize: 16,
    color: '#000',
  },
  addLandmarkButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#00BF6E',
    borderRadius: 5,
    alignItems: 'center',
  },
  addLandmarkButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    alignItems: 'center',
    flex: 1,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#00BF6E',
  },
  dropdownList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#00BF6E',
    borderRadius: 5,
    marginTop: 5,
  },
});

export default TourScreen;
