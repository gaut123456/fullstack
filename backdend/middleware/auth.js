const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET)

module.exports = function auth(req, res, next) {
  console.log('Authenticating request...');
  console.log('Authorization Header:', req.headers['authorization']);

  try {
    const header = String(req.headers['authorization'] || '').trim();
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({ message: 'Token manquant.' });
    }

    const token = parts[1];
    if (!token) {
      return res.status(401).json({ message: 'Token manquant.' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide.' });
  }
};
