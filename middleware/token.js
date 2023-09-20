import jwt from 'jsonwebtoken';
import secret from './key.js';

// decodes the token and saves username and role
export default function tokenVerify(res, cookie) {
  const payload = jwt.verify(cookie.token, secret);
  if (payload) {
    res.locals.username = payload.username;
    res.locals.role = payload.role;
    return 1;
  }
  return 0;
}
