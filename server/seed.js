// Run with: npm run seed
// Puts sample users, equipment, reservations and issues into MongoDB.
// WARNING: it deletes the old data in this database first.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Equipment = require('./models/Equipment');
const Reservation = require('./models/Reservation');
const Issue = require('./models/Issue');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_lab_db';

// date helper: today + some days
function daysFromNow(days, hour) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to ' + mongoose.connection.name);

    // delete the whole database first (this also removes old indexes from older versions)
    await mongoose.connection.dropDatabase();
    // build the indexes again (unique email, unique equipment code)
    await Promise.all([User.init(), Equipment.init(), Reservation.init(), Issue.init()]);

    const users = await User.create([
      { name: 'System Admin', email: 'admin@smartlab.lk', password: await bcrypt.hash('Admin@123', 10), role: 'admin' },
      { name: 'Nimal Perera', email: 'tech@smartlab.lk', password: await bcrypt.hash('Tech@123', 10), role: 'technician' },
      { name: 'Amal Fernando', email: 'student@smartlab.lk', password: await bcrypt.hash('Student@123', 10), role: 'student' },
      { name: 'Dinithi Jayasinghe', email: 'student2@smartlab.lk', password: await bcrypt.hash('Student@123', 10), role: 'student' },
    ]);
    const student1 = users[2];
    const student2 = users[3];

    const eq = await Equipment.create([
      { equipmentCode: 'LAB-OSC-001', name: 'Digital Oscilloscope', category: 'Measurement', location: 'Electronics Lab', description: '100 MHz four channel oscilloscope.', totalQuantity: 8, availableQuantity: 7, condition: 'Excellent', status: 'Available' },
      { equipmentCode: 'LAB-RPI-012', name: 'Raspberry Pi 5 Kit', category: 'Computing', location: 'Embedded Systems Lab', description: 'Raspberry Pi with power supply and SD card.', totalQuantity: 15, availableQuantity: 12, condition: 'Good', status: 'Available' },
      { equipmentCode: 'LAB-RTR-004', name: 'Cisco Router', category: 'Networking', location: 'Networking Lab', description: 'Router used for network configuration practicals.', totalQuantity: 6, availableQuantity: 2, condition: 'Good', status: 'Limited' },
      { equipmentCode: 'LAB-ARM-002', name: 'Robot Arm', category: 'Robotics', location: 'Robotics Lab', description: 'Six axis desktop robot arm.', totalQuantity: 3, availableQuantity: 2, condition: 'Good', status: 'Available' },
      { equipmentCode: 'LAB-FPG-008', name: 'FPGA Development Board', category: 'Electronics', location: 'Digital Systems Lab', description: 'Artix-7 FPGA board for digital design labs.', totalQuantity: 10, availableQuantity: 10, condition: 'Excellent', status: 'Available' },
      { equipmentCode: 'LAB-PSU-003', name: 'DC Power Supply', category: 'Electronics', location: 'Electronics Lab', description: 'Programmable triple output power supply.', totalQuantity: 5, availableQuantity: 0, condition: 'Needs Repair', status: 'Maintenance' },
    ]);

    await Reservation.create([
      { equipment: eq[0]._id, user: student1._id, startDate: daysFromNow(2, 10), endDate: daysFromNow(2, 14), quantity: 1, purpose: 'Analog electronics practical', status: 'pending' },
      { equipment: eq[1]._id, user: student1._id, startDate: daysFromNow(5, 9), endDate: daysFromNow(7, 16), quantity: 2, purpose: 'Embedded systems mini project', status: 'approved' },
      { equipment: eq[2]._id, user: student2._id, startDate: daysFromNow(3, 13), endDate: daysFromNow(3, 16), quantity: 1, purpose: 'OSPF routing experiment', status: 'pending' },
    ]);

    await Issue.create([
      { equipment: eq[5]._id, reportedBy: student1._id, title: 'Output voltage is unstable', description: 'Channel two fluctuates when a small load is connected.', priority: 'high', status: 'in_progress' },
      { equipment: eq[2]._id, reportedBy: student2._id, title: 'Console cable is loose', description: 'The serial cable disconnects when it moves.', priority: 'medium', status: 'open' },
    ]);

    console.log('Sample data added successfully.');
    console.log('Admin:      admin@smartlab.lk   / Admin@123');
    console.log('Technician: tech@smartlab.lk    / Tech@123');
    console.log('Student:    student@smartlab.lk / Student@123');
  } catch (err) {
    console.log('Seeding failed: ' + err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed()