import express from 'express';
import bodyParser from 'body-parser';
import Joi from 'joi';
import * as subs from '../db/subjects.js';
import * as file from '../db/files.js';
import { authorizeAdmin } from '../middleware/auth.js';
import tokenVerify from '../middleware/token.js';

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// validation for the data of the new subject
const schemaSub = Joi.object().keys({
  name: Joi.string().min(3).max(30)
    .required()
    .label('Error: Name'),
  subid: Joi.number().integer().min(0).max(3000)
    .required()
    .label('Error: Id'),
  class: Joi.number().integer().min(1).max(13)
    .required()
    .label('Error: Class'),
  lecture: Joi.number().integer().min(1).max(4)
    .required()
    .label('Error: Lecture'),
  seminar: Joi.number().integer().min(0).max(4)
    .required()
    .label('Error: Seminar'),
  laboratory: Joi.number().integer().min(0).max(4)
    .required()
    .label('Error: Lab'),
});

// view all subjects
router.get('/subject', async (req, res) => {
  try {
    const cookie  = req.cookies.mycookie;
    const subjects = await subs.findAllSubjects();
    if (cookie) {
      if (tokenVerify(res, cookie)) {
        res.render('subj', {
          subjects, username: res.locals.username, role: res.locals.role, fromSubj: 1,
        });
      } else { res.render('error', { message: 'You are not logged in properly' }); }
    } else {
      res.render('subj', {
        subjects, username: 'guest', role: '', fromSubj: 0,
      });
    }
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});
// view all the subjects of a given teacher
router.get('/subjects/[a-z][A-Z]*', async (req, res) => {
  try {
    const cookie  = req.cookies.mycookie;
    const username = req.originalUrl.substring(1).split('/');
    const subjects = await subs.findSubjectsByOwner(username[1]);
    if (cookie) {
      if (tokenVerify(res, cookie)) {
        res.render('subj', {
          subjects, username: res.locals.username, role: res.locals.role, fromSubj: 0,
        });
      } else { res.render('error', { message: 'You are not logged in properly' }); }
    } else {
      res.render('subj', {
        subjects, username: 'guest', role: '', fromSubj: 0,
      });
    }
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

// create a new subject
router.post('/subject', async (req, res) => {
  const newSub = {
    name: `${req.body.name}`,
    subid: `${req.body.id}`,
    class: `${req.body.class}`,
    lecture: `${req.body.lecture}`,
    seminar: `${req.body.seminar}`,
    laboratory: `${req.body.lab}`,
  };
  const cookie = req.cookies.mycookie;

  const validation  = schemaSub.validate(newSub);
  if (cookie) {
    if (tokenVerify(res, cookie)) {
      if (validation.error) {
        res.render('addsubj', {
          username: res.locals.username, role: res.locals.role, fromSubj: 0, message: 'Insert unsuccessful: invalid input',
        });
      } else {
        try {
          const subjects = await subs.findAllSubjects();
          await subs.insertSubject(req, res.locals.username);
          res.render('subj', {
            subjects, username: res.locals.username, role: res.locals.role, fromSubj: 1, message: '',
          });
        } catch (err) {
          res.status(500).render('error', { message: `Unsuccessful select: ${err.message}` });
        }
      }
    }
  } else { res.render('error', { message: 'You are not logged in properly' }); }
});

// view the form for creating a new subject
router.get('/addsubj', authorizeAdmin(), (req, res) => {
  const cookie = req.cookies.mycookie;
  if (cookie) {
    if (tokenVerify(res, cookie)) {
      res.render('addsubj', {
        username: res.locals.username, role: res.locals.role, fromSubj: 0, message: '',
      });
    } else { res.render('error', { message: 'You are not logged in properly' }); }
  } else {
    res.render('addsubj', {
      username: 'guest', role: '', fromSubj: 0, message: '',
    });
  }
});

// view all the files of a subject
router.get('/subj_file', async (req, res) => {
  try {
    const subjects = await file.findFiles(req.query.id);
    res.status(200);
    res.end(JSON.stringify(subjects));
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

// delete a given subject
router.delete('/delete_subj', async (req, res) => {
  try {
    const ok = await subs.deleteSubj(req.query.id);
    if (ok) {
      console.log('inhere');
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
