const { executeQuery } = require('../config/database');

class ServiceFeeService {
  constructor() {
    this.serviceTypes = {
      SCHOLARSHIP: 'scholarship',
      VISA: 'visa',
      APPLICATION: 'application',
      PROCESSING: 'processing',
      CONSULTATION: 'consultation',
      DOCUMENT_REVIEW: 'document_review',
      EXPEDITED_PROCESSING: 'expedited_processing'
    };
  }

  // Calculate service fees for scholarship applications
  async calculateScholarshipServiceFees(scholarshipId, userId, options = {}) {
    try {
      // Get scholarship details
      const scholarship = await executeQuery(
        'SELECT * FROM scholarships WHERE id = ? AND status = "active"',
        [scholarshipId]
      );

      if (scholarship.length === 0) {
        throw new Error('Scholarship not found or inactive');
      }

      const scholarshipData = scholarship[0];
      const fees = {
        base_fee: 0,
        application_fee: scholarshipData.application_fee || 0,
        service_fee: 0,
        processing_fee: 0,
        consultation_fee: 0,
        expedited_fee: 0,
        total_fee: 0,
        currency: scholarshipData.currency || 'USD',
        breakdown: []
      };

      // Base service fee (platform fee)
      fees.base_fee = this.calculateBaseServiceFee(scholarshipData.amount, scholarshipData.amount_type);
      fees.breakdown.push({
        type: 'base_service_fee',
        description: 'Platform service fee',
        amount: fees.base_fee
      });

      // Application fee (if any)
      if (fees.application_fee > 0) {
        fees.breakdown.push({
          type: 'application_fee',
          description: 'Scholarship application fee',
          amount: fees.application_fee
        });
      }

      // Processing fee
      fees.processing_fee = this.calculateProcessingFee(scholarshipData.provider_type);
      if (fees.processing_fee > 0) {
        fees.breakdown.push({
          type: 'processing_fee',
          description: 'Application processing fee',
          amount: fees.processing_fee
        });
      }

      // Consultation fee (if requested)
      if (options.includeConsultation) {
        fees.consultation_fee = this.calculateConsultationFee(scholarshipData.degree_level);
        fees.breakdown.push({
          type: 'consultation_fee',
          description: 'Application consultation fee',
          amount: fees.consultation_fee
        });
      }

      // Expedited processing fee (if requested)
      if (options.expeditedProcessing) {
        fees.expedited_fee = this.calculateExpeditedFee(fees.base_fee + fees.processing_fee);
        fees.breakdown.push({
          type: 'expedited_fee',
          description: 'Expedited processing fee',
          amount: fees.expedited_fee
        });
      }

      // Document review fee (if requested)
      if (options.includeDocumentReview) {
        const documentReviewFee = this.calculateDocumentReviewFee(scholarshipData.required_documents);
        fees.breakdown.push({
          type: 'document_review_fee',
          description: 'Document review and verification fee',
          amount: documentReviewFee
        });
        fees.service_fee += documentReviewFee;
      }

      // Calculate total
      fees.service_fee = fees.base_fee + fees.processing_fee + fees.consultation_fee + fees.expedited_fee;
      fees.total_fee = fees.service_fee + fees.application_fee;

      return fees;
    } catch (error) {
      console.error('Error calculating scholarship service fees:', error);
      throw error;
    }
  }

