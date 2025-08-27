import db from '../config/database.js';

async function run() {
    const id = process.argv[2];
    if (!id) {
        console.error('Usage: node scripts/debug_application_dump.js <application_id>');
        process.exit(1);
    }
    const [rows] = await db.query(`
        SELECT 
            sa.application_id,
            sa.full_name,
            sa.email_address,
            sa.phone_number,
            sa.date_of_birth,
            sa.gender,
            sa.address,
            sa.preferred_university,
            sa.country,
            sa.academic_level,
            sa.intended_major,
            sa.gpa_academic_performance,
            sa.extracurricular_activities,
            sa.parent_guardian_name,
            sa.parent_guardian_contact,
            sa.financial_need_statement,
            sa.how_heard_about,
            sa.motivation_statement
        FROM scholarship_applications sa
        WHERE sa.application_id = ?
        LIMIT 1
    `, [id]);

    if (!rows || rows.length === 0) {
        console.log('No application found with id', id);
        process.exit(0);
    }
    console.log(JSON.stringify(rows[0], null, 2));
    process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });


