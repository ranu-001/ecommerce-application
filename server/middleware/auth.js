const jwt = require('jsonwebtoken');

// Middleware to authenticate any logged-in user
const auth = (req, res, next) => {
  // Get token from header (usually format is "Bearer TOKEN_STRING")
  const authHeader = req.header('Authorization');
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_beginner_ecommerce_secret_key_12345');
    
    // Add user info (id and role) to the request object
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if the user is an Admin
const admin = (req, res, next) => {
  // Ensure auth middleware has run first and attached req.user
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin resources only' });
  }
};

module.exports = { auth, admin };
