const service = require('../services/online-classes.service');
const { ok, created, noContent, badRequest, unauthorized, forbidden, notFound, serverError } = require('../../utils/response');

// Online Classes Controller Methods
const createOnlineClass = async (req, res) => {
	try {
		const classData = {
			...req.body,
			instructor_id: req.user.id
		};
		
		const onlineClass = await service.createClassWithMeeting(classData);
		return created(res, {
			message: 'Online class created successfully',
			data: onlineClass
		});
	} catch (error) {
		return badRequest(res, error.message);
	}
};

const getOnlineClass = async (req, res) => {
	try {
		const onlineClass = await service.getOnlineClass(req.params.classId);
		if (!onlineClass) {
			return notFound(res, 'Online class not found');
		}
		return ok(res, { data: onlineClass });
	} catch (error) {
		return serverError(res, 'Failed to retrieve online class', error);
	}
};

const listOnlineClasses = async (req, res) => {
	try {
		const filters = {
			...req.query,
			limit: parseInt(req.query.limit) || 20,
			page: parseInt(req.query.page) || 1
		};
		
		const classes = await service.listOnlineClasses(filters);
		return ok(res, { data: classes });
	} catch (error) {
		return serverError(res, 'Failed to retrieve online classes', error);
	}
};

const updateOnlineClass = async (req, res) => {
	try {
		const onlineClass = await service.getOnlineClass(req.params.classId);
		if (!onlineClass) {
			return notFound(res, 'Online class not found');
		}
		
		// Check if user is the instructor or admin
		if (onlineClass.instructor_id !== req.user.id && req.user.role !== 'admin') {
			return forbidden(res, 'Only the instructor or admin can update this class');
		}
		
		const updatedClass = await service.updateOnlineClass(req.params.classId, req.body);
		return ok(res, {
			message: 'Online class updated successfully',
			data: updatedClass
		});
	} catch (error) {
		return badRequest(res, error.message);
	}
};

const deleteOnlineClass = async (req, res) => {
	try {
		const onlineClass = await service.getOnlineClass(req.params.classId);
		if (!onlineClass) {
			return notFound(res, 'Online class not found');
		}
		
		// Check if user is the instructor or admin
		if (onlineClass.instructor_id !== req.user.id && req.user.role !== 'admin') {
			return forbidden(res, 'Only the instructor or admin can delete this class');
		}
		
		const deleted = await service.deleteOnlineClass(req.params.classId);
		if (deleted) {
			return noContent(res, 'Online class deleted successfully');
		} else {
			return serverError(res, 'Failed to delete online class');
		}
	} catch (error) {
		return serverError(res, 'Failed to delete online class', error);
	}
};

const enrollInClass = async (req, res) => {
	try {
		const enrollment = await service.enrollInClass(req.params.classId, req.user.id);
		return created(res, {
			message: 'Successfully enrolled in class',
			data: enrollment
		});
	} catch (error) {
		return badRequest(res, error.message);
	}
};

const getClassEnrollments = async (req, res) => {
	try {
		const enrollments = await service.getClassEnrollments(req.params.classId);
		return ok(res, { data: enrollments });
	} catch (error) {
		return serverError(res, 'Failed to retrieve class enrollments', error);
	}
};

const getUserClassEnrollments = async (req, res) => {
	try {
		const enrollments = await service.getUserClassEnrollments(req.user.id);
		return ok(res, { data: enrollments });
	} catch (error) {
		return serverError(res, 'Failed to retrieve user class enrollments', error);
	}
};

const startClass = async (req, res) => {
	try {
		const onlineClass = await service.startClass(req.params.classId, req.user.id);
		return ok(res, {
			message: 'Class started successfully',
			data: onlineClass
		});
	} catch (error) {
		return badRequest(res, error.message);
	}
};

const endClass = async (req, res) => {
	try {
		const onlineClass = await service.endClass(req.params.classId, req.user.id);
		return ok(res, {
			message: 'Class ended successfully',
			data: onlineClass
		});
	} catch (error) {
		return badRequest(res, error.message);
	}
};

const joinClass = async (req, res) => {
	try {
		const result = await service.joinClass(req.params.classId, req.user.id);
		return ok(res, result);
	} catch (error) {
		return badRequest(res, error.message);
	}
};

const leaveClass = async (req, res) => {
	try {
		const result = await service.leaveClass(req.params.classId, req.user.id);
		return ok(res, result);
	} catch (error) {
		return badRequest(res, error.message);
	}
};

const getUpcomingClasses = async (req, res) => {
	try {
		const classes = await service.getUpcomingClasses(req.user.id);
		return ok(res, { data: classes });
	} catch (error) {
		return serverError(res, 'Failed to retrieve upcoming classes', error);
	}
};

const getLiveClasses = async (req, res) => {
	try {
		const classes = await service.getLiveClasses();
		return ok(res, { data: classes });
	} catch (error) {
		return serverError(res, 'Failed to retrieve live classes', error);
	}
};

const getClassAttendance = async (req, res) => {
	try {
		const onlineClass = await service.getOnlineClass(req.params.classId);
		if (!onlineClass) {
			return notFound(res, 'Online class not found');
		}
		
		// Check if user is the instructor or admin
		if (onlineClass.instructor_id !== req.user.id && req.user.role !== 'admin') {
			return forbidden(res, 'Only the instructor or admin can view attendance');
		}
		
		const attendance = await service.getClassAttendance(req.params.classId);
		return ok(res, { data: attendance });
	} catch (error) {
		return serverError(res, 'Failed to retrieve class attendance', error);
	}
};

const addClassMaterial = async (req, res) => {
	try {
		const onlineClass = await service.getOnlineClass(req.params.classId);
		if (!onlineClass) {
			return notFound(res, 'Online class not found');
		}
		
		// Check if user is the instructor or admin
		if (onlineClass.instructor_id !== req.user.id && req.user.role !== 'admin') {
			return forbidden(res, 'Only the instructor or admin can add materials');
		}
		
		const material = await service.addClassMaterial(req.params.classId, req.body);
		return created(res, {
			message: 'Class material added successfully',
			data: material
		});
	} catch (error) {
		return badRequest(res, error.message);
	}
};

const getClassMaterials = async (req, res) => {
	try {
		const materials = await service.getClassMaterials(req.params.classId);
		return ok(res, { data: materials });
	} catch (error) {
		return serverError(res, 'Failed to retrieve class materials', error);
	}
};

const addChatMessage = async (req, res) => {
	try {
		const message = await service.addChatMessage(req.params.classId, req.user.id, req.body);
		return created(res, {
			message: 'Chat message sent successfully',
			data: message
		});
	} catch (error) {
		return badRequest(res, error.message);
	}
};

const getClassChatMessages = async (req, res) => {
	try {
		const filters = {
			limit: parseInt(req.query.limit) || 50,
			page: parseInt(req.query.page) || 1
		};
		
		const messages = await service.getClassChatMessages(req.params.classId, filters);
		return ok(res, { data: messages });
	} catch (error) {
		return serverError(res, 'Failed to retrieve chat messages', error);
	}
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
	startClass,
	endClass,
	joinClass,
	leaveClass,
	getUpcomingClasses,
	getLiveClasses,
	getClassAttendance,
	addClassMaterial,
	getClassMaterials,
	addChatMessage,
	getClassChatMessages
};
