// Error middleware
module.exports = (err, req, res, next) => {
    // TODO: Implement error middleware
    res.status(500).json({ message: 'Internal Server Error' });
};
