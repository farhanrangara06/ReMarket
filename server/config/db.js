import mongoose from 'mongoose';

// Atlas + Render: force IPv4 to avoid TLS "alert internal error" on some hosts
const getConnectOptions = () => ({
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
  autoSelectFamily: false,
  maxPoolSize: 10,
});

const getMongoUri = () => {
  const uri = process.env.MONGO_URI?.trim();
  if (!uri) throw new Error('MONGO_URI is not set');
  return uri;
};

let reconnectTimer = null;

const scheduleReconnect = (delayMs = 10000) => {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (mongoose.connection.readyState === 1) return;
    console.log('Retrying MongoDB connection...');
    await connectDB();
  }, delayMs);
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  try {
    const conn = await mongoose.connect(getMongoUri(), getConnectOptions());
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error(
      'Fix: MongoDB Atlas → Network Access → Add IP → Allow Access from Anywhere (0.0.0.0/0)'
    );
    // Do NOT exit — keep server alive so Render deploy stays up while Atlas is fixed
    scheduleReconnect();
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — will retry');
  scheduleReconnect();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

mongoose.connection.on('connected', () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
});

export const getDBStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

export default connectDB;
