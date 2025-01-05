# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Testing

This project uses Vitest for testing. Run tests with:

## Release Process

The project uses automated version management and deployment through GitHub Actions:

1. **Initiate Version Bump**

   - Go to GitHub Actions → "Version Bump" workflow
   - Click "Run workflow"
   - Select version type (patch/minor/major)
   - This creates a PR with the version bump

2. **Review and Merge**

   - PR will run all checks (lint and tests)
   - Review and approve the PR
   - Squash merge the PR
   - This will create a git tag for the new version

3. **Automatic Release and Deploy**
   When the version tag is pushed, GitHub Actions will automatically:
   - Create a GitHub release with auto-generated notes
   - Deploy the application to Firebase Hosting
   - Deploy updated Firestore rules

### Manual Deployment

To deploy an existing version (e.g., for rollbacks):

1. Go to GitHub Actions → "Release and Deploy" workflow
2. Click "Run workflow"
3. Select the branch, tag, or commit to deploy using the ref dropdown
4. Choose whether to:
   - Just deploy the selected ref (leave "Create GitHub release" unchecked)
   - Create a release and deploy (check "Create GitHub release")
5. Click "Run workflow"

Note: Pre-releases can be created by including `-alpha`, `-beta`, or `-rc` in the version number.
