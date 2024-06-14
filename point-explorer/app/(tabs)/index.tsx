import React, { useState, useEffect, useRef } from 'react';
import { Image, StyleSheet, ScrollView, TouchableOpacity, Modal, View, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { achievements } from '@/components/Achievements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from 'react-native';
import { useNavigation } from 'expo-router';
import { landmarks } from '@/components/Landmarks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from '../screens/welcomeScreen'; // Adjust the import path as needed

export default function HomeScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState({ title: '', description: '', icon: '', iconType: '' });
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showAllDiscover, setShowAllDiscover] = useState(false);
  const [firstOpen, setFirstOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const modalBackgroundColor = useThemeColor({}, 'modalBackground');
  const modalContentColor = useThemeColor({}, 'modalContent');
  const iconColor = colorScheme === 'light' ? '#000' : '#fff';
  const viewAllColor = colorScheme === 'light' ? '#555555' : '#d3d3d3';
  const achievementCardColor = colorScheme === 'light' ? '#e6e6e6' : '#101010';

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

  const handlePress = (landmarkName) => {
    const selectedLandmark = landmarks.find((landmark) => landmark.title === landmarkName);
    if (selectedLandmark) {
      navigation.navigate('landmarkDetails', { landmark: selectedLandmark });
    }
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="face-man-profile" size={42} color={iconColor} style={styles.profileIcon} />
          <View>
            <ThemedText type="default" style={styles.headerText}>hi, John</ThemedText>
            <ThemedText type="default" style={styles.subHeaderText}>happy to see you :)</ThemedText>
          </View>
        </View>
      </View>

      <ThemedView style={styles.achievementsContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>achievements</ThemedText>
          <TouchableOpacity onPress={handleViewAllAchievements}>
            <ThemedText type="link" style={[styles.viewAll, { color: viewAllColor }]}>view all</ThemedText>
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
          <ThemedText type="subtitle" style={styles.sectionTitle}>discover</ThemedText>
          <TouchableOpacity onPress={handleViewAllDiscover}>
            <ThemedText type="link" style={[styles.viewAll, { color: viewAllColor }]}>view all</ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.discoveryItem} onPress={() => handlePress('Visit the Green\'s Windmill')}>
          <Image source={require('@/assets/images/greens-windmill.jpg')} style={styles.image}/>
          <View style={styles.textOverlay}>
            <ThemedText type="default" style={styles.discoveryTitle}>Visit the Green's Windmill</ThemedText>
            <TouchableOpacity style={styles.getStartedButton}>
              <ThemedText type="default" style={styles.buttonText}>get started</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <View style={styles.discoveryItemRow}>
          <TouchableOpacity style={styles.discoveryItemLarge} onPress={() => handlePress('Learn about William Booth')}>
            <Image source={require('@/assets/images/william-booth.png')} style={styles.imageSmall}/>
            <View style={styles.textOverlaySmall}>
              <ThemedText type="default" style={styles.discoveryTitleSmall}>Learn about William Booth</ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.discoveryItemSmall} onPress={() => handlePress('Hermitage Caves')}>
            <Image source={require('@/assets/images/caves.png')} style={styles.imageSmall}/>
            <View style={styles.textOverlaySmall}>
              <ThemedText type="default" style={styles.discoveryTitleSmall}>Hermitage Caves</ThemedText>
            </View>
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
                    <ThemedText type="subtitle" style={styles.sectionTitle}>discover all</ThemedText>
                  </View>
                  <TouchableOpacity style={styles.discoveryItem} onPress={() => handlePress('Visit the Green\'s Windmill')}>
                    <Image source={require('@/assets/images/greens-windmill.jpg')} style={styles.image}/>
                    <View style={styles.textOverlay}>
                      <ThemedText type="default" style={styles.discoveryTitle}>Visit the Green's Windmill</ThemedText>
                      <TouchableOpacity style={styles.getStartedButton}>
                        <ThemedText type="default" style={styles.buttonText}>get started</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.discoveryItemRow}>
                    <TouchableOpacity style={[styles.discoveryItemLarge, styles.discoveryItemSpacing]} onPress={() => handlePress('Learn about William Booth')}>
                      <Image source={require('@/assets/images/william-booth.png')} style={styles.imageSmall}/>
                      <View style={styles.textOverlaySmall}>
                        <ThemedText type="default" style={styles.discoveryTitleSmall}>Learn about William Booth</ThemedText>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.discoveryItemSmall, styles.discoveryItemSpacing]} onPress={() => handlePress('Hermitage Caves')}>
                      <Image source={require('@/assets/images/caves.png')} style={styles.imageSmall}/>
                      <View style={styles.textOverlaySmall}>
                        <ThemedText type="default" style={styles.discoveryTitleSmall}>Hermitage Caves</ThemedText>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={[styles.discoveryItem, styles.discoveryItemSpacing]} onPress={() => handlePress('Visit the Sneinton Market')}>
                    <Image source={require('@/assets/images/sneinton-market.png')} style={styles.image}/>
                    <View style={styles.textOverlay}>
                      <ThemedText type="default" style={[styles.discoveryTitle, { color: '#fff' }]}>Visit the Sneinton Market</ThemedText>
                      <TouchableOpacity style={styles.getStartedButton}>
                        <ThemedText type="default" style={styles.buttonText}>get started</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.discoveryItemRow}>
                    <TouchableOpacity style={[styles.discoveryItemMedium, styles.discoveryItemSpacing]} onPress={() => handlePress('About Saint Stephen’s Church')}>
                      <Image source={require('@/assets/images/saint-stephens-church.png')} style={styles.imageMedium}/>
                      <View style={styles.textOverlaySmall}>
                        <ThemedText type="default" style={styles.discoveryTitleSmall}>About Saint Stephen’s Church</ThemedText>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.discoveryItemMedium, styles.discoveryItemSpacing]} onPress={() => handlePress('What is the Sneinton Dragon?')}>
                      <Image source={require('@/assets/images/sneinton-dragon.png')} style={styles.imageMedium}/>
                      <View style={styles.textOverlaySmall}>
                        <ThemedText type="default" style={styles.discoveryTitleSmall}>What is the Sneinton Dragon?</ThemedText>
                      </View>
                    </TouchableOpacity>
                  </View>
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
  profileIcon: {
    marginRight: 10,
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
  viewAll: {
    color: '#d3d3d3',
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
  discoveryItemSpacing: {
    marginBottom: 16,
  },
  discoveryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discoveryItemLarge: {
    width: '65%',
  },
  discoveryItemMedium: {
    width: '47.5%',
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
  imageMedium: {
    width: '100%',
    height: 180,
    borderRadius: 8,
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
  discoveryTitle: {
    fontSize: 22,
    flex: 1,
    color: '#fff',
  },
  discoveryTitleSmall: {
    fontSize: 14,
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
});
