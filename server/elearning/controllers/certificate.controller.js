const CertificateService = require('../services/certificate.service');
const { executeQuery } = require('../../config/database');
const { ok, created, noContent, badRequest, unauthorized, forbidden, notFound, serverError } = require('../../utils/response');

class CertificateController {
  
  // Create certificate for completed course
  async createCertificate(req, res) {
    try {
      const { enrollmentId } = req.params;
      const { templateId, partnerIds, grade, score } = req.body;
      
      // Get enrollment details
      const enrollmentQuery = `
        SELECT ce.*, c.title as course_title, c.category, c.level, c.duration_hours,
               c.completion_certificate, u.first_name, u.last_name, u.email,
               CONCAT(ui.first_name, ' ', ui.last_name) as instructor_name
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        JOIN users u ON ce.user_id = u.id
        JOIN users ui ON c.instructor_id = ui.id
        WHERE ce.id = ? AND ce.is_completed = 1
      `;
      
      const enrollments = await executeQuery(enrollmentQuery, [enrollmentId]);
      if (enrollments.length === 0) {
        return notFound(res, 'Completed enrollment not found');
      }
      
      const enrollment = enrollments[0];
      
      // Check if certificate already exists
      if (enrollment.certificate_issued) {
        return badRequest(res, 'Certificate already issued for this enrollment');
      }
      
      // Get template if specified
      let template = null;
      if (templateId) {
        const templates = await executeQuery('SELECT * FROM certificate_templates WHERE id = ? AND is_active = 1', [templateId]);
        template = templates[0] || null;
      }
      
      // Create certificate
      const certificate = await CertificateService.createCertificate(
        enrollment,
        {
          id: enrollment.course_id,
          title: enrollment.course_title,
          category: enrollment.category,
          level: enrollment.level,
          duration_hours: enrollment.duration_hours,
          instructor_name: enrollment.instructor_name
        },
        {
          id: enrollment.user_id,
          first_name: enrollment.first_name,
          last_name: enrollment.last_name,
          email: enrollment.email
        },
        template
      );
      
      // Add partner endorsements if specified
      if (partnerIds && partnerIds.length > 0) {
        for (const partnerId of partnerIds) {
          await CertificateService.addPartnerEndorsement(
            certificate.id,
            partnerId,
            'co_signature',
            'Endorsed by partner organization'
          );
        }
      }
      
      // Log certificate creation
      await CertificateService.logCertificateEvent(
        certificate.id,
        'view',
        { action: 'created' },
        req.ip,
        req.get('User-Agent')
      );
      
      return created(res, {
        message: 'Certificate created successfully',
        data: certificate
      });
      
    } catch (error) {
      console.error('Create certificate error:', error);
      return serverError(res, 'Failed to create certificate', error);
    }
  }

  // Get user certificates
  async getUserCertificates(req, res) {
    try {
      const userId = req.user.id;
      const filters = {
        status: req.query.status,
        course_id: req.query.course_id,
        limit: parseInt(req.query.limit) || 20
      };
      
      const certificates = await CertificateService.getUserCertificates(userId, filters);
      
      return ok(res, {
        data: certificates,
        count: certificates.length
      });
      
    } catch (error) {
      console.error('Get user certificates error:', error);
      return serverError(res, 'Failed to retrieve certificates', error);
    }
  }

  // Get certificate by ID
  async getCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const certificate = await CertificateService.getCertificateById(certificateId);
      
      if (!certificate) {
        return notFound(res, 'Certificate not found');
      }
      
      // Check if user has access to this certificate
      if (certificate.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'instructor') {
        return forbidden(res, 'Access denied to this certificate');
      }
      
      // Log certificate view
      await CertificateService.logCertificateEvent(
        certificateId,
        'view',
        { action: 'viewed' },
        req.ip,
        req.get('User-Agent')
      );
      
