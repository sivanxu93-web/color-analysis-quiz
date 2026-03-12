---
name: smart-commit
description: Automates code submission by running basic code checks, building the project, auto-fixing any errors until success, and then committing the changes via git. Use this when the user asks to submit or commit code.
---

# Smart Commit Workflow

This skill ensures code quality before making a git commit. When invoked, follow these steps strictly and autonomously:

## 1. Discover Checks
Read `package.json` (if it exists in the current directory) to identify basic code quality scripts. Look for scripts like `lint`, `typecheck`, or similar.

## 2. Execute Basic Checks
Run the identified basic checks (e.g., `npm run lint`).
- If a check fails, **do not stop or ask the user**. Analyze the error output.
- Use your file editing capabilities to fix the source code causing the errors.
- Re-run the check. Repeat this fix-and-check loop until the check passes completely.

## 3. Execute Build
Run `npm run build`.
- If the build fails, analyze the error output.
- Identify the problematic files and apply fixes.
- Re-run `npm run build`.
- Repeat this fix-and-build loop autonomously until the build completes without any errors.

## 4. Prepare Commit
Once all checks and the build are successful:
- Run `git status` and `git diff HEAD` to understand the scope of the modifications.
- Run `git log -n 3` to understand the recent commit message style and conventions used in the repository.

## 5. Stage and Commit
- Stage all changed files (`git add .` or stage specifically modified files).
- Formulate a clear, concise commit message describing the "why" and "what" of the changes, aligning with the project's commit style.
- Execute the commit (`git commit -m "<message>"`).
- Run `git status` to verify the working tree is now clean.

## Constraints
- **Autonomy:** You must automatically resolve code errors during the checking and building phases. Do not prompt the user for help unless you are completely stuck after multiple failed attempts.
- **No Push:** Do not push to a remote repository (e.g., no `git push`) unless the user explicitly requested it in their initial prompt.