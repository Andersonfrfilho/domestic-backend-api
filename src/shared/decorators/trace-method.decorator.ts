import { pushToTraceStack, popFromTraceStack } from '@adatechnology/nestjs-logger';

/**
 * Rastreia a hierarquia de chamadas entre classes no log.
 *
 * Adicione este decorator aos métodos de use-cases e services.
 * O logger exibirá o histórico completo de chamadas:
 *
 * [reqId][timestamp][app:ver][UseCase.execute][Service.method][LEVEL] - msg
 *
 * Requerimento: LoggerModule.forRoot({ enableTraceStack: true }) no app.module.ts
 */
export function TraceMethod() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName = `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      pushToTraceStack(methodName);
      try {
        return await originalMethod.apply(this, args);
      } finally {
        popFromTraceStack();
      }
    };

    return descriptor;
  };
}
