import { Router, Request, Response } from 'express';
import { execPath } from 'process';
import botTest from '../controllers/message-controller';

const router = Router();

router.post('/send-msg', botTest.sendMsg);
router.post('/recieve-msg', botTest.recieveMsg);
router.post('/status-msg', botTest.statusMsg);

export default router;