      return ok(res, { data: certificate });
      
    } catch (error) {
      console.error('Get certificate error:', error);
      return serverError(res, 'Failed to retrieve certificate', error);
    }
  }

  // Verify certificate
  async verifyCertificate(req, res) {
    try {
      const { verificationCode } = req.params;
      const result = await CertificateService.verifyCertificate(verificationCode);
      
      if (!result.valid) {
        return badRequest(res, result.message);
      }
      
      return ok(res, {
        message: 'Certificate is valid',
        data: result.certificate
      });
      
    } catch (error) {
      console.error('Verify certificate error:', error);
      return serverError(res, 'Failed to verify certificate', error);
    }
  }

  // Download certificate PDF
  async downloadCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const certificate = await CertificateService.getCertificateById(certificateId);
      
      if (!certificate) {
        return notFound(res, 'Certificate not found');
      }
      
      // Check access
      if (certificate.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'instructor') {
        return forbidden(res, 'Access denied to this certificate');
      }
      
      if (!certificate.pdf_url) {
        return badRequest(res, 'Certificate PDF not available');
      }
      
      // Log download
      await CertificateService.logCertificateEvent(
        certificateId,
        'download',
        { action: 'downloaded' },
        req.ip,
        req.get('User-Agent')
      );
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate_${certificate.certificate_number}.pdf"`);
      
      // In a real implementation, you would stream the PDF file
      return ok(res, {
        message: 'Certificate download initiated',
        download_url: certificate.pdf_url
      });
      
    } catch (error) {
      console.error('Download certificate error:', error);
      return serverError(res, 'Failed to download certificate', error);
    }
  }

  // Share certificate
  async shareCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const { platform, isPublic = false } = req.body;
      
      const certificate = await CertificateService.getCertificateById(certificateId);
      
      if (!certificate) {
        return notFound(res, 'Certificate not found');
      }
      
      // Check access
      if (certificate.user_id !== req.user.id) {
        return forbidden(res, 'Access denied to this certificate');
      }
      
      // Generate share URL
      const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/verify/${certificate.verification_code}`;
      
      // Log share
      await CertificateService.logCertificateEvent(
        certificateId,
        'share',
        { platform, isPublic, shareUrl },
        req.ip,
        req.get('User-Agent')
      );
      
      return ok(res, {
        message: 'Certificate shared successfully',
        data: {
          share_url: shareUrl,
          platform,
          is_public: isPublic
        }
      });
      
    } catch (error) {
      console.error('Share certificate error:', error);
      return serverError(res, 'Failed to share certificate', error);
    }
  }

  // Get certificate analytics
  async getCertificateAnalytics(req, res) {
    try {
      const { certificateId } = req.params;
      
      // Check if user has access
      const certificate = await CertificateService.getCertificateById(certificateId);
      if (!certificate) {
        return notFound(res, 'Certificate not found');
      }
      
      if (certificate.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'instructor') {
        return forbidden(res, 'Access denied to certificate analytics');
      }
      
      const analytics = await CertificateService.getCertificateAnalytics(certificateId);
      
      return ok(res, { data: analytics });
      
    } catch (error) {
      console.error('Get certificate analytics error:', error);
      return serverError(res, 'Failed to retrieve certificate analytics', error);
    }
  }

  // Create certificate template
  async createCertificateTemplate(req, res) {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
        return forbidden(res, 'Only admins and instructors can create certificate templates');
      }
      
      const templateData = {
        ...req.body,
        created_by: req.user.id
      };
      
      const templateId = await CertificateService.createCertificateTemplate(templateData);
      
      return created(res, {
        message: 'Certificate template created successfully',
        data: { template_id: templateId }
      });
      
    } catch (error) {
      console.error('Create certificate template error:', error);
      return serverError(res, 'Failed to create certificate template', error);
    }
  }

  // Get certificate templates
  async getCertificateTemplates(req, res) {
    try {
      const filters = {
        template_type: req.query.template_type,
        organization_id: req.query.organization_id
      };
      
      const templates = await CertificateService.getCertificateTemplates(filters);
      
      return ok(res, { data: templates });
      
    } catch (error) {
      console.error('Get certificate templates error:', error);
      return serverError(res, 'Failed to retrieve certificate templates', error);
    }
  }

  // Create partner organization
  async createPartnerOrganization(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return forbidden(res, 'Only admins can create partner organizations');
      }
      
      const partnerId = await CertificateService.createPartnerOrganization(req.body);
      
      return created(res, {
        message: 'Partner organization created successfully',
        data: { partner_id: partnerId }
      });
      
    } catch (error) {
      console.error('Create partner organization error:', error);
      return serverError(res, 'Failed to create partner organization', error);
    }
  }

  // Get partner organizations
  async getPartnerOrganizations(req, res) {
    try {
      const filters = {
        partnership_type: req.query.partnership_type
      };
      
      const partners = await CertificateService.getPartnerOrganizations(filters);
      
      return ok(res, { data: partners });
      
    } catch (error) {
      console.error('Get partner organizations error:', error);
      return serverError(res, 'Failed to retrieve partner organizations', error);
    }
  }

  // Associate course with partners
  async associateCourseWithPartners(req, res) {
    try {
      const { courseId } = req.params;
      const { partnerIds, primaryPartnerId } = req.body;
      
      // Check if user is instructor or admin
      const courseQuery = 'SELECT instructor_id FROM courses WHERE id = ?';
      const courses = await executeQuery(courseQuery, [courseId]);
      
      if (courses.length === 0) {
        return notFound(res, 'Course not found');
      }
      
      if (courses[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
        return forbidden(res, 'Only the course instructor or admin can associate partners');
      }
      
      await CertificateService.associateCourseWithPartners(courseId, partnerIds, primaryPartnerId);
      
      return ok(res, {
        message: 'Course successfully associated with partners',
        data: { course_id: courseId, partner_ids: partnerIds }
      });
      
    } catch (error) {
      console.error('Associate course with partners error:', error);
      return serverError(res, 'Failed to associate course with partners', error);
    }
  }

  // Get course partners
  async getCoursePartners(req, res) {
    try {
      const { courseId } = req.params;
      const partners = await CertificateService.getCoursePartners(courseId);
      
      return ok(res, { data: partners });
      
    } catch (error) {
      console.error('Get course partners error:', error);
      return serverError(res, 'Failed to retrieve course partners', error);
    }
  }

  // Revoke certificate
  async revokeCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const { reason } = req.body;
      
      if (req.user.role !== 'admin') {
        return forbidden(res, 'Only admins can revoke certificates');
      }
      
      const certificate = await CertificateService.getCertificateById(certificateId);
      if (!certificate) {
        return notFound(res, 'Certificate not found');
      }
      
      // Update certificate status
      await executeQuery(
        'UPDATE certificates SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['revoked', certificateId]
      );
      
      // Log revocation
      await CertificateService.logCertificateEvent(
        certificateId,
        'revoke',
        { reason, revoked_by: req.user.id },
        req.ip,
        req.get('User-Agent')
      );
      
      return ok(res, {
        message: 'Certificate revoked successfully',
        data: { certificate_id: certificateId, reason }
      });
      
    } catch (error) {
      console.error('Revoke certificate error:', error);
      return serverError(res, 'Failed to revoke certificate', error);
    }
  }
}

module.exports = new CertificateController();
