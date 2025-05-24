const express = require('express');
const bodyParser = require('body-parser');

const targetRoutes = require('./routes/targetRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const taskRoutes = require('./routes/taskRoutes');
const resultRoutes = require('./routes/resultRoutes');


const app = express();
app.use(bodyParser.json());

app.use('/api/targets', targetRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', resultRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));