import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import * as Speech from 'expo-speech'; // Import expo-speech

export default function ChatScreen() {
  const navigation = useNavigation(); // Use navigation hook here
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textbox = useThemeColor({}, 'textbox');
  const highlightColor = useThemeColor({}, 'highlight');
  const buttonColor = useThemeColor({}, 'background');
  const buttonTextColor = useThemeColor({}, 'highlight');
  const textColor = useThemeColor({}, 'darkText');
  const lightTextColor = useThemeColor({}, 'text');
  const aiMessageBackground = useThemeColor({}, 'aiMessageBackground');

  const handleSend = async () => {
    if (inputText.trim()) {
      const userMessage = { id: Date.now(), text: inputText, type: 'user' };
      setMessages([...messages, userMessage]);
      setInputText('');
      setIsLoading(true);

      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a digital tour guide specifically for areas in and around Nottingham. Your responses must be short, to the point, and directly related to Nottingham's local attractions, landmarks, and history.

                If a user asks about areas outside of Nottingham, politely inform them that your expertise is focused on Nottingham and redirect the conversation back to Nottingham-related topics.

                Ensure all information provided is accurate and up-to-date. If you are unsure about certain details, express uncertainty rather than providing incorrect information.

                If a user's request is unclear or ambiguous, ask clarifying questions to better understand their needs.

                Avoid any disallowed content and adhere strictly to all content policies. Do not provide inappropriate or unrelated information.

                Keep your responses concise and relevant to the user's query. Use polite and user-friendly language, especially when handling errors or misunderstandings.

                When users repeat questions, provide additional information or a different perspective to enhance the conversation.

                Use culturally sensitive and inclusive language at all times.

                Provide disclaimers when necessary, such as suggesting users verify event times or opening hours that may change.

                If a user makes a disallowed request, politely decline and guide the conversation back to acceptable topics.

                Always maintain a polite and professional tone throughout the interaction.`,
              },
              ...messages.map((msg) => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.text,
              })),
              { role: 'user', content: inputText },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer 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',
            },
          }
        );

        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.choices[0].message.content.trim(),
          type: 'ai',
        };

        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error('Error fetching AI response:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now() + 1,
            text: 'Sorry, there was an error processing your request.',
            type: 'ai',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePlayAudio = (text) => {
    Speech.stop(); // Stop any existing speech
    Speech.speak(text, {
      language: 'en-GB',
    });
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            navigation.goBack(); // Add navigation code here
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Robin AI</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
        {dropdownVisible && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              onPress={() => {
                /* Add dropdown action here */
              }}
            >
              <Text style={styles.dropdownItem}>Option 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                /* Add dropdown action here */
              }}
            >
              <Text style={styles.dropdownItem}>Option 2</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.scrollViewContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.type === 'user' ? styles.userMessage : styles.aiMessage,
              {
                backgroundColor:
                  message.type === 'user' ? highlightColor : aiMessageBackground,
                borderColor:
                  message.type === 'user' ? highlightColor : aiMessageBackground,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.messageText,
                { color: message.type === 'user' ? textColor : lightTextColor },
              ]}
            >
              {message.text}
            </ThemedText>
            {message.type === 'ai' && (
              <TouchableOpacity
                onPress={() => handlePlayAudio(message.text)}
                style={styles.speakerIconContainer}
              >
                <Ionicons name="volume-high" size={24} color={buttonTextColor} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {isLoading && <ActivityIndicator size="small" color={buttonColor} />}
      </ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={[styles.inputContainer, { borderTopColor: highlightColor }]}
      >
        <TextInput
          style={[
            styles.textInput,
            { backgroundColor: textbox, color: lightTextColor },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor={'#909090'}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: buttonColor }]}
          onPress={handleSend}
        >
          <MaterialIcons name="send" size={24} color={buttonTextColor} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  iconButton: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scrollViewContent: {
    paddingBottom: 50,
    paddingTop: 20,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 25,
    maxWidth: '80%',
    position: 'relative',
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 5,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  speakerIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    padding: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  textInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 15,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
