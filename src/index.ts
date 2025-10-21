import "@total-typescript/ts-reset";
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { env } from './env.js'
import { etag } from 'hono/etag'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { database } from './database/db.js'
import { createAuth } from './auth.js'
import { secureHeaders } from 'hono/secure-headers'

const app = new Hono()

await database.connect();

const auth = createAuth();

app.use(etag(), logger(), prettyJSON(), secureHeaders());

app.get('/', (c) => c.text('Hello Hono!'));

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));



app.get('/health', async (c) => {
  const isDbHealthy = await database.ping();

  if (!isDbHealthy) {
    return c.json({
      status: 'unhealthy',
      database: 'disconnected'
    }, 503);
  }

  return c.json({
    status: 'healthy',
    database: 'connected'
  });
});



process.on('SIGINT', async () => {
  console.log('\n🛑 Sunucu kapatılıyor...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Sunucu kapatılıyor...');
  await database.disconnect();
  process.exit(0);
});

serve({
  fetch: app.fetch,
  port: env.PORT,
}, (info) => {
  console.log(`🚀 Server is running on http://localhost:${info.port}`)
})
