// src/main.ts

import { startServer } from './frameworks/web/nodeServer';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

startServer(PORT);

