import { Controller, Get, NotFoundException, Param, Req } from '@nestjs/common';
import { ActionVerb, ServiceType } from '../interfaces';
import { AuditLogger } from '../audit-logging.decorator';
import { TestError } from './test.error';

interface RequestWithObjectId extends Request {
  objectId: string;
}
@Controller('/test')
export class TestController {
  @AuditLogger({
    action: ActionVerb.ACCESSED,
    actorIdGetter: (req) => req.headers['x-gateway-user-id'],
    objectIdGetter: (req) => req.params.id,
    eventSubject: 'test',
    errorTypes: [TestError],
  })
  @Get('/error/:id')
  errorId(@Param('id') id: string) {
    throw new TestError('TEST1120');
  }
}
