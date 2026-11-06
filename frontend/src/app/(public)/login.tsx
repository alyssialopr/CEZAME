import { useEffect, useState } from 'react';
import {
  Alert,
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
import { Link, RelativePathString } from 'expo-router';
import { Mail, Lock, LogIn, FlaskConical, User, ArrowRight, Sparkles } from 'lucide-react-native';

import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import { getLastTesterName, signInAsTester } from '@/services/authService';

export default function LoginScreen() {
  const [testerName, setTesterName] = useState('');
  const [testerLoading, setTesterLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Pré-remplir le dernier nom de testeur utilisé
  useEffect(() => {
    getLastTesterName().then((savedName) => {
      if (savedName) setTesterName(savedName);
    });
  }, []);

  async function handleTesterLogin() {
    if (!testerName.trim()) {
      Alert.alert('Nom requis', 'Merci de renseigner ton nom ou prénom pour débuter la session de test.');
      return;
    }

    setTesterLoading(true);
    const result = await signInAsTester(testerName);
    if (!result.success && result.error) {
      Alert.alert('Erreur', result.error);
    }
    setTesterLoading(false);
  }

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Erreur', error.message);
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
            {/* En-tête */}
            <View style={styles.header}>
              <Image
                source={require("@/images/RicoHappy.svg")}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.title}>CEZAME</Text>
              <Text style={styles.subtitle}>Phase de Test Utilisateur</Text>
            </View>

            {/* CARTE CONNEXION RAPIDE TESTEUR (1 clic avec nom uniquement) */}
            <View style={styles.testerCard}>
              <View style={styles.testerBadgeRow}>
                <View style={styles.testerBadge}>
                  <FlaskConical size={14} color="#1D8271" />
                  <Text style={styles.testerBadgeText}>ACCÈS TESTEUR RAPIDE</Text>
                </View>
                <Sparkles size={16} color="#DBBA3E" />
              </View>

              <Text style={styles.testerTitle}>Participer au test</Text>
              <Text style={styles.testerDesc}>
                Entre simplement ton nom ou prénom pour commencer le parcours sans mot de passe :
              </Text>

              <View style={styles.testerInputContainer}>
                <User color="#1D8271" size={20} />
                <TextInput
                  style={styles.input}
                  testID="tester-name-input"
                  placeholder="Ex : Camille, Lucas, Sarah..."
                  placeholderTextColor="#8E929A"
                  value={testerName}
                  onChangeText={setTesterName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.testerButton, testerLoading && styles.buttonDisabled]}
                testID="tester-login-button"
                onPress={handleTesterLogin}
                disabled={testerLoading || loading}
              >
                <Text style={styles.testerButtonText}>
                  {testerLoading ? 'CRÉATION DE LA SESSION...' : 'COMMENCER LE TEST'}
                </Text>
                <ArrowRight color="#FFFFFF" size={18} />
              </TouchableOpacity>
            </View>

            {/* SÉPARATEUR */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OU CONNEXION COMPTE</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* FORMULAIRE CLASSIQUE EMAIL / MOT DE PASSE */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Mail color="#60646C" size={20} />
                <TextInput
                  style={styles.input}
                  testID="email-input"
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
                  testID="password-input"
                  placeholder="Mot de passe"
                  placeholderTextColor="#60646C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                testID="email-login-button"
                onPress={signInWithEmail}
                disabled={loading || testerLoading}
              >
                <LogIn color="#3A6F1E" size={20} />
                <Text style={styles.buttonText}>
                  {loading ? 'CONNEXION...' : 'SE CONNECTER'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Pas encore de compte classique ?</Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>S'inscrire</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#FBFAF8',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 84,
    height: 84,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#60646C',
  },
  testerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#91C85A',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#91C85A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  testerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  testerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF8EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  testerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D8271',
    letterSpacing: 0.5,
  },
  testerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  testerDesc: {
    fontSize: 13,
    color: '#555A63',
    lineHeight: 18,
    marginBottom: 14,
  },
  testerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFAF8',
    borderWidth: 2,
    borderColor: '#D7E9D1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
    marginBottom: 12,
  },
  testerButton: {
    backgroundColor: '#1D8271',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1D8271',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  testerButtonText: {
    fontWeight: '800',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  separatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  form: {
    gap: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
  },
  button: {
    backgroundColor: '#A8EA73',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontWeight: '800',
    fontSize: 15,
    color: '#3A6F1E',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#60646C',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D8271',
  },
});
