import jwt from 'jsonwebtoken';
import secret from './key.js';
import * as teacher from '../db/users.js';

// checks if user is admin/the teacher of the subject
export function authorize() {
  return async (req, res, next) => {
    const cookie = req.cookies.mycookie;
    if (cookie) {
      const payload = jwt.verify(cookie.token, secret);
      const isteacher = await teacher.checkTeacher(payload.username, req.originalUrl.substring(1));
      if (payload.role !== 'admin' && isteacher[0].result !== 1) {
        res.status(403).render('error', { message: 'You do not have permission to access this endpoint' });
      } else {
        next();
      }
    }
  };
}
// checks if user is admin
export function authorizeAdmin() {
  return async (req, res, next) => {
    const cookie = req.cookies.mycookie;
    if (cookie) {
      const payload = jwt.verify(cookie.token, secret);
      if (payload.role !== 'admin') {
        res.status(403).render('error', { message: 'You do not have permission to access this endpoint' });
      } else {
        next();
      }
    }
  };
}
