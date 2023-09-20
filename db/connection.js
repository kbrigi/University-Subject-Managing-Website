import mysql from 'mysql2';
import autoBind from 'auto-bind';

export class DbConnection {
  constructor() {
    this.pool = mysql.createPool({
      connectionLimit: 10,
      database: 'timetable',
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'goodreads',
    });

    autoBind(this);
  }

  executeQuery(query, options = []) {
    return new Promise((resolve, reject) => {
      this.pool.execute(query, options, (error, results) => {
        if (error) {
          reject(new Error(`Error while running '${query}: ${error}'`));
        }
        resolve(results);
      });
    });
  }
}

export default new DbConnection();
