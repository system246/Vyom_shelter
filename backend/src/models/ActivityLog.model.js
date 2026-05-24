import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action:     { type: String, required: true }, // e.g. 'APPROVE_USER', 'REJECT_ASSOCIATE'
  performedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['User', 'Associate'], required: true },
  targetId:   { type: String, required: true },
  targetName: { type: String },
  details:    { type: String },
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
