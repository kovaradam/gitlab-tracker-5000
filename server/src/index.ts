import 'https://deno.land/x/dotenv/load.ts';
import { auth, getToken } from './auth.ts';
import { oak, cors } from './deps.ts';
import * as Storage from './lib/storage.ts';
import { createTimestamp } from './utils.ts';

const storage = Deno.args?.includes('--location')
  ? Storage.createLocalStorage()
  : Storage.createInMemoryStorage();

const port = Number(Deno.env.get('PORT')) ?? 8080;

const [app, router] = [new oak.Application(), new oak.Router()];

app.use(cors.oakCors());
app.use(auth);

router.get('/api/timestamp', (context) => {
  const token = getToken(context.request.headers);
  const timestamp = storage.get(String(token));

  if (!timestamp) {
    context.response.status = 404;
    return;
  }

  context.response.body = timestamp;
  context.response.status = 200;
});

router.post('/api/timestamp', (context) => {
  const token = getToken(context.request.headers);
  const timestamp = createTimestamp();

  storage.set(String(token), timestamp);

  context.response.status = 200;
  context.response.body = timestamp;
});

router.delete('/api/timestamp', (context) => {
  const token = getToken(context.request.headers);

  const timestamp = storage.get(String(token));

  if (!timestamp) {
    context.response.status = 404;
    return;
  }

  storage.delete(String(token));

  context.response.status = 204;
});

app.use(router.routes());
app.listen({ port });
console.info(`Running on port ${port}`);
