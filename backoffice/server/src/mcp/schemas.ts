import { z } from 'zod';

export const EXERCISE_TYPES = [
  'qcm',
  'order',
  'matching',
  'document',
  'bucket',
  'scam',
  'scenario',
] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const ScreenInputSchema = z.object({
  title: z.string().trim().min(1, 'Le titre de la fiche est requis').max(160),
  body: z.string().trim().min(1, 'Le contenu de la fiche est requis').max(2000),
  tip: z.string().trim().max(500).nullable().optional(),
  order_index: z.number().int().positive().optional(),
});

const QcmOptionSchema = z.object({
  letter: z.string().trim().min(1).max(3),
  text: z.string().trim().min(1),
  correct: z.boolean().optional(),
});

const OrderItemSchema = z.object({
  id: z.string().trim().min(1),
  text: z.string().trim().min(1),
});

const MatchingPairSchema = z.object({
  id: z.string().trim().min(1),
  left: z.string().trim().min(1),
  right: z.string().trim().min(1),
});

const DocumentFieldSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
  correct: z.boolean().optional(),
});

const BucketOptionsSchema = z.object({
  buckets: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        label: z.string().trim().min(1),
        color: z.string().trim().min(1),
      })
    )
    .min(2, 'Au moins 2 bacs sont requis'),
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        text: z.string().trim().min(1),
        bucketId: z.string().trim().min(1),
      })
    )
    .min(2, 'Au moins 2 éléments à trier sont requis'),
});

const ScamOptionsSchema = z.object({
  sender: z.string().trim().min(1),
  channel: z.enum(['sms', 'email', 'whatsapp', 'call', 'web']),
  message: z.string().trim().min(1),
  isScam: z.boolean(),
  redFlags: z.array(z.string().trim().min(1)).default([]),
});

const ScenarioOptionsSchema = z.object({
  context: z.string().trim().min(1),
  persona: z.object({
    name: z.string().trim().min(1),
    role: z.string().trim().min(1),
  }),
  keyFacts: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        value: z.string().trim().min(1),
      })
    )
    .default([]),
  options: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        text: z.string().trim().min(1),
        correct: z.boolean(),
        consequence: z.string().trim().min(1),
      })
    )
    .min(2, 'Au moins 2 choix de scénario sont requis'),
});

const BaseQuestionFields = {
  category: z.string().trim().min(1, 'La sous-catégorie de la question est requise').max(120),
  prompt: z.string().trim().min(1, "L'énoncé de la question est requis").max(600),
  explanation: z.string().trim().min(1, "L'explication pédagogique est requise").max(1000),
  order_index: z.number().int().positive().optional(),
};

export const QuestionInputSchema = z.discriminatedUnion('type', [
  z.object({
    ...BaseQuestionFields,
    type: z.literal('qcm'),
    options: z
      .array(QcmOptionSchema)
      .min(2, 'Un QCM doit contenir au moins 2 options')
      .refine((opts) => opts.some((o) => o.correct === true), {
        message: 'Au moins une option du QCM doit avoir correct: true',
      }),
  }),
  z.object({
    ...BaseQuestionFields,
    type: z.literal('order'),
    options: z.array(OrderItemSchema).min(2, 'Un exercice order doit contenir au moins 2 étapes'),
  }),
  z.object({
    ...BaseQuestionFields,
    type: z.literal('matching'),
    options: z.array(MatchingPairSchema).min(2, 'Un exercice matching doit contenir au moins 2 paires'),
  }),
  z.object({
    ...BaseQuestionFields,
    type: z.literal('document'),
    options: z
      .array(DocumentFieldSchema)
      .min(2, 'Un exercice document doit contenir au moins 2 lignes')
      .refine((fields) => fields.some((f) => f.correct === true), {
        message: 'Au moins une ligne du document doit avoir correct: true',
      }),
  }),
  z.object({
    ...BaseQuestionFields,
    type: z.literal('bucket'),
    options: BucketOptionsSchema.refine(
      (data) => {
        const bucketIds = new Set(data.buckets.map((b) => b.id));
        return data.items.every((item) => bucketIds.has(item.bucketId));
      },
      { message: 'Chaque item bucket doit référencer un bucketId existant' }
    ),
  }),
  z.object({
    ...BaseQuestionFields,
    type: z.literal('scam'),
    options: ScamOptionsSchema,
  }),
  z.object({
    ...BaseQuestionFields,
    type: z.literal('scenario'),
    options: ScenarioOptionsSchema.refine(
      (data) => data.options.some((opt) => opt.correct === true),
      { message: 'Au moins une option de scénario doit avoir correct: true' }
    ),
  }),
]);

