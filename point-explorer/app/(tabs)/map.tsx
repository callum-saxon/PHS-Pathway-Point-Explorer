import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Image, View, TextInput, FlatList, TouchableOpacity, Text, Keyboard } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { landmarks, Landmark } from '@/components/Landmarks';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const MapScreen: React.FC = () => {
  const [location, setLocation] = useState<Region | null>(null);
  const [search, setSearch] = useState('');
  const [highlightedLandmarkId, setHighlightedLandmarkId] = useState<string | null>(null);
  const [searchBarActive, setSearchBarActive] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });
    })();
  }, []);

  const backgroundColor = useThemeColor({}, 'background');

  const handleSelectLandmark = (landmark: Landmark) => {
    setLocation({
      latitude: landmark.coordinate.latitude,
      longitude: landmark.coordinate.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    });
    setSearch(landmark.title);
    setHighlightedLandmarkId(landmark.id);
    setSearchBarActive(false);
    Keyboard.dismiss();
  };

  const handleSearchIconPress = () => {
    setSearchBarActive(true);
    searchInputRef.current?.focus();
  };

  const handleToggleSearchBar = () => {
    setSearchBarActive(!searchBarActive);
    if (!searchBarActive && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  const handleMapPress = () => {
    setSearchBarActive(false);
    Keyboard.dismiss();
  };

  const filteredLandmarks = search
    ? landmarks.filter(landmark =>
        landmark.title.toLowerCase().includes(search.toLowerCase())
      )
    : landmarks;

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {location && (
        <MapView
          style={styles.map}
          region={location}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onPress={handleMapPress}
        >
          <Marker coordinate={location}>
            <View style={styles.customMarker}>
              <View style={styles.innerMarker} />
            </View>
          </Marker>
          {landmarks.map((landmark: Landmark) => (
            <Marker
              key={landmark.id}
              coordinate={landmark.coordinate}
              title={landmark.title}
              description={landmark.description}
              onPress={() => handleSelectLandmark(landmark)}
            >
              <Image
                source={landmark.image}
                style={[
                  styles.markerImage,
                  highlightedLandmarkId === landmark.id && styles.highlightedMarkerImage
                ]}
              />
            </Marker>
          ))}
        </MapView>
      )}
      <View style={[styles.searchContainer, searchBarActive ? styles.searchContainerActive : styles.searchContainerInactive]}>
        <TouchableOpacity style={styles.iconButton} onPress={handleSearchIconPress}>
          <FontAwesome5 name="search-location" size={20} color="#000" />
        </TouchableOpacity>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchBarActive(true)}
          onBlur={() => !search && setSearchBarActive(false)}
        />
        <TouchableOpacity style={styles.iconButton} onPress={handleToggleSearchBar}>
          <MaterialIcons name={searchBarActive ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {searchBarActive && (
        <View style={styles.searchResultsContainer}>
          <View style={styles.searchResultsTopExtension} />
          {filteredLandmarks.length > 0 ? (
            <FlatList
              style={styles.searchResults}
              data={filteredLandmarks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleSelectLandmark(item)}
                >
                  <Text style={styles.searchResultText}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.searchResultItem}>
              <Text style={styles.searchResultText}>No results</Text>
            </View>
          )}
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2f95dc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2f95dc',
  },
  innerMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#fff',
  },
  highlightedMarkerImage: {
    borderColor: '#2f95dc',
  },
  searchContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 30,
    paddingHorizontal: 5,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  searchContainerInactive: {
    bottom: 20,
  },
  searchContainerActive: {
    top: 40,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 40,
    maxHeight: 300,
    zIndex: 1,
  },
  searchResultsTopExtension: {
    height: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchResults: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 1,
  },
  searchResultItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchResultText: {
    fontSize: 16,
  },
});

export default MapScreen;
