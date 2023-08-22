const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors());

dotenv.config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const jwt = require('jsonwebtoken');

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to Mongodb');
  })
  .catch((err) => {
    console.log('Error Connecting to Mongodb', err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
