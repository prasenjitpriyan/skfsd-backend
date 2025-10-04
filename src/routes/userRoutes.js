import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, employeeId, phone } = req.body;

    const newUser = new User({
      name,
      email,
      password,
      employeeId,
      phone,
    });

    const savedUser = await newUser.save();
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res
      .status(201)
      .json({ message: 'User registered successfully!', user: userResponse });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: 'Email or Employee ID already exists.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password.' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'Login successful!',
      user: userResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'preferences'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User updated successfully!', user });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error during update.' });
  }
});

export default router;
