import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  ChevronRight,
  FlaskConical,
  Heart,
  Info,
  LogOut,
  MessageSquareHeart,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  Volume2,
  X,
} from 'lucide-react-native';

import { useAuth } from '@/providers/AuthProvider';
import { useTutorial } from '@/providers/TutorialProvider';
import { useProgress } from '@/hooks/useProgress';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, user } = useAuth();
  const { data: progress } = useProgress();
  const { requestTutorial } = useTutorial();

  // Préférences utilisateur (états locaux pour le test)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Modal de feedback testeur
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const username = (user?.user_metadata?.username as string | undefined) || 'Explorateur';
  const email = user?.email || 'testeur@cezame.app';

  // 1. Réinitialisation complète pour les sessions de tests utilisateurs
  const handleResetForTesting = () => {
    Alert.alert(
      'Réinitialiser pour un nouveau test ?',
      'Cette action efface la progression des leçons, les badges et le bilan d\'onboarding afin de recommencer le parcours depuis le début.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            try {
              // Effacer les clés locales AsyncStorage
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter(
                (k) =>
                  k.startsWith('@cezame_') ||
                  k.startsWith('@tutorial_') ||
                  k === '@active_category'
              );
              if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);
              }

              // Si connecté sur Supabase, remettre à zéro
              if (session?.user?.id) {
                await supabase
                  .from('users')
                  .update({ is_onboarding_completed: false })
                  .eq('id', session.user.id);

                await supabase
                  .from('progress')
                  .update({ streak: 0, xp: 0, rank: 'bronze' })
                  .eq('user_id', session.user.id);

                // Mettre à jour le cache queryClient
                queryClient.setQueryData(['userProfile', session.user.id], (old: any) =>
                  old ? { ...old, is_onboarding_completed: false } : null
                );
              }

              // Invalider tous les caches React Query
              await queryClient.invalidateQueries();

              Alert.alert('Succès 🎉', 'Données de test réinitialisées ! Tu vas être redirigé vers l\'onboarding.');
              router.replace('/(onboarding)');
            } catch (err) {
              console.error('Erreur réinitialisation :', err);
              Alert.alert('Erreur', 'Impossible de réinitialiser toutes les données.');
            }
          },
        },
      ]
    );
  };

  // 2. Revoir le tutoriel pas à pas
  const handleReplayTutorial = () => {
    requestTutorial();
    router.replace('/(private)/categories');
  };

  // 3. Soumission du feedback utilisateur
  const handleSubmitFeedback = () => {
    if (!feedbackComment.trim() && rating === 0) {
      Alert.alert('Champ requis', 'Merci d\'indiquer une note ou un petit mot avant d\'envoyer.');
      return;
    }

    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackModalVisible(false);
      setFeedbackComment('');
      setRating(5);
      Alert.alert('Merci beaucoup ! 🙏', 'Ton retour a bien été enregistré. Il nous aide énormément à améliorer Cézame !');
    }, 900);
  };

  // 4. Déconnexion
  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Veux-tu vraiment te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => {
          supabase.auth.signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => router.push('/categories')}>
          <Image
            source={require('@/images/logo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
          <Text style={styles.logoText}>CEZAME</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* CARTE PROFIL RÉSUMÉ */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <UserRound size={32} color="#7C4DFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{username}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            <View style={styles.testerBadge}>
              <Sparkles size={12} color="#7C4DFF" />
              <Text style={styles.testerBadgeText}>Session Testeur MVP</Text>
            </View>
          </View>
        </View>

        {/* SECTION 1 : ZONE DE TESTS UTILISATEURS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <FlaskConical size={18} color="#7C4DFF" />
            <Text style={styles.sectionTitle}>Tests Utilisateurs & Démo</Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.row, styles.rowBorder]}
              onPress={handleResetForTesting}
              activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Trash2 size={18} color="#EF4444" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={[styles.rowTitle, { color: '#DC2626' }]}>
                  Réinitialiser le parcours de test
                </Text>
                <Text style={styles.rowSubtitle}>
                  Efface le bilan et repart de zéro (pour un autre testeur)
                </Text>
              </View>
              <ChevronRight size={18} color="#DC2626" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={handleReplayTutorial}
              activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: '#EDE4FF' }]}>
                <RotateCcw size={18} color="#7C4DFF" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Revoir le tutoriel interactif</Text>
                <Text style={styles.rowSubtitle}>
                  Relance les bulles d'aide guidées
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 2 : AVIS & FEEDBACK */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MessageSquareHeart size={18} color="#10B981" />
            <Text style={styles.sectionTitle}>Ton Avis de Testeur</Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => setFeedbackModalVisible(true)}
              activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
                <Heart size={18} color="#059669" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Donner mon avis sur Cézame</Text>
                <Text style={styles.rowSubtitle}>
                  Partage tes impressions, ce qui t'a plu ou bloqué
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 3 : PRÉFÉRENCES */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Bell size={18} color="#64748B" />
            <Text style={styles.sectionTitle}>Préférences</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.row, styles.rowBorder]}>
              <View style={[styles.iconContainer, { backgroundColor: '#F1F5F9' }]}>
                <Volume2 size={18} color="#475569" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Effets sonores & animations</Text>
                <Text style={styles.rowSubtitle}>Confettis et retours visuels</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#E2E8F0', true: '#A8EA73' }}
                thumbColor={soundEnabled ? '#1A1A1A' : '#FFFFFF'}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.iconContainer, { backgroundColor: '#F1F5F9' }]}>
                <Bell size={18} color="#475569" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Rappels quotidiens</Text>
                <Text style={styles.rowSubtitle}>Notification pour garder ta série</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E2E8F0', true: '#A8EA73' }}
                thumbColor={notificationsEnabled ? '#1A1A1A' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* SECTION 4 : À PROPOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Info size={18} color="#64748B" />
            <Text style={styles.sectionTitle}>À propos de Cézame</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.row, styles.rowBorder]}>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Version</Text>
                <Text style={styles.rowSubtitle}>1.0.0 (Build MVP - Projet PIE)</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Mission Cézame</Text>
                <Text style={styles.rowSubtitle}>
                  Rendre l'autonomie administrative et financière accessible et ludique pour tous les jeunes.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* DÉCONNEXION */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* MODAL DE FEEDBACK TESTEUR */}
      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ton avis compte énormément ! ✨</Text>
              <TouchableOpacity
                onPress={() => setFeedbackModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Comment évalues-tu ton expérience globale sur Cézame ?
            </Text>

            {/* SÉLECTEUR D'ÉTOILES */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starTouch}>
                  <Star
                    size={32}
                    color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                    fill={star <= rating ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>
              Qu'as-tu pensé des leçons ? As-tu rencontré des points de blocage ?
            </Text>
            <TextInput
              style={styles.feedbackInput}
              multiline
              numberOfLines={4}
              placeholder="Ex : J'ai adoré les explications avec Rico, mais la question sur les impôts était un peu floue..."
              placeholderTextColor="#94A3B8"
              value={feedbackComment}
              onChangeText={setFeedbackComment}
            />

            <TouchableOpacity
              style={[
                styles.modalSubmitButton,
                feedbackSubmitted && { opacity: 0.6 },
              ]}
              onPress={handleSubmitFeedback}
              disabled={feedbackSubmitted}>
              <Text style={styles.modalSubmitButtonText}>
                {feedbackSubmitted ? 'Envoi en cours...' : 'Envoyer mes retours'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F5F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E7E7E7',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7C4DFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  content: {
    padding: 18,
    gap: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDE4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
  },
  testerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
  },
  testerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C4DFF',
  },
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTextContainer: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    paddingRight: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  starTouch: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 20,
  },
  modalSubmitButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSubmitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
