import dbConnection from './connection.js';

export const insertFiles = (sID, req) => {
  const { path } = req.files.myfile;
  const splitted = path.split('\\').pop();
  const name = `/${splitted}`;
  return dbConnection.executeQuery('INSERT INTO files  (fileName, subID) VALUES (?, ?)', [name, sID]);
};

export const findFilesID = (subjectID) => dbConnection.executeQuery('SELECT files.fileID, files.fileName FROM files WHERE files.subID = ?', [subjectID]);

export const findFiles = (subjectID) => dbConnection.executeQuery('SELECT files.fileName FROM files WHERE files.subID = ?', [subjectID]);

export const deleteFile = (fileID) => dbConnection.executeQuery('DELETE FROM files WHERE fileID = ?', [fileID]);
