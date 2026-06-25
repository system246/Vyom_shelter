import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  serviceId:       { type: String, required: true, unique: true },
  title:           { type: String, required: true, trim: true },
  category:        {
    type: String, required: true,
    enum: ['Labour', 'Home Repair', 'Daily Essentials', 'Professional', 'Other'],
  },
  description:     { type: String, required: true },
  image:           { type: String, default: '' },
  tags:            [{ type: String, trim: true }],
  providerName:    { type: String, default: '' },
  providerPhone:   { type: String, default: '' },
  providerDetails: { type: String, default: '' },
  status:          { type: String, enum: ['active', 'inactive'], default: 'active' },
  addedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views:           { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
