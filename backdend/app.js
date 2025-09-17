const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const auth = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', auth, require('./routes/contacts'));

const PORT = process.env.PORT;

// Do not start the server when running tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
