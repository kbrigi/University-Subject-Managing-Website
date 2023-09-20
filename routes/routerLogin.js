import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';
import { findAccount } from '../db/users.js';
import secret from '../middleware/key.js';

const router = express.Router();
const hashSize = 32,
  hashAlgorithm = 'sha512',
  iterations = 1000;

const pbkdf2 = promisify(crypto.pbkdf2);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const thisuser = await findAccount(username);

  // if the user exists
  if (thisuser.length > 0) {
    // hash password and compare
    const hashWithSalt = thisuser[0].userPassword;
    const [expectedHash, saltB64] = hashWithSalt.split(':');
    const salt = Buffer.from(saltB64, 'base64');

    const binaryHash = await pbkdf2(password, salt, iterations, hashSize, hashAlgorithm);

    const givenHash = binaryHash.toString('base64');

    // login successfully
    if (expectedHash === givenHash) {
      // create a token and store it in a cookie
      const mytoken = jwt.sign({
        username: thisuser[0].userName,
        role: thisuser[0].userRole,
      }, secret);
      const mycookie = {
        token: mytoken,
      };
      res.cookie('mycookie', mycookie, { maxAge: 900000, httpOnly: true });
      res.redirect('/subject');
    } else {
      res.render('login', { message: 'Error: incorrect username or password.' });
    }
  } else {
    res.render('login', { message: 'Error: no such user exists.' });
  }
});

router.get('/login', async (req, res) => {
  res.clearCookie('mycookie');
  res.render('login', { message: '' });
});

export default router;
