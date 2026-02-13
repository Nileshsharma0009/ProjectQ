// JWT configuration
module.exports = {
  secret: process.env.JWT_SECRET || 'secret',
  expiresIn: '1d',
};