export const LessonDraftPayloadSchema = z.object({
  title: z.string().trim().min(1, 'Le titre de la leçon est requis').max(160),
  xp_reward: z.number().int().min(10).max(500).default(50),
  screens: z.array(ScreenInputSchema).min(1, 'Au moins une fiche de cours est requise'),
  questions: z.array(QuestionInputSchema).min(1, 'Au moins une question est requise'),
});

export type LessonDraftPayload = z.infer<typeof LessonDraftPayloadSchema>;

export function validateLessonPayload(payload: unknown) {
  const parsed = LessonDraftPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      valid: false as const,
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.') || 'root',
        message: issue.message,
      })),
    };
  }

  const warnings: string[] = [];
  parsed.data.screens.forEach((screen, idx) => {
    if (screen.body.length > 600) {
      warnings.push(
        `Fiche #${idx + 1} ("${screen.title}") : texte long (${screen.body.length} caractères), pense à rester concis pour mobile.`
      );
    }
  });

  return {
    valid: true as const,
    data: parsed.data,
    warnings,
  };
}

export const EXERCISE_TYPES_REFERENCE = {
  qcm: {
    description: 'Question à choix multiples (A, B, C...)',
    optionsExample: [
      { letter: 'A', text: 'Réponse correcte', correct: true },
      { letter: 'B', text: 'Mauvaise réponse' },
      { letter: 'C', text: 'Autre mauvaise réponse' },
    ],
  },
  order: {
    description: "Remettre les étapes dans l'ordre chronologique",
    optionsExample: [
      { id: '1', text: 'Première étape' },
      { id: '2', text: 'Deuxième étape' },
      { id: '3', text: 'Troisième étape' },
    ],
  },
  matching: {
    description: 'Associer chaque élément de gauche à son équivalent à droite',
    optionsExample: [
      { id: '1', left: 'Carte Vitale', right: 'Télétransmission des soins' },
      { id: '2', left: 'Mutuelle', right: 'Complète le remboursement Sécu' },
    ],
  },
  document: {
    description: "Décryptage d'un document (bulletin de paie, ordonnance, bail...) : l'apprenant touche la ligne demandée",
    optionsExample: [
      { id: '1', label: 'Salaire brut', value: '2 150,00 €' },
      { id: '2', label: 'Net payé en euros', value: '1 677,00 €', correct: true },
    ],
  },
  bucket: {
    description: 'Tri en bacs (classer des éléments dans des catégories)',
    optionsExample: {
      buckets: [
        { id: 'b1', label: 'Besoins (50%)', color: '#3B82F6' },
        { id: 'b2', label: 'Envies (30%)', color: '#8B5CF6' },
      ],
      items: [
        { id: '1', text: 'Loyer', bucketId: 'b1' },
        { id: '2', text: 'Cinéma', bucketId: 'b2' },
      ],
    },
  },
  scam: {
    description: "Détecteur d'arnaque (SMS, email, WhatsApp, appel, web)",
    optionsExample: {
      sender: 'Alerte-Banque (+33 7 45 12 98 23)',
      channel: 'sms',
      message: 'ALERTE : Cliquez ici pour annuler un paiement de 489 €...',
      isScam: true,
      redFlags: [
        'Une banque ne demande jamais de cliquer sur un lien par SMS',
        'Numéro de portable individuel (07)',
      ],
    },
  },
  scenario: {
    description: 'Cas pratique / mise en situation avec persona, faits clés et conséquences par choix',
    optionsExample: {
      context: 'Maxime, 21 ans, a 35 € sur son compte et une facture de 55 € arrive dans 3 jours.',
      persona: { name: 'Maxime', role: 'Apprenti 21 ans' },
      keyFacts: [
        { label: 'Solde', value: '35 €' },
        { label: 'Facture', value: '55 €' },
      ],
      options: [
        {
          id: 'opt1',
          text: "Demander un report d'échéance au fournisseur",
          correct: true,
          consequence: 'Les fournisseurs décalent facilement un prélèvement si on prévient avant.',
        },
        {
          id: 'opt2',
          text: 'Laisser le prélèvement être rejeté',
          correct: false,
          consequence: 'Tu risques des frais bancaires de rejet.',
        },
      ],
    },
  },
};
