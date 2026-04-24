const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // นำเข้า mongoose
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- เพิ่มส่วนเชื่อมต่อ Database ตรงนี้ ----
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/maxnetic-time'; // มี fallback ให้เผื่อรัน local

mongoose.connect(mongoURI)
  .then(() => console.log('✅ เชื่อมต่อ MongoDB สำเร็จแล้ว!'))
  .catch((err) => console.error('❌ เชื่อมต่อ MongoDB ไม่สำเร็จ:', err));
// ------------------------------------

const siteRoutes = require('./src/routes/siteRoutes');
const authRoutes = require('./src/routes/authRoutes');
const timeLogRoutes = require('./src/routes/timeLogRoutes');

app.use('/api/sites', siteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/timelogs', timeLogRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Maxnetic Time API! ระบบหลังบ้านพร้อมทำงาน 🚀');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});