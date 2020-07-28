import mongoose from 'mongoose';
import chalk from 'chalk';

const connectDB = async (dbURI = process.env.DB_URI) => {
  try {
    // console.log(process.env.DB_URI);
    mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });

    console.log(chalk.green.inverse("Database connected"));
  } catch (err) {
    console.log("ERROR: DATABASE CONNECTION FAIL", err);
  }
};

export default connectDB ;