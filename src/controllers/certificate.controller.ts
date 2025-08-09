import { Request, Response } from 'express';
import { Certificate } from '../models/certificate.model';
import { AuthRequest } from '../types/AuthRequest';
import path from 'path';
import fs from 'fs';

export const getCertificateById = async (req: AuthRequest, res: Response) => {
  const certId = req.params.id;

  try {
    const certificate = await Certificate.findById(certId);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Authorization: Allow only owner or admin
    if (
      req.user?.role !== 'admin' &&
      certificate.userId.toString() !== req.user?.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const absolutePath = path.resolve(certificate.filePath);

    // Stream or download PDF
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Certificate file not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=certificate_${certificate._id}.pdf`
    );

    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const listCertificates = async (req: AuthRequest, res: Response) => {
  const { userId, page = '1', limit = '10' } = req.query;

  // Pagination params validation
  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

  try {
    let filter: any = {};

    if (userId) {
      filter.userId = userId;
    }

    // Non-admin users can only see their own certificates
    if (req.user?.role !== 'admin') {
      filter.userId = req.user?.id;
    }

    const total = await Certificate.countDocuments(filter);

    const certificates = await Certificate.find(filter)
      .sort({ issuedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('userId', 'name email')
      .populate('testSessionId', 'testId score awardedLevel')
      .lean();

    res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data: certificates,
    });
  } catch (error) {
    console.error('Error listing certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
