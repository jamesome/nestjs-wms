import * as os from 'os';
import * as dotenv from 'dotenv';
// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

dotenv.config();
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  integrations: [nodeProfilingIntegration()],
  serverName: os.hostname(),
  // Tracing
  tracesSampleRate: parseInt(process.env.SENTRY_TRACE_RATE || '0'),
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: parseInt(process.env.SENTRY_PROFILE_RATE || '0'),
});
