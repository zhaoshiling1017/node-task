var _ = require("underscore"),
    moment = require('moment'),
    EventProxy = require('eventproxy'),
    CronJob = require('cron').CronJob,
    url = require('url'),
    querystring = require('querystring'),
    logger = require('./logger').logger('job'),
    http = require('http'),
    config = require('../config/config.json');

/**
 * 周期性获取监控的快照
 */
exports.run = function(client, conn, tasks) {
    _.each(tasks, function(task) {
        var job = new CronJob({
            cronTime: task.cron,
            onTick: function() {
                process(client, conn, task);
            },
            start: false
        });
        job.start();
    });
}

var process = function(client, conn, task) {
  if (task.target == 'EXPORT_TASKS_QUEUE') {
    var queue = task.queue;
    var toQueue = task.toQueue;
    client.get('DIC_SYSTEM_CORE_NUM', function(err, num) {
      if (err) {
        logger.error("[%s]: message<%s>", "process", err.toString());
      } else if (parseInt(num) > 0) {
        client.lpop(queue, function(err, res) {
          if (err) {
            logger.error("[%s]: message<%s>", "process", err.toString());
          } else {
            if (null != res) {
              var obj = JSON.parse(res);
              var creatorId = obj.creatorId;
              var createdAt = obj.createdAt;
              var params = JSON.stringify(obj.params);
              var args = {url: obj.url, creator_id: creatorId, if_use: 1, created_at: createdAt, params: params, status: 'READY', count: 0, updated_at: new Date()}
              var sql = "INSERT INTO T_TASK SET ?";
              conn.query(sql, args, function(err, result) {
                if (err) {
                  logger.error("[%s]: res<%s>, message<%s>", "process", res, err.toString());
                } else {
                  obj.id = result.insertId;
                  var value = JSON.stringify(obj);
                  client.rpush(toQueue, value, function(err) {
                    if(err) {
                        logger.error("[%s]: toQueue<%s>, value<%s>, message<%s>", "process", toQueue, value, err.toString());
                    } else {
                      client.decr('DIC_SYSTEM_CORE_NUM', function(err) {
                        if (err) {
                          logger.error("[%s]: message<%s>", "process", err.toString());
                        }
                      });
                    }
                  });
                }
              });
            }
          }
        });
      }
    });
  }
  if (task.target == 'EXPORT_DOWNLOAD_QUEUE') {
    var queue = task.queue;
    client.lpop(queue, function(err, res) {
      if (err) {
        logger.error("[%s]: message<%s>", "process", err.toString());
      } else {
        if (null != res) {
          var obj = JSON.parse(res);
          var taskId = obj.id;
          var sql = "UPDATE T_TASK SET status = ?, updated_at = ? WHERE id = ?";
          var args = ['BEGIN', new Date(), taskId];
          var creatorId = obj.creatorId;
          var params = obj.params;
          params.taskId = taskId;
          params.creatorId = creatorId;
          conn.query(sql, args, function(err, results) {
            if (err) {
              logger.error("[%s]: message<%s>", "process", err.toString());
              return;
            }
          });
          var content = querystring.stringify(params);
          var urlStr = task.baseUrl + obj.url;
          sendExpData(urlStr, content, conn);
        }
      }
    });
  }
}

var sendExpData = function(urlStr, content, conn) {
  urlStr = urlStr + "?" + content;
  var parsedUrl = url.parse(urlStr, true);
  var options = {host: null, port: -1, path: null, method: 'GET'};
  options.host = parsedUrl.hostname;
  options.port = parsedUrl.port;
  options.path = parsedUrl.pathname;
  if (parsedUrl.search) {
    options.path += parsedUrl.search;
  }
  var req = http.request(options, function(res){
    res.setEncoding('utf8');
    res.on('error', function(err){
      logger.error('RESPONSE ERROR: ' + err);
    });
  });

  req.on('error', function(err){
    logger.error('REQUEST ERROR: ' + err);
  });
  req.end();
}
