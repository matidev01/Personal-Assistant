require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const userRoutes = require('./routes/userRoutes');
const accountRoutes = require('./routes/accountRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const incomeRoutes = require('./routes/incomeRoutes');
const loanRoutes = require('./routes/loanRoutes');
const overviewRoutes = require('./routes/overviewRoutes');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/overview', overviewRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});


const port = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
