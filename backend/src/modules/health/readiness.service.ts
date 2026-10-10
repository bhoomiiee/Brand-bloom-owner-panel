import mongoose from 'mongoose';

export const readinessService = {
  async checkDependencies() {
    const mongoReady = mongoose.connection.readyState === 1;
    return {
      status: mongoReady ? 'READY' : 'DEGRADED',
      database: mongoReady ? 'CONNECTED' : 'DISCONNECTED'
    };
  }
};
