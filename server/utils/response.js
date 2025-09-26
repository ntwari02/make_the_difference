// Standardized response helpers
const ok = (res, data, message = null) => {
	return res.status(200).json({
		success: true,
		message,
		data
	});
};

const created = (res, data, message = 'Resource created successfully') => {
	return res.status(201).json({
		success: true,
		message,
		data
	});
};

const badRequest = (res, message = 'Bad request', errors = null) => {
	return res.status(400).json({
		success: false,
		message,
		errors
	});
};

const unauthorized = (res, message = 'Unauthorized') => {
	return res.status(401).json({
		success: false,
		message
	});
};

const forbidden = (res, message = 'Forbidden') => {
	return res.status(403).json({
		success: false,
		message
	});
};

const notFound = (res, message = 'Resource not found') => {
	return res.status(404).json({
		success: false,
		message
	});
};

const conflict = (res, message = 'Conflict') => {
	return res.status(409).json({
		success: false,
		message
	});
};

const internalError = (res, message = 'Internal server error') => {
	return res.status(500).json({
		success: false,
		message
	});
};

module.exports = {
	ok,
	created,
	badRequest,
	unauthorized,
	forbidden,
	notFound,
	conflict,
	internalError
};
