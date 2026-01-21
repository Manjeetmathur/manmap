## Production Deployment

### Prerequisites
- Node.js 18+
- Environment variables configured (see `.env.example`)

### Build Commands
```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run preview  # Test production build locally
```

### Deployment
Deploy to Vercel, Netlify, or any Node.js hosting platform.

### Security Notes
- Ensure Firebase security rules are configured to allow only authenticated users if needed.
- Monitor API usage to avoid exceeding Gemini API limits.
- Consider adding rate limiting for AI requests.