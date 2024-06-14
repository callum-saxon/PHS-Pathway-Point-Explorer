import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useColorScheme } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = '#ffffff';
  const textColor = useThemeColor({}, 'text');
  const navigation = useNavigation();

  const settingsOptions = [
    { title: 'Account Info', icon: 'user-cog', iconType: FontAwesome5, screen: 'screens/settings/AccountInfo' },
    { title: 'Change Password', icon: 'key', iconType: FontAwesome5, screen: 'screens/settings/ChangePassword' },
    { title: 'Privacy Settings', icon: 'user-shield', iconType: FontAwesome5, screen: 'screens/settings/PrivacySettings' },
    { title: 'Notification Settings', icon: 'bell', iconType: FontAwesome5, screen: 'screens/settings/NotificationSettings' },
    { title: 'Language', icon: 'globe', iconType: FontAwesome5, screen: 'screens/settings/Language' },
    { title: 'Connected Apps', icon: 'link', iconType: FontAwesome5, screen: 'screens/settings/ConnectedApps' },
    { title: 'Help & Support', icon: 'info-circle', iconType: FontAwesome5, screen: 'screens/settings/HelpSupport' },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Ionicons name="settings-outline" size={42} color={iconColor} style={styles.profileIcon} />
          <View>
            <ThemedText type="default" style={[styles.headerText, { color: textColor }]}>
              Settings
            </ThemedText>
          </View>
        </View>
        <View style={styles.optionsContainer}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.option} onPress={() => navigation.navigate(option.screen)}>
              <option.iconType name={option.icon} size={24} color={iconColor} style={styles.optionIcon} />
              <ThemedText type="default" style={[styles.optionText, { color: textColor }]}>
                {option.title}
              </ThemedText>
              <Ionicons name="chevron-forward" size={24} color={iconColor} style={styles.optionChevron} />
            </TouchableOpacity>
          ))}
        </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    top: 25,
  },
  profileIcon: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 18,
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
});
