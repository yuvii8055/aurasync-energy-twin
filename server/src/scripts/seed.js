import { initDatabase } from '../db/store.js';

console.log('🔄 Executing explicit database re-seed script...');
await initDatabase(true);
console.log('✨ Seed script completed successfully.');
process.exit(0);
