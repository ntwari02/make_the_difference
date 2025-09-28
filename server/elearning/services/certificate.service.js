const { executeQuery } = require('../../config/database');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// PDF generation will be implemented when pdfkit is properly installed
// const PDFDocument = require('pdfkit');

class CertificateService {
  
  // Generate unique certificate number
  generateCertificateNumber(courseId, userId) {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `CERT-${courseId.substring(0, 8)}-${userId.substring(0, 8)}-${timestamp}-${random}`.toUpperCase();
  }

  // Generate verification code
  generateVerificationCode() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  // Create certificate
  async createCertificate(enrollmentData, courseData, userData, templateData = null) {
    try {
      const certificateNumber = this.generateCertificateNumber(courseData.id, userData.id);
      const verificationCode = this.generateVerificationCode();
      
      const certificateId = crypto.randomUUID();
      
      const query = `
        INSERT INTO certificates (
          id, enrollment_id, user_id, course_id, template_id, certificate_number,
          title, issued_to_name, issued_to_email, course_title, completion_date,
          issue_date, grade, score, duration_hours, certificate_type, status,
          verification_code, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        certificateId,
        enrollmentData.id,
        userData.id,
        courseData.id,
        templateData?.id || null,
        certificateNumber,
        `Certificate of Completion - ${courseData.title}`,
        `${userData.first_name} ${userData.last_name}`,
        userData.email,
        courseData.title,
        enrollmentData.completed_at,
        new Date(),
        this.calculateGrade(enrollmentData.completion_percentage),
        enrollmentData.completion_percentage,
        courseData.duration_hours,
        'completion',
        'issued',
        verificationCode,
        JSON.stringify({
          course_category: courseData.category,
          course_level: courseData.level,
          instructor_name: courseData.instructor_name,
          completion_percentage: enrollmentData.completion_percentage
        })
      ];
      
      await executeQuery(query, params);
      
      // Generate PDF certificate
      const pdfUrl = await this.generatePDFCertificate(certificateId, {
        certificateNumber,
        studentName: `${userData.first_name} ${userData.last_name}`,
        courseTitle: courseData.title,
        completionDate: enrollmentData.completed_at,
        grade: this.calculateGrade(enrollmentData.completion_percentage),
        score: enrollmentData.completion_percentage,
        duration: courseData.duration_hours,
        verificationCode
      }, templateData);
      
      // Update certificate with PDF URL
      await executeQuery(
        'UPDATE certificates SET pdf_url = ? WHERE id = ?',
        [pdfUrl, certificateId]
      );
      
      // Update enrollment with certificate reference
      await executeQuery(
        'UPDATE course_enrollments SET certificate_id = ?, certificate_issued = 1, certificate_url = ? WHERE id = ?',
        [certificateId, pdfUrl, enrollmentData.id]
      );
      
      return await this.getCertificateById(certificateId);
      
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw new Error('Failed to create certificate');
    }
  }

  // Generate PDF certificate (placeholder implementation)
  async generatePDFCertificate(certificateId, data, template = null) {
    try {
      // Create certificates directory if it doesn't exist
      const certDir = path.join(__dirname, '../../public/certificates');
      await fs.mkdir(certDir, { recursive: true });
      
      const filename = `certificate_${certificateId}.pdf`;
      const filepath = path.join(certDir, filename);
      
      // For now, create a simple text file as placeholder
      // In production, this would generate a proper PDF using PDFKit
      const certificateContent = `
CERTIFICATE OF COMPLETION

This is to certify that

${data.studentName}

has successfully completed the course

${data.courseTitle}

Completed on: ${new Date(data.completionDate).toLocaleDateString()}
Grade: ${data.grade}
Score: ${data.score}%
Duration: ${data.duration} hours

Certificate No: ${data.certificateNumber}
Verification Code: ${data.verificationCode}

Instructor Signature: _________________

This certificate can be verified at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/verify/${data.verificationCode}
      `;
      
      await fs.writeFile(filepath, certificateContent);
      
      return `/certificates/${filename}`;
      
    } catch (error) {
      console.error('Error generating PDF certificate:', error);
      throw new Error('Failed to generate certificate PDF');
    }
  }

  // Calculate grade based on completion percentage
  calculateGrade(percentage) {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'B+';
    if (percentage >= 80) return 'B';
    if (percentage >= 75) return 'C+';
    if (percentage >= 70) return 'C';
    if (percentage >= 65) return 'D+';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  // Get default template
  getDefaultTemplate() {
    return {
      layout: 'landscape',
      background: '#f8f9fa',
      primary_color: '#007bff',
      secondary_color: '#6c757d',
      font_family: 'Arial',
      elements: {
        title: { text: 'Certificate of Completion', size: 32, weight: 'bold', color: '#007bff' },
        subtitle: { text: 'This is to certify that', size: 18, color: '#6c757d' },
        student_name: { size: 24, weight: 'bold', color: '#000' },
        course_name: { size: 20, weight: 'bold', color: '#007bff' },
        completion_date: { size: 16, color: '#6c757d' },
        signature_line: { text: 'Instructor Signature', size: 14, color: '#6c757d' }
      }
    };
  }

  // Get certificate by ID
  async getCertificateById(certificateId) {
    const query = `
      SELECT c.*, u.first_name, u.last_name, u.email, 
             co.title as course_title, co.category, co.level,
             ct.name as template_name
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN certificate_templates ct ON c.template_id = ct.id
      WHERE c.id = ?
    `;
    
    const result = await executeQuery(query, [certificateId]);
    return result[0] || null;
  }

  // Get user certificates
  async getUserCertificates(userId, filters = {}) {
    let query = `
      SELECT c.*, co.title as course_title, co.category, co.level,
             ct.name as template_name
      FROM certificates c
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN certificate_templates ct ON c.template_id = ct.id
      WHERE c.user_id = ?
    `;
    
    const params = [userId];
    
    if (filters.status) {
      query += ' AND c.status = ?';
      params.push(filters.status);
    }
    
    if (filters.course_id) {
      query += ' AND c.course_id = ?';
      params.push(filters.course_id);
    }
    
    query += ' ORDER BY c.issue_date DESC';
    
    // Use LIMIT without parameter binding to avoid SQL issues
    const limit = filters.limit || 20;
    query += ` LIMIT ${parseInt(limit)}`;
    
    return await executeQuery(query, params);
  }

  // Verify certificate
  async verifyCertificate(verificationCode) {
    const query = `
      SELECT c.*, u.first_name, u.last_name, u.email,
             co.title as course_title, co.category, co.level,
             ct.name as template_name
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN certificate_templates ct ON c.template_id = ct.id
      WHERE c.verification_code = ?
    `;
    
    const result = await executeQuery(query, [verificationCode]);
    const certificate = result[0];
    
    if (!certificate) {
      return { valid: false, message: 'Certificate not found' };
    }
    
    if (certificate.status === 'revoked') {
      return { valid: false, message: 'Certificate has been revoked' };
    }
    
    if (certificate.status === 'expired' || (certificate.expiry_date && new Date(certificate.expiry_date) < new Date())) {
      return { valid: false, message: 'Certificate has expired' };
    }
    
    // Log verification
    await this.logVerification(certificate.id, verificationCode, 'valid');
    
    return { valid: true, certificate };
  }

  // Log verification attempt
  async logVerification(certificateId, verificationCode, result, ipAddress = null, userAgent = null) {
    const query = `
      INSERT INTO certificate_verifications (
        id, certificate_id, verification_code, verified_by_ip, 
        verified_by_user_agent, verification_result
      ) VALUES (UUID(), ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(query, [certificateId, verificationCode, ipAddress, userAgent, result]);
  }

  // Add partner endorsement
  async addPartnerEndorsement(certificateId, partnerId, endorsementType, endorsementText = null) {
    const query = `
      INSERT INTO certificate_endorsements (
        id, certificate_id, partner_id, endorsement_type, endorsement_text
      ) VALUES (UUID(), ?, ?, ?, ?)
    `;
    
    await executeQuery(query, [certificateId, partnerId, endorsementType, endorsementText]);
  }

  // Get certificate analytics
  async getCertificateAnalytics(certificateId) {
    const query = `
      SELECT event_type, COUNT(*) as count, 
             DATE(created_at) as date
      FROM certificate_analytics
      WHERE certificate_id = ?
      GROUP BY event_type, DATE(created_at)
      ORDER BY date DESC
    `;
    
    return await executeQuery(query, [certificateId]);
  }

  // Log certificate event
  async logCertificateEvent(certificateId, eventType, eventData = null, ipAddress = null, userAgent = null) {
    const query = `
      INSERT INTO certificate_analytics (
        id, certificate_id, event_type, event_data, ip_address, user_agent
      ) VALUES (UUID(), ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(query, [
      certificateId, 
      eventType, 
      JSON.stringify(eventData), 
      ipAddress, 
      userAgent
    ]);
  }

  // Create certificate template
  async createCertificateTemplate(templateData) {
    const query = `
      INSERT INTO certificate_templates (
        id, name, description, template_type, organization_id,
        template_data, background_image_url, logo_url, created_by
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      templateData.name,
      templateData.description,
      templateData.template_type || 'course_completion',
      templateData.organization_id || null,
      JSON.stringify(templateData.template_data),
      templateData.background_image_url || null,
      templateData.logo_url || null,
      templateData.created_by
    ];
    
    const result = await executeQuery(query, params);
    return result.insertId;
  }

  // Get certificate templates
  async getCertificateTemplates(filters = {}) {
    let query = `
      SELECT ct.*, o.name as organization_name
      FROM certificate_templates ct
      LEFT JOIN organizations o ON ct.organization_id = o.id
      WHERE ct.is_active = 1
    `;
    
    const params = [];
    
    if (filters.template_type) {
      query += ' AND ct.template_type = ?';
      params.push(filters.template_type);
    }
    
    if (filters.organization_id) {
      query += ' AND ct.organization_id = ?';
      params.push(filters.organization_id);
    }
    
    query += ' ORDER BY ct.is_default DESC, ct.created_at DESC';
    
    return await executeQuery(query, params);
  }

  // Create partner organization
  async createPartnerOrganization(partnerData) {
    const query = `
      INSERT INTO certificate_partners (
        id, name, description, logo_url, website_url,
        contact_email, contact_phone, partnership_type
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      partnerData.name,
      partnerData.description,
      partnerData.logo_url,
      partnerData.website_url,
      partnerData.contact_email,
      partnerData.contact_phone,
      partnerData.partnership_type || 'educational'
    ];
    
    const result = await executeQuery(query, params);
    return result.insertId;
  }

  // Get partner organizations
  async getPartnerOrganizations(filters = {}) {
    let query = 'SELECT * FROM certificate_partners WHERE is_active = 1';
    const params = [];
    
    if (filters.partnership_type) {
      query += ' AND partnership_type = ?';
      params.push(filters.partnership_type);
    }
    
    query += ' ORDER BY name ASC';
    
    return await executeQuery(query, params);
  }

  // Associate course with partners
  async associateCourseWithPartners(courseId, partnerIds, primaryPartnerId = null) {
    // Remove existing associations
    await executeQuery('DELETE FROM course_certificate_partners WHERE course_id = ?', [courseId]);
    
    // Add new associations
    for (let i = 0; i < partnerIds.length; i++) {
      const partnerId = partnerIds[i];
      const isPrimary = partnerId === primaryPartnerId;
      
      await executeQuery(`
        INSERT INTO course_certificate_partners (
          id, course_id, partner_id, is_primary_partner, display_order
        ) VALUES (UUID(), ?, ?, ?, ?)
      `, [courseId, partnerId, isPrimary, i]);
    }
  }

  // Get course partners
  async getCoursePartners(courseId) {
    const query = `
      SELECT ccp.*, cp.name as partner_name, cp.logo_url, cp.website_url
      FROM course_certificate_partners ccp
      JOIN certificate_partners cp ON ccp.partner_id = cp.id
      WHERE ccp.course_id = ? AND cp.is_active = 1
      ORDER BY ccp.display_order ASC
    `;
    
    return await executeQuery(query, [courseId]);
  }
}

module.exports = new CertificateService();
