// server/src/utils/config.js

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  polygonApiKey: process.env.POLYGON_API_KEY,
  openAiApiKey: process.env.OPENAI_API_KEY,
  port: process.env.PORT || 8080,
};