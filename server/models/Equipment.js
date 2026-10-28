const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    equipmentCode: {
      type: String,
      required: [true, 'Equipment code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: { type: String, required: [true, 'Equipment name is required'], trim: true },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Computing', 'Electronics', 'Measurement', 'Networking', 'Robotics', 'Other'],
    },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    totalQuantity: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [1, 'Total quantity must be at least 1'],
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
    },
    condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Needs Repair'], default: 'Good' },
    status: { type: String, enum: ['Available', 'Limited', 'Maintenance'], default: 'Available' },
  },
  { timestamps: true }
);

// available quantity cannot be more than total quantity
equipmentSchema.pre('validate', function (next) {
  if (this.availableQuantity > this.totalQuantity) {
    this.invalidate('availableQuantity', 'Available quantity cannot be more than total quantity');
  }
  next();
});

module.exports = mongoose.model('Equipment', equipmentSchema);
