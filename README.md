# Weekly Wins

Track and celebrate your weekly accomplishments.

## Development

This project uses:

- React + Vite for the frontend
- Firebase for hosting and backend
- GitHub Actions for CI/CD

### Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

### Testing

Run tests with:

```bash
npm test           # Watch mode
npm run test:unit  # Run unit tests once
npm run test:ci    # Run all tests including emulator tests
```

## Release Process

The project uses automated version management and deployment through GitHub Actions:

1. **Initiate Version Bump**

   - Go to Actions → "Version Bump" workflow
   - Click "Run workflow"
   - Select version type (patch/minor/major)
   - This creates a PR with the version bump

2. **Review and Merge**

   - PR will run quality checks (lint, format, tests, build)
   - Review and approve the PR
   - Merge the PR
   - This triggers the release workflow

3. **Automatic Release and Deploy**
   When the version bump PR is merged, GitHub Actions will:
   - Create a GitHub release with auto-generated notes
   - Deploy the new version to Firebase
   - Deploy updated Firestore rules

### Manual Deployment

For manual deployments (e.g., rollbacks):

1. Go to Actions → "Deploy" workflow
2. Click "Run workflow"
3. Select the branch to deploy
4. Click "Run workflow"

Note: Pre-releases are automatically detected by hyphens in version numbers (e.g., `1.0.0-beta.1`).
