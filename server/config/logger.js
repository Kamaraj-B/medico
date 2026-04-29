// configire the winston logger
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const logDir = 'logs'; 

// Create the log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);   
}
// Configure the logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
        }),
    ],
});

module.exports = [
    logger,
    winston.format.errors({ stack: true }),
    winston.format.json()   
    ]
//use the logger in your application
// logger.log('info', 'This is an info message with metadata', { metadata: 'value' });
// logger.log('error', 'This is an error message with metadata', { metadata: 'value' });
// logger.log('warn', 'This is a warning message with metadata', { metadata: 'value' });
// logger.log('debug', 'This is a debug message with metadata', { metadata: 'value' });
