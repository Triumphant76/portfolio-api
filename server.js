import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
// eslint-disable-next-line no-unused-vars
import colors from 'colors';
import connectDB from './config/db.js';
import projectsRouter from './routes/projects.js';
import errorHandler from './middleware/error.js';
import { upload } from './middleware/multer.js';
// Load env variables
dotenv.config({ path: './.env' });
// config({ path: './config/config.env' }); switch to this in dev mode

// Connect to database
connectDB();

const app = express();

app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(upload);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/projects', projectsRouter);

// Mount error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on http://${HOST}:${PORT}`.yellow.bold,
  ),
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`.red.bold);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default server;
