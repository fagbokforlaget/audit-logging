import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MetadataKey } from './audit-logging.interfaces';
import { ActionVerb, AuditLog, AuditLogParams, Outcome } from '../..';
import { AuditLoggerParams } from './audit-logging.decorator';
import { AuditLogOptions } from '../interfaces';
import { BaseAuditLogger, Transport } from '../audit-logger';

@Injectable()
export class AuditLoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(BaseAuditLogger) private auditLog: BaseAuditLogger,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const auditLogOpts = this.reflector.get<AuditLoggerParams>(
      MetadataKey.AuditParams,
      context.getHandler(),
    );

    return next.handle().pipe(
      catchError((err) => {
        const errorHandler = auditLogOpts.errorTypes.filter(
          (eh) => err instanceof eh,
        )[0];
        if (errorHandler) {
          this.auditLog.log(
            { ...auditLogOpts, outcome: Outcome.FAILURE },
            request,
          );
        }
        throw err;
      }),
      tap(() => {
        this.auditLog.log(
          { ...auditLogOpts, outcome: Outcome.SUCCESS },
          request,
        );
      }),
    );
  }
}
