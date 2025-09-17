const express = require('express');
const { listContacts, createContact, updateContact, deleteContact } = require('../controllers/contactController');

const router = express.Router();

router.get('/', listContacts);
router.post('/', createContact);
router.patch('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;
