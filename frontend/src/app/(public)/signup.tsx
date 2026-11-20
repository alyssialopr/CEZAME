import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Mail, Lock, UserPlus, User as UserIcon, FlaskConical } from 'lucide-react-native';

import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'info'; message: string } | null>(null);

  async function signUpWithEmail() {
    setLoading(true);
    setFeedback(null);
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

    // Alert.alert ne s'affiche pas sur le web : le retour est affiché sous le formulaire.
    if (error) {
      setFeedback({ kind: 'error', message: error.message });
    } else if (!session) {
      setFeedback({ kind: 'info', message: 'Vérifie tes emails : un lien de confirmation a été envoyé !' });
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
             <View style={styles.brandRow}>
              <Image
                source={require("@/images/logo-horizontal.png")}
                style={styles.brandLogo}
                contentFit="contain"
              />
            </View>
          <Image
            source={require("@/images/RicoHappy.svg")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Rejoins-nous !</Text>
          <Text style={styles.subtitle}>Crée ton compte CEZAME</Text>
        </View>

          <Link href="/login" asChild>
          <TouchableOpacity style={styles.testerBanner}>
            <FlaskConical size={16} color="#1D8271" />
            <Text style={styles.testerBannerText}>
              Testeur ? <Text style={{ textDecorationLine: 'underline', fontWeight: '800' }}>Rejoins avec ton prénom ici</Text>
            </Text>
          </TouchableOpacity>
        </Link>

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

          {feedback && (
            <Text
              testID="signup-feedback"
              accessibilityRole="alert"
              style={[styles.feedback, feedback.kind === 'error' ? styles.feedbackError : styles.feedbackInfo]}
            >
              {feedback.message}
            </Text>
          )}

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
            <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  feedback: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  feedbackError: {
    color: '#D93025',
  },
  feedbackInfo: {
    color: '#1D8271',
  },
  container: {
    flex: 1,
    backgroundColor: '#FBFAF8',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  brandLogo: {
    width: 132,
    height: 46,
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
  testerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EAF8EE',
    borderWidth: 1.5,
    borderColor: '#91C85A',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  testerBannerText: {
    fontSize: 13,
    color: '#1D8271',
    fontWeight: '600',
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
