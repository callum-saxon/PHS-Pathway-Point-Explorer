import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Image, View, TextInput, FlatList, TouchableOpacity, Text, Keyboard, Dimensions, TouchableWithoutFeedback } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { landmarks, Landmark } from '@/components/Landmarks';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import polyline from 'polyline';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const MapScreen: React.FC = () => {
  const [location, setLocation] = useState<Region | null>(null);
  const [search, setSearch] = useState('');
  const [highlightedLandmark, setHighlightedLandmark] = useState<Landmark | null>(null);
  const [searchBarActive, setSearchBarActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [exploreSheetOpen, setExploreSheetOpen] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<TextInput>(null);
  const mapRef = useRef<MapView>(null);

  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const searchBarBackgroundColor = useThemeColor({ light: 'rgba(255, 255, 255, 0.85)', dark: '#121212' }, 'background');
  const searchTextColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const landmarkTextColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const cardBackgroundColor = useThemeColor({}, 'background');
  const bottomSheetBackgroundColor = useThemeColor({}, 'background');
  const bottomSheetHandleColor = colorScheme === 'light' ? '#ccc' : '#444';
  const arrowIconColor = useThemeColor({ light: 'black', dark: 'white' }, 'text');
  const directionsButtonColor = '#2f95dc';
  const landmarkCardColor = colorScheme === 'light' ? '#e6e6e6' : '#121212';

  const bottomSheetInitialHeight = 300;
  const bottomSheetFullHeight = 700;
  const exploreSheetInitialHeight = 100;
  const exploreSheetFullHeight = screenHeight * 0.9;
  const translateY = useSharedValue(bottomSheetFullHeight);
  const translateYExplore = useSharedValue(exploreSheetFullHeight);

  const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const exploreSheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateYExplore.value }],
    };
  });

  const handleSheetGesture = (event: { nativeEvent: { translationY: any; }; }) => {
    const translationY = event.nativeEvent.translationY;
    if (translationY > 0) {
      translateY.value = withTiming(bottomSheetInitialHeight + translationY, { duration: 50 });
    } else {
      translateY.value = withTiming(Math.max(bottomSheetInitialHeight + translationY, 0), { duration: 50 });
    }
  };

  const handleExploreSheetGesture = (event: { nativeEvent: { translationY: any; }; }) => {
    const translationY = event.nativeEvent.translationY;
    if (translationY > 0) {
      translateYExplore.value = withTiming(exploreSheetInitialHeight + translationY, { duration: 50 });
    } else {
      translateYExplore.value = withTiming(Math.max(exploreSheetInitialHeight + translationY, 0), { duration: 50 });
    }
  };

  const handleSheetClose = (event: { nativeEvent: { translationY: number; }; }) => {
    if (event.nativeEvent.translationY > bottomSheetInitialHeight / 2) {
      translateY.value = withSpring(bottomSheetFullHeight, { damping: 15, stiffness: 100 });
      runOnJS(setBottomSheetOpen)(false);
    } else {
      translateY.value = withSpring(bottomSheetInitialHeight, { damping: 15, stiffness: 100 });
      runOnJS(setBottomSheetOpen)(true);
    }
  };

  const handleExploreSheetClose = (event: { nativeEvent: { translationY: number; }; }) => {
    if (event.nativeEvent.translationY > exploreSheetInitialHeight / 2) {
      translateYExplore.value = withSpring(exploreSheetFullHeight, { damping: 15, stiffness: 100 });
      runOnJS(setExploreSheetOpen)(false);
      runOnJS(setSearchBarActive)(false);
    } else {
      translateYExplore.value = withSpring(exploreSheetInitialHeight, { damping: 15, stiffness: 100 });
      runOnJS(setExploreSheetOpen)(true);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      };
      setLocation(initialRegion);
      setInitialRegion(initialRegion);
    })();
  }, []);

  const handleSelectLandmark = (landmark: Landmark) => {
    const newLocation = {
      latitude: landmark.coordinate.latitude,
      longitude: landmark.coordinate.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    };
    setLocation(newLocation);
    setSearch(landmark.title);
    setHighlightedLandmark(landmark);
    setSearchBarActive(false);
    Keyboard.dismiss();
    if (mapRef.current) {
      mapRef.current.animateToRegion(newLocation, 1000);
    }
  };

  const handleSearchIconPress = () => {
    setSearchBarActive(true);
    searchInputRef.current?.focus();
    handleSearch();
  };

  const handleToggleSearchBar = () => {
    setSearchBarActive(!searchBarActive);
    if (!searchBarActive && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  const handleMapPress = (event: { nativeEvent: { coordinate: any; }; }) => {
    const { coordinate } = event.nativeEvent;
    const selectedLandmark = landmarks.find(
      (landmark) =>
        Math.abs(landmark.coordinate.latitude - coordinate.latitude) < 0.001 &&
        Math.abs(landmark.coordinate.longitude - coordinate.longitude) < 0.001
    );

    if (selectedLandmark) {
      handleSelectLandmark(selectedLandmark);
    } else {
      setSearchBarActive(false);
      Keyboard.dismiss();
    }
  };

  const handleOverlayPress = () => {
    setSearchBarActive(false);
    Keyboard.dismiss();
  };

  const handleSearch = () => {
    const matchedLandmark = landmarks.find(landmark =>
      landmark.title.toLowerCase().includes(search.toLowerCase())
    );
    if (matchedLandmark) {
      handleSelectLandmark(matchedLandmark);
    }
  };

  const fetchDirections = async (origin: { latitude: any; longitude: any; }, destination: { latitude: any; longitude: any; }) => {
    try {
      const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.routes.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const routeCoords = points.map(point => ({
          latitude: point[0],
          longitude: point[1],
        }));
        setRouteCoordinates(routeCoords);
      } else {
        alert('No routes found');
      }
    } catch (error) {
      alert('Error fetching directions');
      console.error(error);
    }
  };

  const handleDirectionsPress = (landmark: Landmark) => {
    if (location) {
      const origin = {
        latitude: location.latitude,
        longitude: location.longitude,
      };
      const destination = {
        latitude: landmark.coordinate.latitude,
        longitude: landmark.coordinate.longitude,
      };
      fetchDirections(origin, destination);
      setExploreSheetOpen(false);
      translateYExplore.value = withSpring(exploreSheetFullHeight, { damping: 15, stiffness: 100 });
    }
  };

  const handleLandmarkCardPress = () => {
    translateY.value = withSpring(bottomSheetInitialHeight, { damping: 15, stiffness: 100 });
    setBottomSheetOpen(true);
  };

  const handleCloseLandmarkCard = () => {
    setHighlightedLandmark(null);
  };

  const handleExplorePress = () => {
    setSearch('');
    setSearchBarActive(false);
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    translateYExplore.value = withSpring(screenHeight * 0.1, { damping: 15, stiffness: 100 });
    setExploreSheetOpen(true);
    setHighlightedLandmark(null);
  };

  const handleFavoritePress = (landmarkId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(landmarkId)) {
        newFavorites.delete(landmarkId);
      } else {
        newFavorites.add(landmarkId);
      }
      return newFavorites;
    });
  };

  const filteredLandmarks = search
    ? landmarks.filter(landmark =>
        landmark.title.toLowerCase().includes(search.toLowerCase())
      )
    : landmarks;

  const lightMapStyle = [
    {
      "featureType": "all",
      "elementType": "labels",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        { "visibility": "off" }
      ]
    },
  ];

  const darkMapStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#181818"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1b1b1b"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#2c2c2c"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#8a8a8a"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#373737"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#3c3c3c"
        }
      ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#4e4e4e"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#3d3d3d"
        }
      ]
    }
  ];

  const calculateZoomLevel = (latitudeDelta: number) => {
    const zoom = Math.log2(720 / latitudeDelta);
    return Math.round(zoom);
  };

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const renderExploreItem = ({ item }: { item: Landmark }) => (
    <View style={[styles.exploreItem, { backgroundColor: landmarkCardColor }]}>
      <View style={styles.exploreItemImageContainer}>
        <Image source={item.image} style={styles.exploreItemImage} />
        <TouchableOpacity style={styles.favoriteIcon} onPress={() => handleFavoritePress(item.id)}>
          <MaterialIcons name={favorites.has(item.id) ? 'favorite' : 'favorite-outline'} size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.exploreItemTextContainer}>
        <Text style={[styles.exploreItemTitle, { color: landmarkTextColor }]}>{item.title}</Text>
        <View style={styles.exploreItemDescriptionContainer}>
          <Text style={[styles.exploreItemDescription, { color: landmarkTextColor }]} numberOfLines={3} ellipsizeMode='tail'>{item.description}</Text>
          <TouchableOpacity style={styles.directionsButton} onPress={() => handleDirectionsPress(item)}>
            <FontAwesome6 name="arrow-alt-circle-right" size={24} color={directionsButtonColor} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.exploreItemLocation, { color: landmarkTextColor }]}>{item.location}</Text>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        {initialRegion && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onPress={handleMapPress}
            onRegionChangeComplete={(region) => {
              setLocation(region);
              setZoomLevel(calculateZoomLevel(region.latitudeDelta));
            }}
            customMapStyle={backgroundColor === '#fff' ? lightMapStyle : darkMapStyle}
            rotateEnabled={true}
          >
            {landmarks.map((landmark: Landmark) => (
              <Marker
                key={landmark.id}
                coordinate={landmark.coordinate}
                onPress={() => handleSelectLandmark(landmark)}
              >
                <View style={styles.markerContainer}>
                  <Image
                    source={landmark.image}
                    style={[
                      styles.markerImage,
                      highlightedLandmark?.id === landmark.id && styles.highlightedMarkerImage
                    ]}
                  />
                  {zoomLevel > 15 && (
                    <Text style={[styles.markerText, { color: landmarkTextColor }]}>{landmark.title}</Text>
                  )}
                </View>
              </Marker>
            ))}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={4}
                strokeColor="blue"
              />
            )}
          </MapView>
        )}
        {!searchBarActive && highlightedLandmark && (
          <TouchableOpacity 
            style={[styles.landmarkInfoCard, { backgroundColor: cardBackgroundColor }]} 
            onPress={handleLandmarkCardPress}
          >
            <Image source={highlightedLandmark.image} style={styles.landmarkImage} />
            <View style={styles.landmarkTextContainer}>
              <Text style={[styles.landmarkTitle, { color: landmarkTextColor }]}>{highlightedLandmark.title}</Text>
              <Text style={[styles.landmarkDescription, { color: landmarkTextColor }]}>{truncateText(highlightedLandmark.description, 50)}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseLandmarkCard}>
              <MaterialIcons name="close" size={24} color={directionsButtonColor} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.directionsButton, { marginTop: 30 }]} onPress={() => handleDirectionsPress(highlightedLandmark)}>
              <FontAwesome6 name="arrow-alt-circle-right" size={28} color={directionsButtonColor} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle, { backgroundColor: bottomSheetBackgroundColor, zIndex: 5 }]}>
          <PanGestureHandler onGestureEvent={handleSheetGesture} onHandlerStateChange={handleSheetClose}>
            <View style={styles.bottomSheetHandleWrapper}>
              <Animated.View style={[styles.bottomSheetHandle, { backgroundColor: bottomSheetHandleColor }]} />
            </View>
          </PanGestureHandler>
          <View style={styles.bottomSheetContent}>
            {highlightedLandmark && (
              <>
                <Image source={highlightedLandmark.image} style={styles.bottomSheetLandmarkImage} />
                <Text style={[styles.landmarkTitle, { color: landmarkTextColor }]}>{highlightedLandmark.title}</Text>
                <Text style={[styles.landmarkDescription, { color: landmarkTextColor }]}>{highlightedLandmark.description}</Text>
              </>
            )}
          </View>
        </Animated.View>
        {!searchBarActive && (
          <Animated.View style={[styles.exploreSheet, exploreSheetAnimatedStyle, { backgroundColor: bottomSheetBackgroundColor, zIndex: 4, height: exploreSheetFullHeight }]}>
            <PanGestureHandler onGestureEvent={handleExploreSheetGesture} onHandlerStateChange={handleExploreSheetClose}>
              <View style={styles.bottomSheetHandleWrapper}>
                <Animated.View style={[styles.bottomSheetHandle, { backgroundColor: bottomSheetHandleColor }]} />
              </View>
            </PanGestureHandler>
            <View style={styles.exploreSheetContent}>
              <Text style={[styles.exploreHeaderText, { color: landmarkTextColor }]}>Explore</Text>
              <View style={styles.exploreFilterContainer}>
                <TouchableOpacity style={styles.exploreFilterButton}>
                  <Text style={styles.exploreFilterText}>Nearby</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exploreFilterButton}>
                  <Text style={styles.exploreFilterText}>Popular</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exploreFilterButton}>
                  <Text style={styles.exploreFilterText}>Favorites</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={landmarks}
                renderItem={renderExploreItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.exploreListContentContainer}
              />
            </View>
          </Animated.View>
        )}
        {searchBarActive && (
          <TouchableWithoutFeedback onPress={handleOverlayPress}>
            <View style={styles.searchOverlay} />
          </TouchableWithoutFeedback>
        )}
        {!bottomSheetOpen && (
          <View style={[styles.searchContainer, { backgroundColor: searchBarBackgroundColor }, (searchBarActive || exploreSheetOpen) ? styles.searchContainerActive : styles.searchContainerInactive]}>
            <TouchableOpacity style={styles.iconButton} onPress={handleSearchIconPress}>
              <FontAwesome5 name="search-location" size={20} color={searchTextColor} />
            </TouchableOpacity>
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: searchTextColor }]}
              placeholder="Search"
              placeholderTextColor={searchTextColor}
              value={search}
              onChangeText={(text) => setSearch(text)}
              onSubmitEditing={handleSearch}
              onFocus={() => setSearchBarActive(true)}
              onBlur={() => !search && setSearchBarActive(false)}
            />
            <TouchableOpacity style={styles.iconButton} onPress={handleToggleSearchBar}>
              <MaterialIcons name={searchBarActive ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color={searchTextColor} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: directionsButtonColor }]} onPress={handleExplorePress}>
              <MaterialCommunityIcons name="map-search" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
        {searchBarActive && (
          <View style={styles.searchResultsContainer}>
            <View style={[styles.searchResultsTopExtension, { backgroundColor: searchBarBackgroundColor }]} />
            {filteredLandmarks.length > 0 ? (
              <FlatList
                style={[styles.searchResults, { backgroundColor: searchBarBackgroundColor }]}
                data={filteredLandmarks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.searchResultItem, { backgroundColor: searchBarBackgroundColor }]}
                    onPress={() => handleSelectLandmark(item)}
                  >
                    <Text style={[styles.searchResultText, { color: searchTextColor }]}>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={[styles.searchResultItem, { backgroundColor: searchBarBackgroundColor }]}>
                <Text style={[styles.searchResultText, { color: searchTextColor }]}>No landmarks found</Text>
              </View>
            )}
            <LinearGradient
              colors={['rgba(255,255,255,0)', searchBarBackgroundColor]}
              style={styles.searchResultsFade}
              pointerEvents="none"
            />
          </View>
        )}
      </ThemedView>
    </GestureHandlerRootView>
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
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  markerText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  searchContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 30,
    paddingHorizontal: 5,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 7,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 5,
  },
  searchResultsContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 40,
    maxHeight: 300,
    zIndex: 6,
  },
  searchResultsTopExtension: {
    height: 55,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchResults: {
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 1,
  },
  searchResultsFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
    zIndex: 1,
  },
  searchResultItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchResultText: {
    fontSize: 16,
  },
  landmarkInfoCard: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 10,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  landmarkImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#2f95dc',
  },
  landmarkTextContainer: {
    flex: 1,
  },
  landmarkTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  landmarkDescription: {
    marginTop: 5,
    fontSize: 14,
  },
  directionsButton: {
    padding: 10,
    marginTop: 30,
  },
  closeButton: {
    padding: 10,
    position: 'absolute',
    right: 12,
    top: 5,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 700,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  exploreSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomSheetHandleWrapper: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 6,
    borderRadius: 3,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  exploreSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  exploreItem: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  exploreItemImageContainer: {
    position: 'relative',
  },
  exploreItemImage: {
    width: '100%',
    height: 200,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 5,
  },
  exploreItemTextContainer: {
    padding: 10,
  },
  exploreItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exploreItemDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  exploreItemDescription: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  exploreItemLocation: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  exploreItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  exploreListContentContainer: {
    paddingBottom: 60,
  },
  exploreHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exploreFilterContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  exploreFilterButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  exploreFilterText: {
    fontSize: 14,
  },
  bottomSheetLandmarkImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 20,
  },
});

export default MapScreen;
