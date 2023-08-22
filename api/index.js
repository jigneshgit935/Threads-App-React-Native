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

const User = require('./models/user');
const Post = require('./models/post');

// register a user in backend

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(404).json({ message: 'Email already registered' });
    }
    // create a new user
    const newUser = new User({ name, email, password });

    // generate and store the verification token
    newUser.verificationToken = crypto.randomBytes(20).toString('hex');

    // save the user to the backend
    await newUser.save();

    // send the verification email to the user

    sendVerificationEmail(newUser.email, newUser.verificationToken);

    res.status(200).json({
      message: 'Registration successfull',
    });
  } catch (error) {
    console.log('error registering user', error);
    res.status(500).json({
      message: 'error registering user',
    });
  }
});

const sendVerificationEmail = async (email, verificationToken) => {
  // create a nodemialer transporter

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jinu.sharma.935@gmail.com',
      pass: 'sgokshhaygfrxale',
    },
  });

  // compose the email message
  const mailOptions = {
    from: 'threads.com',
    to: email,
    subject: 'Email Verification',
    text: `please click the following link to verify your email http://localhost:3000/verify/${verificationToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('error sending mail', error);
  }
};

app.get('/verify/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).json({ message: 'Invalid token' });
    }
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
    res.status(200).json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.log('error getting token', error);
    res.status(500).json({ message: 'Email verification failed' });
  }
});

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString('hex');
  return secretKey;
};

const secretKey = generateSecretKey();
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'Invalid email' });
    }

    if (user.password !== password) {
      return res.status(404).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);
    return res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});
