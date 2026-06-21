const express = require('express');
const cors = require('cors');
const path = require('path');

const customerRoutes = require('./routes/customerRoutes'); 
const salesRoutes = require('./routes/salesRoutes');
const contractRoutes = require('./routes/contractRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const managerRoutes = require('./routes/managerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


app.use('/api/companies', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/managers', managerRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 헬스 체크
app.get('/', (req, res) => {
  res.send('CMS API server is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});