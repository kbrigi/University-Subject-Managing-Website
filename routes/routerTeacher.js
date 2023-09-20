import express from 'express';
import bodyParser from 'body-parser';
import Joi from 'joi';
import * as subs from '../db/subjects.js';
import {
  insertTeacher, findTeacher, deleteTeacher, checkTeacher,
} from '../db/users.js';
import tokenVerify from '../middleware/token.js';

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const schemaStud = Joi.object().keys({
  subid: Joi.number().integer().min(0).max(10000)
    .required(),
});

function error(res, teacherList, subjectsList, joins, leaves, registered, username, role) {
  if (joins === true && registered === 1) {
    res.render('teacher', {
      subj: subjectsList, teacher: teacherList, message: 'Registration unsuccessful: You are already a member of this subject', username, role, fromSubj: 0,
    });
    return 1;
  } if (leaves === true && registered !== 1) {
    res.render('teacher', {
      subj: subjectsList, teacher: teacherList, message: 'Registration unsuccessful: You are not a member of this subject', username, role, fromSubj: 0,
    });
    return 1;
  }
  return 0;
}

router.get('/registration', async (req, res) => {
  try {
    const cookie = req.cookies.mycookie;
    const teachersList = await findTeacher();
    const subjectsList = await subs.findSubjects();
    if (cookie) {
      if (tokenVerify(res, cookie)) {
        res.render('teacher', {
          subj: subjectsList, teacher: teachersList, message: '', username: res.locals.username, role: res.locals.role, fromSubj: 0,
        });
      } else { res.render('error', { message: 'You are not logged in properly' }); }
    } else {
      res.render('teacher', {
        subj: subjectsList, teacher: teachersList, message: '', username: 'guest', role: '', fromSubj: 0,
      });
    }
  } catch (err) {
    res.render('teacher', {  subj: {}, teacher: {}, message: `Registration unsuccessful: ${err.message}` });
  }
});

router.post('/registration/[0-1]', async (req, res) => {
  const newTeacher = {
    subid: `${req.body.subjectID}`,
  };
  const cookie = req.cookies.mycookie;
  let username;
  let role;
  if (cookie) {
    if (tokenVerify(res, cookie)) {
      username = res.locals.username;
      role = res.locals.role;
    } else { res.render('error', { message: 'You are not logged in properly' }); }
  } else {
    username = 'guest';
    role = '';
  }

  const validation  = schemaStud.validate(newTeacher);
  if (validation.error) {
    res.status(500).render('error', { message: 'Insert unsuccessful: invalid input' });
  } else {
    const teacherList = await findTeacher();
    const subjectsList = await subs.findSubjects();
    try {
      const action = req.originalUrl.substring(1).split('/');
      const joins = Boolean(Number(action[1]));
      const leaves = !(joins);
      const ok = await checkTeacher(req.body.userName, req.body.subjectID);

      if (!error(res, teacherList, subjectsList, joins, leaves, ok[0].result, username, role)) {
        if (joins) {
          await insertTeacher(req);
          res.render('teacher', {
            subj: subjectsList, teacher: teacherList, message: 'Successfull registration', username, role, fromSubj: 0,
          });
        } else if (leaves) {
          await deleteTeacher(req);
          res.render('teacher', {
            subj: subjectsList, teacher: teacherList, message: 'Registration successfully', username, role, fromSubj: 0,
          });
        }
      }
    } catch (err) {
      res.render('teacher', {
        subj: subjectsList, teacher: teacherList, message: `Registration unsuccessful: ${err.message}`, username, role, fromSubj: 0,
      });
    }
  }
});

export default router;
