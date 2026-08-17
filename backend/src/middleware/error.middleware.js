

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.code === 11000) {
        statusCode = 409;
        message = message;
    }

    return res.status(statusCode).json({
        statusCode: statusCode,
        success: false,
        message: message,
        data: null
    });
};

export { errorHandler };