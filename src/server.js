import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
});

const app = express();
app.use(express.json());

connectDB();

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('SKFSD Backend is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
