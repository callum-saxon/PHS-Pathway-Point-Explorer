import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = '#ffffff';
  const textColor = useThemeColor({}, 'text');
  const { logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    logout();
    navigation.navigate('screens/auth/loginScreen');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <MaterialIcons name="face" size={100} color={iconColor} style={styles.profileIcon} />
          <ThemedText type="default" style={[styles.headerText, { color: textColor }]}>
            Mr. John Doe
          </ThemedText>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText type="default" style={[styles.logoutButtonText, { color: textColor }]}>
              Logout
            </ThemedText>
            <MaterialIcons name="keyboard-arrow-right" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('screens/profile/ProfileView')}>
            <FontAwesome5 name="user" size={24} color={iconColor} style={styles.optionIcon} />
            <ThemedText type="default" style={[styles.optionText, { color: textColor }]}>
              View Profile
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color={iconColor} style={styles.optionChevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('screens/profile/FavoriteLocations')}>
            <FontAwesome5 name="star" size={24} color={iconColor} style={styles.optionIcon} />
            <ThemedText type="default" style={[styles.optionText, { color: textColor }]}>
              Favorite Locations
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color={iconColor} style={styles.optionChevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('screens/profile/RecentlyVisited')}>
            <FontAwesome5 name="clock" size={24} color={iconColor} style={styles.optionIcon} />
            <ThemedText type="default" style={[styles.optionText, { color: textColor }]}>
              Recently Visited
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color={iconColor} style={styles.optionChevron} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.helpButton, { backgroundColor: '#333' }]}>
          <FontAwesome5 name="headset" size={24} color={iconColor} />
          <ThemedText type="default" style={[styles.helpButtonText, { color: iconColor }]}>
            How can we help you?
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
    top: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileIcon: {
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 32,
    marginBottom: 32,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  optionChevron: {
    marginLeft: 'auto',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  helpButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  logoutButton: {
    position: 'absolute',
    top: -40,
    left: 240,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  logoutButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
});
