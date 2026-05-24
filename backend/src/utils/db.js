import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    await seedHeadAdmin();
  } catch (err) {
    console.error(`❌ MongoDB error: ${err.message}`);
    process.exit(1);
  }
};

const seedHeadAdmin = async () => {
  const { default: User } = await import('../models/User.model.js');
  const exists = await User.findOne({ role: 'head_admin' });
  if (exists) {
    // ensure head admin is always active+verified
    if (!exists.isActive || !exists.isVerified) {
      exists.isActive   = true;
      exists.isVerified = true;
      await exists.save();
    }
    return;
  }
  await User.create({
    email:      process.env.HEAD_ADMIN_EMAIL    || 'admin@portal.com',
    password:   process.env.HEAD_ADMIN_PASSWORD || 'Admin@1234',
    role:       'head_admin',
    profile:    { fullName: 'Head Administrator' },
    isActive:   true,
    isVerified: true,
  });
  console.log(`🌱 Head admin seeded: ${process.env.HEAD_ADMIN_EMAIL}`);
};

export default connectDB;
