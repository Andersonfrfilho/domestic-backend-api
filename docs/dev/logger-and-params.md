# Logger injection & Params pattern (examples)

## Logger injection

Prefer injecting the logger provider instead of creating a new Logger instance. This allows the runtime logger implementation to be swapped and preserves request context.

When possible, include `ClassName.methodName` in `context` for easier tracing.

For structured payload, prefer `meta` (new pattern). `params` should be treated as legacy compatibility only.
If log `message` or `context` is repeated in the same flow/class, extract them to constants.

Example service constructor:

```ts
import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

@Injectable()
export class MyService {
  private readonly logContext = 'MyService.doWork';

  constructor(@Inject(LOGGER_PROVIDER) private readonly log: LogProviderInterface) {}

  doWork() {
    const LOG_MESSAGES = {
      WORK_STARTED: 'work started',
    } as const;

    this.log.info({
      message: LOG_MESSAGES.WORK_STARTED,
      context: this.logContext,
      meta: { feature: 'user-sync', step: 'start' },
    });
  }
}
```

## Params / Result naming

- For functions with multiple inputs, use a single object parameter with the `<Name>Params` type.
- If the function returns a structured object, define `<Name>Result`.

Example:

```ts
export type CreateUserParams = { fullName: string; keycloakId: string };
export type CreateUserResult = { id: string; createdAt: string };

async function createUser(params: CreateUserParams): Promise<CreateUserResult> {
  const { fullName, keycloakId } = params;
  // ...
}
```
