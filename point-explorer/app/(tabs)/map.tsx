import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Image, View, TextInput, FlatList, TouchableOpacity, Text, Keyboard, Dimensions, TouchableWithoutFeedback, Share, Alert, Modal } from 'react-native';
import MapView, { Marker, Polyline, Region, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { landmarks, Landmark } from '@/components/Landmarks';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import polyline from 'polyline';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: screenHeight } = Dimensions.get('window');

const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialLandmark = route.params?.initialLandmark as Landmark | null;
  const initialLandmarks = route.params?.initialLandmarks as Landmark[] | null;

  const [location, setLocation] = useState<Region | null>(null);
  const [search, setSearch] = useState('');
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
  const [isCentered, setIsCentered] = useState(false);
  const [highlightedLandmark, setHighlightedLandmark] = useState<Landmark | null>(initialLandmark || null);
  const [searchBarActive, setSearchBarActive] = useState(false);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [exploreSheetOpen, setExploreSheetOpen] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('Nearby');
  const [navigationMode, setNavigationMode] = useState(false);
  const [travelTime, setTravelTime] = useState('');
  const [directions, setDirections] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [distanceToDestination, setDistanceToDestination] = useState('');
  const [remainingTime, setRemainingTime] = useState('');
  const [isSecondCardVisible, setIsSecondCardVisible] = useState(false);
  const [waypoints, setWaypoints] = useState<string[]>([]);

  const searchInputRef = useRef<TextInput>(null);
  const mapRef = useRef<MapView>(null);

  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const highlightColor = useThemeColor({ light: Colors.light.highlight, dark: Colors.dark.highlight }, 'highlight');
  const tintColor = useThemeColor({}, 'tint');
  const searchBarBackgroundColor = useThemeColor({ light: 'rgb(255, 255, 255)', dark: '#121212' }, 'background');
  const TextColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const BackgroundColor = useThemeColor({}, 'background');
  const bottomSheetHandleColor = colorScheme === 'light' ? '#ccc' : '#444';
  const arrowIconColor = useThemeColor({ light: 'black', dark: 'white' }, 'text');
  const directionsButtonColor = highlightColor;
  const [directionButtonPressed, setDirectionButtonPressed] = useState(false);
  const fadeAnim = useSharedValue(1);
  const [currentDirectionsLandmarkId, setCurrentDirectionsLandmarkId] = useState<string | null>(null);
  const [initialNavigationLandmarkId, setInitialNavigationLandmarkId] = useState<string | null>(null);
  const [isCurrentLandmarkCardExpanded, setIsCurrentLandmarkCardExpanded] = useState(false);
  const [navigationLandmarkCardVisible, setNavigationLandmarkCardVisible] = useState(false);
  const [navigationLandmark, setNavigationLandmark] = useState<Landmark | null>(null);

  const landmarkCardColor = colorScheme === 'light' ? '#e6e6e6' : '#101010';

  const bottomSheetInitialHeight = 300;
  const bottomSheetFullHeight = 700;
  const exploreSheetInitialHeight = 100;
  const exploreSheetFullHeight = screenHeight * 0.9;
  const translateY = useSharedValue(bottomSheetFullHeight);
  const translateYExplore = useSharedValue(exploreSheetFullHeight);

  const [landmarksWithETA, setLandmarksWithETA] = useState([]);
  const [transportMode, setTransportMode] = useState('walking');

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

          if (initialLandmark) {
              const landmarkRegion = {
                  latitude: initialLandmark.coordinate.latitude,
                  longitude: initialLandmark.coordinate.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
              };
              setLocation(landmarkRegion);
              setInitialRegion(landmarkRegion);
              setHighlightedLandmark(initialLandmark);
          } else if (initialLandmarks && initialLandmarks.length > 0) {
              const landmarkRegion = {
                  latitude: initialLandmarks[0].coordinate.latitude,
                  longitude: initialLandmarks[0].coordinate.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
              };
              setLocation(landmarkRegion);
              setInitialRegion(landmarkRegion);
              setHighlightedLandmark(initialLandmarks[0]);

              const userLocation = {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
              };

              const waypoints = initialLandmarks.map((landmark) => `${landmark.coordinate.latitude},${landmark.coordinate.longitude}`);

              fetchDirections(userLocation, waypoints[waypoints.length - 1], waypoints.slice(0, -1));
          } else {
              setLocation(initialRegion);
              setInitialRegion(initialRegion);
          }
      })();
  }, [initialLandmark, initialLandmarks]);

useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    if (navigationMode) {
      (async () => {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          async (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            setLocation((prevLocation) => ({
              ...prevLocation,
              latitude,
              longitude,
            }));

            if (currentDirectionsLandmarkId) {
              const destination = landmarks.find(l => l.id === currentDirectionsLandmarkId)?.coordinate;
              if (destination) {
                const distanceToDest = calculateDistance(
                  latitude,
                  longitude,
                  destination.latitude,
                  destination.longitude
                );
                setDistanceToDestination((distanceToDest / 1000).toFixed(2) + ' km');

                const apiKey = 'AIzaSyBwT5euSmaG7X8epNBW9cT8y3DfvhWcnic';
                const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=${destination.latitude},${destination.longitude}&mode=${transportMode}&key=${apiKey}`;
                try {
                  const response = await fetch(url);
                  const data = await response.json();
                  if (data.routes.length) {
                    const newTravelTime = data.routes[0].legs[0].duration.text;
                    setRemainingTime(newTravelTime);
                  } else {
                    setRemainingTime('No routes found');
                  }
                } catch (error) {
                  console.error('Error fetching directions:', error);
                  setRemainingTime('Error calculating ETA');
                }
              } else {
                setDistanceToDestination('No destination');
                setRemainingTime('No destination');
              }
            }
          }
        );
      })();
    } else if (locationSubscription) {
      locationSubscription.remove();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
}, [navigationMode, currentDirectionsLandmarkId, transportMode]);

  useEffect(() => {
    if (initialRegion && mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 1000);
    }
  }, [initialRegion]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    return d;
  };

  useEffect(() => {
    (async () => {
      try {
        const favorites = await AsyncStorage.getItem('favorites');
        const favoriteList = favorites ? JSON.parse(favorites) : [];
        setFavorites(new Set(favoriteList));
      } catch (error) {
        console.error('Error loading favorites', error);
      }
    })();
  }, []);

  const handleSelectLandmark = (landmark: Landmark) => {
    const newLocation = {
      latitude: landmark.coordinate.latitude,
      longitude: landmark.coordinate.longitude,
      latitudeDelta: 0.005, // Adjust these values for desired zoom level
      longitudeDelta: 0.005, // Adjust these values for desired zoom level
    };
    setLocation(newLocation);
    setInitialRegion(newLocation);
    setSearch(landmark.title);
    setHighlightedLandmark(landmark);
    setSearchBarActive(false);
    setExploreSheetOpen(false);
    translateYExplore.value = withSpring(exploreSheetFullHeight, { damping: 15, stiffness: 100 });
    Keyboard.dismiss();
    if (mapRef.current) {
      mapRef.current.animateToRegion(newLocation, 1000);
    }
  
    if (navigationMode) {
      setNavigationLandmark(landmark);
      setNavigationLandmarkCardVisible(true);
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

  const handleLocationPress = async () => {
    if (isCentered) {
      setIsCentered(false);
    } else {
      try {
        let location = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        };
        setLocation(newRegion);
        setUserLocation(newRegion); // Set user location
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
        setIsCentered(true); // Centered on user's location
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    }
  };
  
  const fetchDirections = async (origin, destination, waypoints = []) => {
    try {
      const apiKey = 'AIzaSyBwT5euSmaG7X8epNBW9cT8y3DfvhWcnic';
      const waypointsParam = waypoints.length > 0 ? `&waypoints=${[...new Set(waypoints)].join('|')}` : '';
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=${transportMode}&key=${apiKey}${waypointsParam}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.routes.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const routeCoords = points.map(point => ({
          latitude: point[0],
          longitude: point[1],
        }));
        setRouteCoordinates(routeCoords);
        setTravelTime(data.routes[0].legs[0].duration.text);

        const steps = data.routes[0].legs.flatMap((leg, legIndex) =>
          leg.steps.map((step, index) => ({
            key: `${legIndex}-${index}`,
            instructions: step.html_instructions.replace(/<[^>]+>/g, ''),
            icon: step.maneuver,
            distance: step.distance.text,
            end_location: step.end_location,
          }))
        );
        setDirections(steps);
        setCurrentStepIndex(0);
      } else {
        alert('No routes found');
      }
    } catch (error) {
      alert('Error fetching directions');
      console.error(error);
    }
  };

  const fetchETAForLandmark = async (origin, destination) => {
    try {
      const apiKey = 'AIzaSyBwT5euSmaG7X8epNBW9cT8y3DfvhWcnic';
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=${transportMode}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.routes.length) {
        return data.routes[0].legs[0].duration.text; // Return the ETA as a string (e.g., "5 mins")
      } else {
        return 'No ETA available';
      }
    } catch (error) {
      console.error('Error fetching ETA:', error);
      return 'Error';
    }
  };

  useEffect(() => {
    const fetchETAs = async () => {
      const userLocation = await Location.getCurrentPositionAsync({});
  
      const updatedLandmarks = await Promise.all(waypoints.map(async (waypoint) => {
        const landmark = landmarks.find(l => `${l.coordinate.latitude},${l.coordinate.longitude}` === waypoint);
  
        if (landmark) {
          const eta = await fetchETAForLandmark(userLocation.coords, landmark.coordinate);
          return { ...landmark, eta };  // Attach ETA to the landmark object
        }
        return null;
      }));
  
      setLandmarksWithETA(updatedLandmarks.filter(Boolean));  // Update state to include ETA
    };
  
    fetchETAs();
  }, [waypoints]);

  const handleDirectionsPress = async (landmark: Landmark) => {
    if (currentDirectionsLandmarkId && currentDirectionsLandmarkId !== landmark.id) {
      Alert.alert(
        "Directions Active",
        "Would you like to add this landmark to create a tour or set directions individually?",
        [
          {
            text: "Individually",
            onPress: async () => {
              try {
                const userLocation = await Location.getCurrentPositionAsync({});
                const origin = {
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                };
                const destination = {
                  latitude: landmark.coordinate.latitude,
                  longitude: landmark.coordinate.longitude,
                };
                await fetchDirections(origin, destination);
                setExploreSheetOpen(false);
                translateYExplore.value = withSpring(exploreSheetFullHeight, { damping: 15, stiffness: 100 });

                fadeAnim.value = withTiming(0, {
                  duration: 300,
                  easing: Easing.linear,
                }, () => {
                  runOnJS(setDirectionButtonPressed)(true);
                  runOnJS(setCurrentDirectionsLandmarkId)(landmark.id);
                  runOnJS(setWaypoints)([]); // Clear waypoints

                  fadeAnim.value = withTiming(1, {
                    duration: 300,
                    easing: Easing.linear,
                  });
                });

                // Set the initial navigation landmark if it's not already set
                if (!initialNavigationLandmarkId) {
                  setInitialNavigationLandmarkId(landmark.id);
                }

                // Zoom in on the landmark and open the info card
                const zoomedRegion = {
                  latitude: landmark.coordinate.latitude,
                  longitude: landmark.coordinate.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                };
                if (mapRef.current) {
                  mapRef.current.animateToRegion(zoomedRegion, 1000);
                }
                setHighlightedLandmark(landmark);
                setBottomSheetOpen(false); // Close landmark info card
              } catch (error) {
                console.error('Error fetching user location:', error);
              }
            },
          },
          {
            text: "Add to Tour",
            onPress: async () => {
              try {
                const userLocation = await Location.getCurrentPositionAsync({});
                const origin = {
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                };
                const destination = {
                  latitude: landmark.coordinate.latitude,
                  longitude: landmark.coordinate.longitude,
                };
                // Include the current landmark with active directions as a waypoint
                const currentLandmark = landmarks.find(l => l.id === currentDirectionsLandmarkId);
                const currentLandmarkWaypoint = currentLandmark ? `${currentLandmark.coordinate.latitude},${currentLandmark.coordinate.longitude}` : null;
                const newWaypoints = currentLandmarkWaypoint ? [...new Set([...waypoints, currentLandmarkWaypoint, `${landmark.coordinate.latitude},${landmark.coordinate.longitude}`])] : [`${landmark.coordinate.latitude},${landmark.coordinate.longitude}`];
                await fetchDirections(origin, destination, newWaypoints);
                runOnJS(setWaypoints)(newWaypoints); // Update waypoints
                runOnJS(setCurrentDirectionsLandmarkId)(landmark.id);

                // Set the initial navigation landmark if it's not already set
                if (!initialNavigationLandmarkId) {
                  setInitialNavigationLandmarkId(landmark.id);
                }

                // Zoom in on the landmark and open the info card
                const zoomedRegion = {
                  latitude: landmark.coordinate.latitude,
                  longitude: landmark.coordinate.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                };
                if (mapRef.current) {
                  mapRef.current.animateToRegion(zoomedRegion, 1000);
                }
                setHighlightedLandmark(null);
                setBottomSheetOpen(false); // Close landmark info card
              } catch (error) {
                console.error('Error adding landmark to tour:', error);
              }
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    } else {
      try {
        const userLocation = await Location.getCurrentPositionAsync({});
        const origin = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        };
        const destination = {
          latitude: landmark.coordinate.latitude,
          longitude: landmark.coordinate.longitude,
        };
        await fetchDirections(origin, destination);
        setExploreSheetOpen(false);
        translateYExplore.value = withSpring(exploreSheetFullHeight, { damping: 15, stiffness: 100 });

        fadeAnim.value = withTiming(0, {
          duration: 300,
          easing: Easing.linear,
        }, () => {
          runOnJS(setDirectionButtonPressed)(true);
          runOnJS(setCurrentDirectionsLandmarkId)(landmark.id);
          runOnJS(setWaypoints)([]);

          fadeAnim.value = withTiming(1, {
            duration: 300,
            easing: Easing.linear,
          });
        });

        // Set the initial navigation landmark if it's not already set
        if (!initialNavigationLandmarkId) {
          setInitialNavigationLandmarkId(landmark.id);
        }

        // Zoom in on the landmark and open the info card
        const zoomedRegion = {
          latitude: landmark.coordinate.latitude,
          longitude: landmark.coordinate.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        if (mapRef.current) {
          mapRef.current.animateToRegion(zoomedRegion, 1000);
        }
        setHighlightedLandmark(landmark);
        setBottomSheetOpen(false); // Close landmark info card
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    }
  };

  const handleExitNavPress = () => {
    setNavigationMode(false);
  };

  const handleStartNavPress = () => {
    setNavigationMode(true);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });

  const handleLandmarkCardPress = () => {
    translateY.value = withSpring(bottomSheetInitialHeight, { damping: 15, stiffness: 100 });
    setBottomSheetOpen(true);
  };

  const handleCloseLandmarkCard = async () => {
    try {
      const userLocation = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      };

      if (currentDirectionsLandmarkId && highlightedLandmark && highlightedLandmark.id === currentDirectionsLandmarkId) {
        // If closing the landmark card for the landmark with active directions, reset directions
        setRouteCoordinates([]);
        setDirections([]);
        setCurrentDirectionsLandmarkId(null);
        setInitialNavigationLandmarkId(null);
        setDistanceToDestination('');
        setRemainingTime('');
        setWaypoints([]);

        setLocation(initialRegion);
        if (mapRef.current) {
          mapRef.current.animateToRegion(initialRegion, 1000);
        }
      }

      setHighlightedLandmark(null);

      translateY.value = withSpring(bottomSheetFullHeight, { damping: 15, stiffness: 100 });
      setBottomSheetOpen(false);
    } catch (error) {
      console.error('Error resetting map position:', error);
    }
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

  const handleFavoritePress = async (landmarkId: string) => {
    try {
      const updatedFavorites = new Set(favorites);
      if (updatedFavorites.has(landmarkId)) {
        updatedFavorites.delete(landmarkId);
      } else {
        updatedFavorites.add(landmarkId);
      }
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(Array.from(updatedFavorites)));
    } catch (error) {
      console.error('Error updating favorites', error);
    }
  };

  const handleLearnMorePress = (landmark: Landmark) => {
    navigation.navigate('screens/landmarkdetailsScreen', { landmark });
  };

  const handleSharePress = async () => {
    try {
      const result = await Share.share({
        message: `Check out this landmark: ${highlightedLandmark?.title} - ${highlightedLandmark?.description}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert('Error sharing the landmark');
      console.error(error);
    }
  };

  const filteredLandmarks = search
    ? landmarks.filter(landmark =>
        landmark.title.toLowerCase().includes(search.toLowerCase())
      )
    : landmarks;

  const filteredExploreLandmarks = filter === 'Favorites'
    ? landmarks.filter(landmark => favorites.has(landmark.id))
    : landmarks;

  const lightMapStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e8ecfc"
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
          "color": "#616161"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
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
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dadada"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    }
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

  const renderExploreItem = ({ item }: { item: Landmark }) => {
    const isFavorite = favorites.has(item.id);
    const isActiveDirectionLandmark = waypoints.includes(`${item.coordinate.latitude},${item.coordinate.longitude}`) || currentDirectionsLandmarkId === item.id;

    return (
      <TouchableOpacity
        style={[styles.exploreItem, { backgroundColor: landmarkCardColor }]}
        onPress={() => handleLearnMorePress(item)}
      >
        <View style={styles.exploreItemImageContainer}>
          <Image source={item.image} style={styles.exploreItemImage} />
          <TouchableOpacity style={styles.favoriteIcon} onPress={() => handleFavoritePress(item.id)}>
            <MaterialIcons name={isFavorite ? 'favorite' : 'favorite-outline'} size={24} color={isFavorite ? highlightColor : 'white'} style={isFavorite && styles.glow} />
          </TouchableOpacity>
        </View>
        <View style={styles.exploreItemTextContainer}>
          <View style={styles.exploreItemTitleContainer}>
            <Text style={[styles.exploreItemTitle, { color: TextColor }]}>{item.title}</Text>
            <FontAwesome name="star" size={16} color={highlightColor} style={styles.ratingIcon} />
            <Text style={[styles.exploreItemRating, { color: TextColor }]}>{item.rating?.toFixed(1)}</Text>
          </View>
          <View style={styles.exploreItemDescriptionContainer}>
            <Text style={[styles.exploreItemDescription, { color: TextColor }]} numberOfLines={3} ellipsizeMode='tail'>{item.description}</Text>
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() => {
                if (isActiveDirectionLandmark) {
                  handleStartNavPress();
                } else {
                  handleDirectionsPress(item);
                }
              }}
            >
              <FontAwesome6
                name={isActiveDirectionLandmark ? "location-arrow" : "arrow-alt-circle-right"}
                size={24}
                color={highlightColor}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.learnMoreButton, { justifyContent: 'center', alignItems: 'center' }]} onPress={() => handleLearnMorePress(item)}>
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDirectionStep = ({ item }) => {
    let iconName = 'location-on';
    switch (item.icon) {
      case 'turn-left':
        iconName = 'turn-left';
        break;
      case 'turn-right':
        iconName = 'turn-right';
        break;
      case 'straight':
        iconName = 'arrow-upward';
        break;
      case 'slight-left':
        iconName = 'turn-slight-left';
        break;
      case 'slight-right':
        iconName = 'turn-slight-right';
        break;
    }
    return (
      <View style={styles.directionStepContainer}>
        <MaterialIcons name={iconName} size={24} color={highlightColor} />
        <Text style={[styles.directionStepText, { color: TextColor }]}>{item.instructions} ({item.distance})</Text>
      </View>
    );
  };

  const handleLandmarkButtonPress = () => {
    setIsSecondCardVisible(!isSecondCardVisible);
  };

  const addLandmarkToTour = async (landmark) => {
    try {
      const userLocation = await Location.getCurrentPositionAsync({});
      const origin = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };
      const destination = {
        latitude: landmark.coordinate.latitude,
        longitude: landmark.coordinate.longitude,
      };
  
      const newWaypoints = [...waypoints];
  
      // Check if the landmark is already in the waypoints
      const isLandmarkInTour = newWaypoints.some(
        waypoint => waypoint === `${landmark.coordinate.latitude},${landmark.coordinate.longitude}`
      );
  
      // Only add if the landmark is not already in the tour
      if (!isLandmarkInTour) {
        // Add the new landmark to the waypoints
        newWaypoints.push(`${landmark.coordinate.latitude},${landmark.coordinate.longitude}`);
        await fetchDirections(origin, destination, newWaypoints);
        setWaypoints(newWaypoints);
  
        // Do not update the currentDirectionsLandmarkId to keep the existing navigation target
        // setCurrentDirectionsLandmarkId(landmark.id);
  
        const zoomedRegion = {
          latitude: landmark.coordinate.latitude,
          longitude: landmark.coordinate.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        if (mapRef.current) {
          mapRef.current.animateToRegion(zoomedRegion, 1000);
        }
      } else {
        console.log('Landmark is already in the tour');
      }
    } catch (error) {
      console.error('Error adding landmark to tour:', error);
    }
  };  

  const removeLandmarkFromTour = async (landmark) => {
    try {
      const updatedWaypoints = waypoints.filter(
        waypoint => waypoint !== `${landmark.coordinate.latitude},${landmark.coordinate.longitude}`
      );
      setWaypoints(updatedWaypoints);

      if (currentDirectionsLandmarkId === landmark.id) {
        setCurrentDirectionsLandmarkId(null);
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      const origin = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };

      if (updatedWaypoints.length > 0) {
        const destination = {
          latitude: updatedWaypoints[updatedWaypoints.length - 1].split(',')[0],
          longitude: updatedWaypoints[updatedWaypoints.length - 1].split(',')[1],
        };
        await fetchDirections(origin, destination, updatedWaypoints);
      } else {
        setRouteCoordinates([]);
        setDirections([]);
      }
    } catch (error) {
      console.error('Error removing landmark from tour:', error);
    }
  };

  const renderLandmarkItem = ({ item }) => {
    if (item.id === initialNavigationLandmarkId) {
      return null;
    }

    const isActiveDirectionLandmark = waypoints.includes(`${item.coordinate.latitude},${item.coordinate.longitude}`) || currentDirectionsLandmarkId === item.id;

    return (
      <TouchableOpacity style={styles.landmarkItem} onPress={() => handleSelectLandmark(item)}>
        <Image source={item.image} style={styles.landmarkItemImage} />
        <Text style={[styles.landmarkItemText, { color: TextColor }]}>{item.title}</Text>
        <TouchableOpacity onPress={() => isActiveDirectionLandmark ? removeLandmarkFromTour(item) : addLandmarkToTour(item)}>
          <MaterialIcons name={isActiveDirectionLandmark ? "location-off" : "add-location"} size={30} color={highlightColor} style={styles.plusIcon} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const TourList = ({ waypoints, onRemoveLandmark }) => {
    return (
      <View style={[styles.tourList]}>
        <Text style={[styles.tourListTitle, { color: TextColor }]}>Current Tour</Text>
        {waypoints.map((waypoint, index) => {
          const landmark = landmarks.find(l => `${l.coordinate.latitude},${l.coordinate.longitude}` === waypoint);
          if (!landmark) return null;

          return (
            <View key={index} style={styles.tourItemContainer}>
              <Text style={[styles.tourItemText, { color: TextColor }]}>{landmark.title}</Text>
              <TouchableOpacity onPress={() => onRemoveLandmark(landmark)}>
                <MaterialIcons name="close" size={24} color="#ff0000" />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  const TourCard = () => {
    return (
      <View style={[styles.tourCard, { backgroundColor: BackgroundColor }]}>
        <TouchableOpacity style={[styles.tourExitButton, { borderColor: TextColor }]} onPress={() => setWaypoints([])}>
          <MaterialCommunityIcons name="close" size={24} color={TextColor} />
        </TouchableOpacity>
        <View style={styles.tourInfoContainer}>
          <Text style={[styles.tourText, { color: TextColor }]}>
            {remainingTime ? `ETA: ${remainingTime}` : 'Calculating ETA...'}
          </Text>
          <Text style={[styles.tourText, { color: TextColor }]}>
            {distanceToDestination ? `Distance: ${distanceToDestination}` : 'Calculating distance...'}
          </Text>
        </View>
        <TouchableOpacity style={styles.tourNavButton} onPress={handleStartNavPress}>
          <FontAwesome6 name="location-arrow" size={24} color='#00BF6E' />
        </TouchableOpacity>
      </View>
    );
  };

  const translateYTour = useSharedValue(screenHeight);

  const tourListAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateYTour.value }],
    };
  });

  const handleShowTourList = () => {
    translateYTour.value = withTiming(screenHeight * 0.6, { duration: 300 });
  };

  const handleHideTourList = () => {
    translateYTour.value = withTiming(screenHeight, { duration: 300 });
  };

  useEffect(() => {
    if (waypoints.length > 0) {
      handleShowTourList();
      setIsSearchBarVisible(false);
    } else {
      handleHideTourList();
      setIsSearchBarVisible(true);
    }
  }, [waypoints]);

  const [tourName, setTourName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSavePress = () => {
    setIsModalVisible(true);
  };

  const handleSaveTour = async () => {
    if (tourName.trim() !== '') {
      const newTour = {
        id: `${Date.now()}`,
        title: tourName,
        description: `Tour created on ${new Date().toLocaleDateString()}`,
        image: highlightedLandmark?.image || landmarks[0].image, // Use the first landmark image as a placeholder
        landmarks: waypoints.map((waypoint) => {
          const [latitude, longitude] = waypoint.split(',');
          return landmarks.find(
            (landmark) =>
              landmark.coordinate.latitude === parseFloat(latitude) &&
              landmark.coordinate.longitude === parseFloat(longitude)
          );
        }),
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
      } catch (error) {
        console.error('Error saving tour', error);
        Alert.alert('Error', 'Failed to save the tour.');
      }
    } else {
      Alert.alert('Error', 'Tour name cannot be empty.');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setTourName('');
  };

  const CafeMarker = () => (
    <View style={[styles.cafeMarkerContainer, { paddingTop: 6 }]}>
      <MaterialIcons name="local-cafe" size={18} color="white" />
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
            showsMyLocationButton={false}
            showsCompass={false}
            onPress={handleMapPress}
            onRegionChangeComplete={(region) => {
              setLocation(region);
              setZoomLevel(calculateZoomLevel(region.latitudeDelta));
              if (isCentered) {
                setIsCentered(false);
              }
            }}
            customMapStyle={colorScheme === 'light' ? lightMapStyle : darkMapStyle}
            rotateEnabled={true}
          >
            {landmarks.map((landmark: Landmark) => {
              const isActiveDirectionLandmark = waypoints.includes(`${landmark.coordinate.latitude},${landmark.coordinate.longitude}`) || currentDirectionsLandmarkId === landmark.id;
              return (
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
                        (highlightedLandmark?.id === landmark.id || isActiveDirectionLandmark) && styles.highlightedMarkerImage
                      ]}
                    />
                    {zoomLevel > 15 && (
                      <Text style={[styles.markerText, { color: TextColor }]}>{landmark.title}</Text>
                    )}
                  </View>
                </Marker>
              );
            })}
            {landmarks.map((landmark) =>
              landmark.nearbyPlaces?.map((place) => (
                zoomLevel > 13 && (
                  <Marker
                    key={place.id}
                    coordinate={place.coordinate}
                    onPress={() => Alert.alert("Cafe")}
                  >
                    <CafeMarker />
                  </Marker>
                )
              ))
            )}
            {routeCoordinates.length > 0 && (
              landmarks.map((landmark) => {
                return (
                  <Polyline
                    key={landmark.id}
                    coordinates={routeCoordinates}
                    strokeWidth={4}
                    strokeColor={highlightColor}
                    lineDashPattern={[20, 10]}
                  />
                );
              })
            )}
          </MapView>
        )}
        
        {!searchBarActive && (
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: backgroundColor }]}
            onPress={handleLocationPress}
          >
            {isCentered ? (
              <MaterialIcons name="my-location" size={24} color={highlightColor} />
            ) : (
              <MaterialIcons name="location-searching" size={24} color={highlightColor} />
            )}
          </TouchableOpacity>
        )}
        
        {waypoints.length > 0 && (
          <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: backgroundColor }]}
          onPress={handleSavePress}
        >
          <MaterialIcons name="save-alt" size={24} color={highlightColor} />
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: backgroundColor }]}>
            <Text style={styles.modalTitle}>Save Tour</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter tour name"
              placeholderTextColor="#00BF6E"
              value={tourName}
              onChangeText={setTourName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveTour}>
                <Text style={[styles.modalButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

        {!searchBarActive && !navigationMode && highlightedLandmark && (
          <View
            style={[styles.landmarkInfoCard, { backgroundColor: BackgroundColor }]}
          >
            <Image source={highlightedLandmark.image} style={styles.landmarkImage} />
            <View style={styles.landmarkTextContainer}>
              <Text style={[styles.landmarkTitle, { color: TextColor }]}>{highlightedLandmark.title}</Text>
              <Text style={[styles.landmarkDescription, { color: TextColor }]}>{truncateText(highlightedLandmark.description, 50)}</Text>
              <TouchableOpacity onPress={handleLandmarkCardPress} style={{ alignItems: 'center', marginTop: 10 }}>
                <Text style={[styles.learnMoreText, { color: 'lightgrey' }]}>See more ...</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeButtonCircle} onPress={handleCloseLandmarkCard}>
              <MaterialIcons name="close" size={28} color={highlightColor} />
            </TouchableOpacity>
            <Animated.View style={[animatedStyle]}>
              {directionButtonPressed && (waypoints.includes(`${highlightedLandmark.coordinate.latitude},${highlightedLandmark.coordinate.longitude}`) || currentDirectionsLandmarkId === highlightedLandmark.id) ? (
                <TouchableOpacity style={[styles.directionsButton, { backgroundColor: tintColor }]} onPress={handleStartNavPress}>
                  <View style={styles.iconWrapper}>
                    <FontAwesome6 name="location-arrow" size={24} color={highlightColor} />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.directionsButton]} onPress={() => handleDirectionsPress(highlightedLandmark)}>
                  <FontAwesome6 name="arrow-alt-circle-right" size={28} color={highlightColor} />
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        )}
        {navigationMode && (
          <>
            <Animated.View style={[styles.navigationCard, { backgroundColor: BackgroundColor }]}>
              
              <View style={styles.navigationInfoContainer}>
                <View style={styles.iconRow}>
                <TouchableOpacity
                  style={styles.iconButtonWithBackground}
                  onPress={() => setTransportMode('walking')}
                >
                  <FontAwesome6 name="person-walking" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconButtonWithBackground}
                    onPress={() => setTransportMode('bicycling')}
                  >
                    <MaterialIcons name="directions-bike" size={24} color="white" />
                  </TouchableOpacity>


                </View>
                <View style={styles.bottomRow}>
                  <TouchableOpacity style={[styles.exitButton, { borderColor: TextColor }]} onPress={handleExitNavPress}>
                    <MaterialCommunityIcons name="close" size={24} color={TextColor} />
                  </TouchableOpacity>
                  <Text style={[styles.navigationText, { color: TextColor }]}>
                    {remainingTime ? `ETA: ${remainingTime}` : 'Calculating ETA...'}
                  </Text>
                  <Text style={[styles.navigationText, { color: TextColor }]}>
                    {distanceToDestination ? `Distance: ${distanceToDestination}` : 'Calculating distance...'}
                  </Text>
                  <TouchableOpacity style={[styles.landmarkButton, { backgroundColor: directionsButtonColor }]} onPress={handleLandmarkButtonPress}>
                    <MaterialIcons name="add-location-alt" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
            {isSecondCardVisible && (
              <Animated.View style={[styles.secondCard, { backgroundColor: BackgroundColor }]}>
                <FlatList
                  data={landmarks}
                  keyExtractor={(item) => item.id}
                  renderItem={renderLandmarkItem}
                />
              </Animated.View>
            )}
            <View style={[styles.directionsContainer, { backgroundColor: landmarkCardColor }]}>
              <FlatList
                data={[directions[currentStepIndex]]}
                renderItem={renderDirectionStep}
                keyExtractor={(item) => item.key}
              />
            </View>
            {currentDirectionsLandmarkId && (
              <>
                <TouchableOpacity
                  style={[styles.currentLandmarkCard, { backgroundColor: BackgroundColor }]}
                  onPress={() => setIsCurrentLandmarkCardExpanded(!isCurrentLandmarkCardExpanded)}
                >
                  <Text style={[styles.currentLandmarkText, { color: TextColor }]}>
                    Navigating to: {landmarks.find(l => l.id === currentDirectionsLandmarkId)?.title}
                  </Text>
                  {isCurrentLandmarkCardExpanded && (
                    <FlatList
                      data={landmarksWithETA} // Use landmarksWithETA instead of waypoints
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <View style={styles.currentLandmarkItem}>
                          <Text style={[styles.currentLandmarkText, { color: TextColor }]}>
                            {item.title} - ETA: {item.eta ? item.eta : 'Calculating...'}
                          </Text>
                        </View>
                      )}
                    />
                  )}
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {navigationLandmarkCardVisible && navigationLandmark && (
          <Animated.View style={[styles.navigationLandmarkCard, { backgroundColor: BackgroundColor }]}>
            <View style={styles.navigationLandmarkCardContent}>
              <Text style={[styles.navigationLandmarkTitle, { color: TextColor }]}>
                {navigationLandmark.title}
              </Text>
              {!(waypoints.includes(`${navigationLandmark.coordinate.latitude},${navigationLandmark.coordinate.longitude}`) || currentDirectionsLandmarkId === navigationLandmark.id) && (
                <Text style={[styles.navigationLandmarkInfo, { color: TextColor }]}>
                  6 min • +1 min detour
                </Text>
              )}
              <View style={styles.navigationLandmarkCardButtons}>
                {(waypoints.includes(`${navigationLandmark.coordinate.latitude},${navigationLandmark.coordinate.longitude}`) || currentDirectionsLandmarkId === navigationLandmark.id) ? (
                  <>
                    <Text style={[styles.alreadyInTourText, { color: TextColor }]}>
                      This landmark is already part of your tour.
                    </Text>
                    <TouchableOpacity
                      style={[styles.navigationLandmarkCardButton, styles.dismissButton]}
                      onPress={() => setNavigationLandmarkCardVisible(false)}
                    >
                      <MaterialIcons name="close" size={24} color="white" />
                      <Text style={[styles.buttonText, styles.dismissButtonText]}>Dismiss</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.navigationLandmarkCardButton, styles.cancelButton]}
                      onPress={() => {
                        setNavigationLandmarkCardVisible(false);
                        setNavigationLandmark(null);
                        setHighlightedLandmark(null);
                      }}
                    >
                      <MaterialIcons name="close" size={24} color="white" />
                      <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.navigationLandmarkCardButton, styles.addButton]}
                      onPress={() => {
                        if (navigationLandmark) {
                          addLandmarkToTour(navigationLandmark);
                          setNavigationLandmarkCardVisible(false);
                          setNavigationLandmark(null);
                        }
                      }}
                    >
                      <MaterialIcons name="add-location-alt" size={24} color={highlightColor} />
                      <Text style={[styles.buttonText, styles.addButtonText]}>Add Stop</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        {!searchBarActive && !navigationMode && !highlightedLandmark && waypoints.length > 0 && (
          <View style={[styles.tourList, { backgroundColor: BackgroundColor }]}>
            <Text style={[styles.tourListTitle, { color: TextColor }]}>Current Tour</Text>
            {waypoints.map((waypoint, index) => {
              const landmark = landmarks.find(l => `${l.coordinate.latitude},${l.coordinate.longitude}` === waypoint);
              if (!landmark) return null;
              return (
                <View key={index} style={styles.tourItemContainer}>
                  <Text style={[styles.tourItemText, { color: TextColor }]}>{landmark.title}</Text>
                  <TouchableOpacity onPress={() => removeLandmarkFromTour(landmark)}>
                    <MaterialIcons name="close" size={20} color={highlightColor} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {!navigationMode && waypoints.length > 0 && (
          <View style={[styles.tourCardContainer, { backgroundColor: BackgroundColor }]}>
            <TourCard />
          </View>
        )}

        <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle, { backgroundColor: BackgroundColor, zIndex: 5 }]}>
          <PanGestureHandler onGestureEvent={handleSheetGesture} onHandlerStateChange={handleSheetClose}>
            <View style={styles.bottomSheetHandleWrapper}>
              <Animated.View style={[styles.bottomSheetHandle, { backgroundColor: bottomSheetHandleColor }]} />
            </View>
          </PanGestureHandler>
          <View style={styles.bottomSheetContent}>
            {highlightedLandmark && (
              <>
                <Image source={highlightedLandmark.image} style={styles.bottomSheetLandmarkImage} />
                <Text style={[styles.landmarkTitle, { color: TextColor }]}>{highlightedLandmark.title}</Text>
                <Text style={[styles.landmarkDescription, { color: TextColor }]}>{highlightedLandmark.description}</Text>
                <TouchableOpacity onPress={() => handleLearnMorePress(highlightedLandmark)}>
                  <Text style={[styles.learnMoreText]}>Learn more ...</Text>
                </TouchableOpacity>
                <View style={styles.bottomSheetIcons}>
                  <TouchableOpacity onPress={handleSharePress} style={styles.shareButton}>
                    <FontAwesome6 name="share" size={24} color={highlightColor} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Animated.View>
        {!searchBarActive && !navigationMode && (
          <Animated.View style={[styles.exploreSheet, exploreSheetAnimatedStyle, { backgroundColor: BackgroundColor, zIndex: 4, height: exploreSheetFullHeight }]}>
            <PanGestureHandler onGestureEvent={handleExploreSheetGesture} onHandlerStateChange={handleExploreSheetClose}>
              <View style={styles.bottomSheetHandleWrapper}>
                <Animated.View style={[styles.bottomSheetHandle, { backgroundColor: bottomSheetHandleColor }]} />
              </View>
            </PanGestureHandler>
            <View style={styles.exploreSheetContent}>
              <Text style={[styles.exploreHeaderText, { color: TextColor }]}>Explore</Text>
              <View style={styles.exploreFilterContainer}>
                <TouchableOpacity
                  style={[
                    styles.exploreFilterButton,
                    filter === 'Nearby' && styles.activeFilterButton,
                  ]}
                  onPress={() => setFilter('Nearby')}
                >
                  <Text style={[styles.exploreFilterText, filter === 'Nearby' && styles.activeFilterText]}>Nearby</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.exploreFilterButton,
                    filter === 'Popular' && styles.activeFilterButton,
                  ]}
                  onPress={() => setFilter('Popular')}
                >
                  <Text style={[styles.exploreFilterText, filter === 'Popular' && styles.activeFilterText]}>Popular</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.exploreFilterButton,
                    filter === 'Favorites' && styles.activeFilterButton,
                  ]}
                  onPress={() => setFilter('Favorites')}
                >
                  <Text style={[styles.exploreFilterText, filter === 'Favorites' && styles.activeFilterText]}>Favorites</Text>
                </TouchableOpacity>
              </View>
              {filter === 'Favorites' && filteredExploreLandmarks.length === 0 ? (
                <Text style={styles.noFavoritesText}>You have no favorites</Text>
              ) : (
                <FlatList
                  data={filteredExploreLandmarks}
                  renderItem={renderExploreItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.exploreListContentContainer}
                />
              )}
            </View>
          </Animated.View>
        )}
        {searchBarActive && (
          <TouchableWithoutFeedback onPress={handleOverlayPress}>
            <View style={styles.searchOverlay} />
          </TouchableWithoutFeedback>
        )}
        {!bottomSheetOpen && !navigationMode && isSearchBarVisible && (
          <View style={[styles.searchContainer, { backgroundColor: searchBarBackgroundColor }, (searchBarActive || exploreSheetOpen) ? styles.searchContainerActive : styles.searchContainerInactive]}>
            <TouchableOpacity style={styles.iconButton} onPress={handleSearchIconPress}>
              <FontAwesome5 name="search-location" size={20} color={TextColor} />
            </TouchableOpacity>
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: TextColor }]}
              placeholder="Search"
              placeholderTextColor={TextColor}
              value={search}
              onChangeText={(text) => setSearch(text)}
              onSubmitEditing={handleSearch}
              onFocus={() => setSearchBarActive(true)}
              onBlur={() => !search && setSearchBarActive(false)}
            />
            <TouchableOpacity style={styles.iconButton} onPress={handleToggleSearchBar}>
              <MaterialIcons name={searchBarActive ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color={TextColor} />
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
                    <Text style={[styles.searchResultText, { color: TextColor }]}>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={[styles.searchResultItem, { backgroundColor: searchBarBackgroundColor }]}>
                <Text style={[styles.searchResultText, { color: TextColor }]}>No landmarks found</Text>
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
    bottom: -75,
  },
  customMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00BF6E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00BF6E',
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
    borderColor: '#00BF6E',
  },
  markerText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  searchContainer: {
    position: 'absolute',
    top: 40, // Always stay at the top, adjust the value as needed
    left: 20,
    right: 20,
    borderRadius: 30,
    paddingHorizontal: 5,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 7, // Ensures it stays above other elements
  },
  searchContainerInactive: {
    top: 40,
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
    backgroundColor: 'rgb(0, 0, 0,)',
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
  locationButton: {
    position: 'absolute',
    bottom: 220,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  locationButtonActive: {
  },
  locationButtonInactive: {
  },
  landmarkInfoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    padding: 10,
    borderTopStartRadius: 30,
    borderTopEndRadius: 30,
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
    borderColor: '#00BF6E',
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
    borderRadius: 360,
    marginTop: 30,
  },
  iconWrapper: {
    marginRight: 2,
  },
  closeButtonCircle: {
    position: 'absolute',
    right: 12,
    top: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  bottomSheetIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  exploreSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  exploreItem: {
    marginBottom: 20,
    borderRadius: 10,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
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
  exploreItemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingIcon: {
    marginLeft: 15,
    marginRight: 5,
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
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: 'white',
  },
  exploreFilterText: {
    fontSize: 14,
    color: 'black',
  },
  activeFilterButton: {
    backgroundColor: '#00BF6E',
  },
  activeFilterText: {
    color: 'white',
  },
  noFavoritesText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'grey',
    marginTop: 20,
  },
  bottomSheetLandmarkImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
  },
  learnMoreButton: {
    alignItems: 'center',
  },
  learnMoreText: {
    color: '#00BF6E',
    fontSize: 16,
  },
  shareButton: {
    bottom: 30,
    marginLeft: 10,
  },
  navigationCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  navigationText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigationInfoContainer: {
    alignItems: 'center',
  },
  exitButton: {
    position: 'absolute',
    left: -20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 2,
  },
  landmarkButton: {
    position: 'absolute',
    right: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '110%',
    marginBottom: 20,
  },
  iconButtonWithBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BF6E', // Button background color
    padding: 10,
    marginHorizontal: 10, // Adds some spacing between the buttons
    borderRadius: 10, // Gives the buttons a rounded shape
  },
  bottomRow: {
    justifyContent: 'space-between',  // Space between the close button, ETA, and add-location-alt button
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,  // Adjust padding as needed
  },
  navigationLandmarkCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  navigationLandmarkCardContent: {
    alignItems: 'center',
    padding: 10,
    width: '100%',
  },
  navigationLandmarkTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  navigationLandmarkInfo: {
    fontSize: 16,
    marginVertical: 5,
  },
  navigationLandmarkCardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  navigationLandmarkCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
  },
  cancelButton: {
    backgroundColor: '#00BF6E',
  },
  addButton: {
    backgroundColor: '#ffffff',
    borderColor: '#00BF6E',
    borderWidth: 1,
  },
  buttonText: {
    marginLeft: 5,
    fontSize: 16,
  },
  addButtonText: {
    color: '#00BF6E',
  },
  cancelButtonText: {
    color: 'white',
  },
  alreadyInTourText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    left: 25,
  },
  dismissButton: {
    backgroundColor: '#00BF6E',
    top: 30,
    right: 15,
  },
  dismissButtonText: {
    color: 'white',
  },
  directionsContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  directionStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    flexWrap: 'wrap',
  },
  directionStepText: {
    marginLeft: 10,
    fontSize: 18,
    flexShrink: 1,
    flex: 1,
  },
  secondCard: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 250,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 0,
  },
  landmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    bottom: 5,
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  landmarkItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  landmarkItemText: {
    fontSize: 16,
  },
  cafeMarkerContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'tan',
    alignItems: 'center',
  },
  currentLandmarkCard: {
    position: 'absolute',
    width: '55%',
    top: 150,
    left: 20,
    right: 20,
    padding: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    textAlign: 'left',
    zIndex: 1,
  },
  currentLandmarkText: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'left',
  },
  currentLandmarkItem: {
    padding: 5,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    width: '100%',
    alignItems: 'flex-start',
  },
  tourList: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 15,
  },
  tourListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tourItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tourItemText: {
    fontSize: 16,
  },
  scanHelperButton: {
    position: 'absolute',
    top: 175,
    right: 20,
    borderRadius: 50,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tourCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  tourCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  tourText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tourInfoContainer: {
    alignItems: 'center',
  },
  tourExitButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 2,
  },
  tourNavButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00BF6E',
  },
  modalInput: {
    width: '100%',
    padding: 10,
    color: '#00BF6E',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#00BF6E',
  },
});

export default MapScreen;