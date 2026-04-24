const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  empCode: { type: String, required: true, unique: true }, // รหัสพนักงาน
  name: { type: String, required: true }, // ชื่อ-นามสกุล
  password: { type: String, required: true }, // รหัสผ่าน (เดี๋ยวเราค่อยทำเข้ารหัส)
  role: { type: String, enum: ['employee', 'admin'], default: 'employee' }, // สิทธิ์การใช้งาน
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);