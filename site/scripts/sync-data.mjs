import { cpSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const pub = resolve(dirname(fileURLToPath(import.meta.url)), '../public');

mkdirSync(pub, { recursive: true });
cpSync(resolve(root, 'catalog.json'), resolve(pub, 'catalog.json'));

const figDst = resolve(pub, 'figures');
if (existsSync(figDst)) rmSync(figDst, { recursive: true, force: true });
cpSync(resolve(root, 'figures'), figDst, { recursive: true });
console.log('synced catalog.json + figures/ → site/public/');
