# MEasyMate HTML Product Migration Rules V1

## Do not move blindly

For each existing HTML product:

1. Inspect the current project directory first.
2. Read all files for small projects; for large projects inventory first and inspect the relevant source/control files.
3. Identify the latest verified `index.html`.
4. Do not delete or archive the old repository yet.
5. Copy the latest verified source into `projects/<project-id>/index.html`.
6. Keep project user-data behavior unchanged until Data Safety review is complete.
7. Add shared notice integration only after the current app is understood.
8. Test the GitHub Pages subpath.
9. Test refresh/reopen and old user data.
10. Only then mark the new repository as the product source of truth.

## Status language

Use:
- PASS
- FAIL
- UNVERIFIED

Never claim migration/release success without evidence.
