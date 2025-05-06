
const jwt = require('jsonwebtoken');

module.exports = {
  requireAuth: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send('Access denied');
  
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (error) {
      res.status(401).send('Invalid token');
    }
  },
  
  requireRole: (role) => (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).send('Insufficient permissions');
    }
    next();
  }
};