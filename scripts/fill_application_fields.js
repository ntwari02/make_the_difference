import db from '../config/database.js';

async function run() {
    const id = process.argv[2];
    if (!id) {
        console.error('Usage: node scripts/fill_application_fields.js <application_id>');
        process.exit(1);
    }

    const updates = {
        address: 'Kigali, Rwanda',
        preferred_university: 'University of Rwanda',
        country: 'Rwanda',
        academic_level: 'undergraduate',
        intended_major: 'Computer Science',
        gpa_academic_performance: '3.7',
        extracurricular_activities: 'Debate Club; Volunteering',
        parent_guardian_name: 'Parent Name',
        parent_guardian_contact: '+250788000000',
        financial_need_statement: 'Financial hardship due to family circumstances.',
        how_heard_about: 'School counselor',
        motivation_statement: 'I am passionate about technology and community impact.'
    };

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const params = [...Object.values(updates), id];
    await db.query(`UPDATE scholarship_applications SET ${setClauses} WHERE application_id = ?`, params);

    const [rows] = await db.query('SELECT * FROM scholarship_applications WHERE application_id = ? LIMIT 1', [id]);
    console.log('Updated row:\n', JSON.stringify(rows[0], null, 2));
    process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });


