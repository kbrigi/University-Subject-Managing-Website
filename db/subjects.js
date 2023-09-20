import dbConnection from './connection.js';

// all subjects and their details
export const findAllSubjects = () => dbConnection.executeQuery('SELECT * FROM subjects');
// inserts a new subject
export const insertSubject = (req, username) => dbConnection.executeQuery('INSERT INTO subjects VALUES (?, ?, ? ,?, ?, ?, ?)', [req.body.id, req.body.name, req.body.class, req.body.lecture, req.body.seminar, req.body.lab, username]);
// returns all subjectIDs
export const findSubjects = () => dbConnection.executeQuery('SELECT subID FROM subjects');
// all the details of a given subject
export const findDetails = (subID) => dbConnection.executeQuery(`SELECT subjects.subID, subjects.subName, subjects.class, subjects.lecture, subjects.seminar, subjects.lab\n
  FROM subjects\n
  WHERE subjects.subID = ?`, [subID]);
// returns if a user is the owner of the given subject
export const findOwner = (subID, username) => dbConnection.executeQuery('SELECT COUNT(subID) AS isowner FROM subjects WHERE ownerName = ? AND subID = ? ', [username, subID]);
// all the details of all subjects, by the given owner
export const findSubjectsByOwner = (username) => dbConnection.executeQuery('SELECT subjects.subID, subjects.subName, subjects.class, subjects.lecture, subjects.seminar, subjects.lab FROM teachers JOIN subjects ON teachers.subID= subjects.subID WHERE teachers.userName =  ?', [username]);
// delete a subject
export const deleteSubj = (subID) => {
  dbConnection.executeQuery('DELETE FROM files WHERE subID = ?', [subID]);
  dbConnection.executeQuery('DELETE FROM teachers WHERE subID = ?', [subID]);
  return dbConnection.executeQuery('DELETE FROM subjects WHERE subID = ?', [subID]);
};