  // Calculate service fees for visa applications
  async calculateVisaServiceFees(visaServiceId, userId, options = {}) {
    try {
      // Get visa service details
      const visaService = await executeQuery(
        'SELECT * FROM visa_services WHERE id = ? AND status = "active"',
        [visaServiceId]
      );

      if (visaService.length === 0) {
        throw new Error('Visa service not found or inactive');
      }

      const visaData = visaService[0];
      const fees = {
        base_fee: 0,
        visa_fee: visaData.price || 0,
        service_fee: 0,
        processing_fee: 0,
        consultation_fee: 0,
        expedited_fee: 0,
        urgent_fee: 0,
        total_fee: 0,
        currency: visaData.currency || 'USD',
        breakdown: []
      };

      // Base service fee (platform fee)
      fees.base_fee = this.calculateBaseServiceFee(visaData.price, 'fixed');
      fees.breakdown.push({
        type: 'base_service_fee',
        description: 'Platform service fee',
        amount: fees.base_fee
      });

      // Visa fee
      if (fees.visa_fee > 0) {
        fees.breakdown.push({
          type: 'visa_fee',
          description: `${visaData.visa_type} visa fee`,
          amount: fees.visa_fee
        });
      }

      // Processing fee
      fees.processing_fee = this.calculateVisaProcessingFee(visaData.visa_type, visaData.country);
      if (fees.processing_fee > 0) {
        fees.breakdown.push({
          type: 'processing_fee',
          description: 'Visa processing fee',
          amount: fees.processing_fee
        });
      }

      // Urgent processing fee
      if (options.urgentProcessing || visaData.is_urgent_processing) {
        fees.urgent_fee = visaData.urgent_processing_fee || this.calculateUrgentFee(visaData.price);
        fees.breakdown.push({
          type: 'urgent_fee',
          description: 'Urgent processing fee',
          amount: fees.urgent_fee
        });
      }

      // Consultation fee (if requested)
      if (options.includeConsultation) {
        fees.consultation_fee = this.calculateVisaConsultationFee(visaData.visa_type);
        fees.breakdown.push({
          type: 'consultation_fee',
          description: 'Visa consultation fee',
          amount: fees.consultation_fee
        });
      }

      // Document review fee (if requested)
      if (options.includeDocumentReview) {
        const documentReviewFee = this.calculateDocumentReviewFee(visaData.required_documents);
        fees.breakdown.push({
          type: 'document_review_fee',
          description: 'Document review and verification fee',
          amount: documentReviewFee
        });
        fees.service_fee += documentReviewFee;
      }

      // Calculate total
      fees.service_fee = fees.base_fee + fees.processing_fee + fees.consultation_fee + fees.urgent_fee;
      fees.total_fee = fees.service_fee + fees.visa_fee;

      return fees;
    } catch (error) {
      console.error('Error calculating visa service fees:', error);
      throw error;
    }
  }

