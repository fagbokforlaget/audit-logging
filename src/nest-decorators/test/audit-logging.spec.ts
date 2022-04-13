import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestController } from './test.controller-old';
import { NatsClientModule } from '../../../../nats-client/nats-client.module';
import { NatsClientService } from '../../../../nats-client/nats-client.service';
import {
  ActionType,
  ActionVerb,
  ActorType,
  ObjectType,
  Outcome,
  ServiceType,
} from '../../interfaces';
import { AuditLog } from '../../audit-log.model';
import { TestErrorHandler } from './error.handler';
import { AuditLoggingInterceptor } from '../audit-logging.interceptor';
import { BaseAuditLogger } from '../../audit-logger';
import { TestController } from './test.controller';

jest.mock('../../../../../src/nats-client/nats-client.service');

describe('AuditLog (e2e)', () => {
  let app: INestApplication;
  let interceptor: AuditLoggingInterceptor;
  let auditLog: AuditLog;

  beforeEach(async () => {
    jest
      .useFakeTimers('modern')
      .setSystemTime(new Date('2022-03-16T11:01:58.135Z'));
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NatsClientModule],
      controllers: [TestController],
      providers: [
        NatsClientService,
        AuditLoggingInterceptor,
        {
          provide: AuditLog,
          useValue: new AuditLog({
            actionType: ActionType.Object,
            actorType: ActorType.Eportal,
            service: { type: ServiceType.App, id: 'test.service' },
            objectType: ObjectType.ErudioNamespace,
          }),
        },
        {
          provide: BaseAuditLogger,
          useFactory: (transport: NatsClientService, auditLog: AuditLog) => {
            return new BaseAuditLogger('test.one.two', auditLog, transport);
          },
          inject: [NatsClientService, AuditLog],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new TestErrorHandler());
    interceptor = app.get<AuditLoggingInterceptor>(AuditLoggingInterceptor);
    auditLog = app.get<AuditLog>(AuditLog);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("interceptor's error handler", () => {
    it('should be called succesfully', async () => {
      await request(app.getHttpServer()).get('/test/error/2');
    });
  });
});
