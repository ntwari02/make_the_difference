import express from 'express';
import pool from '../config/database.js';
import { bypassAuth } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create SMTP transporter if env is configured
function getMailer() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    return transporter;
}

// Convert HTML to plain text fallback
function stripHtmlToText(html) {
    try {
        // Remove tags and collapse whitespace
        const text = String(html || '')
            .replace(/<\/(p|div|br)\s*>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        return text;
    } catch { return String(html || ''); }
}

// GET all email templates
router.get('/', bypassAuth, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM email_templates ORDER BY id");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET email template by ID
router.get('/:id', bypassAuth, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM email_templates WHERE id = ?", [req.params.id]);
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

        const [result] = await pool.query(
            "INSERT INTO email_templates (name, subject, content, category, is_active) VALUES (?, ?, ?, ?, ?)",
            [name, subject, content, category || 'custom', is_active !== undefined ? is_active : true]
        );

        const [newTemplate] = await pool.query("SELECT * FROM email_templates WHERE id = ?", [result.insertId]);
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
        const [existing] = await pool.query("SELECT * FROM email_templates WHERE id = ?", [templateId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Email template not found' });
        }

        const [result] = await pool.query(
            "UPDATE email_templates SET name = ?, subject = ?, content = ?, category = ?, is_active = ?, updated_at = NOW() WHERE id = ?",
            [name, subject, content, category, is_active, templateId]
        );

        const [updatedTemplate] = await pool.query("SELECT * FROM email_templates WHERE id = ?", [templateId]);
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
        const [existing] = await pool.query("SELECT * FROM email_templates WHERE id = ?", [templateId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Email template not found' });
        }

        await pool.query("DELETE FROM email_templates WHERE id = ?", [templateId]);
        res.json({ message: 'Email template deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST send test email
router.post('/test-send', bypassAuth, async (req, res) => {
    try {
        const { recipient_email, template_type, custom_content, custom_subject } = req.body;

        if (!recipient_email) {
            return res.status(400).json({ error: 'Recipient email is required' });
        }

        // Get template content based on type
        let emailContent = '';
        let emailSubject = custom_subject || 'Test Email';

        if (template_type === 'custom' && custom_content) {
            emailContent = custom_content;
            emailSubject = 'Custom Test Email';
        } else {
            // Get template from database
            const [templates] = await pool.query(
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

        // Replace template variables with sample data + optional custom vars
        const sampleData = {
            name: 'Test User',
            scholarship: 'Sample Scholarship',
            date: new Date().toLocaleDateString(),
            status: 'Under Review',
            user_id: '0000',
            amount: ''
        };

        const customVars = typeof req.body.vars === 'object' && req.body.vars ? req.body.vars : {};
        const mergeVars = { ...sampleData, ...customVars };

        let processedSubject = emailSubject;
        let processedContent = emailContent;
        Object.keys(mergeVars).forEach(key => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            processedContent = processedContent.replace(regex, String(mergeVars[key] ?? ''));
            processedSubject = processedSubject.replace(regex, String(mergeVars[key] ?? ''));
        });
        // Remove any leftover {{variable}} tags
        processedContent = processedContent.replace(/{{\s*[^}]+\s*}}/g, '');
        processedSubject = processedSubject.replace(/{{\s*[^}]+\s*}}/g, '');

        // Send email if SMTP configured
        const transporter = getMailer();
        if (transporter) {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: recipient_email,
                subject: processedSubject,
                html: processedContent,
                text: stripHtmlToText(processedContent)
            });
            return res.json({ message: 'Test email sent successfully' });
        } else {
            console.warn('SMTP not configured; test email not actually sent.');
            return res.json({ message: 'Email service not configured. Simulated send only.', email_disabled: true });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET templates by category
router.get('/category/:category', bypassAuth, async (req, res) => {
    try {
        const [rows] = await pool.query(
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
                await pool.query(
                    "UPDATE email_templates SET name = ?, subject = ?, content = ?, category = ?, is_active = ?, updated_at = NOW() WHERE id = ?",
                    [name, subject, content, category, is_active, id]
                );
            } else {
                // Create new template
                const [result] = await pool.query(
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
        const { template_id, user_ids, custom_subject, custom_content, vars_common } = req.body;

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
            const [templates] = await pool.query(
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
        const [users] = await pool.query(
            "SELECT id, full_name, email FROM users WHERE id IN (?)",
            [user_ids]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'No valid users found' });
        }

        const sentEmails = [];
        const failedEmails = [];

        const transporter = getMailer();

        // Process each user
        for (const user of users) {
            try {
                // Replace template variables with user data
                let processedContent = emailContent;
                let processedSubject = emailSubject;

                // Build per-user variables, merged with common vars
                const commonVars = typeof vars_common === 'object' && vars_common ? vars_common : {};
                const userVars = {
                    name: user.full_name,
                    email: user.email,
                    user_id: user.id,
                    date: new Date().toLocaleDateString(),
                    scholarship: commonVars.scholarship || 'Scholarship Program',
                    amount: commonVars.amount || '',
                    deadline: commonVars.deadline || '',
                    url: commonVars.url || '',
                    support_email: commonVars.support_email || '',
                    location: commonVars.location || '',
                    custom1: commonVars.custom1 || '',
                    custom2: commonVars.custom2 || ''
                };
                // Names mapping override (comma-separated list maps in order)
                if (Array.isArray(commonVars.names_list) && commonVars.names_list.length){
                    const idx = users.findIndex(u=> u.id === user.id);
                    if (idx >= 0 && commonVars.names_list[idx]) {
                        userVars.name = commonVars.names_list[idx];
                    }
                }
                const merged = { ...commonVars, ...userVars };

                // Replace {{ var }} occurrences (trimmed inside braces)
                Object.keys(merged).forEach(key => {
                    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                    processedContent = processedContent.replace(regex, String(merged[key] ?? ''));
                    processedSubject = processedSubject.replace(regex, String(merged[key] ?? ''));
                });

                // Also support bracket placeholders like [Name], [Scholarship Name], [User ID], [Date]
                const bracketMap = new Map([
                    ['name', ['name','Name']],
                    ['scholarship', ['scholarship name','Scholarship Name','scholarship','Scholarship']],
                    ['user_id', ['user id','User ID','id','ID']],
                    ['date', ['date','Date']],
                    ['amount', ['amount','Amount']]
                ]);
                bracketMap.forEach((labels, varKey) => {
                    labels.forEach(label => {
                        const re = new RegExp(`\\[\\s*${label.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')}\\s*\\]`, 'g');
                        processedContent = processedContent.replace(re, String(merged[varKey] ?? ''));
                        processedSubject = processedSubject.replace(re, String(merged[varKey] ?? ''));
                    });
                });

                // Remove any leftover tags
                processedContent = processedContent
                    .replace(/{{\s*[^}]+\s*}}/g, '')
                    .replace(/\[[^\]]+\]/g, '');
                processedSubject = processedSubject
                    .replace(/{{\s*[^}]+\s*}}/g, '')
                    .replace(/\[[^\]]+\]/g, '');

                // Send email if SMTP configured; otherwise skip
                if (transporter) {
                    await transporter.sendMail({
                        from: process.env.SMTP_FROM || process.env.SMTP_USER,
                        to: user.email,
                        subject: processedSubject,
                        html: processedContent,
                        text: stripHtmlToText(processedContent)
                    });
                }

                // Create notification for the user
                try {
                    await pool.query(`
                        INSERT INTO user_notifications (user_id, type, title, message, related_url)
                        VALUES (?, ?, ?, ?, ?)
                    `, [
                        user.id,
                        'email',
                        processedSubject,
                        processedContent.substring(0, 200) + (processedContent.length > 200 ? '...' : ''),
                        null
                    ]);
                } catch (notificationError) {
                    console.error(`Error creating notification for user ${user.id}:`, notificationError);
                }

                sentEmails.push({ user_id: user.id, email: user.email, name: user.full_name, status: 'sent' });

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
            message: `Bulk email completed. ${sentEmails.length} processed, ${failedEmails.length} failed.` + (transporter ? '' : ' Email service not configured; emails not sent but notifications created.'),
            sent_emails: sentEmails,
            failed_emails: failedEmails,
            total_processed: users.length,
            email_disabled: !transporter
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router; 
