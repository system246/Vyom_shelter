import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './utils/db.js';
import authRoutes         from './routes/auth.routes.js';
import userRoutes         from './routes/user.routes.js';
import associateRoutes    from './routes/associate.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import activityRoutes     from './routes/activity.routes.js';
import propertyRoutes     from './routes/property.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/associates',    associateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-log',  activityRoutes);
app.use('/api/properties',    propertyRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  API   → http://localhost:${PORT}/api`);
  console.log(`📁  Files → http://localhost:${PORT}/uploads\n`);
});
