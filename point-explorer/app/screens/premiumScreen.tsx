// PremiumScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function PremiumScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.headerText}>Choose Your Premium Plan</ThemedText>

      {/* Premium Plan 1 */}
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.planTitle}>Basic Plan</ThemedText>
        <ThemedText type="default" style={styles.planDescription}>
          Access to basic quizzes, and limited Ai use.
          This is what you currenlty have.
        </ThemedText>
        <ThemedText type="default" style={styles.planPrice}>Free</ThemedText>
      </ThemedView>

      {/* Premium Plan 2 */}
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.planTitle}>Premium Plan</ThemedText>
        <ThemedText type="default" style={styles.planDescription}>
          Includes everything in Basic plus: Advanced features and quizzes, access to save custom tours for later, exclusive tours and unlimted usage of the Robin Ai Tour Guide.
        </ThemedText>
        <ThemedText type="default" style={styles.planPrice}>£6.99/month</ThemedText>
        <TouchableOpacity style={styles.selectButton}>
          <ThemedText type="button" style={styles.selectButtonText}>Select Plan</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Premium Plan 3 */}
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.planTitle}>Pro Plan</ThemedText>
        <ThemedText type="default" style={styles.planDescription}>
          Full access to all quizzes, premium content, and advanced features. With only a one time payment.
        </ThemedText>
        <ThemedText type="default" style={styles.planPrice}>£17.49 Single Payment</ThemedText>
        <TouchableOpacity style={styles.selectButton}>
          <ThemedText type="button" style={styles.selectButtonText}>Select Plan</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  planDescription: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: '#00BF6E',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
