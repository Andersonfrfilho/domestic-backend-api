## Summary

- What changed?
- Why?

## Validation

- [ ] I ran local checks relevant to this PR (lint/tests/build when applicable)
- [ ] I updated tests/docs when behavior changed

## Code Style Checklist (required)

- [ ] Logger is injected via `LOGGER_PROVIDER` + `LogProviderInterface`
- [ ] Structured logging uses `meta` (not `params`, except legacy compatibility)
- [ ] Repeated literals (messages/contexts/error keys/events) were extracted to constants
- [ ] Reused log context in the same class is stored in a class property (e.g. `private readonly logContext = 'MyUseCase.execute'`)
- [ ] Constants are reused in unit tests when applicable
- [ ] Methods with multiple inputs use object params (`<Name>Params`) and extracted types in module `types/`

## Notes

- Extra context for reviewers, trade-offs, follow-ups.
