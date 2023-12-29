const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

//uncaught Exceptions -- must be declared at the beginning of the file,
//in order to really catch all possible unhandled erros

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

let DB = process.env.DATABASE.replace('<USER>', process.env.USER);
DB = DB.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful');
    const port = process.env.PORT || 3000;

    const server = app.listen(port, () => {
      console.log(`App running on port ${port}...`);
    });
    //safety net for unhandled rejection promises
    process.on('unhandledrejection', (err) => {
      console.log(err.name, err.message);
      console.log('UNHANDLED REJECTION!');
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => console.log(err));
