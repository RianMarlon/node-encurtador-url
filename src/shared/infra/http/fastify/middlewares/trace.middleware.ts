import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { runWithTrace } from '@/shared/infra/providers/logger/trace-context';
import { generateUUID } from '@/shared/utils/generate-uuid';

export class TraceMiddleware {
  handle(request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
    const traceId = (request.headers['x-request-id'] as string) || generateUUID();
    reply.header('x-request-id', traceId);

    runWithTrace(traceId, () => {
      done();
    });
  }
}
