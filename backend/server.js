const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const attendanceRoutes = require('./routes/attendance');
const marksRoutes = require('./routes/marks');
const feesRoutes = require('./routes/fees');
const coursesRoutes = require('./routes/courses');
const timetableRoutes = require('./routes/timetable');
const profileRoutes = require('./routes/profile');
const seedRoutes = require('./routes/seed');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern_db';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    // Seed Admin User if not exists
    try {
      const User = require('./models/User');
      const adminEmail = 'admin@gmail.com';
      const existingAdmin = await User.findOne({ email: adminEmail });

      if (!existingAdmin) {
        const adminUser = new User({
          name: 'Admin',
          studentId: 'ADMIN001', // Dummy ID for admin
          email: adminEmail,
          password: 'admin', // Will be hashed by pre-save hook
          role: 'admin',
          phone: '0000000000'
        });
        await adminUser.save();
        console.log('Admin user seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding admin:', error);
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/seed', seedRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
