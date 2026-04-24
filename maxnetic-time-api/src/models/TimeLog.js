const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // เชื่อมกับ User
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true }, // เชื่อมกับ Site
  date: { type: String, required: true }, // เก็บวันที่เพียวๆ เช่น '2026-04-24' เพื่อให้ค้นหาง่าย
  clockInTime: { type: Date, required: true }, // เวลาเข้างาน
  clockOutTime: { type: Date }, // เวลาออกงาน (ตอนแรกจะยังว่างไว้)
  clockInImage: { type: String, default: '' }, // รูปถ่ายตอนเข้า (ไม่บังคับ)
  clockOutImage: { type: String }, // ลิ้งก์รูปถ่ายตอนออก
  remark: { type: String }, // หมายเหตุ เช่น "สาย(ยางรถแตก)" เหมือนใน Excel ของคุณเบียร์
}, { timestamps: true });

module.exports = mongoose.model('TimeLog', timeLogSchema);