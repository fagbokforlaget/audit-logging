import { AuditLogMessage, AuditLogOptions, AuditLogParams } from './interfaces';

export class AuditLog {
  constructor(private options: AuditLogOptions) {}

  message(
    params: AuditLogParams,
    overrides?: Partial<AuditLogOptions>,
  ): AuditLogMessage {
    const opts = { ...this.options, ...(overrides ?? {}) };
    return {
      actor: {
        type: opts.actorType,
        id: params.actorId,
      },
      service: {
        type: opts.service.type,
        id: opts.service.id,
      },
      action: {
        type: opts.actionType,
        verb: params.actionVerb,
      },
      object: {
        type: opts.objectType,
        id: params.objectId,
      },
      pii: params.pii,
      outcome: params.outcome,
      timestamp: padZeros(),
    };
  }
}

function padZeros(): string {
  const dates: string[] = new Date().toISOString().split('.');
  const fractionFormat = dates[1].slice(0, -1);
  dates[1] = `${fractionFormat}000Z`;

  return dates.join('.');
}
