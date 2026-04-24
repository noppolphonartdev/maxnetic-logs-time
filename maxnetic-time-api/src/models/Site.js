const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // เช่น BDC1, CMG, SCDC
  location: {
    lat: { type: Number, required: true }, // ละติจูด
    lng: { type: Number, required: true }  // ลองจิจูด
  },
  radius: { type: Number, default: 200 }, // รัศมีที่อนุญาตให้สแกนได้ (เมตร) แอดมินแก้ได้
  isActive: { type: Boolean, default: true } // เปิด/ปิด ไซต์งานนี้
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema);