import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/useThemeColor';

type RootStackParamList = {
  LandmarkDetailsScreen: { landmark: { id: string; title: string; description: string; image: any } };
};

type LandmarkDetailsScreenRouteProp = RouteProp<RootStackParamList, 'LandmarkDetailsScreen'>;

const LandmarkDetailsScreen = () => {
  const route = useRoute<LandmarkDetailsScreenRouteProp>();
  const { landmark } = route.params;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const imageBorderColor = useThemeColor({}, 'border');

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Image source={landmark.image} style={[styles.image, { borderColor: imageBorderColor }]} />
      <Text style={[styles.title, { color: textColor }]}>{landmark.title}</Text>
      <Text style={[styles.description, { color: textColor }]}>{landmark.description}</Text>
      {/* Add any additional information you want to display about the landmark */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
  },
});

export default LandmarkDetailsScreen;
