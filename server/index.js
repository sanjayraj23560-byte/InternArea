const express = require('express');
const app = express();

const cors = require('cors');
const connectDB = require('./db')

const router = require('./routes/index');

const port = 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api', router);

app.get('/', (req, res) => {
    res.send("Hello");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});