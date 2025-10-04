// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Adjust path as needed

export const protect = async (req, res, next) => {
  let token;

  // Check if the token is sent in the headers and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGciOiJIUz...")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using your secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID from the token's payload
      // and attach the user object to the request (excluding the password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found.' });
      }

      next(); // If everything is good, proceed to the next middleware/route handler
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // The 'protect' middleware should have already run, so we expect req.user to exist.
    if (!req.user || !roles.includes(req.user.role)) {
      // 403 Forbidden is more appropriate than 401 Unauthorized here.
      // 401 means "you are not logged in".
      // 403 means "you are logged in, but you don't have permission".
      return res
        .status(403)
        .json({
          message: 'You do not have permission to perform this action.',
        });
    }
    next();
  };
};
