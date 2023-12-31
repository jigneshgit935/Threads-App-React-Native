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
      user: process.env.EMAIL_SEND,
      pass: process.env.SECRET_PASSWORD,
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

// endpoint to access all the users (except the login user)

app.get('/user/:userId', (req, res) => {
  try {
    const loggedInUserId = req.params.userId;
    User.find({ _id: { $ne: loggedInUserId } })
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((error) => {
        console.log('Error', error);
        res.status(500).json('error');
      });
  } catch (error) {
    res.status(500).json({ message: 'error getting the users' });
  }
});

// endpoint to follow  a particular user
app.post('/follow', async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { followers: currentUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'error in following a user' });
  }
});

// for unfollow a particular user
app.post('/users/unfollow', async (req, res) => {
  const { loggedInUserId, targetUserId } = req.body;

  try {
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: loggedInUserId },
    });

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user' });
  }
});

// endpoint to create a new post
app.post('/create-post', async (req, res) => {
  try {
    const { content, userId } = req.body;
    const newPostData = {
      user: userId,
    };
    if (content) {
      newPostData.content = content;
    }
    const newPost = new Post(newPostData);

    await newPost.save();

    res.status(200).json({ message: 'Post saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'post creation failed' });
  }
});

// endpoint  liking a particular post
app.put('/post/:postId/:userId/like', async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.userId;

    const post = await Post.findById(postId).populate('user', 'name');

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'post not found' });
    }

    updatedPost.user = post.user;

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'an error while liking' });
  }
});

// endpoint  unlike a particular post
app.put('/post/:postId/:userId/unlike', async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.userId;

    const post = await Post.findById(postId).populate('user', 'name');

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'post not found' });
    }

    updatedPost.user = post.user;

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'an error while liking' });
  }
});

// endpoint to get all the post
app.get('/get-posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'An occured while getting the post' });
  }
});
