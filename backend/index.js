const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors=require('colors')

const connectDB = require('./config/db');
const errorHandler=require('./middleware/error')

//load env vars
dotenv.config({ path: './config/config.env' });

//MongoDB connection
connectDB()

//routes
const bootcampsRoute = require('./routes/bootcamps');

const app = express();

//body parser
app.use(express.json())

//dev logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//mount routes
app.use('/api/v1/bootcamps', bootcampsRoute);

app.use(errorHandler)

const PORT = process.env.PORT || 5000;

const server=app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

process.on('unhandledRejection', (err, promise)=>{
    console.log(`Error: ${err.message}`.red);
    server.close(()=> process.exit(1))
})
