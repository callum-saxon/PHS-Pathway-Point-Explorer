import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/useThemeColor';  // Import theme color hook
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing high scores
import { quizzes } from '../../components/quizData'; // Import quiz data

const getTodayDayNumber = () => {
  const now = new Date();
  return now.getDate();
};

export default function QuizGridScreen() {
  const [dayNumber, setDayNumber] = useState(1);
  const [highScores, setHighScores] = useState({});
  const navigation = useNavigation();
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme();

  useEffect(() => {
    const todayDayNumber = getTodayDayNumber();
    setDayNumber(todayDayNumber);
    fetchHighScores();
  }, []);

  const fetchHighScores = async () => {
    try {
      const storedScores = await AsyncStorage.getItem('quizHighScores');
      if (storedScores) {
        setHighScores(JSON.parse(storedScores));
      }
    } catch (error) {
      console.error('Error fetching high scores:', error);
    }
  };

  const handleQuizPress = (quizName) => {
    navigation.navigate('screens/quizScreen', { quizName });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchHighScores();
    });

    return unsubscribe;
  }, [navigation]);

  const renderQuizItem = ({ item, index }) => {
    const quizUnlocked = index + 1 <= dayNumber;
    const highScore = highScores[item.name] || 0;

    return (
      <TouchableOpacity
        style={[styles.quizButton, quizUnlocked ? styles.unlockedQuiz : styles.lockedQuiz]}
        onPress={() => quizUnlocked && handleQuizPress(item.name)}
        disabled={!quizUnlocked}
      >
        <Text style={styles.quizText}>{item.name}</Text>
        <Text style={styles.quizStatus}>{quizUnlocked ? 'Unlocked' : 'Locked'}</Text>
        {quizUnlocked && <Text style={styles.highScore}>High Score: {highScore}</Text>}
      </TouchableOpacity>
    );
  };

  const quizzesData = Object.keys(quizzes).map((quizName) => ({
    name: quizName,
  }));

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.headerText}>Daily Quizzes</Text>
      <FlatList
        data={quizzesData}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.name}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    top: 10,
  },
  quizButton: {
    flex: 1,
    margin: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  unlockedQuiz: {
    backgroundColor: '#121212',
    borderColor: 'white',
    borderWidth: 1,
  },
  lockedQuiz: {
    backgroundColor: '#d3d3d3',
  },
  quizText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  quizStatus: {
    fontSize: 12,
    color: '#fff',
    marginTop: 10,
  },
  highScore: {
    marginTop: 5,
    fontSize: 16,
    color: '#fff',
  },
});
