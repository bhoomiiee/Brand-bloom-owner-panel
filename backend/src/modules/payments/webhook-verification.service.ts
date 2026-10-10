import crypto from 'crypto';

export const webhookVerificationService = {
  verifySignature(payload: any, signature?: string, secret: string = 'whsec_test_secret'): boolean {
    if (!signature) return false;
    const bodyStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expected = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
    try {
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expected);
      if (sigBuf.length !== expBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }
};
