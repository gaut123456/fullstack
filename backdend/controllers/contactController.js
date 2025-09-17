const Contact = require('../models/Contacts');

function validate(body = {}, partial = false) {
  const fields = ['firstName', 'lastName', 'phone'];
  const data = {};
  const errors = [];

  for (const field of fields) {
    if (body[field] === undefined) {
      if (!partial) errors.push(`${field} requis.`);
      continue;
    }

    const value = body[field].trim();
    if (!value) {
      errors.push(`${field} requis.`);
      continue;
    }

    if (field === 'phone' && (value.length < 10 || value.length > 20)) {
      errors.push('phone doit faire entre 10 et 20 caractères.');
      continue;
    }

    data[field] = value;
  }

  return { data, errors };
}

async function listContacts(req, res) {
  try {
    const contacts = await Contact.find({ user: req.user.id })
      .sort({ lastName: 1, firstName: 1 });
    return res.json(contacts);
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function createContact(req, res) {
  try {
    const { data, errors } = validate(req.body, false);
    if (errors.length) {
      return res.status(400).json({ message: errors.join(' ') });
    }
    const created = await Contact.create({ ...data, user: req.user.id });
    return res.status(201).json(created);
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function updateContact(req, res) {
  try {
    const { data, errors } = validate(req.body, true);
    if (errors.length) {
      return res.status(400).json({ message: errors.join(' ') });
    }
    const updated = await Contact.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: data },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Contact non trouvé.' });
    return res.json(updated);
  } catch (err) {
    if (err && err.name === 'CastError') {
      return res.status(400).json({ message: 'ID invalide.' });
    }
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function deleteContact(req, res) {
  try {
    const deleted = await Contact.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!deleted) return res.status(404).json({ message: 'Contact non trouvé.' });
    return res.json({ message: 'Contact supprimé.' });
  } catch (err) {
    if (err && err.name === 'CastError') {
      return res.status(400).json({ message: 'ID invalide.' });
    }
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

module.exports = {
  listContacts,
  createContact,
  updateContact,
  deleteContact
};