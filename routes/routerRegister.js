import express from 'express';
import bodyParser from 'body-parser';
// import cookieParser from 'cookie-parser';
// import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';
import * as users  from '../db/users.js';
// import secret from '../middleware/key.js';

const router = express.Router();
const hashSize = 32,
  saltSize = 30,
  hashAlgorithm = 'sha512',
  iterations = 1000;

const pbkdf2 = promisify(crypto.pbkdf2);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/register', async (req, res) => {
  try {
    res.render('registration', { message: '' });
  } catch (err) {
    res.status(500).render('registration', { message: `Error: ${err.message}` });
  }
});

router.post('/register', async (req, res) => {
  try {
    const {
      username, password, password2, hour1, hour2,
    } = req.body;
    const exists = await users.teacherExists(username);
    // username already exists
    if (exists[0]) {
      res.status(500).render('registration', { message: 'Error: Username already exists\nPlease try again' });
    } else
    if (password !== password2) { res.status(500).render('registration', { message: 'Error: Your passwords do not match\nPlease try again' }); } else {
      const salt = crypto.randomBytes(saltSize);
      const hash = await pbkdf2(password, salt, iterations, hashSize, hashAlgorithm);
      const hashWithSalt =  `${hash.toString('base64')}:${salt.toString('base64')}`;

      await users.insertNewUser(username, hashWithSalt, 'user', hour1, hour2);
      res.render('login', { message: '' });
    }
  } catch (err) {
    res.status(500).render('registration', { message: `Error: ${err.message}` });
  }
});

export default router;
