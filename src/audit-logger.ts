import { AuditLog } from './audit-log.model';
import {
  ActionVerb,
  AuditLogOptions,
  AuditLogParams,
  Outcome,
  PII,
} from './interfaces';

export type Transport = {
  log: (subject: string, payload: any) => Promise<any> | any;
};

export interface AuditLoggerParams {
  actorIdGetter: (req: any) => string | number;
  objectIdGetter: (req: any) => string | number;
  action: ActionVerb;
  pii?: PII[];
  outcome: Outcome;
  overrides?: Partial<AuditLogOptions>;
}

export class BaseAuditLogger {
  constructor(
    private subject: string,
    private auditLog: AuditLog,
    private transport: Transport,
  ) {}

  async log(
    params: AuditLoggerParams,
    request: Record<string, unknown>,
  ): Promise<void> {
    const options: AuditLogParams = {
      actorId: params.actorIdGetter(request),
      actionVerb: params.action,
      objectId: params.objectIdGetter(request),
      outcome: params.outcome,
      pii: params.pii ?? [],
    };

    this.transport.log(
      this.subject,
      this.auditLog.message(options, params.overrides),
    );
  }
}
