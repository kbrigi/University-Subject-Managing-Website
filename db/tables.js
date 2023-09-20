import dbConnection from './connection.js';

// creates all tables in the database
export const createTable = async () => {
  try {
    await dbConnection.executeQuery(`CREATE TABLE IF NOT EXISTS timetable.users (
      userName VARCHAR(45) NOT NULL PRIMARY KEY,
      userPassword VARCHAR(250) NOT NULL,
      userRole VARCHAR(45) NOT NULL,
      hour1 INT,
      hour2 INT)
  `);

    await dbConnection.executeQuery(`CREATE TABLE IF NOT EXISTS subjects (
        subID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        subName varchar(20),
        class INT,
        lecture INT,
        seminar INT,
        lab INT,
        ownerName VARCHAR(45),
        FOREIGN KEY (ownerName)  REFERENCES users (userName)
      )`);

    await dbConnection.executeQuery(`CREATE TABLE IF NOT EXISTS files (
        fileID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        fileName varchar(150),
        subID INT,
        FOREIGN KEY (subID)  REFERENCES subjects (subID)
        )
      `);

    await dbConnection.executeQuery(`CREATE TABLE IF NOT EXISTS teachers (
          userName VARCHAR(45) NOT NULL,
          subID INT NOT NULL,
          PRIMARY KEY (userName, subID),
          FOREIGN KEY (userName)  REFERENCES users (userName),
          FOREIGN KEY (subID)  REFERENCES subjects (subID)
          )
        `);

    console.log('Table created successfully');
  } catch (err) {
    console.error(`Create table error: ${err}`);
    process.exit(1);
  }
};

export default createTable;
