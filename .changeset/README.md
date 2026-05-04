# Versioning & Releasing

This project uses a monorepo structure managed by `pnpm` workspaces and uses [@changesets/cli](https://github.com/changesets/changesets) for automated versioning and changelog generation. We use **Fixed Versioning**, meaning the frontend, worker, and desktop client versions are kept in sync.

## Workflow

1.  **Generate a Changeset:** Before committing a feature or fix, run:
    ```bash
    pnpm changeset
    ```
    Follow the interactive prompts to select the affected packages, bump type (major/minor/patch), and provide a summary of your changes. Commit the generated `.changeset/*.md` file with your code.

2.  **Release/Version Bump:** When you are ready to cut a release, run:
    ```bash
    pnpm run release
    ```
    This single command will:
    * Run `changeset version` to bump package versions based on your unreleased `.changeset` files.
    * Run a custom script (`.changeset/append-commits.mjs`) to fetch the Git commit log since the last tag.
    * Automatically inject that raw Git commit list into the new `CHANGELOG.md` sections.
    * Automatically commit the resulting files.

3.  **Generate Tags:** After the version bump commit is created, generate Git tags for the new versions by running:
    ```bash
    pnpm changeset tag
    ```
    You can then push your commit and tags to the remote repository using `git push --follow-tags`.
