import { AuditLog } from '../src/audit-log.model';
import {
  AuditLoggerParams,
  BaseAuditLogger,
  Transport,
} from '../src/audit-logger';
import {
  ActionVerb,
  Outcome,
  ActionType,
  ActorType,
  ServiceType,
  ObjectType,
} from '../src/interfaces';

jest
  .useFakeTimers('modern')
  .setSystemTime(new Date('2022-03-16T11:01:58.135Z'));

class TestTransport implements Transport {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log(subject: string, payload: any): void {
    return;
  }
}

describe('BaseAuditLoger', () => {
  const subject = 'test.subject';
  const message = {
    action: {
      type: ActionType.Object,
      verb: ActionVerb.MODIFIED,
    },
    actor: {
      id: 1,
      type: ActorType.Eportal,
    },
    object: {
      id: 2,
      type: ObjectType.FacebookUser,
    },
    outcome: Outcome.SUCCESS,
    pii: [],
    service: {
      id: 'service.id',
      type: ServiceType.App,
    },
    timestamp: '2022-03-16T11:01:58.135000Z',
  };

  const auditLog = new AuditLog({
    actionType: message.action.type,
    actorType: message.actor.type,
    service: message.service,
    objectType: message.object.type,
  });

  const params: AuditLoggerParams = {
    actorIdGetter: () => message.actor.id,
    objectIdGetter: () => message.object.id,
    action: message.action.verb,
    outcome: message.outcome,
    pii: [],
  };

  const transport = new TestTransport();

  describe('given valid params', () => {
    let baseAuditLogger: BaseAuditLogger;
    beforeEach(() => {
      jest.spyOn(transport, 'log');
      jest.spyOn(auditLog, 'message');
      baseAuditLogger = new BaseAuditLogger(subject, auditLog, transport);
      baseAuditLogger.log(params, {});
    });

    it('log has been called', () => {
      expect(transport.log).toHaveBeenCalled();
    });

    it('auditLog builder has been called', async () => {
      expect(auditLog.message).toHaveBeenCalled();
    });

    it('log correct message', async () => {
      expect(transport.log).toHaveBeenCalledWith('test.subject', message);
    });
  });
});
