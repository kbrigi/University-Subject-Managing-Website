import dbConnection from './connection.js';
// all users and their details
export const findAccount = (username) => (dbConnection.executeQuery('SELECT * FROM users WHERE userName = ?', [username]));

export const findTeacher = () => dbConnection.executeQuery('SELECT userName, userRole FROM users');

export const insertTeacher = (req) => dbConnection.executeQuery('INSERT INTO teachers VALUES(?, ?)', [req.body.userName, req.body.subjectID]);

export const deleteTeacher = (req) => dbConnection.executeQuery('DELETE FROM teachers WHERE userName = ? AND subID = ?', [req.body.userName, req.body.subjectID]);

export const checkTeacher = (username, subjectID) => dbConnection.executeQuery('SELECT COUNT(userName) AS result FROM teachers WHERE userName = ? AND subID = ?', [username, subjectID]);

export const teacherExists = (username) => dbConnection.executeQuery('SELECT * FROM users WHERE username = ?', [username]);

export const insertNewUser = (username, password, role, hour1, hour2) => dbConnection.executeQuery('INSERT INTO users VALUES(?, ?, ?, ?, ?)', [username, password, role, hour1, hour2]);

export const findallTeacher = (subID) => dbConnection.executeQuery('SELECT username FROM teachers WHERE subID = ?', [subID]);

export default findAccount;
