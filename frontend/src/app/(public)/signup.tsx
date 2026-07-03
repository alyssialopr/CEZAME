import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Mail, Lock, UserPlus, User as UserIcon } from 'lucide-react-native';

import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (error) {
      Alert.alert('Erreur', error.message);
    } else if (!session) {
      Alert.alert('Vérifie tes emails', 'Un lien de confirmation a été envoyé !');
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("@/images/RicoHappy.svg")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Rejoins-nous !</Text>
          <Text style={styles.subtitle}>Crée ton compte CEZAME</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <UserIcon color="#60646C" size={20} />
            <TextInput
              style={styles.input}
              placeholder="Pseudo"
              placeholderTextColor="#60646C"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail color="#60646C" size={20} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#60646C"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock color="#60646C" size={20} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#60646C"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={signUpWithEmail}
            disabled={loading}
          >
            <UserPlus color="#3A6F1E" size={20} />
            <Text style={styles.buttonText}>
              {loading ? 'INSCRIPTION...' : "S'INSCRIRE"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ?</Text>
          <Link href="/(public)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFAF8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#60646C',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  button: {
    backgroundColor: '#A8EA73',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontWeight: '800',
    fontSize: 16,
    color: '#3A6F1E',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 6,
  },
  footerText: {
    fontSize: 15,
    color: '#60646C',
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D8271',
  },
});
