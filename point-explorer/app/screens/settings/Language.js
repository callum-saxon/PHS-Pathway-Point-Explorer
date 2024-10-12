import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTranslation } from 'react-i18next';

export default function Language() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ThemedText type="default" style={[styles.sectionTitle, { color: textColor }]}>
          {t('language')}
        </ThemedText>
        <TouchableOpacity style={styles.languageOption} onPress={() => changeLanguage('en')}>
          <ThemedText type="default" style={{ color: textColor }}>{t('english')}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.languageOption} onPress={() => changeLanguage('fr')}>
          <ThemedText type="default" style={{ color: textColor }}>{t('french')}</ThemedText>
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  languageOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
