const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const PEPPER = process.env.BCRYPT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

async function register(req, res) {
  try {
    const { email = '', password = '' } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }
    if (!/.+@.+\..+/i.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide." });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 6 caractères.'
      });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email déjà utilisé.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + PEPPER, salt);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword
    });

    return res.status(201).json({
      message: 'Inscription réussie.',
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Email déjà utilisé.' });
    }
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function login(req, res) {
  try {
    const { email = '', password = '' } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    const passwordMatch = await bcrypt.compare(password + PEPPER, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    const token = jwt.sign(
      { sub: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'Connexion réussie.',
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    console.error('login-error', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

module.exports = { register, login };