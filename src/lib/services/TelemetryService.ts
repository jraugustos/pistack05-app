/**
 * TelemetryService
 * Serviço básico de telemetria para rastrear eventos do canvas
 * 
 * Eventos importantes (conforme PRD):
 * - template_selected
 * - idea_base_created
 * - checklist_click_stage
 * - card_generated(mode)
 * - card_confirmed
 * - workplan_enabled
 * - output_generated(type)
 */

export interface TelemetryEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
  userId?: string;
  projectId?: string;
}

class TelemetryServiceClass {
  private enabled: boolean = true;
  private queue: TelemetryEvent[] = [];

  /**
   * Track um evento
   */
  track(event: string, properties?: Record<string, any>, context?: { userId?: string; projectId?: string }) {
    if (!this.enabled) return;

    const telemetryEvent: TelemetryEvent = {
      event,
      properties: properties || {},
      timestamp: new Date().toISOString(),
      userId: context?.userId,
      projectId: context?.projectId,
    };

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry]', telemetryEvent);
    }

    // Adicionar à fila
    this.queue.push(telemetryEvent);

    // TODO: Integrar com serviço de analytics real (Mixpanel, Amplitude, etc)
    // this.flush();
  }

  /**
   * Eventos específicos do Canvas
   */
  templateSelected(templateId: string, context?: { userId?: string; projectId?: string }) {
    this.track('template_selected', { template_id: templateId }, context);
  }

  ideaBaseCreated(projectId: string, context?: { userId?: string }) {
    this.track('idea_base_created', { project_id: projectId }, { ...context, projectId });
  }

  checklistClickStage(stageKey: string, typeKey: string, context?: { userId?: string; projectId?: string }) {
    this.track('checklist_click_stage', { stage_key: stageKey, type_key: typeKey }, context);
  }

  cardGenerated(cardId: string, mode: 'generate' | 'expand' | 'review', context?: { userId?: string; projectId?: string }) {
    this.track('card_generated', { card_id: cardId, mode }, context);
  }

  cardConfirmed(cardId: string, typeKey: string, context?: { userId?: string; projectId?: string }) {
    this.track('card_confirmed', { card_id: cardId, type_key: typeKey }, context);
  }

  workplanEnabled(readyCardsCount: number, context?: { userId?: string; projectId?: string }) {
    this.track('workplan_enabled', { ready_cards_count: readyCardsCount }, context);
  }

  outputGenerated(type: 'work-plan' | 'prd' | 'prompt-pack', context?: { userId?: string; projectId?: string }) {
    this.track('output_generated', { output_type: type }, context);
  }

  /**
   * Flush events para backend (stub)
   */
  private async flush() {
    if (this.queue.length === 0) return;

    // TODO: Enviar para endpoint de telemetria
    // await fetch('/api/telemetry', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events: this.queue }),
    // });

    this.queue = [];
  }

  /**
   * Habilitar/desabilitar telemetria
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Obter fila atual (para debug)
   */
  getQueue() {
    return [...this.queue];
  }
}

// Singleton
export const TelemetryService = new TelemetryServiceClass();