  // Create service fee transaction
  async createServiceFeeTransaction(feeData, userId, serviceType, serviceId) {
    try {
      const {
        total_fee,
        currency,
        breakdown,
        payment_method = 'pending',
        status = 'pending'
      } = feeData;

      const transactionId = `sf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const query = `
        INSERT INTO service_fee_transactions (
          id, user_id, service_type, service_id, total_amount, currency,
          fee_breakdown, payment_method, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const params = [
        transactionId,
        userId,
        serviceType,
        serviceId,
        total_fee,
        currency,
        JSON.stringify(breakdown),
        payment_method,
        status
      ];

      await executeQuery(query, params);

      return {
        transaction_id: transactionId,
        total_amount: total_fee,
        currency,
        breakdown,
        status,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating service fee transaction:', error);
      throw error;
    }
  }

  // Update service fee transaction status
  async updateServiceFeeTransaction(transactionId, updateData) {
    try {
      const {
        status,
        payment_method,
        external_transaction_id,
        payment_details = {}
      } = updateData;

      const query = `
        UPDATE service_fee_transactions 
        SET status = ?, payment_method = ?, external_transaction_id = ?, 
            payment_details = ?, updated_at = NOW()
        WHERE id = ?
      `;

      const params = [
        status,
        payment_method,
        external_transaction_id,
        JSON.stringify(payment_details),
        transactionId
      ];

      await executeQuery(query, params);

      return { success: true, transaction_id: transactionId };
    } catch (error) {
      console.error('Error updating service fee transaction:', error);
      throw error;
    }
  }

  // Get service fee transaction
  async getServiceFeeTransaction(transactionId) {
    try {
      const query = `
        SELECT * FROM service_fee_transactions 
        WHERE id = ?
      `;

      const result = await executeQuery(query, [transactionId]);
      
      if (result.length === 0) {
        throw new Error('Service fee transaction not found');
      }

      const transaction = result[0];
      transaction.fee_breakdown = JSON.parse(transaction.fee_breakdown || '[]');
      transaction.payment_details = JSON.parse(transaction.payment_details || '{}');

      return transaction;
    } catch (error) {
      console.error('Error getting service fee transaction:', error);
      throw error;
    }
  }

  // Get user's service fee transactions
  async getUserServiceFeeTransactions(userId, filters = {}) {
    try {
      let query = `
        SELECT * FROM service_fee_transactions 
        WHERE user_id = ?
      `;
      const params = [userId];

      if (filters.service_type) {
        query += ' AND service_type = ?';
        params.push(filters.service_type);
      }

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.date_from) {
        query += ' AND created_at >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        query += ' AND created_at <= ?';
        params.push(filters.date_to);
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }

      const result = await executeQuery(query, params);
      
      return result.map(transaction => ({
        ...transaction,
        fee_breakdown: JSON.parse(transaction.fee_breakdown || '[]'),
        payment_details: JSON.parse(transaction.payment_details || '{}')
      }));
    } catch (error) {
      console.error('Error getting user service fee transactions:', error);
      throw error;
    }
  }

  // Helper methods for fee calculations
  calculateBaseServiceFee(amount, amountType) {
    if (!amount || amount <= 0) return 25; // Minimum fee for free scholarships
    
    const baseFee = Math.min(Math.max(amount * 0.05, 25), 500); // 5% of amount, min $25, max $500
    
    // Adjust based on amount type
    switch (amountType) {
      case 'full':
        return baseFee * 1.2; // 20% premium for full scholarships
      case 'partial':
        return baseFee * 0.8; // 20% discount for partial scholarships
      case 'variable':
        return baseFee * 1.1; // 10% premium for variable amounts
      default:
        return baseFee;
    }
  }

  calculateProcessingFee(providerType) {
    const fees = {
      'university': 15,
      'government': 10,
      'private_organization': 20,
      'foundation': 15,
      'corporation': 25
    };
    return fees[providerType] || 20;
  }

  calculateConsultationFee(degreeLevel) {
    const fees = {
      'undergraduate': 50,
      'graduate': 75,
      'phd': 100,
      'diploma': 40,
      'certificate': 30,
      'any': 60
    };
    return fees[degreeLevel] || 50;
  }

  calculateExpeditedFee(baseAmount) {
    return Math.min(baseAmount * 0.5, 200); // 50% of base amount, max $200
  }

  calculateDocumentReviewFee(requiredDocuments) {
    if (!requiredDocuments) return 0;
    
    const docCount = Array.isArray(requiredDocuments) ? requiredDocuments.length : 1;
    return Math.min(docCount * 10, 100); // $10 per document, max $100
  }

  calculateVisaProcessingFee(visaType, country) {
    const baseFees = {
      'tourist': 30,
      'student': 50,
      'work': 75,
      'business': 60,
      'transit': 20,
      'family': 40,
      'refugee': 25,
      'other': 35
    };
    
    const baseFee = baseFees[visaType] || 35;
    
    // Country-specific adjustments
    const countryMultipliers = {
      'USA': 1.5,
      'UK': 1.3,
      'Canada': 1.2,
      'Australia': 1.2,
      'Germany': 1.1,
      'France': 1.1
    };
    
    const multiplier = countryMultipliers[country] || 1.0;
    return Math.round(baseFee * multiplier);
  }

  calculateVisaConsultationFee(visaType) {
    const fees = {
      'tourist': 40,
      'student': 60,
      'work': 80,
      'business': 70,
      'transit': 30,
      'family': 50,
      'refugee': 35,
      'other': 45
    };
    return fees[visaType] || 45;
  }

  calculateUrgentFee(basePrice) {
    return Math.min(basePrice * 0.3, 300); // 30% of base price, max $300
  }

  // Get service fee statistics
  async getServiceFeeStatistics(filters = {}) {
    try {
      let query = `
        SELECT 
          service_type,
          COUNT(*) as total_transactions,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as average_fee,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions
        FROM service_fee_transactions
        WHERE 1=1
      `;
      const params = [];

      if (filters.date_from) {
        query += ' AND created_at >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        query += ' AND created_at <= ?';
        params.push(filters.date_to);
      }

      query += ' GROUP BY service_type ORDER BY total_revenue DESC';

      const result = await executeQuery(query, params);
      return result;
    } catch (error) {
      console.error('Error getting service fee statistics:', error);
      throw error;
    }
  }
}

module.exports = new ServiceFeeService();
