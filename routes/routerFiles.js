import express from 'express';
import bodyParser from 'body-parser';
import eformidable from 'express-formidable';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as files from '../db/files.js';
import * as sub from '../db/subjects.js';
import * as teachers from '../db/users.js';
import { authorize }  from '../middleware/auth.js';
import tokenVerify from '../middleware/token.js';

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const uploadDir = join(process.cwd(), 'public');

router.use(eformidable({ uploadDir }));

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

router.get('/[0-9]*$', async (req, res) => {
  try {
    const cookie = req.cookies.mycookie;
    const ID = req.originalUrl.substring(1);
    const allsubj = await sub.findDetails(ID);
    const file = await files.findFilesID(ID);
    const subj = allsubj[0];
    if (cookie) {
      if (tokenVerify(res, cookie)) {
        const owner = await sub.findOwner(ID, res.locals.username);
        const isteacher = await teachers.checkTeacher(res.locals.username, ID);
        const teacher = await teachers.findallTeacher(ID);
        res.render('files', {
          subj,
          file,
          teacher,
          username: res.locals.username,
          role: res.locals.role,
          owner: owner[0].isowner,
          fromSubj: 0,
          isteacher: isteacher[0].result,
        });
      } else { res.render('error', { message: 'You are not logged in properly' }); }
    } else {
      res.render('files', {
        subj, file, username: 'guest', role: '', owner: '', fromSubj: 0, isteacher: 0,
      });
    }
  } catch (err) {
    res.status(500).render('error', { message: `Showing details unsuccessful: ${err.message}` });
  }
});

router.post('/[0-9]*$', authorize(), async (req, res) => {
  try {
    const cookie = req.cookies.mycookie;
    const ID = req.originalUrl.substring(1);
    await files.insertFiles(ID, req);
    const allsubj = await sub.findDetails(ID);
    const file = await files.findFilesID(ID);
    const subj = allsubj[0];

    if (cookie) {
      if (tokenVerify(res, cookie)) {
        const owner = await sub.findOwner(ID, res.locals.username);
        const isteacher = await teachers.checkTeacher(res.locals.username, ID);
        const teacher = await teachers.findallTeacher(ID);
        res.render('files', {
          subj,
          file,
          teacher,
          username: res.locals.username,
          role: res.locals.role,
          owner: owner[0].isowner,
          fromSubj: 0,
          isteacher: isteacher[0].result,
        });
      } else { res.render('error', { message: 'You are not logged in properly' }); }
    } else {
      res.render('files', {
        subj, file, username: 'guest', role: '', owner: '', fromSubj: 0, isteacher: 0,
      });
    }
  } catch (err) {
    res.status(500).render('error', { message: `Insert unsuccessful: ${err.message}` });
  }
});

// deletes a given file
router.delete('/delete', async (req, res) => {
  try {
    const ok = await files.deleteFile(req.query.id);

    if (ok) {
      res.status(200);
      res.end();
    } else {
      res.status(500);
      res.end();
    }
  } catch (err) {
    res.status(500).render('error', { message: `Delete unsuccessful: ${err.message}` });
  }
});

export default router;
