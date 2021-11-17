import { auth, getToken } from './auth.ts';
import { oak, cors, redis } from './deps.ts';
import { createTimestamp } from './utils.ts';

const [envPort, redisPort, redisHostname, redisPassword] = [
  'PORT',
  'REDIS_PORT',
  'REDIS_HOST',
  'REDIS_PWD',
].map(Deno.env.get);

const storage = await redis.connect({
  port: redisPort,
  hostname: redisHostname ?? '',
  password: redisPassword,
});

const port = envPort ? Number(envPort) : 8080;

const [app, router] = [new oak.Application(), new oak.Router()];

app.use(cors.oakCors());
app.use(auth);

router.get('/api/timestamp', async ({ response, request }, next) => {
  try {
    const token = getToken(request.headers);
    const timestamp = await storage.get(String(token));
    await next();
    if (!timestamp) {
      response.status = 404;
      return;
    }

    response.body = timestamp;
    response.status = 200;
  } catch (error) {
    console.error(error);
    response.status = 500;
  }
});

router.post('/api/timestamp', async (context) => {
  try {
    const token = getToken(context.request.headers);
    const timestamp = createTimestamp();

    await storage.set(String(token), timestamp);

    context.response.status = 200;
    context.response.body = timestamp;
  } catch (error) {
    console.error(error);
    context.response.status = 500;
  }
});

router.delete('/api/timestamp', async (context) => {
  try {
    const token = getToken(context.request.headers);

    const timestamp = await storage.get(String(token));

    if (!timestamp) {
      context.response.status = 404;
      return;
    }

    storage.del(String(token));
    context.response.status = 204;
  } catch (error) {
    console.error(error);
    context.response.status = 500;
  }
});

app.use(router.routes());
app.listen({ port });
console.info(`Running on port ${port}`);
