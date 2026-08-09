// src/i18n/test-export.ts
import { LanguageCode } from './types';

// This will help us see if the export works
const test: LanguageCode = 'en';
console.log('LanguageCode works!', test);

// Also import everything to see what's available
import * as AllExports from './types';
console.log('All exports from types.ts:', Object.keys(AllExports));