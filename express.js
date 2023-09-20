import express from 'express';
import { join } from 'path';
import fs, { existsSync, mkdirSync } from 'fs';
import eformidable from 'express-formidable';
import Joi from 'joi';

const app = express();
const uploadDir = join(process.cwd(), 'uploadDir');

app.use(express.static(join(process.cwd(), 'static')));

app.use(express.urlencoded({ extended: true }));

app.use(eformidable({ uploadDir }));

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

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

function checkSub(obj, i) {
  return obj.subject.findIndex((x) => x.subid === i);
}

function checkStud(obj, sub, stud) {
  return obj.student.findIndex((x) => (x !== null) && (x.studid === stud) && (x.subid === sub));
}

function validationExit(validation, response) {
  console.log('Validation error!');
  response.send(validation.error);
  response.statusCode = 404;
  response.end();
}

// admin
app.post('/submit1', (request, response) => {
  const respBody = `Server got the new subject:
  name: ${request.fields.name}
  id: ${request.fields.id} 
  class: ${request.fields.class}
  lecture: ${request.fields.lecture}
  seminar: ${request.fields.seminar}
  laboratory: ${request.fields.lab}
  `;

  console.log(respBody);
  fs.readFile('./orarend.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const obj = JSON.parse(data);
      if (checkSub(obj, request.fields.id) > -1) {
        console.log(`Error: ${request.fields.id} is a used subjectID!`);
        response.statusCode = 404;
        response.end();
      } else {
        const newSub = {
          name: `${request.fields.name}`,
          subid: `${request.fields.id}`,
          class: `${request.fields.class}`,
          lecture: `${request.fields.lecture}`,
          seminar: `${request.fields.seminar}`,
          laboratory: `${request.fields.lab}`,
        };

        const validation  = schemaSub.validate(newSub);

        if (validation.error) {
          validationExit(validation, response);
        } else {
          obj.subject.push(newSub);
          const json = JSON.stringify(obj, null, 2);

          fs.writeFile('./orarend.json', json, 'utf8', (error) => {
            if (error) {
              console.log(error);
            }
          });
          console.log(`Updated the json file with a new subject(${request.fields.id})`);

          response.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
          });
          response.end(respBody);
        }
      }
    }
  });
});

const schemaStud = Joi.object().keys({
  subid: Joi.number().integer().min(0).max(10000)
    .required()
    .label('Error: SubjectID'),
  studid: Joi.number().integer().min(0).max(10000)
    .required()
    .label('Error: StudentID'),
});

// students
// eslint-disable-next-line max-lines-per-function
app.post('/submit2', (request, response) => {
  const joins = Boolean(request.fields.join);
  const leaves = Boolean(request.fields.leave);
  const respBody = `Server got the student's message:
    StudID: ${request.fields.studentID}
    SubjID: ${request.fields.subjectID} 
    Join: ${joins}
    Leave: ${leaves}
    `;
  console.log(respBody);

  if (joins === leaves) {
    console.log('Error: You have to choose if you join OR leave a subject!');
    response.statusCode = 404;
    response.end();
  }

  fs.readFile('./orarend.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const obj = JSON.parse(data);
      // Hibakezeles: nem letezo subjectID
      if (checkSub(obj, request.fields.subjectID) === -1) {
        console.log(`Error: ${request.fields.subjectID} is an unknown subjectid!`);
        response.statusCode = 404;
        response.end();
      } else {
        // Hibakezeles: mar csatlakozott es ujbol akar
        const i = checkStud(obj, request.fields.subjectID, request.fields.studentID);
        if (joins === true) {
          if (i > -1) {
            console.log(`Error: ${request.fields.studentID} student had already joined this subject!`);
            response.statusCode = 404;
            response.end();
          } else {
            const newStudent = {
              subid: `${request.fields.subjectID}`,
              studid: `${request.fields.studentID}`,
            };

            const validation  = schemaStud.validate(newStudent);

            if (validation.error) {
              validationExit(validation, response);
            } else {
              obj.student.push(newStudent);
              const json = JSON.stringify(obj, null, 2);
              fs.writeFile('./orarend.json', json, 'utf8', (error) => {
                if (error) {
                  console.log(error);
                }
              });
              console.log(`Updated the json file by adding the student(${request.fields.studentID}) to a new subject(${request.fields.subjectID})`);
              response.writeHead(200, {
                'Content-Type': 'text/plain; charset=utf-8',
              });
              response.end(respBody);
            }
          }
        } else
        // Hibakezeles: meg nem csatlakozott es ki akar lepni
        if (leaves === true) {
          if (i === -1) {
            console.log(`Error: ${i} student is not part of this class!`);
            response.statusCode = 404;
            response.end();
          } else {
            delete obj.student[i];
            const json = JSON.stringify(obj, null, 2);
            fs.writeFile('./orarend.json', json, 'utf8', (error) => {
              if (error) {
                console.log(error);
              }
            });
            console.log(`Updated the json file by deleting the student(${request.fields.studentID}) from the subject(${request.fields.subjectID})`);
            response.writeHead(200, {
              'Content-Type': 'text/plain; charset=utf-8',
            });
            response.end(respBody);
          }
        }
      }
    }
  });
});

const schemaFile = Joi.object().keys({
  subid: Joi.number().integer().min(0).max(3000)
    .required()
    .label('Error: Id'),
  name: Joi.string()
    .required()
    .label('Error: Name'),
  path: Joi.string()
    .required()
    .label('Error: Path'),
});

// professor upload files
app.post('/upload_file', (request, response) => {
  const fileHandler = request.files.myfile;
  const id = request.fields.subjectID;
  const respBody = `Server got a new upload:
    SubjID: ${id}
    állománynév: ${fileHandler.name}
    név a szerveren: ${fileHandler.path}
    `;
  console.log(respBody);

  const newFile = {
    subid: `${request.fields.subjectID}`,
    name: `${fileHandler.name}`,
    path: `${fileHandler.path}`,
  };

  const validation  = schemaFile.validate(newFile);

  if (validation.error) {
    validationExit(validation, response);
  } else {
    fs.readFile('./orarend.json', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      } else {
        const obj = JSON.parse(data);
        const i = checkSub(obj, id);
        if (i === -1) {
          console.log('Error: unknown subjectid!');
          response.statusCode = 404;
          response.end();
        } else {
          obj.file.push(newFile);
          const json = JSON.stringify(obj, null, 2);
          fs.writeFile('./orarend.json', json, 'utf8', (error) => {
            if (error) {
              console.log(error);
            }
          });
          console.log('Updated the json file with a new file');
          response.set(
            'Content-Type',
            'text/plain;charset=utf-8',
          );
          response.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
          });
          response.end(respBody);
        }
      }
    });
  }
});

app.listen(8080, () => { console.log('Server listening...'); });
