import { oak } from './deps.ts';

const tokenHeaderKey = 'authorization';

export const auth: oak.Middleware<Record<string, unknown>> = (context, next) => {
  const token = getToken(context.request.headers);

  if (!token) {
    context.response.body = 'unauthorized';
    context.response.status = 401;
    return;
  }
  next();
};

export function getToken(headers: Headers): string | null {
  const headerValue =
    headers.get(tokenHeaderKey) ??
    headers.get(tokenHeaderKey[0].toUpperCase().concat(tokenHeaderKey.slice(1)));

  if (!headerValue) {
    return null;
  }

  const [type, token] = headerValue.split(' ');
  if (!['Bearer', 'bearer'].includes(type) || !token) {
    return null;
  }
  return token;
}
