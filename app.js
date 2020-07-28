import express from 'express';
import path from 'path';
import chalk from 'chalk';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from "./db/connectDB";

/* import fs from 'fs';
import https from 'https'; */

const app = express();
// config path
const configPath = path.resolve(__dirname, 'config', '.env');

// Load config file
require('dotenv').config({path: configPath})
const port = process.env.PORT || 8000;

//connect database
connectDB();

// express middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(cors());

// route middleware
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/user'));
app.use('/api', require('./routes/category'));
app.use('/api', require('./routes/product'));
app.use('/api', require('./routes/braintree'));
app.use('/api', require('./routes/order'));


/* const server = https.createServer({
    key: fs.readFileSync('./open_ssl/server.key'),
    cert: fs.readFileSync('./open_ssl/server.cert')
}, app) */

app.listen(port, () => {
    console.log(chalk.yellow.inverse(`Server is up on port ${port}`));
})
