const Site = require('../models/Site');

// API สำหรับเพิ่มไซต์งานใหม่
exports.createSite = async (req, res) => {
  try {
    const { name, lat, lng, radius } = req.body;

    // ตรวจสอบว่าส่งข้อมูลมาครบไหม
    if (!name || !lat || !lng) {
      return res.status(400).json({ message: 'กรุณาส่งชื่อไซต์ และพิกัด (lat, lng) มาให้ครบ' });
    }

    // สร้างข้อมูลใหม่ตาม Schema
    const newSite = new Site({
      name,
      location: { lat, lng },
      radius: radius || 200 // ถ้าไม่ส่งรัศมีมา ให้ใช้ค่า default ที่ 200 เมตร
    });

    const savedSite = await newSite.save();
    res.status(201).json({ message: 'สร้างไซต์งานสำเร็จ!', site: savedSite });

  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างไซต์งาน', error: error.message });
  }
};

// API สำหรับดึงข้อมูลไซต์งานทั้งหมด
exports.getAllSites = async (req, res) => {
  try {
    const sites = await Site.find();
    res.status(200).json(sites);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  }
};

// API สำหรับอัปเดตข้อมูลไซต์งาน (เช่น เปลี่ยนรัศมี หรือ เปิด/ปิด ไซต์)
exports.updateSite = async (req, res) => {
  try {
    const { radius, isActive } = req.body;
    
    // หาไซต์จาก ID แล้วอัปเดตข้อมูล
    const updatedSite = await Site.findByIdAndUpdate(
      req.params.id, 
      { radius, isActive }, 
      { new: true }
    );

    if (!updatedSite) return res.status(404).json({ message: 'ไม่พบไซต์งานนี้' });
    
    res.status(200).json({ message: 'อัปเดตไซต์งานสำเร็จ!', site: updatedSite });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดต', error: error.message });
  }
};