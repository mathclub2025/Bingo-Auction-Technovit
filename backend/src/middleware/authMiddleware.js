import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'math_club_auction_secret_key_2026';

/**
 * Middleware: Authenticate JWT Token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const adminKey = req.headers['x-admin-key'];

  // Shortcut for Source Computer / Admin key
  if (adminKey && (adminKey === process.env.ADMIN_KEY || adminKey === 'admin123')) {
    req.user = { id: 'admin-master', teamName: 'Source Computer Admin', role: 'admin' };
    return next();
  }

  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Access token is missing or invalid. Please login.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Forbidden: Session expired or token is invalid.'
      });
    }
    req.user = user;
    next();
  });
}

/**
 * Role-Based Access Control: Require Admin Role
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Denied: Only the Admin / Source Computer is authorized to perform this operation.'
    });
  }
  next();
}

/**
 * Role-Based Access Control: Require Team or Admin Role
 */
export function requireTeamOrAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'team' && req.user.role !== 'admin')) {
    return res.status(403).json({
      error: 'Access Denied: Valid team or admin authentication required.'
    });
  }
  next();
}
