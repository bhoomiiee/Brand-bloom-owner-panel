import { Router } from 'express';
import { exec } from 'child_process';
import path from 'path';

const router = Router();

router.get('/', (_req, res) => {
  exec('npx tsx scripts/sync-from-brandbloom.ts', (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message, stderr });
    }
    return res.json({ success: true, message: 'Data synced successfully from BrandBloom to MongoDB', output: stdout });
  });
});

export default router;
