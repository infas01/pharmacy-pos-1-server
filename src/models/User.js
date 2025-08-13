import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['Admin', 'Sub Admin', 'Cashier'],
      default: 'Cashier'
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);