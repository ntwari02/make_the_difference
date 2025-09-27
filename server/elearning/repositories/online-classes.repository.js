const { executeQuery } = require('../../config/database');

// Online Classes Repository Methods
const createOnlineClass = async (classData) => {
	const classId = require('crypto').randomUUID();
	const query = `
		INSERT INTO online_classes (
			id, course_id, instructor_id, title, description, class_type, status,
			start_time, end_time, duration_minutes, max_participants, meeting_room_id,
			meeting_url, meeting_password, recording_url, is_recording_enabled,
			is_chat_enabled, is_screen_share_enabled, is_participant_video_enabled,
			is_participant_audio_enabled
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;
	
	const params = [
		classId,
		classData.course_id,
		classData.instructor_id,
		classData.title,
		classData.description || null,
		classData.class_type || 'live',
		classData.status || 'scheduled',
		classData.start_time,
		classData.end_time,
		classData.duration_minutes,
		classData.max_participants || 50,
		classData.meeting_room_id || null,
		classData.meeting_url || null,
		classData.meeting_password || null,
		classData.recording_url || null,
		classData.is_recording_enabled !== false,
		classData.is_chat_enabled !== false,
		classData.is_screen_share_enabled !== false,
		classData.is_participant_video_enabled !== false,
		classData.is_participant_audio_enabled !== false
	];
	
	await executeQuery(query, params);
	return { id: classId, ...classData };
};

const getOnlineClassById = async (classId) => {
	const query = `
		SELECT 
			oc.*,
			c.title as course_title,
			u.first_name as instructor_name,
			u.last_name as instructor_last_name,
			u.email as instructor_email
		FROM online_classes oc
		JOIN courses c ON oc.course_id = c.id
		JOIN users u ON oc.instructor_id = u.id
		WHERE oc.id = ?
	`;
	
	const classes = await executeQuery(query, [classId]);
	return classes[0] || null;
};

const listOnlineClasses = async (filters) => {
	let query = `
		SELECT 
			oc.*,
			c.title as course_title,
			u.first_name as instructor_name,
			u.last_name as instructor_last_name,
			COUNT(ce.id) as enrolled_count
		FROM online_classes oc
		JOIN courses c ON oc.course_id = c.id
		JOIN users u ON oc.instructor_id = u.id
		LEFT JOIN class_enrollments ce ON oc.id = ce.class_id
	`;
	
	const conditions = [];
	const params = [];
	
	if (filters.course_id) {
		conditions.push('oc.course_id = ?');
		params.push(filters.course_id);
	}
	
	if (filters.instructor_id) {
		conditions.push('oc.instructor_id = ?');
		params.push(filters.instructor_id);
	}
	
	if (filters.status) {
		conditions.push('oc.status = ?');
		params.push(filters.status);
	}
	
	if (filters.class_type) {
		conditions.push('oc.class_type = ?');
		params.push(filters.class_type);
	}
	
	if (filters.start_date) {
		conditions.push('DATE(oc.start_time) >= ?');
		params.push(filters.start_date);
	}
	
	if (filters.end_date) {
		conditions.push('DATE(oc.start_time) <= ?');
		params.push(filters.end_date);
	}
	
	if (conditions.length > 0) {
		query += ' WHERE ' + conditions.join(' AND ');
	}
	
	query += ' GROUP BY oc.id ORDER BY oc.start_time ASC';
	
	if (filters.limit) {
		const offset = (filters.page - 1) * filters.limit;
		query += ` LIMIT ${filters.limit} OFFSET ${offset}`;
	}
	
	const classes = await executeQuery(query, params);
	return classes;
};

const updateOnlineClass = async (classId, updateData) => {
	const allowedFields = [
		'title', 'description', 'class_type', 'status', 'start_time', 'end_time',
		'duration_minutes', 'max_participants', 'meeting_room_id', 'meeting_url',
		'meeting_password', 'recording_url', 'is_recording_enabled', 'is_chat_enabled',
		'is_screen_share_enabled', 'is_participant_video_enabled', 'is_participant_audio_enabled'
	];
	
	const updates = [];
	const params = [];
	
	Object.keys(updateData).forEach(key => {
		if (allowedFields.includes(key) && updateData[key] !== undefined) {
			updates.push(`${key} = ?`);
			params.push(updateData[key]);
		}
	});
	
	if (updates.length === 0) {
		throw new Error('No valid fields to update');
	}
	
	params.push(classId);
	const query = `UPDATE online_classes SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
	
	await executeQuery(query, params);
	return getOnlineClassById(classId);
};

const deleteOnlineClass = async (classId) => {
	const query = 'DELETE FROM online_classes WHERE id = ?';
	const result = await executeQuery(query, [classId]);
	return result.affectedRows > 0;
};

// Class Enrollment Methods
const enrollInClass = async (classId, userId) => {
	const enrollmentId = require('crypto').randomUUID();
	const query = `
		INSERT INTO class_enrollments (id, class_id, user_id, enrollment_status)
		VALUES (?, ?, ?, 'enrolled')
	`;
	
	await executeQuery(query, [enrollmentId, classId, userId]);
	return { id: enrollmentId, class_id: classId, user_id: userId, enrollment_status: 'enrolled' };
};

