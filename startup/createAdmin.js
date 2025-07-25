/* eslint-disable no-console */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const readline = require('readline');
const { Admin, validate } = require('../models/admin');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const printError = '\x1b[31m%s\x1b[0m';
const printSuccess = '\x1b[32m%s\x1b[0m';

mongoose.connect(
  process.env.DB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err) => {
    if (err) throw err;
  },
);

(() => {
  rl.question('Please Enter Username : ', (username) => {
    rl.question('Please Enter a Password : ', async (password) => {
      // Validate Admin Object.
      const { error } = validate({ username, password });

      if (error) {
        rl.close();
        rl.removeAllListeners();
        return console.log(printError, error.details[0].message);
      }

      let admin = await Admin.findOne({ username });
      if (admin) {
        console.log(printError, 'Username already registered, Try again with Different one.');
        rl.close(process.exit(0));
      }
      admin = await new Admin({ username, password });

      try {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);

        const { username: registerUsername } = await admin.save();
        console.log(printSuccess, `Successfully registered user -> : '${registerUsername}'`);
        rl.close(process.exit(1));
      } catch (ex) {
        console.log(printError, ex.message);
      }
    });
  });
})();
