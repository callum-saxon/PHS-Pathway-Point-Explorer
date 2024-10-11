import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileImage from '@/assets/images/profileeg1.png'; // Ensure this path is correct
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

const ProfileScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const navigation = useNavigation();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({}, 'highlight');

  useEffect(() => {
    (async () => {
      // Load the saved image from AsyncStorage
      const imageUri = await AsyncStorage.getItem('profileImage');
      if (imageUri) {
        setSelectedImage({ uri: imageUri });
      } else {
        setSelectedImage(profileImage);
      }
    })();
  }, []);

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(true);
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch the image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage({ uri });
      // Save the image URI to AsyncStorage
      await AsyncStorage.setItem('profileImage', uri);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {selectedImage ? (
            <Image source={selectedImage} style={styles.profileImage} />
          ) : (
            <Image source={profileImage} style={styles.profileImage} />
          )}
          <TouchableOpacity style={styles.editIconContainer} onPress={pickImage}>
            <MaterialCommunityIcons name="plus-circle" size={40} color={highlightColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: textColor }]}>Your Name</Text>
          <Text style={[styles.userEmail, { color: textColor }]}>youremail@example.com</Text>
        </View>
      </View>
      {/* Add more profile details or settings here */}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
  },
  profileSection: {
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  userInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 18,
    color: 'gray',
  },
});
