const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log to file
const logToFile = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
  };

  const logFile = path.join(
    logsDir,
    `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`
  );

  fs.appendFileSync(
    logFile,
    JSON.stringify(logEntry) + '\n'
  );
};

// Logger object
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data || '');
    logToFile('INFO', message, data);
  },
  error: (message, data) => {
    console.error(`[ERROR] ${message}`, data || '');
    logToFile('ERROR', message, data);
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data || '');
    logToFile('WARN', message, data);
  },
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data || '');
      logToFile('DEBUG', message, data);
    }
  },
};

module.exports = logger;
