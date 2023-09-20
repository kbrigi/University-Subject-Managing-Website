import express from 'express';
import path from 'path';
import errorMiddleware from './middleware/error.js';
import subjRoutes from './routes/routerSubj.js';
import fileRoutes from './routes/routerFiles.js';
import teachRoutes from './routes/routerTeacher.js';
import loginRoutes from './routes/routerLogin.js';
import registerRoutes from './routes/routerRegister.js';
import { createTable } from './db/tables.js';

const app = express();
app.use(express.static(path.join(process.cwd(), 'static')));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// using routers
app.use('/', registerRoutes);
app.use('/', loginRoutes);
app.use('/', teachRoutes);
app.use('/', subjRoutes);
app.use('/', fileRoutes);

app.use(errorMiddleware);

createTable().then(() => {
  app.listen(8080, () => { console.log('Server listening on http://localhost:8080/ ...'); });
});
