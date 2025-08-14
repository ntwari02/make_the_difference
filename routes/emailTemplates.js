import express from 'express';
import pool from '../config/database.js';
import { bypassAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all email templates
router.get('/', bypassAuth, async (req, res) => {
    try {
        const [rows] = await pool.promise().query("SELECT * FROM email_templates ORDER BY id");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET email template by ID
router.get('/:id', bypassAuth, async (req, res) => {
    try {
        const [rows] = await pool.promise().query("SELECT * FROM email_templates WHERE id = ?", [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Email template not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create new email template
router.post('/', bypassAuth, async (req, res) => {
    try {
        const { name, subject, content, category, is_active } = req.body;
        
        if (!name || !subject || !content) {
            return res.status(400).json({ error: 'Name, subject, and content are required' });
        }

        const [result] = await pool.promise().query(
            "INSERT INTO email_templates (name, subject, content, category, is_active) VALUES (?, ?, ?, ?, ?)",
            [name, subject, content, category || 'custom', is_active !== undefined ? is_active : true]
        );

        const [newTemplate] = await pool.promise().query("SELECT * FROM email_templates WHERE id = ?", [result.insertId]);
        res.status(201).json(newTemplate[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update email template
router.put('/:id', bypassAuth, async (req, res) => {
    try {
        const { name, subject, content, category, is_active } = req.body;
        const templateId = req.params.id;

        // Check if template exists
        const [existing] = await pool.promise().query("SELECT * FROM email_templates WHERE id = ?", [templateId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Email template not found' });
        }

        const [result] = await pool.promise().query(
            "UPDATE email_templates SET name = ?, subject = ?, content = ?, category = ?, is_active = ?, updated_at = NOW() WHERE id = ?",
            [name, subject, content, category, is_active, templateId]
        );

        const [updatedTemplate] = await pool.promise().query("SELECT * FROM email_templates WHERE id = ?", [templateId]);
        res.json(updatedTemplate[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE email template
router.delete('/:id', bypassAuth, async (req, res) => {
    try {
        const templateId = req.params.id;

        // Check if template exists
        const [existing] = await pool.promise().query("SELECT * FROM email_templates WHERE id = ?", [templateId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Email template not found' });
        }

        await pool.promise().query("DELETE FROM email_templates WHERE id = ?", [templateId]);
        res.json({ message: 'Email template deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST send test email
router.post('/test-send', bypassAuth, async (req, res) => {
    try {
        const { recipient_email, template_type, custom_content } = req.body;

        if (!recipient_email) {
            return res.status(400).json({ error: 'Recipient email is required' });
        }

        // Get template content based on type
        let emailContent = '';
        let emailSubject = 'Test Email';

        if (template_type === 'custom' && custom_content) {
            emailContent = custom_content;
            emailSubject = 'Custom Test Email';
        } else {
            // Get template from database
            const [templates] = await pool.promise().query(
                "SELECT * FROM email_templates WHERE category = ? OR name LIKE ? LIMIT 1",
                [template_type, `%${template_type}%`]
            );

            if (templates.length > 0) {
                emailContent = templates[0].content;
                emailSubject = templates[0].subject;
            } else {
                // Default templates if none found in database
                const defaultTemplates = {
                    'application-received': {
                        subject: 'Application Received',
                        content: 'Dear {{name}},\n\nYour application for {{scholarship}} has been received and is under review.\n\nWe will contact you soon with further updates.\n\nBest regards,\nScholarship Team'
                    },
                    'application-approved': {
                        subject: 'Application Approved',
                        content: 'Dear {{name}},\n\nCongratulations! Your application for {{scholarship}} has been approved.\n\nWe will send you further instructions shortly.\n\nBest regards,\nScholarship Team'
                    },
                    'application-rejected': {
                        subject: 'Application Status Update',
                        content: 'Dear {{name}},\n\nWe regret to inform you that your application for {{scholarship}} was not successful at this time.\n\nWe encourage you to apply for future opportunities.\n\nBest regards,\nScholarship Team'
                    },
                    'reminder-documents': {
                        subject: 'Document Submission Reminder',
                        content: 'Dear {{name}},\n\nThis is a reminder to submit your required documents for {{scholarship}} by {{date}}.\n\nPlease ensure all documents are submitted on time.\n\nBest regards,\nScholarship Team'
                    },
                    'reminder-interview': {
                        subject: 'Interview Schedule',
                        content: 'Dear {{name}},\n\nYour interview for {{scholarship}} is scheduled on {{date}}.\n\nPlease be prepared and arrive on time.\n\nBest regards,\nScholarship Team'
                    }
                };

                const defaultTemplate = defaultTemplates[template_type];
                if (defaultTemplate) {
                    emailContent = defaultTemplate.content;
                    emailSubject = defaultTemplate.subject;
                } else {
                    emailContent = 'This is a test email from the scholarship system.';
                }
            }
        }

        // Replace template variables with sample data
        const sampleData = {
            name: 'Test User',
            scholarship: 'Sample Scholarship',
            date: new Date().toLocaleDateString(),
            status: 'Under Review'
        };

        let processedContent = emailContent;
        Object.keys(sampleData).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processedContent = processedContent.replace(regex, sampleData[key]);
        });

        // In a real application, you would integrate with an email service here
        // For now, we'll simulate the email sending
        const emailData = {
            to: recipient_email,
            subject: emailSubject,
            content: processedContent,
            sent_at: new Date(),
            status: 'sent'
        };

        // Log the email (in production, you'd send it via email service)
        console.log('Test Email Sent:', emailData);

        res.json({
            message: 'Test email sent successfully',
            email_data: emailData
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET templates by category
router.get('/category/:category', bypassAuth, async (req, res) => {
    try {
        const [rows] = await pool.promise().query(
            "SELECT * FROM email_templates WHERE category = ? ORDER BY name",
            [req.params.category]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST bulk update templates
router.post('/bulk-update', bypassAuth, async (req, res) => {
    try {
        const { templates } = req.body;

        if (!Array.isArray(templates)) {
            return res.status(400).json({ error: 'Templates must be an array' });
        }

        const results = [];
        for (const template of templates) {
            const { id, name, subject, content, category, is_active } = template;

            if (id) {
                // Update existing template
                await pool.promise().query(
                    "UPDATE email_templates SET name = ?, subject = ?, content = ?, category = ?, is_active = ?, updated_at = NOW() WHERE id = ?",
                    [name, subject, content, category, is_active, id]
                );
            } else {
                // Create new template
                const [result] = await pool.promise().query(
                    "INSERT INTO email_templates (name, subject, content, category, is_active) VALUES (?, ?, ?, ?, ?)",
                    [name, subject, content, category, is_active]
                );
                template.id = result.insertId;
            }
            results.push(template);
        }

        res.json({
            message: 'Templates updated successfully',
            templates: results
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST send bulk emails
router.post('/send-bulk', bypassAuth, async (req, res) => {
    try {
        const { template_id, user_ids, custom_subject, custom_content } = req.body;

        if (!template_id && !custom_content) {
            return res.status(400).json({ error: 'Template ID or custom content is required' });
        }

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json({ error: 'User IDs array is required' });
        }

        // Get template if template_id is provided
        let emailSubject = custom_subject || 'Email from Scholarship System';
        let emailContent = custom_content || '';

        if (template_id) {
            const [templates] = await pool.promise().query(
                "SELECT * FROM email_templates WHERE id = ?",
                [template_id]
            );

            if (templates.length === 0) {
                return res.status(404).json({ error: 'Email template not found' });
            }

            emailSubject = templates[0].subject;
            emailContent = templates[0].content;
        }

        // Get users
        const [users] = await pool.promise().query(
            "SELECT id, full_name, email FROM users WHERE id IN (?)",
            [user_ids]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'No valid users found' });
        }

        const sentEmails = [];
        const failedEmails = [];

        // Process each user
        for (const user of users) {
            try {
                // Replace template variables with user data
                let processedContent = emailContent;
                let processedSubject = emailSubject;

                const userData = {
                    name: user.full_name,
                    email: user.email,
                    user_id: user.id,
                    date: new Date().toLocaleDateString(),
                    scholarship: 'Scholarship Program'
                };

                // Replace variables in content and subject
                Object.keys(userData).forEach(key => {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    processedContent = processedContent.replace(regex, userData[key]);
                    processedSubject = processedSubject.replace(regex, userData[key]);
                });

                // In a real application, you would send the email here
                // For now, we'll simulate the email sending
                const emailData = {
                    to: user.email,
                    subject: processedSubject,
                    content: processedContent,
                    user_id: user.id,
                    sent_at: new Date(),
                    status: 'sent'
                };

                // Log the email (in production, you'd send it via email service)
                console.log('Bulk Email Sent:', emailData);

                sentEmails.push({
                    user_id: user.id,
                    email: user.email,
                    name: user.full_name,
                    status: 'sent'
                });

            } catch (error) {
                console.error(`Error sending email to ${user.email}:`, error);
                failedEmails.push({
                    user_id: user.id,
                    email: user.email,
                    name: user.full_name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        res.json({
            message: `Bulk email sending completed. ${sentEmails.length} sent, ${failedEmails.length} failed.`,
            sent_emails: sentEmails,
            failed_emails: failedEmails,
            total_processed: users.length
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router; 
