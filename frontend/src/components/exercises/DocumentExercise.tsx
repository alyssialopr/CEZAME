import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, FileText, X } from 'lucide-react-native';
import { DocumentField } from '@/types/lesson';

interface DocumentExerciseProps {
  fields: DocumentField[];
  documentTitle?: string;
  selectedFieldId: string | null;
  isRevealed: boolean;
  onSelectField: (field: DocumentField) => void;
  disabled?: boolean;
}

export function DocumentExercise({
  fields,
  documentTitle,
  selectedFieldId,
  isRevealed,
  onSelectField,
  disabled = false,
}: DocumentExerciseProps) {
  const safeFields = Array.isArray(fields) ? fields : [];

  return (
    <View style={styles.container}>
      {/* Simulation Document Papier Authentique */}
      <View style={styles.documentCard}>
        {/* En-tête officiel du document */}
        <View style={styles.documentHeader}>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconBadge}>
              <FileText size={18} color="#2563EB" />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.documentTitle} numberOfLines={1}>
                {documentTitle || 'Document officiel'}
              </Text>
              <Text style={styles.documentSubtitle}>RÉPUBLIQUE FRANÇAISE • EXTRAIT CERTIFIÉ</Text>
            </View>
          </View>
          <View style={styles.stampBadge}>
            <Text style={styles.stampText}>OFFICIEL</Text>
          </View>
        </View>

        <View style={styles.dashedDivider} />

        {/* Consigne d'inspection */}
        <View style={styles.instructionBanner}>
          <Text style={styles.instructionText}>
            {isRevealed
              ? 'Analyse du document terminée :'
              : 'Inspecte le document et touche la ligne ciblée :'}
          </Text>
        </View>

        {/* Lignes du document */}
        <View style={styles.fieldsList}>
          {safeFields.map((field, index) => {
            const isSelected = selectedFieldId === field.id;
            const isCorrect = Boolean(field.correct);
            const isCorrectRevealed = isRevealed && isCorrect;
            const isWrongRevealed = isRevealed && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={field.id || `field-${index}`}
                activeOpacity={0.8}
                disabled={isRevealed || disabled}
                testID={`document-field-${field.id || index}`}
                onPress={() => onSelectField(field)}
                style={[
                  styles.fieldRow,
                  isSelected && styles.fieldRowSelected,
                  isCorrectRevealed && styles.fieldRowCorrect,
                  isWrongRevealed && styles.fieldRowWrong,
                ]}
              >
                <View style={styles.fieldLeft}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      (isCorrectRevealed || isWrongRevealed) && styles.fieldLabelActive,
                    ]}
                  >
                    {field.label}
                  </Text>
                  {field.hint && isRevealed && (
                    <Text style={styles.fieldHint}>{field.hint}</Text>
                  )}
                </View>

                <View style={styles.fieldRight}>
                  <Text
                    style={[
                      styles.fieldValue,
                      isCorrectRevealed && styles.fieldValueCorrect,
                      isWrongRevealed && styles.fieldValueWrong,
                    ]}
                  >
                    {field.value}
                  </Text>

                  {isRevealed && (
                    <View
                      style={[
                        styles.statusBadge,
                        isCorrect && styles.statusBadgeCorrect,
                        !isCorrect && isSelected && styles.statusBadgeWrong,
                      ]}
                    >
                      {isCorrect ? (
                        <Check size={14} color="#FFFFFF" />
                      ) : isSelected ? (
                        <X size={14} color="#FFFFFF" />
                      ) : null}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pied du document avec faux tampon de certification */}
        <View style={styles.documentFooter}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Visa pour authentification</Text>
          </View>
          <View style={styles.securitySeal}>
            <Text style={styles.securitySealText}>RÉF-DOC • 2026-FR</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  documentSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  stampBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    transform: [{ rotate: '-6deg' }],
  },
  stampText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 0.8,
  },
  dashedDivider: {
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  instructionBanner: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  instructionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  fieldsList: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  fieldRowSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  fieldRowCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  fieldRowWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldLeft: {
    flex: 1,
    paddingRight: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  fieldLabelActive: {
    fontWeight: '800',
  },
  fieldHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  fieldRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  fieldValueCorrect: {
    color: '#065F46',
    fontWeight: '900',
  },
  fieldValueWrong: {
    color: '#991B1B',
    fontWeight: '800',
  },
  statusBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeCorrect: {
    backgroundColor: '#10B981',
  },
  statusBadgeWrong: {
    backgroundColor: '#EF4444',
  },
  documentFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  signatureBlock: {
    width: 130,
  },
  signatureLine: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#94A3B8',
  },
  securitySeal: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  securitySealText: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#64748B',
    fontWeight: 'bold',
  },
});
