module.exports = func => {
    return (req, res, next) => {
        // Wrap the function call in a try-catch block for synchronous errors
        try {
            // Call the provided function and handle async errors
            Promise.resolve(func(req, res, next)).catch(next);
        } catch (err) {
            next(err); // Handle synchronous errors
        }
    };
};