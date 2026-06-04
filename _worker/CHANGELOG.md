# @stash/worker

## 0.2.0

### Commits

- c1de07a perf(worker): only sync active pools often
- 28afcd0 fix(worker): attach real upload data to synced media
- ab519cd fix(worker): pools belong to parent cluster
- 7d588e7 fix(worker): add downloaded media to the correct cluster
- f1f7d34 feat(worker): add sync pagination
- 4e3c88f perf(worker): use more efficient curl from URL job instead of yt-dlp
- f73f658 feat(worker): add WIP smart tag sync job
- 39cb30e fix(worker): no fallback for yt-dlp
- bec60c4 chore(worker): fix dockerfile yt-dlp install
- 949dc9f refactor: move yt-dlp to worker only
- f4c5e27 chore(worker): update bun.lock
- c0a0c1b chore(deps): bump the npm_and_yarn group with 13 updates
- c64f0d9 feat(_frontend): cleanup unused console logs
- 64b7feb fix(_workers): handle symlinks properly
- b268b5b ci(_worker): build out of root


### Minor Changes

- New import sources from yt-dlp and booru

## 0.1.1

### Commits

- 91c6eb2 docs(\_worker): remove README
- b8c3aa5 fix(\_worker): only delete contents of hierarchy folder and not folder itself
- 278a16f chore: update bun lock file to non-binary version
- 8051e1a feat: initial version (still in early beta fyi)
- a652fa9 chore: add changeset

### Patch Changes

- Version bumps and minor cleanup

## 0.1.0

### Minor Changes

- initial version
