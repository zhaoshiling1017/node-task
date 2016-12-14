var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    {
      type: 'file',
      filename: 'logs/agent_interface.log',
      maxLogSize: 20480,
      backups:7
      //category: ['normal']
    }
  ],
  replaceConsole: true
});

exports.logger=function(name){
  var logger = log4js.getLogger(name);
  logger.setLevel('INFO');
  return logger;
}