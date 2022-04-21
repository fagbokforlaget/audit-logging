import { v4 as uuid4 } from 'uuid';
import { AuditLog } from './audit-log.model';
import {
  ActionVerb,
  Outcome,
  AuditLogParams,
  ActionType,
  ActorType,
  ServiceType,
  ObjectType,
} from './interfaces';

jest
  .useFakeTimers('modern')
  .setSystemTime(new Date('2022-03-16T11:01:58.135Z'));

describe('AuditLog Message', () => {
  describe('given valid params', () => {
    const log = new AuditLog({
      actionType: ActionType.Object,
      actorType: ActorType.Eportal,
      service: { type: ServiceType.App, id: 'edtech.namespace' },
      objectType: ObjectType.ErudioNamespace,
    });
    const actorId = uuid4();
    const params: AuditLogParams = {
      actorId,
      actionVerb: ActionVerb.MODIFIED,
      outcome: Outcome.SUCCESS,
      objectId: uuid4(),
      pii: [],
    };

    it('has correct timestamp output', () => {
      const message = log.message(params);

      expect(message.timestamp).toEqual('2022-03-16T11:01:58.135000Z');
      expect(message.outcome).toEqual('success');
      expect(message.action.verb).toEqual('modified');
    });
  });
});
