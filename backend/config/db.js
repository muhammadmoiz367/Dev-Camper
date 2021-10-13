const mongoose = require('mongoose');

const connectDB = async () => {
  // console.log('mongo ', process.env.MONGO_URI);
  const URI = process.env.MONGO_URI;
  mongoose.connect(
    URI,
    {
      useNewUrlParser: true,

      useUnifiedTopology: true,
    },
    (err) => {
      if (err) throw err;
      console.log('Connected to MongoDB!!!'.cyan.underline.bold);
    }
  );
};

module.exports = connectDB;
