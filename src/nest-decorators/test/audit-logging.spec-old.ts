// TODO: merge with new specs

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
          provide: 'AuditLoggingTransport',
          useExisting: NatsClientService,
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
    beforeEach(() => {
      jest.spyOn(interceptor, 'errorHandler');
      jest.spyOn(interceptor, 'emitAuditMessage');
    });
    it('should be called succesfully', async () => {
      await request(app.getHttpServer()).get('/test/success/2');
      // .expect(HttpStatus.OK);
      expect(interceptor.errorHandler).not.toHaveBeenCalled();
      expect(interceptor.emitAuditMessage).toHaveBeenCalled();
    });
  });

  describe("interceptor's error handler", () => {
    beforeEach(() => {
      jest.spyOn(interceptor, 'errorHandler');
      jest.spyOn(interceptor, 'emitAuditMessage');
    });
    it('should catch TestError type', async () => {
      await request(app.getHttpServer())
        .get('/test/error/2')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(interceptor.errorHandler).toHaveBeenCalled();
      expect(interceptor.emitAuditMessage).toHaveBeenCalled();
    });

    it('should catch NotFoundException type', async () => {
      const resp = await request(app.getHttpServer())
        .get('/test/notfound/1')
        .expect(HttpStatus.NOT_FOUND);
      expect(resp.body.message).toMatch(/Not Found/);
      expect(interceptor.errorHandler).toHaveBeenCalled();
      expect(interceptor.emitAuditMessage).toHaveBeenCalled();
    });

    it('should not be called if not defined', async () => {
      const resp = await request(app.getHttpServer())
        .get('/test/without-audit/1')
        .expect(HttpStatus.NOT_FOUND);
      expect(resp.body.message).toMatch(/Not Found/);
      expect(interceptor.errorHandler).not.toHaveBeenCalled();
    });

    it('should not catch not defined error type', async () => {
      await request(app.getHttpServer())
        .get('/test/not-error/2')
        .expect(HttpStatus.NOT_FOUND);
      expect(interceptor.errorHandler).toHaveBeenCalled();
      expect(interceptor.emitAuditMessage).not.toHaveBeenCalled();
    });

    it('should emit audit log', async () => {
      const actorId = '123';
      const objectId = 'some-object-id-123';
      const resp = await request(app.getHttpServer())
        .get(`/test/notfound/${objectId}`)
        .set('x-gateway-user-id', actorId)
        .expect(HttpStatus.NOT_FOUND);
      expect(resp.body.message).toMatch(/Not Found/);
      expect(interceptor.errorHandler).toHaveBeenCalled();
      expect(interceptor.emitAuditMessage).toHaveBeenCalledWith(
        'test',
        {
          actorId: '123',
          actionVerb: 'accessed',
          objectId: 'some-object-id-123',
          outcome: 'failure',
          pii: [],
        },
        {},
      );
    });

    describe('Audit Log', () => {
      beforeEach(() => {
        jest.spyOn(auditLog, 'message');
      });
      it('should respond in a correct format for failure', async () => {
        const actorId = '123';
        const objectId = 'some-object-id-123';
        await request(app.getHttpServer())
          .get(`/test/notfound/${objectId}`)
          .set('x-gateway-user-id', actorId)
          .expect(HttpStatus.NOT_FOUND);
        expect(auditLog.message).toHaveReturnedWith({
          action: { type: 'urn:forlagshuset:action:object', verb: 'accessed' },
          actor: { id: actorId, type: 'urn:forlagshuset:identity:eportal' },
          object: {
            id: objectId,
            type: 'urn:forlagshuset:object:erudio:namespace',
          },
          outcome: 'failure',
          pii: [],
          service: { id: 'test.service', type: 'urn:forlagshuset:service:app' },
          timestamp: '2022-03-16T11:01:58.135000Z',
        });
      });

      it('should respond in a correct format for success', async () => {
        const actorId = '123';
        const objectId = 'some-object-id-123';
        await request(app.getHttpServer())
          .get(`/test/success/${objectId}`)
          .set('x-gateway-user-id', actorId)
          .expect(HttpStatus.OK);
        expect(auditLog.message).toHaveReturnedWith({
          action: { type: 'urn:forlagshuset:action:object', verb: 'accessed' },
          actor: { id: actorId, type: 'urn:forlagshuset:identity:eportal' },
          object: {
            id: objectId,
            type: 'urn:forlagshuset:object:erudio:namespace',
          },
          outcome: 'success',
          pii: [],
          service: { id: 'test.service', type: 'urn:forlagshuset:service:app' },
          timestamp: '2022-03-16T11:01:58.135000Z',
        });
      });

      it("should respond with correct objectId, given objectId is resolved in method's body", async () => {
        const actorId = '123';
        const objectId = 'some-object-id-123';
        await request(app.getHttpServer())
          .get(`/test/object/${objectId}`)
          .set('x-gateway-user-id', actorId)
          .expect(HttpStatus.OK);
        expect(auditLog.message).toHaveReturnedWith({
          action: { type: 'urn:forlagshuset:action:object', verb: 'accessed' },
          actor: { id: actorId, type: 'urn:forlagshuset:identity:eportal' },
          object: {
            id: `injected-${objectId}`,
            type: 'urn:forlagshuset:object:erudio:namespace',
          },
          outcome: 'success',
          pii: [],
          service: { id: 'test.service', type: 'urn:forlagshuset:service:app' },
          timestamp: '2022-03-16T11:01:58.135000Z',
        });
      });

      it('should respond with overrided service type', async () => {
        const actorId = '123';
        const objectId = 'some-object-id-123';
        await request(app.getHttpServer())
          .get(`/test/override/${objectId}`)
          .set('x-gateway-user-id', actorId)
          .expect(HttpStatus.OK);
        expect(auditLog.message).toHaveReturnedWith({
          action: { type: 'urn:forlagshuset:action:object', verb: 'accessed' },
          actor: { id: actorId, type: 'urn:forlagshuset:identity:eportal' },
          object: {
            id: objectId,
            type: 'urn:forlagshuset:object:erudio:namespace',
          },
          outcome: 'success',
          pii: [],
          service: {
            id: 'test.service',
            type: 'urn:forlagshuset:service:batch',
          },
          timestamp: '2022-03-16T11:01:58.135000Z',
        });
      });
    });
  });
});
