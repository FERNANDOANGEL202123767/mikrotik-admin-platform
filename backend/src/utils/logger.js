class Logger {
     async log(message, level = 'info') {
       const logMessage = `${new Date().toISOString()} [${level.toUpperCase()}]: ${message}`;
       console.log(logMessage);
     }

     async error(message) {
       await this.log(message, 'error');
     }
   }

   module.exports = new Logger();