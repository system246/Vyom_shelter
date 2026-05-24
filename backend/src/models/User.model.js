import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['head_admin', 'admin', 'associate'],
      required: true,
    },
    // Extra roles granted on top of primary role (e.g. associate promoted to admin keeps both)
    roles: {
      type: [String],
      enum: ['head_admin', 'admin', 'associate'],
      default: [],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    profile: {
      fullName:    { type: String, required: true, trim: true },
      mobile:      { type: String, default: '' },
      photoUrl:    { type: String, default: null },
    },
    associateRecordId: { type: String, default: null },
    isActive:   { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    otp:        { type: String, select: false },
    otpExpiry:  { type: Date,   select: false },
    isSelfRegistered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual: all effective roles (primary + extra)
userSchema.virtual('effectiveRoles').get(function () {
  return [...new Set([this.role, ...(this.roles || [])])];
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.set('toJSON', {
  transform: (_, obj) => {
    delete obj.password; delete obj.otp; delete obj.otpExpiry;
    // Expose effectiveRoles as a flat array so frontend can use it
    obj.effectiveRoles = [...new Set([obj.role, ...(obj.roles || [])])];
    return obj;
  },
});

export default mongoose.model('User', userSchema);
