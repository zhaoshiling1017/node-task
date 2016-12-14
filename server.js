var config = require('./config/config.json'),
    express = require('express'),
    app = require('express')(),
    http = require('http').Server(app),
    logger = require('./lib/logger').logger('server'),
    Job = require('./lib/job'),
    redis = require("redis"),
    mysql = require('mysql'),
    exec = require('child_process').exec,
    query = require('./lib/query'),
    moment = require('moment');

var dic = config.dic;
var db = config.db;
var client = redis.createClient(dic.port, dic.host);
var conn = mysql.createConnection({
  host : db.host,
  user : db.user,
  password : db.password,
  database : db.database
});

Job.run(client, conn, config.tasks);

app.use(express.static(__dirname + '/views'));
http.listen(config.port, function() {
  logger.info('listening on *:' + config.port);
});

app.get("/volunteer/downVolunteerInfo", function(req, res) {
  var q = req.query;
  var fileName="志愿者详情表.xlsx";
  query.toVolunteerQuery(conn, q, function(err, sql) {
    if (err) {
      return res.send({"rcode": -1, "reason": "任务执行出现异常", "filePath": '', "fileName": fileName});
    }
    var titles = ["志愿者姓名", "志愿者编号", "联系方式", "身份证号", "总队", "支队", "中队", "总积分", "性别", "注册来源", "注册日期", "修改日期", "用户名", "人员类型", "乘车路线", "乘车车站", "审核状态", "活跃度"];
    var sign = moment(new Date()).format('YYYYMMDDHHmmss');
    var basePath = config.download_filePath;
    var filePathName = basePath + "/" + sign + "_volunteer_info_list.xlsx";
    var cmd = "lua ./lua/export.lua '"+filePathName+"' '"+JSON.stringify(titles)+"' '"+sql+"'";
    exec(cmd, function(err, stdout, stderr) {
      if (err) {
        logger.error("[%s]: message<%s>", "server", err.toString());
        return res.send({"rcode": -1, "reason": "任务执行出现异常", "filePath": '', "fileName": fileName});
      }
      if (stdout) {
        var result = JSON.parse(stdout);
        logger.info("[%s]: rcode<%s>, reason<%s>, filePathName<%s>", "server", result.rcode, result.reason, filePathName);
        res.send({"rcode": 0, "reason": "", "filePath": filePathName, "fileName": fileName});
      }
    });
  });
});
