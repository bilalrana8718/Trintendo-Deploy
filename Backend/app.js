import express from 'express';
import morgan from 'morgan';
import connect from './db/db.config.js';
import ownerRouter from './routes/owner.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

connect('Trintendo');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors());

app.use('/owner', ownerRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

export default app;