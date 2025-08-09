// certificate Routes
import { Router } from 'express';
import { getCertificateById, listCertificates } from '../controllers/certificate.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/certificates/:id', authenticate, getCertificateById);
router.get('/certificates', authenticate, listCertificates);

export default router;
