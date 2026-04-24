// src/controllers/timeLogController.js
const TimeLog = require('../models/TimeLog');
const Site = require('../models/Site');
const { getDistance } = require('../utils/geo');

exports.clockIn = async (req, res) => {
  try {
    const { userId, siteId, lat, lng, image, remark } = req.body;

    // 1. ดึงข้อมูลไซต์งานเพื่อเอาพิกัดและรัศมีมาเช็ค
    const site = await Site.findById(siteId);
    if (!site) return res.status(404).json({ message: 'ไม่พบไซต์งานนี้ในระบบ' });

    // 2. คำนวณระยะทางระหว่างพนักงาน กับ ไซต์งาน
    const distance = getDistance(lat, lng, site.location.lat, site.location.lng);

    // 3. ตรวจสอบว่าอยู่ในรัศมีที่กำหนดหรือไม่
    if (distance > site.radius) {
      return res.status(400).json({ 
        message: `คุณอยู่นอกพื้นที่! (ห่างจากจุดสแกน ${Math.round(distance)} เมตร)`,
        distance: Math.round(distance)
      });
    }

    // 4. บันทึกข้อมูลลงเวลา
    const today = new Date();
    // แปลงวันที่ให้อยู่ในฟอร์แมต YYYY-MM-DD เพื่อให้ค้นหาในตาราง Excel ง่ายๆ
    const dateString = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }); 

    const newTimeLog = new TimeLog({
      user: userId,
      site: siteId,
      date: dateString,
      clockInTime: today,
      clockInImage: image || "", // รูปไม่บังคับ
      remark: remark || ""
    });

    await newTimeLog.save();
    res.status(201).json({ 
      message: 'บันทึกเวลาเข้างานสำเร็จ!', 
      distance: Math.round(distance),
      data: newTimeLog 
    });

  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงเวลา', error: error.message });
  }
};

// API สำหรับดึงข้อมูลการลงเวลาทั้งหมด (สำหรับ Admin)
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await TimeLog.find()
      .populate('user', 'name empCode') // ดึงชื่อและรหัสพนักงานมาด้วย
      .populate('site', 'name')         // ดึงชื่อไซต์งานมาด้วย
      .sort({ createdAt: -1 });         // เรียงจากล่าสุดขึ้นก่อน

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  }
};

// API: เช็คสถานะการลงเวลา (อัปเดตใหม่: รองรับกะดึก และ ควบกะ)
exports.checkTodayStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // ดึงประวัติ "ล่าสุด" ของพนักงานคนนี้มาดู (ไม่สนวันที่แล้ว เพื่อให้สแกนออกข้ามวันได้)
    const log = await TimeLog.findOne({ user: userId }).sort({ createdAt: -1 });

    if (!log || (log && log.clockOutTime)) {
      // ถ้ายังไม่เคยลงเวลาเลย หรือ ล่าสุดสแกนออกไปแล้ว -> แปลว่าพร้อมเข้างานกะใหม่
      return res.status(200).json({ status: 'not_clocked_in' });
    } else {
      // ถ้าล่าสุดมีเวลาเข้า แต่ยังไม่มีเวลาออก -> แปลว่าทำงานค้างอยู่ รอสแกนออก
      return res.status(200).json({ status: 'clocked_in', logId: log._id, siteId: log.site });
    }
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ', error: error.message });
  }
};

// API: สแกนออกงาน
exports.clockOut = async (req, res) => {
  try {
    const { logId, lat, lng, image } = req.body;

    // หาประวัติการลงเวลาของเช้านี้
    const log = await TimeLog.findById(logId).populate('site');
    if (!log) return res.status(404).json({ message: 'ไม่พบประวัติการเข้างานของวันนี้' });

    // ตรวจสอบระยะพิกัด (ต้องกดออกงานในพื้นที่คลังเท่านั้น)
    const distance = getDistance(lat, lng, log.site.location.lat, log.site.location.lng);
    if (distance > log.site.radius) {
      return res.status(400).json({ 
        message: `คุณอยู่นอกพื้นที่! (ห่างจากจุดสแกน ${Math.round(distance)} เมตร)` 
      });
    }

    // อัปเดตเวลาออกงานและรูปภาพ
    log.clockOutTime = new Date();
    log.clockOutImage = image || "";
    
    await log.save();
    res.status(200).json({ message: 'บันทึกเวลาออกงานสำเร็จ!', distance: Math.round(distance) });

  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงเวลาออก', error: error.message });
  }
};