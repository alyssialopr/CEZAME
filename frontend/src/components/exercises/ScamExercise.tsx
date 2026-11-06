import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, Check, CheckCircle2, MessageSquare, ShieldAlert, ShieldCheck, X } from 'lucide-react-native';
import { ScamData } from '@/types/lesson';

interface ScamExerciseProps {
  data: ScamData;
  userChoice: boolean | null; // true = arnaque, false = authentique
  isRevealed: boolean;
  onChoose: (choseScam: boolean) => void;
  disabled?: boolean;
}

export function ScamExercise({
  data,
  userChoice,
  isRevealed,
  onChoose,
  disabled = false,
}: ScamExerciseProps) {
  // Support à la fois objet, chaîne JSON (Supabase/AsyncStorage) ou tableau
  let parsed: any = data;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = {};
    }
  }
  if (Array.isArray(parsed)) {
    parsed = parsed[0] || {};
  }
  if (!parsed || typeof parsed !== 'object') {
    parsed = {};
  }

  const isActualScam = Boolean(parsed.isScam !== undefined ? parsed.isScam : parsed.scam);
  const isUserCorrect = isRevealed && userChoice === isActualScam;
  const redFlags = Array.isArray(parsed.redFlags) ? parsed.redFlags : (Array.isArray(parsed.flags) ? parsed.flags : []);
  const senderText = parsed.sender || parsed.from || 'Expéditeur inconnu';
  const messageText = parsed.message || parsed.text || parsed.body || parsed.content || 'ALERTE : Veuillez vérifier vos accès immédiatement.';
  const channel = parsed.channel || 'sms';

  const isSocialMedia =
    channel === 'social' ||
    channel === 'network' ||
    senderText.includes('(@') ||
    senderText.toLowerCase().includes('crypto') ||
    /réseau social|telegram|instagram|tiktok|snapchat/i.test(messageText);

  const channelLabel = isSocialMedia
    ? 'Message sur réseau social'
    : channel === 'email'
    ? 'E-mail reçu'
    : channel === 'notification'
    ? 'Notification d’application'
    : 'SMS / Message texte';

  return (
    <View style={styles.container}>
      {/* Simulation Message Smartphone */}
      <View style={styles.phoneScreen}>
        {/* Barre d'en-tête du message */}
        <View style={styles.phoneHeader}>
          <View style={styles.senderAvatar}>
            <MessageSquare size={16} color="#475569" />
          </View>
          <View style={styles.senderInfo}>
            <Text style={styles.senderName} numberOfLines={1}>
              {senderText}
            </Text>
            <Text style={styles.messageChannel}>{channelLabel}</Text>
          </View>
        </View>

        {/* Bulle de message réaliste */}
        <View style={styles.bubbleContainer}>
          <View style={styles.speechBubble}>
            <Text style={styles.bubbleMessageText}>{messageText}</Text>
            <Text style={styles.bubbleTime}>Aujourd'hui • 10:42</Text>
          </View>
        </View>
      </View>

      <Text style={styles.instruction}>
        {isRevealed
          ? 'Verdict de la détection :'
          : 'D’après toi, ce message est-il authentique ou s’agit-il d’une arnaque ?'}
      </Text>

      {/* Boutons d'action : Arnaque vs Authentique */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isRevealed || disabled}
          onPress={() => onChoose(true)}
          style={[
            styles.choiceButton,
            styles.scamButton,
            userChoice === true && styles.choiceButtonSelected,
            isRevealed && isActualScam && styles.buttonCorrectScam,
            isRevealed && userChoice === true && !isActualScam && styles.buttonWrongSelection,
          ]}
        >
          <ShieldAlert size={20} color={isRevealed && isActualScam ? '#FFFFFF' : '#DC2626'} />
          <Text
            style={[
              styles.choiceButtonText,
              { color: isRevealed && isActualScam ? '#FFFFFF' : '#991B1B' },
            ]}
          >
            C'EST UNE ARNAQUE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isRevealed || disabled}
          onPress={() => onChoose(false)}
          style={[
            styles.choiceButton,
            styles.legitButton,
            userChoice === false && styles.choiceButtonSelected,
            isRevealed && !isActualScam && styles.buttonCorrectLegit,
            isRevealed && userChoice === false && isActualScam && styles.buttonWrongSelection,
          ]}
        >
          <ShieldCheck size={20} color={isRevealed && !isActualScam ? '#FFFFFF' : '#059669'} />
          <Text
            style={[
              styles.choiceButtonText,
              { color: isRevealed && !isActualScam ? '#FFFFFF' : '#065F46' },
            ]}
          >
            C'EST AUTHENTIQUE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cartouche d'indices suspects révélés */}
      {isRevealed && (
        <View
          style={[
            styles.resultCard,
            isUserCorrect ? styles.resultCardSuccess : styles.resultCardDanger,
          ]}
        >
          <View style={styles.resultHeader}>
            {isUserCorrect ? (
              <CheckCircle2 size={18} color="#059669" />
            ) : (
              <AlertTriangle size={18} color="#DC2626" />
            )}
            <Text
              style={[
                styles.resultTitle,
                { color: isUserCorrect ? '#065F46' : '#991B1B' },
              ]}
            >
              {isUserCorrect
                ? isActualScam
                  ? '🎯 Bien vu, c’est bien une tentative d’arnaque !'
                  : '🎯 Exact, ce message provient bien de la source officielle.'
                : isActualScam
                ? '⚠️ Piège ! Il s’agissait bien d’une arnaque.'
                : '⚠️ Attention, ce message était en réalité authentique.'}
            </Text>
          </View>

          {isActualScam && redFlags.length > 0 && (
            <View style={styles.redFlagsList}>
              <Text style={styles.redFlagsHeader}>Indices qui ne trompent pas :</Text>
              {redFlags.map((flag: string, idx: number) => (
                <View key={idx} style={styles.redFlagRow}>
                  <Text style={styles.redFlagBullet}>🚨</Text>
                  <Text style={styles.redFlagText}>{flag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  phoneScreen: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#334155',
    marginBottom: 12,
  },
  phoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 12,
  },
  senderAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  messageChannel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  bubbleContainer: {
    alignItems: 'flex-start',
  },
  speechBubble: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderTopLeftRadius: 4,
    padding: 12,
    maxWidth: '92%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  bubbleMessageText: {
    fontSize: 13,
    color: '#F1F5F9',
    lineHeight: 18,
    fontWeight: '500',
  },
  bubbleTime: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  instruction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 2,
  },
  scamButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  legitButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  choiceButtonSelected: {
    borderWidth: 2.5,
  },
  buttonCorrectScam: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
  },
  buttonCorrectLegit: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  buttonWrongSelection: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  choiceButtonText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  resultCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  resultCardSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  resultCardDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECDD3',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  redFlagsList: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FECDD3',
  },
  redFlagsHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 6,
  },
  redFlagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  redFlagBullet: {
    fontSize: 11,
  },
  redFlagText: {
    flex: 1,
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 16,
    fontWeight: '600',
  },
});