const getClassEnrollments = async (classId) => {
	const query = `
		SELECT 
			ce.*,
			u.first_name,
			u.last_name,
			u.email,
			u.profile_image
		FROM class_enrollments ce
		JOIN users u ON ce.user_id = u.id
		WHERE ce.class_id = ?
		ORDER BY ce.enrolled_at DESC
	`;
	
	const enrollments = await executeQuery(query, [classId]);
	return enrollments;
};

const getUserClassEnrollments = async (userId) => {
	const query = `
		SELECT 
			ce.*,
			oc.title as class_title,
			oc.start_time,
			oc.end_time,
			oc.status as class_status,
			c.title as course_title,
			u.first_name as instructor_name,
			u.last_name as instructor_last_name
		FROM class_enrollments ce
		JOIN online_classes oc ON ce.class_id = oc.id
		JOIN courses c ON oc.course_id = c.id
		JOIN users u ON oc.instructor_id = u.id
		WHERE ce.user_id = ?
		ORDER BY oc.start_time DESC
	`;
	
	const enrollments = await executeQuery(query, [userId]);
	return enrollments;
};

const updateEnrollmentStatus = async (classId, userId, status) => {
	const query = `
		UPDATE class_enrollments 
		SET enrollment_status = ?, updated_at = CURRENT_TIMESTAMP
		WHERE class_id = ? AND user_id = ?
	`;
	
	const result = await executeQuery(query, [status, classId, userId]);
	return result.affectedRows > 0;
};

// Class Attendance Methods
const recordAttendance = async (classId, userId, attendanceData) => {
	const attendanceId = require('crypto').randomUUID();
	const query = `
		INSERT INTO class_attendance (id, class_id, user_id, joined_at, left_at, duration_minutes, is_present)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`;
	
	const params = [
		attendanceId,
		classId,
		userId,
		attendanceData.joined_at || new Date(),
		attendanceData.left_at || null,
		attendanceData.duration_minutes || 0,
		attendanceData.is_present !== false
	];
	
	await executeQuery(query, params);
	return { id: attendanceId, class_id: classId, user_id: userId, ...attendanceData };
};

const getClassAttendance = async (classId) => {
	const query = `
		SELECT 
			ca.*,
			u.first_name,
			u.last_name,
			u.email
		FROM class_attendance ca
		JOIN users u ON ca.user_id = u.id
		WHERE ca.class_id = ?
		ORDER BY ca.joined_at DESC
	`;
	
	const attendance = await executeQuery(query, [classId]);
	return attendance;
};

// Class Materials Methods
const addClassMaterial = async (classId, materialData) => {
	const materialId = require('crypto').randomUUID();
	const query = `
		INSERT INTO class_materials (id, class_id, title, description, file_url, file_type, file_size, is_required)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`;
	
	const params = [
		materialId,
		classId,
		materialData.title,
		materialData.description || null,
		materialData.file_url || null,
		materialData.file_type || null,
		materialData.file_size || null,
		materialData.is_required || false
	];
	
	await executeQuery(query, params);
	return { id: materialId, class_id: classId, ...materialData };
};

const getClassMaterials = async (classId) => {
	const query = `
		SELECT * FROM class_materials 
		WHERE class_id = ? 
		ORDER BY created_at ASC
	`;
	
	const materials = await executeQuery(query, [classId]);
	return materials;
};

// Class Chat Methods
const addChatMessage = async (classId, userId, messageData) => {
	const messageId = require('crypto').randomUUID();
	const query = `
		INSERT INTO class_chat_messages (id, class_id, user_id, message, message_type, is_public)
		VALUES (?, ?, ?, ?, ?, ?)
	`;
	
	const params = [
		messageId,
		classId,
		userId,
		messageData.message,
		messageData.message_type || 'text',
		messageData.is_public !== false
	];
	
	await executeQuery(query, params);
	return { id: messageId, class_id: classId, user_id: userId, ...messageData };
};

const getClassChatMessages = async (classId, filters) => {
	const offset = (filters.page - 1) * filters.limit;
	const query = `
		SELECT 
			ccm.*,
			u.first_name,
			u.last_name,
			u.profile_image
		FROM class_chat_messages ccm
		JOIN users u ON ccm.user_id = u.id
		WHERE ccm.class_id = ?
		ORDER BY ccm.created_at DESC
		LIMIT ${filters.limit} OFFSET ${offset}
	`;
	
	const messages = await executeQuery(query, [classId]);
	return messages;
};

module.exports = {
	createOnlineClass,
	getOnlineClassById,
	listOnlineClasses,
	updateOnlineClass,
	deleteOnlineClass,
	enrollInClass,
	getClassEnrollments,
	getUserClassEnrollments,
	updateEnrollmentStatus,
	recordAttendance,
	getClassAttendance,
	addClassMaterial,
	getClassMaterials,
	addChatMessage,
	getClassChatMessages
};
