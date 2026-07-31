import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from './models/User.js';
import Message from './models/Message.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'blu_super_secure_safety_key_123';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blu-social')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- ROOT ROUTE (Fixes Cannot GET / error) ---
app.get('/', (req, res) => {
  res.status(200).send('Blu Social API is live and operational!');
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, age, bluId, interest, bio } = req.body;
    if (age >= 18) {
      return res.status(400).json({ error: 'Blu Social is strictly for users under 18 years old.' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { bluId }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or Blu ID is already registered.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name, email, phone, password: hashedPassword, age, bluId, interest, bio
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser._id, name, email, bluId, age, interest, bio, avatar: newUser.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, bluId: user.bluId, age: user.age, interest: user.interest, bio: user.bio, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DISCOVERY & SEARCH ROUTES ---
app.get('/api/users/discover/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const excludedIds = [...user.connections, user._id];
    const profiles = await User.find({ _id: { $nin: excludedIds }, age: { $lt: 18 } }).select('-password');
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/connect', async (req, res) => {
  try {
    const { userId, targetId } = req.body;
    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user.connections.includes(targetId)) {
      user.connections.push(targetId);
      await user.save();
    }
    if (!target.connections.includes(userId)) {
      target.connections.push(userId);
      await target.save();
    }
    res.json({ success: true, message: 'Connected successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/search', async (req, res) => {
  try {
    const { query } = req.query;
    const user = await User.findOne({
      $or: [{ bluId: query }, { email: query }, { phone: query }]
    }).select('-password');
    if (!user) return res.status(404).json({ error: 'Friend not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/connections/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('connections', '-password');
    res.json(user.connections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CHAT MESSAGING ROUTES ---
app.get('/api/messages/:userId/:targetId', async (req, res) => {
  try {
    const { userId, targetId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: targetId },
        { sender: targetId, recipient: userId }
      ]
    }).sort('createdAt');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SOCKET.IO REAL-TIME CHAT & CALLS ---
io.on('connection', (socket) => {
  socket.on('join_chat', (room) => {
    socket.join(room);
  });

  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
        sender: data.sender,
        recipient: data.recipient,
        text: data.text
      });
      await newMessage.save();
      io.to(data.room).emit('receive_message', newMessage);
    } catch (err) {
      console.error('Socket message save error:', err);
    }
  });

  socket.on('call_user', (data) => {
    io.to(data.to).emit('incoming_call', { signal: data.signalData, from: data.from, name: data.name, type: data.type });
  });

  socket.on('answer_call', (data) => {
    io.to(data.to).emit('call_accepted', data.signal);
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server fully running on port ${PORT}`));
