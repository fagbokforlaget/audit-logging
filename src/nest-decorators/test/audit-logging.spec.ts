import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  ActionType,
  ActorType,
  ObjectType,
  ServiceType,
} from '../../interfaces';
import { AuditLog } from '../../audit-log.model';
import { TestErrorHandler } from './error.handler';
import { AuditLoggingInterceptor } from '../audit-logging.interceptor';
import { BaseAuditLogger } from '../../audit-logger';
import { TestController } from './test.controller';

describe('AuditLog (e2e)', () => {
  let app: INestApplication;
  let interceptor: AuditLoggingInterceptor;
  let auditLog: AuditLog;

  beforeEach(async () => {
    jest
      .useFakeTimers('modern')
      .setSystemTime(new Date('2022-03-16T11:01:58.135Z'));
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
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
          useFactory: (auditLog: AuditLog) => {
            return new BaseAuditLogger(
              'test.one.two',
              auditLog,
              console as undefined,
            );
          },
          inject: [AuditLog],
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
