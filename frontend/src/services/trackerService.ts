import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// Génération d'un identifiant de session unique pour chaque cycle de vie de l'app
let currentSessionId: string = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export interface TrackOptions {
  eventType?: 'screen_view' | 'click' | 'lesson' | 'quiz' | 'auth' | 'system' | string;
  screenName?: string;
  properties?: Record<string, any>;
  userId?: string | null;
}

/**
 * Service de traçabilité des événements utilisateur (façon Customer.io / Mixpanel).
 * Permet au backoffice de suivre les parcours, clics, réussites et abandons.
 */
class TrackerService {
  private sessionId: string = currentSessionId;
  private currentScreen: string | null = null;
  private cachedUserId: string | null = null;

  constructor() {
    // Écouter les changements d'authentification pour mettre à jour le userId en cache
    supabase.auth.onAuthStateChange((_event, session) => {
      this.cachedUserId = session?.user?.id ?? null;
    });
  }

  /**
   * Récupère l'ID de session courant
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Réinitialise la session (ex: à la déconnexion ou nouveau login)
   */
  public resetSession(): string {
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return this.sessionId;
  }

  /**
   * Enregistre un événement générique de manière asynchrone et non-bloquante
   */
  public async track(
    eventName: string,
    propertiesOrOptions: Record<string, any> = {}
  ): Promise<void> {
    try {
      const isConfigObject =
        'properties' in propertiesOrOptions ||
        'eventType' in propertiesOrOptions ||
        'screenName' in propertiesOrOptions ||
        'userId' in propertiesOrOptions;

      const uid = (isConfigObject ? propertiesOrOptions.userId : undefined) ?? this.cachedUserId;
      const screenName = (isConfigObject ? propertiesOrOptions.screenName : undefined) || this.currentScreen;
      const eventType = (isConfigObject ? propertiesOrOptions.eventType : undefined) || 'action';
      const userProps = isConfigObject ? (propertiesOrOptions.properties || {}) : propertiesOrOptions;

      const enrichedProperties = {
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
        ...userProps,
      };

      // Insertion asynchrone dans Supabase
      const { error } = await supabase.from('user_events').insert({
        user_id: uid,
        session_id: this.sessionId,
        event_type: eventType,
        event_name: eventName,
        screen_name: screenName,
        properties: enrichedProperties,
      });

      if (error) {
        // Log discret en dev sans interrompre l'app
        console.warn('[TrackerService] Échec du suivi:', error.message);
      }
    } catch (err) {
      console.warn('[TrackerService] Erreur inattendue:', err);
    }
  }

  /**
   * Suivi d'affichage d'un écran
   */
  public async trackScreen(screenName: string, properties: Record<string, any> = {}): Promise<void> {
    this.currentScreen = screenName;
    return this.track('screen_view', {
      eventType: 'screen_view',
      screenName,
      properties,
    });
  }

  /**
   * Suivi d'un clic ou d'une interaction UI spécifique
   */
  public async trackClick(elementName: string, properties: Record<string, any> = {}): Promise<void> {
    return this.track(elementName, {
      eventType: 'click',
      properties,
    });
  }

  /**
   * Suivi du flux pédagogique (leçons, quiz, exercices)
   */
  public async trackLessonEvent(
    action:
      | 'lesson_opened'
      | 'lesson_started'
      | 'lesson_completed'
      | 'lesson_abandoned'
      | 'question_answered'
      | 'screen_swiped'
      | 'screen_read'
      | 'quiz_started'
      | string,
    lessonId: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    return this.track(action, {
      eventType: 'lesson',
      properties: {
        lessonId,
        ...details,
      },
    });
  }
}

export const tracker = new TrackerService();
