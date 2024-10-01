import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing high scores
import { quizzes } from '../../components/quizData'; // Import quiz data

export default function QuizScreen() {
  const route = useRoute(); // Get the quiz name from navigation
  const navigation = useNavigation(); // Use navigation for going back
  const { quizName } = route.params; 
  const currentQuiz = quizzes[quizName];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  useEffect(() => {
    if (currentQuiz) {
      const options = [...currentQuiz[currentQuestionIndex].options];
      setShuffledOptions(shuffleArray(options)); // Shuffle the options
    }
  }, [currentQuestionIndex]);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleAnswerPress = (answer) => {
    const isCorrect = answer === currentQuiz[currentQuestionIndex].correctAnswer;
    let newScore = score;
    if (isCorrect) {
      newScore += 1;
      setScore(newScore);
    }

    setSelectedAnswer(answer);

    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestionIndex < currentQuiz.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        saveHighScore(newScore);
      }
    }, 1000);
  };

  const saveHighScore = async (finalScore) => {
    try {
      const storedScores = await AsyncStorage.getItem('quizHighScores');
      let highScores = storedScores ? JSON.parse(storedScores) : {};
      const previousHighScore = highScores[quizName] || 0;

      if (finalScore > previousHighScore && finalScore > 0) {
        highScores[quizName] = finalScore;
        await AsyncStorage.setItem('quizHighScores', JSON.stringify(highScores));
        Alert.alert(
          'Quiz Completed!',
          `New high score: ${finalScore}/${currentQuiz.length}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Quiz Completed!',
          `Your score: ${finalScore}/${currentQuiz.length}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  if (!quizName || !quizzes[quizName]) {
    return <Text>No quiz data available.</Text>;
  }

  const currentQuestion = currentQuiz[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{currentQuestion.question}</Text>
      {shuffledOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            selectedAnswer === option && option === currentQuestion.correctAnswer && styles.correctAnswer,
            selectedAnswer === option && option !== currentQuestion.correctAnswer && styles.incorrectAnswer,
          ]}
          onPress={() => handleAnswerPress(option)}
          disabled={selectedAnswer !== null}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  question: {
    color: '#00BF6E',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#e6e6e6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 18,
    textAlign: 'center',
  },
  correctAnswer: {
    backgroundColor: '#00BF6E',
  },
  incorrectAnswer: {
    backgroundColor: '#f44336',
  },
});
