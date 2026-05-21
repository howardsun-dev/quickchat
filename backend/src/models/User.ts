import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      unique: false,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: '',
    },
    lastSeen: {
      type: Date,
    },
    // ✅ Reset password fields
    resetPasswordToken: {
      type: String,
      default: undefined,
      required: false,
    },
    resetPasswordExpire: {
      type: Date,
      default: undefined,
      required: false,
    },
  },
  { timestamps: true } // createdAt & updatedAt
);

const User = mongoose.model('User', userSchema);

export default User;
