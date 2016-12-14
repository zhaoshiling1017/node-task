var logger = require('./logger').logger('query');

var toVolunteerQuery = function(conn, query, callback) {
  var creatorId = query.creatorId;
  var name = query['query.name'];
  var idCard = query['query.idCard'];
  var code = query['query.code'];
  var rideLine = query['query.rideLine'];
  var unitTotal = query['query.unitTotal'];
  var unitBranch = query['query.unitBranch'];
  var unitMiddle = query['query.unitMiddle'];
  var beginTime = query['query.beginTime'];
  var endTime = query['query.endTime'];
  var active = query['query.active'];
  var userName = query['query.userName'];
  var status = query['query.status'];
  var auditStatus = query["query.auditStatus"];
  var ifEdit = query["query.ifEdit"];
  conn.query("SELECT unit_total, unit_branch, unit_middle FROM T_USER WHERE id = ?", [creatorId], function(err, rows, fields) {
    if (err) {
      logger.error("[%s]: message<%s>", "toVolunteerQuery", err.toString());
      return callback(err);
    }
    var orgCode = "";
    if (null != rows && rows.length > 0) {
      var row = rows[0];
      if (row.unit_middle != '') {
        orgCode = row.unit_middle;
      } else if (row.unit_branch != '') {
        orgCode = row.unit_branch;
      } else {
        orgCode = row.unit_total;
      }
    }
    var sql = 'SELECT IFNULL(name, ""),IFNULL(code, ""),IFNULL(phone, ""),IFNULL(id_card, ""),IFNULL(unit_total, ""), IFNULL(unit_branch, ""), IFNULL(unit_middle, ""),CONCAT(integral, ""),IFNULL(sex, ""),IFNULL(reg_source, ""),IFNULL(created_at, ""),IFNULL(updated_at, ""),IFNULL(user_name, ""),IFNULL(p_type, ""),IFNULL(ride_line, ""),IFNULL(station, ""),IFNULL(audit_status, ""),IFNULL(active, "")  FROM T_VOLUNTEER t WHERE t.if_use=1 AND t.if_pass_exam=1';
    if (name != '') {
      sql += (' AND t.name LIKE "'+name+'%"');
    }
    if (idCard != '') {
      sql += (' AND t.id_card LIKE "'+idCard+'%"');
    }
    if (code != '') {
      sql += (' AND t.code LIKE "'+code+'%"');
    }
    if (rideLine != '') {
      sql += (' AND t.ride_line = "'+rideLine+'"');
    }
    if (unitMiddle) {
      sql += (' AND t.unit_middle = "'+unitMiddle+'"');
    }
    if (unitTotal && !unitBranch) {
      sql += (' AND t.unit_total = "'+unitTotal+'"');
    }
    if (unitBranch  && !unitMiddle) {
      sql += (' AND t.unit_branch = "'+unitBranch+'"');
    }
    if (auditStatus != '' && auditStatus == 'pending' && (beginTime != '' || endTime != '')) {
      sql += (' AND t.auditStatus = "pending"');
      if (beginTime != '') {
        sql += (' AND t.updated_at >= "'+beginTime+'"');
      }
      if (endTime != '') {
        sql += (' AND t.updated_at <= "'+endTime+'"');
      }
    } else {
      if (auditStatus != '') {
        sql += (' AND t.audit_status = "'+auditStatus+'"');
      }
      if (beginTime != '') {
        sql += (' AND t.created_at >= "'+beginTime+'"');
      }
      if (endTime != '') {
        sql += (' AND t.created_at <= "'+endTime+'"');
      }
    }
    if (orgCode != '') {
      sql += (' AND t.unit_middle LIKE "'+orgCode+'%"');
    }
    if (active != '') {
      sql += (' AND t.active = "'+active+'"');
    }
    if (userName != '') {
      sql += (' AND t.user_name = "'+userName+'"');
    }
    if (status != '') {
      sql += (' AND t.status = "'+status+'"');
    }
    if (ifEdit != '') {
      sql += (' AND t.if_edit = ' + ifEdit);
    }
    sql += ' ORDER BY t.created_at DESC';
    logger.info("[%s]: sql<%s>", "toVolunteerQuery", sql);
    callback(null, sql);
  });
}

exports.toVolunteerQuery = toVolunteerQuery;
