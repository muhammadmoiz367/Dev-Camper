const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const path = require('path');
const mongoSanitize=require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp=require('hpp')
const rateLimit=require('express-rate-limit')
const cors=require('cors')

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

//load env vars
dotenv.config({ path: './config/config.env' });

//MongoDB connection
connectDB();

//routes
const authRoute = require('./routes/auth');
const bootcampsRoute = require('./routes/bootcamps');
const coursesRoute = require('./routes/courses');
const userRoute = require('./routes/users');
const reviewRoute = require('./routes/reviews');
const helmet = require('helmet');

const app = express();

//body parser
app.use(express.json());

//dev logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//upload files
app.use(fileUpload());

//sanitize data
app.use(mongoSanitize())

//add secrurity headers
app.use(helmet())

//prevent XSS attacks
app.use(xss())

//limit API rate
const limiter=rateLimit({
  windowMs: 10*60*1000, //10 min
  max: 100
})

app.use(limiter)

//Prevent http param pollution
app.use(hpp())

//enable CORS
app.use(cors())

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//mount routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/bootcamps', bootcampsRoute);
app.use('/api/v1/courses', coursesRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
