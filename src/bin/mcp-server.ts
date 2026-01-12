#!/usr/bin/env node

import { startMCPServer } from '../server/index.js';

startMCPServer().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});