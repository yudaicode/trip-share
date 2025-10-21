import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.title}>🌏 タビネタ</Text>
        <Text style={styles.subtitle}>旅行プランを作成・共有しよう</Text>
      </View>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✨</Text>
          <Text style={styles.featureTitle}>旅行プラン作成</Text>
          <Text style={styles.featureText}>簡単に旅行プランを作成</Text>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureIcon}>👥</Text>
          <Text style={styles.featureTitle}>シェア機能</Text>
          <Text style={styles.featureText}>友達とプランを共有</Text>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🌍</Text>
          <Text style={styles.featureTitle}>発見</Text>
          <Text style={styles.featureText}>他の人のプランを探索</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>はじめる</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  features: {
    flex: 1,
    justifyContent: 'center',
  },
  feature: {
    alignItems: 'center',
    marginBottom: 30,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
