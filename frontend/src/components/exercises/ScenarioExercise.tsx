import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Briefcase,
  User,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import { ScenarioData, ScenarioOption } from '@/types/lesson';

interface ScenarioExerciseProps {
  data: ScenarioData;
  selectedOptionId: string | null;
  isRevealed: boolean;
  onSelectOption: (option: ScenarioOption) => void;
}

export function ScenarioExercise({
  data,
  selectedOptionId,
  isRevealed,
  onSelectOption,
}: ScenarioExerciseProps) {
  // Parsing défensif des données
  let effectiveData: ScenarioData;
  try {
    if (typeof data === 'string') {
      effectiveData = JSON.parse(data);
    } else if (Array.isArray(data)) {
      effectiveData = (data as any)[0] || {};
    } else if (data && typeof data === 'object') {
      effectiveData = (data as any).scenario || data;
    } else {
      effectiveData = {} as ScenarioData;
    }
  } catch {
    effectiveData = (data as any) || {};
  }

  const context =
    effectiveData?.context ||
    "Lucas vient de recevoir une facture imprévue de 90 € alors qu'il ne lui reste que 40 € sur son compte avant sa paie dans une semaine.";

  const persona = effectiveData?.persona;
  const keyFacts = Array.isArray(effectiveData?.keyFacts) ? effectiveData.keyFacts : [];

  const rawOptions = Array.isArray(effectiveData?.options) ? effectiveData.options : [];
  const options: ScenarioOption[] =
    rawOptions.length > 0
      ? rawOptions
      : [
          {
            id: '1',
            text: "Contacter le créancier pour demander un étalement ou un report de prélèvement",
            correct: true,
            consequence: "Très bon réflexe ! La plupart des organismes acceptent un délai si on les prévient en amont.",
          },
          {
            id: '2',
            text: "Laisser passer le prélèvement quitte à être à découvert et payer des agios",
            correct: false,
            consequence: "Attention : un découvert non autorisé englobe des frais de rejet élevés et des commissions d'intervention.",
          },
          {
            id: '3',
            text: "Souscrire un mini-crédit express en ligne avec intérêts élevés",
            correct: false,
            consequence: "Risque de surendettement : les crédits conso rapides ont des taux d'intérêt souvent supérieurs à 15-20%.",
          },
        ];

  return (
    <View style={styles.container}>
      {/* Badge En-tête Cas Pratique */}
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Briefcase size={13} color="#2563EB" />
          <Text style={styles.badgeText}>CAS PRATIQUE • MISE EN SITUATION</Text>
        </View>

        {persona?.name ? (
          <View style={styles.personaBadge}>
            <User size={12} color="#475569" />
            <Text style={styles.personaText}>
              {persona.name} {persona.role ? `• ${persona.role}` : ''}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Carte du Contexte / Scénario */}
      <View style={styles.contextCard}>
        <View style={styles.contextHeader}>
          <Info size={16} color="#3B82F6" />
          <Text style={styles.contextTitle}>La Situation</Text>
        </View>

        <Text style={styles.contextText}>{context}</Text>

        {/* Faits clés / Indicateurs si présents */}
        {keyFacts.length > 0 && (
          <View style={styles.keyFactsRow}>
            {keyFacts.map((fact, idx) => (
              <View key={idx} style={styles.factPill}>
                <Text style={styles.factLabel}>{fact.label} :</Text>
                <Text style={styles.factValue}>{fact.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Consigne d'action */}
      <Text style={styles.decisionPrompt}>
        Quelle décision conseilles-tu dans cette situation ?
      </Text>

      {/* Choix des décisions */}
      <View style={styles.optionsList}>
        {options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.correct;
          const showSuccess = isRevealed && isCorrect;
          const showFailure = isRevealed && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={option.id || idx}
              activeOpacity={0.85}
              disabled={isRevealed}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                showSuccess && styles.optionCardCorrect,
                showFailure && styles.optionCardWrong,
              ]}
              testID={`scenario-option-${option.id || idx}`}
              onPress={() => onSelectOption(option)}
            >
              <View style={styles.optionMainRow}>
                {/* Pastille lettre ou icône de résultat */}
                <View
                  style={[
                    styles.letterPill,
                    isSelected && styles.letterPillSelected,
                    showSuccess && styles.letterPillCorrect,
                    showFailure && styles.letterPillWrong,
                  ]}
                >
                  {showSuccess ? (
                    <CheckCircle2 size={16} color="#FFFFFF" />
                  ) : showFailure ? (
                    <AlertTriangle size={16} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.letterText,
                        isSelected && styles.letterTextSelected,
                      ]}
                    >
                      {letter}
                    </Text>
                  )}
                </View>

                {/* Texte de l'option */}
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionText,
                      showSuccess && styles.optionTextCorrect,
                      showFailure && styles.optionTextWrong,
                    ]}
                  >
                    {option.text}
                  </Text>
                </View>
              </View>

              {/* Révélation de la conséquence pédagogique après validation */}
              {isRevealed && (isSelected || isCorrect) && option.consequence ? (
                <View
                  style={[
                    styles.consequenceBox,
                    isCorrect ? styles.consequenceBoxCorrect : styles.consequenceBoxWrong,
                  ]}
                >
                  <Text
                    style={[
                      styles.consequenceTitle,
                      isCorrect ? styles.consequenceTitleCorrect : styles.consequenceTitleWrong,
                    ]}
                  >
                    {isCorrect ? '✅ Impact / Bonne décision :' : '⚠️ Conséquence / Risque :'}
                  </Text>
                  <Text
                    style={[
                      styles.consequenceText,
                      isCorrect ? styles.consequenceTextCorrect : styles.consequenceTextWrong,
                    ]}
                  >
                    {option.consequence}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  personaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  personaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  contextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  contextTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#334155',
    fontWeight: '500',
  },
  keyFactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  factPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  factLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  factValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  decisionPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFC',
  },
  optionCardCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  optionCardWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  letterPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  letterPillSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  letterPillCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  letterPillWrong: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  letterText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  letterTextSelected: {
    color: '#FFFFFF',
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '600',
    color: '#1E293B',
  },
  optionTextCorrect: {
    color: '#065F46',
    fontWeight: '700',
  },
  optionTextWrong: {
    color: '#991B1B',
    fontWeight: '700',
  },
  consequenceBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  consequenceBoxCorrect: {
    borderTopColor: '#BBF7D0',
  },
  consequenceBoxWrong: {
    borderTopColor: '#FECACA',
  },
  consequenceTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  consequenceTitleCorrect: {
    color: '#059669',
  },
  consequenceTitleWrong: {
    color: '#DC2626',
  },
  consequenceText: {
    fontSize: 12,
    lineHeight: 17,
  },
  consequenceTextCorrect: {
    color: '#047857',
  },
  consequenceTextWrong: {
    color: '#B91C1C',
  },
});
