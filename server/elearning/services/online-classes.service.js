const onlineClassesRepo = require('../repositories/online-classes.repository');

// Online Classes Service Methods
const createOnlineClass = (classData) => onlineClassesRepo.createOnlineClass(classData);

const getOnlineClass = (classId) => onlineClassesRepo.getOnlineClassById(classId);

const listOnlineClasses = (filters) => onlineClassesRepo.listOnlineClasses(filters);

const updateOnlineClass = (classId, updateData) => onlineClassesRepo.updateOnlineClass(classId, updateData);

const deleteOnlineClass = (classId) => onlineClassesRepo.deleteOnlineClass(classId);

const enrollInClass = (classId, userId) => onlineClassesRepo.enrollInClass(classId, userId);

const getClassEnrollments = (classId) => onlineClassesRepo.getClassEnrollments(classId);

const getUserClassEnrollments = (userId) => onlineClassesRepo.getUserClassEnrollments(userId);

const updateEnrollmentStatus = (classId, userId, status) => onlineClassesRepo.updateEnrollmentStatus(classId, userId, status);

const recordAttendance = (classId, userId, attendanceData) => onlineClassesRepo.recordAttendance(classId, userId, attendanceData);

const getClassAttendance = (classId) => onlineClassesRepo.getClassAttendance(classId);

const addClassMaterial = (classId, materialData) => onlineClassesRepo.addClassMaterial(classId, materialData);

const getClassMaterials = (classId) => onlineClassesRepo.getClassMaterials(classId);

const addChatMessage = (classId, userId, messageData) => onlineClassesRepo.addChatMessage(classId, userId, messageData);

const getClassChatMessages = (classId, filters) => onlineClassesRepo.getClassChatMessages(classId, filters);

// Business Logic Methods
const generateMeetingRoom = (classId) => {
	// Generate a unique meeting room ID
	const roomId = `room_${classId}_${Date.now()}`;
	return roomId;
};

const generateMeetingUrl = (roomId) => {
	// For now, we'll use a placeholder URL structure
	// In production, this would integrate with services like Jitsi, Zoom, or WebRTC
	return `https://meet.example.com/${roomId}`;
};

const generateMeetingPassword = () => {
	// Generate a random 6-digit password
	return Math.floor(100000 + Math.random() * 900000).toString();
};

const createClassWithMeeting = async (classData) => {
	// Generate meeting details
	const meetingRoomId = generateMeetingRoom(classData.id || 'temp');
	const meetingUrl = generateMeetingUrl(meetingRoomId);
	const meetingPassword = generateMeetingPassword();
	
	// Add meeting details to class data
	const classWithMeeting = {
		...classData,
		meeting_room_id: meetingRoomId,
		meeting_url: meetingUrl,
		meeting_password: meetingPassword
	};
	
	return onlineClassesRepo.createOnlineClass(classWithMeeting);
};

const startClass = async (classId, instructorId) => {
	// Verify instructor owns the class
	const onlineClass = await onlineClassesRepo.getOnlineClassById(classId);
	if (!onlineClass || onlineClass.instructor_id !== instructorId) {
		throw new Error('Unauthorized: Only the instructor can start this class');
	}
	
	if (onlineClass.status !== 'scheduled') {
		throw new Error('Class is not in scheduled status');
	}
	
	// Update class status to live
	return onlineClassesRepo.updateOnlineClass(classId, { status: 'live' });
};

const endClass = async (classId, instructorId) => {
	// Verify instructor owns the class
	const onlineClass = await onlineClassesRepo.getOnlineClassById(classId);
	if (!onlineClass || onlineClass.instructor_id !== instructorId) {
		throw new Error('Unauthorized: Only the instructor can end this class');
	}
	
	if (onlineClass.status !== 'live') {
		throw new Error('Class is not currently live');
	}
	
	// Update class status to completed
	return onlineClassesRepo.updateOnlineClass(classId, { status: 'completed' });
};

const joinClass = async (classId, userId) => {
	// Check if user is enrolled
	const enrollments = await onlineClassesRepo.getClassEnrollments(classId);
	const userEnrollment = enrollments.find(e => e.user_id === userId);
	
	if (!userEnrollment) {
		throw new Error('User is not enrolled in this class');
	}
	
	// Record attendance
	const attendanceData = {
		joined_at: new Date(),
		is_present: true
	};
	
	await onlineClassesRepo.recordAttendance(classId, userId, attendanceData);
	
	// Update enrollment status to attended
	await onlineClassesRepo.updateEnrollmentStatus(classId, userId, 'attended');
	
	return { success: true, message: 'Successfully joined the class' };
};

const leaveClass = async (classId, userId) => {
	// Find the most recent attendance record
	const attendance = await onlineClassesRepo.getClassAttendance(classId);
	const userAttendance = attendance.find(a => a.user_id === userId && !a.left_at);
	
	if (userAttendance) {
		// Calculate duration
		const joinedAt = new Date(userAttendance.joined_at);
		const leftAt = new Date();
		const durationMinutes = Math.floor((leftAt - joinedAt) / (1000 * 60));
		
		// Update attendance record
		await onlineClassesRepo.recordAttendance(classId, userId, {
			joined_at: userAttendance.joined_at,
			left_at: leftAt,
			duration_minutes: durationMinutes,
			is_present: true
		});
	}
	
	return { success: true, message: 'Successfully left the class' };
};

const getUpcomingClasses = async (userId) => {
	const filters = {
		start_date: new Date().toISOString().split('T')[0],
		status: 'scheduled',
		limit: 10,
		page: 1
	};
	
	const classes = await onlineClassesRepo.listOnlineClasses(filters);
	
	// Filter classes where user is enrolled
	const userEnrollments = await onlineClassesRepo.getUserClassEnrollments(userId);
	const enrolledClassIds = userEnrollments.map(e => e.class_id);
	
	return classes.filter(c => enrolledClassIds.includes(c.id));
};

const getLiveClasses = async () => {
	const filters = {
		status: 'live',
		limit: 50,
		page: 1
	};
	
	return onlineClassesRepo.listOnlineClasses(filters);
};

module.exports = {
	createOnlineClass,
	getOnlineClass,
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
	getClassChatMessages,
	createClassWithMeeting,
	startClass,
	endClass,
	joinClass,
	leaveClass,
	getUpcomingClasses,
	getLiveClasses
};
