import React, { useState, useEffect, useRef } from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Modal, Animated, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { achievements } from '@/components/Achievements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useNavigation } from 'expo-router';
import { landmarks } from '@/components/Landmarks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from '../screens/welcomeScreen';

export default function HomeScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState({ title: '', description: '', icon: '', iconType: '' });
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showAllDiscover, setShowAllDiscover] = useState(false);
  const [showAllQuizzes, setShowAllQuizzes] = useState(false); // Add new state for quizzes modal
  const [firstOpen, setFirstOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  const [guideTextIndex, setGuideTextIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const guideTexts = ["I'm your digital tour guide!", "Ask me anything!", "What would you like to know?"];

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const modalBackgroundColor = useThemeColor({}, 'modalBackground');
  const modalContentColor = useThemeColor({}, 'modalContent');
  const iconColor = colorScheme === 'light' ? '#000' : '#fff';
  const viewAllColor = colorScheme === 'light' ? '#555555' : '#d3d3d3';
  const achievementCardColor = colorScheme === 'light' ? '#e6e6e6' : '#101010';
  const highlightColor = useThemeColor({ light: Colors.light.highlight, dark: Colors.dark.highlight }, 'highlight');

  const typingSpeed = 25; // Adjust typing speed
  const deletingSpeed = 50; // Adjust deleting speed
  const delayBeforeDelete = 2000; // Delay before starting to delete text

  const quizzes = [
    { id: 1, title: 'Quiz 1: History of Landmarks', description: 'Test your knowledge of famous landmarks!' },
    { id: 2, title: 'Quiz 2: Cultural Heritage', description: 'How well do you know world cultures?' },
    { id: 3, title: 'Quiz 3: Architecture Styles', description: 'Identify different architectural styles.' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      // Close the modal when the screen comes into focus
      setModalVisible(false);
      setShowAllDiscover(false);  // Reset the state for "Discover All"
      return () => {
        // Optional: Any clean-up actions if necessary
      };
    }, [])
  );

  useEffect(() => {
    let timeoutId;
    
    const currentText = guideTexts[guideTextIndex];
    if (isDeleting) {
      // If deleting, reduce the text length by 1
      timeoutId = setTimeout(() => {
        setTypedText((prev) => prev.slice(0, -1));
        if (typedText === '') {
          setIsDeleting(false);
          setGuideTextIndex((prevIndex) => (prevIndex + 1) % guideTexts.length); // Move to the next text
        }
      }, deletingSpeed);
    } else {
      // If typing, increase the text length by 1
      timeoutId = setTimeout(() => {
        setTypedText(currentText.slice(0, typedText.length + 1));
        if (typedText === currentText) {
          timeoutId = setTimeout(() => setIsDeleting(true), delayBeforeDelete); // Start deleting after delay
        }
      }, typingSpeed);
    }

    return () => clearTimeout(timeoutId); // Clean up timeout on unmount
  }, [typedText, isDeleting, guideTextIndex]);

  const handleQuizPress = (quizName) => {
    // Navigate to the quiz screen based on the quiz selected
    navigation.navigate('screens/quizScreen', { quizName });
  };

  const handlePremiumPress = () => {
    // Navigate to the PremiumScreen
    navigation.navigate('screens/premiumScreen'); // Make sure the screen name matches your navigation setup
  };

  const handlePressAchievement = (title, description, icon, iconType) => {
    setTooltipData({ title, description, icon, iconType });
    setShowAllAchievements(false);
    setShowAllDiscover(false);
    setModalVisible(true);
    setFirstOpen(true);
  };

  const handleViewAllAchievements = () => {
    setTooltipData({ title: 'Achievements', description: '', icon: '', iconType: '' });
    setShowAllAchievements(true);
    setShowAllDiscover(false);
    setModalVisible(true);
  };

  const handleViewAllDiscover = () => {
    setTooltipData({ title: 'Discover', description: '', icon: '', iconType: '' });
    setShowAllDiscover(true);
    setShowAllAchievements(false);
    setModalVisible(true);
  };

  const handleViewAllQuizzes = () => {
    setTooltipData({ title: 'Quizzes', description: '', icon: '', iconType: '' });
    setShowAllQuizzes(true);
    setShowAllAchievements(false);
    setShowAllDiscover(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setFirstOpen(false);
  };

  const startBounceAnimation = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (isModalVisible && firstOpen) {
      startBounceAnimation();
    }
  }, [isModalVisible, firstOpen]);

  useEffect(() => {
    const checkWelcomeScreen = async () => {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      if (hasSeenWelcome) {
        setShowWelcome(false);
      }
    };

    checkWelcomeScreen();
  }, []);

  const handleWelcomeComplete = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  const renderIcon = (icon, type) => {
    switch (type) {
      case 'FontAwesome5':
        return <FontAwesome5 name={icon} size={44} color={iconColor} style={styles.icon} />;
      case 'FontAwesome6':
        return <FontAwesome6 name={icon} size={44} color={iconColor} style={styles.icon} />;
      default:
        return null;
    }
  };

  const handleGuideButtonPress = () => {
    navigation.navigate('screens/AIChatScreen'); // Navigate to AI Chat Screen
  };

  const handlePress = (landmarkName) => {
    setShowAllDiscover(false);
    setModalVisible(false);
    const selectedLandmark = landmarks.find((landmark) => landmark.title === landmarkName);
    if (selectedLandmark) {
      navigation.navigate('screens/landmarkdetailsScreen', { landmark: selectedLandmark });
    }
  };

  const handleGetStartedPress = (landmark) => {
    navigation.navigate('map', { initialLandmark: landmark });
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  const renderLandmarkRow = (index1, index2) => (
    <View style={styles.discoveryItemRow} key={`${index1}-${index2}`}>
      <TouchableOpacity style={styles.discoveryItemLarge} onPress={() => handlePress(landmarks[index1].title)}>
        <Image source={landmarks[index1].image} style={styles.imageSmall} />
        <View style={styles.textOverlaySmall}>
          <ThemedText type="default" style={styles.discoveryTitleSmall}>
            {index1 === 1 ? 'Learn more about William Booth' : landmarks[index1].title}
          </ThemedText>
        </View>
      </TouchableOpacity>
      {index2 < landmarks.length && (
        <TouchableOpacity style={styles.discoveryItemSmall} onPress={() => handlePress(landmarks[index2].title)}>
          <Image source={landmarks[index2].image} style={styles.imageSmall} />
          <View style={styles.textOverlaySmall}>
            <ThemedText type="default" style={styles.discoveryTitleSmall}>{landmarks[index2].title}</ThemedText>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLargeLandmarks = () => (
    landmarks.map((landmark, index) => (
      <TouchableOpacity key={index} style={styles.discoveryCard} onPress={() => handlePress(landmark.title)}>
        <View style={styles.card}>
          <Image source={landmark.image} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <ThemedText type="default" style={styles.cardTitle}>{landmark.title}</ThemedText>
              <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={16} color={highlightColor} style={styles.ratingIcon} />
                <ThemedText type="default" style={styles.ratingText}>{landmark.rating?.toFixed(1) ?? 'N/A'}</ThemedText>
              </View>
            </View>
            <ThemedText type="default" style={styles.cardDescription} numberOfLines={3}>{landmark.description}</ThemedText>
            <View style={styles.cardFooter}>
              <TouchableOpacity onPress={() => handlePress(landmark.title)}>
                <ThemedText type="link" style={styles.learnMoreText}>Learn More</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ))
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="face-man-profile" size={42} color={iconColor} style={styles.profileIcon} />
          <TouchableOpacity style={styles.guideButtonWrapper} onPress={handleGuideButtonPress} activeOpacity={0.7}>
            <View style={styles.guideButton}>
              <ThemedText type="default" style={styles.guideButtonText}>
                {typedText}
              </ThemedText>
            </View>
            <View style={styles.guideButtonTail} />
          </TouchableOpacity>
        </View>
      </View>

      <ThemedView style={styles.achievementsContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Achievements</ThemedText>
          <TouchableOpacity onPress={handleViewAllAchievements}>
            <ThemedText type="link" style={[{ color: viewAllColor }]}>view all</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={[styles.achievementsCard, { backgroundColor: achievementCardColor }]}>
          <View style={styles.achievements}>
            {achievements.slice(0, 3).map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={styles.achievement}
                onPress={() => handlePressAchievement(achievement.title, achievement.description, achievement.icon, achievement.iconType)}
              >
                {renderIcon(achievement.icon, achievement.iconType)}
                <ThemedText type="default" style={styles.achievementText}>{achievement.title}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.discoveryContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Discover</ThemedText>
          <TouchableOpacity onPress={handleViewAllDiscover}>
            <ThemedText type="link" style={[{ color: viewAllColor }]}>view all</ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.discoveryItem} onPress={() => handlePress(landmarks[0].title)}>
          <Image source={landmarks[0].image} style={styles.image}/>
          <View style={styles.textOverlay}>
            <ThemedText type="default" style={styles.discoveryTitle}>{landmarks[0].title}</ThemedText>
            <TouchableOpacity style={styles.getStartedButton} onPress={() => handleGetStartedPress(landmarks[0])}>
              <ThemedText type="default" style={styles.buttonText}>get started</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        {renderLandmarkRow(1, 2)}
      </ThemedView>

      {/* Premium Card Section */}
      <ThemedView style={styles.premiumCardContainer}>
          <View style={styles.premiumCard}>
              <ThemedText type="title" style={styles.premiumTitle}>Unlock Premium Features</ThemedText>
              <ThemedText type="default" style={styles.premiumDescription}>
                  Get exclusive access to more quizzes, premium content, and advanced features!
              </ThemedText>
              <TouchableOpacity style={styles.premiumButton} onPress={handlePremiumPress}>
                <ThemedText type="button" style={styles.premiumButtonText}>Get Premium</ThemedText>
              </TouchableOpacity>

          </View>
      </ThemedView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <TouchableOpacity style={[styles.modalBackground, { backgroundColor: modalBackgroundColor }]} onPress={closeModal}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalContent, styles.wideModalContent, { backgroundColor: modalContentColor }]}>
            {showAllAchievements ? (
              <View style={styles.grid}>
                {achievements.map((achievement) => (
                  <TouchableOpacity
                    key={achievement.id}
                    style={styles.achievementGridItem}
                    onPress={() => handlePressAchievement(achievement.title, achievement.description, achievement.icon, achievement.iconType)}
                  >
                    {renderIcon(achievement.icon, achievement.iconType)}
                    <ThemedText type="default" style={styles.achievementText}>{achievement.title}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            ) : showAllDiscover ? (
              <ScrollView>
                <View style={styles.discoveryContainer}>
                  <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Discover all</ThemedText>
                  </View>
                  {renderLargeLandmarks()}
                </View>
              </ScrollView>
            ) : (
              <>
                <ThemedText type="title" style={styles.modalTitle}>{tooltipData.title}</ThemedText>
                {renderIcon(tooltipData.icon, tooltipData.iconType) && (
                  <Animated.View style={[styles.modalIcon, { transform: [{ scale: bounceAnim }] }]}>
                    {renderIcon(tooltipData.icon, tooltipData.iconType)}
                  </Animated.View>
                )}
                <ThemedText type="default" style={styles.modalDescription}>{tooltipData.description}</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  guideButtonWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  guideButton: {
    backgroundColor: '#212121',
    left: 10,
    width: 275,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00BF6E',
    minHeight: 48,
  },
  guideButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  guideButtonTail: {
    backgroundColor: '#212121',
    position: 'absolute',
    left: 20,
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#00BF6E',
  },
  profileIcon: {},
  settingsIcon: {
    marginLeft: 'auto',
  },
  headerText: {
    fontSize: 18,
  },
  subHeaderText: {
    fontSize: 16,
  },
  achievementsContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  achievementsCard: {
    padding: 14,
    borderRadius: 8,
  },
  achievements: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievement: {
    alignItems: 'center',
    width: '30%',
  },
  icon: {
    marginBottom: 8,
  },
  achievementText: {
    textAlign: 'center',
    fontSize: 12,
  },
  discoveryContainer: {
    padding: 16,
  },
  discoveryItem: {
    marginBottom: 16,
    position: 'relative',
  },
  discoveryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  discoveryItemLarge: {
    width: '65%',
  },
  discoveryItemLargeModal: {
    width: '100%',
    marginBottom: 16,
  },
  discoveryItemSmall: {
    width: '30%',
  },
  image: {
    width: '100%',
    height: 215,
    borderRadius: 8,
  },
  imageSmall: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  imageLarge: {
    width: '100%',
    height: 215,
    borderRadius: 8,
  },
  discoveryCard: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#212121',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },
  cardFooter: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  learnMoreText: {
    color: '#00BF6E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  textOverlaySmall: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  textOverlayLarge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  discoveryTitle: {
    fontSize: 22,
    flex: 1,
    color: '#fff',
  },
  discoveryTitleSmall: {
    fontSize: 14,
    color: '#fff',
  },
  discoveryTitleLarge: {
    fontSize: 22,
    color: '#fff',
  },
  getStartedButton: {
    padding: 10,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    fontSize: 14,
    color: '#fff',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  wideModalContent: {
    width: '95%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementGridItem: {
    width: '30%',
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
    // Premium Card styles
    premiumCardContainer: {
      padding: 16,
    },
    premiumCard: {
      backgroundColor: '#121212',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
    },
    premiumTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    premiumDescription: {
      fontSize: 16,
      color: '#777',
      textAlign: 'center',
      marginBottom: 20,
    },
    premiumButton: {
      backgroundColor: '#00BF6E',
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 25,
    },
    premiumButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
});
