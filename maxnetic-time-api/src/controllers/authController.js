const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// API: สร้างแอดมินใหม่
exports.adminRegister = async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ message: 'มี Admin ชื่อนี้ในระบบแล้ว' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({ username, password: hashedPassword, name });
    await newAdmin.save();
    
    res.status(201).json({ message: 'สร้าง Admin สำเร็จ!' });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
};

// API: Admin เข้าสู่ระบบ
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin) return res.status(400).json({ message: 'ไม่พบ Username นี้' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });

    const token = jwt.sign(
      { adminId: admin._id, role: 'superadmin' }, 
      process.env.JWT_SECRET || 'maxnetic_super_secret_key', 
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'เข้าสู่ระบบ Admin สำเร็จ',
      adminToken: token, // ใช้ชื่อ token แยกกัน
      adminData: { username: admin.username, name: admin.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
};

// API: เพิ่มพนักงานใหม่ (ส่วนใหญ่ Admin จะเป็นคนแอดให้)
exports.register = async (req, res) => {
  try {
    const { empCode, name, password, role } = req.body;

    // เช็คว่ามีพนักงานรหัสนี้ในระบบหรือยัง
    const existingUser = await User.findOne({ empCode });
    if (existingUser) {
      return res.status(400).json({ message: 'รหัสพนักงานนี้มีในระบบแล้ว' });
    }

    // เข้ารหัสผ่านก่อนบันทึกลง Database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // สร้าง User ใหม่
    const newUser = new User({
      empCode,
      name,
      password: hashedPassword,
      role: role || 'employee'
    });

    await newUser.save();
    res.status(201).json({ message: 'เพิ่มพนักงานสำเร็จ!' });

  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
};

// API: ล็อคอินเข้าสู่ระบบ
exports.login = async (req, res) => {
  try {
    const { empCode, password } = req.body;

    // 1. หา User จากรหัสพนักงาน
    const user = await User.findOne({ empCode });
    if (!user) {
      return res.status(400).json({ message: 'ไม่พบรหัสพนักงานนี้ในระบบ' });
    }

    // 2. ตรวจสอบรหัสผ่านว่าตรงกันไหม
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    // 3. สร้าง Token เพื่อให้ Frontend เอาไปใช้ยืนยันตัวตน (อายุ 1 วัน)
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'maxnetic_super_secret_key', 
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: { empCode: user.empCode, name: user.name, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
};

// API: สำหรับให้ Admin ดึงรายชื่อพนักงานทั้งหมด
exports.getAllUsers = async (req, res) => {
  try {
    // ดึงมาทุกคน แต่ไม่เอาฟิลด์รหัสผ่าน (-password) ไปโชว์เพื่อความปลอดภัย
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  }
};