const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/ReduxLogin', { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;

connection.on('connected', () => {
    console.log('MongoDB is connected');
});

connection.on('error', (error) => {
    console.log('Error in MongoDB connection', error);
});

module.exports = mongoose;
