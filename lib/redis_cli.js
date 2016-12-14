var redis = require('redis'),
    logger = require('./logger').logger('redis_cli');

var RedisCli = function(port, host, options) {
    logger.info("[%s]: port<%s>, host<%s>", "RedisCli", port, host);
    this.src = redis.createClient(port, host, options);
}

RedisCli.prototype.lpop = function(dicName) {
    var _this = this;
    _this.src.lpop(dicName, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, message<%s>", "lpop", dicName, err);
        }
    });
};

RedisCli.prototype.rpop = function(dicName) {
    var _this = this;
    _this.src.rpop(dicName, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, message<%s>", "rpop", dicName, err);
        }
    });
};

RedisCli.prototype.lpush = function(dicName, value) {
    var _this = this;
    _this.src.lpush(dicName, value, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, value<%s>, message<%s>", "lpush", dicName, value, err);
        }
    });
};

RedisCli.prototype.rpush = function(dicName, value) {
    var _this = this;
    _this.src.rpush(dicName, value, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, value<%s>, message<%s>", "rpush", dicName, value, err);
        }
    });
};

RedisCli.prototype.get = function(dicName) {
    var _this = this;
    _this.src.get(dicName, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, message<%s>", "get", dicName, err);
        }
    });
};

RedisCli.prototype.set = function(dicName,value) {
    var _this = this;
    _this.src.set(dicName, value, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, value<%s>, message<%s>", "set", dicName, value, err);
        }
    });
};

RedisCli.prototype.hgetall = function(dicName) {
    var _this = this;
    _this.src.hgetall(dicName, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, message<%s>", "hgetall", dicName, err);
        }
    });
}

RedisCli.prototype.hmset = function(dicName,object) {
    var _this = this;
    _this.src.hmset(dicName, object, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, object<%s>, message<%s>", "hmet", dicName, object, err);
        }
    });
}

RedisCli.prototype.incr = function(dicName) {
    var _this = this;
    _this.src.incr(dicName, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, dicName<%s>, message<%s>", "incr", dicName, err);
        }
    });
}

RedisCli.prototype.incrby = function(dicName, number) {
    var _this = this;
    _this.src.incrby(dicName, number, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, number<%s>, message<%s>", "incrby", dicName, number, err);
        }
    });
}

RedisCli.prototype.decr = function(dicName){
    var _this = this;
    _this.src.decr(dicName, function(err) {
        if(err) {
            logger.error("[%s], dicName<%s>, message<%s>", "decr", dicName, err);
        }
    });
}

RedisCli.prototype.reloadDic = function(dicName, object) {
    var _this = this;
    _this.del(dicName);
    _this.src.hmset(dicName, object, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, object<%s>, message<%s>", "reloadDic::hmset", dicName, object, err);
        }
    });
}

RedisCli.prototype.del = function(dicName) {
    var _this = this;
    _this.src.del(dicName, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, message<%s>", "del", dicName, err);
        }
    })
}

RedisCli.prototype.sadd = function(dicName, member) {
    var _this = this;
    _this.src.sadd(dicName, member, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, message<%s>", "sadd", dicName, member);
        }
    })
}

RedisCli.prototype.srem = function(dicName,  member) {
    var _this = this;
    _this.src.srem(dicName, member, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, message<%s>", "srem", dicName, member);
        }
    })
}

RedisCli.prototype.lrem = function(dicName, count, value) {
    var _this = this;
    _this.src.lrem(dicName, count, value, function(err) {
        if(err) {
            logger.error("[%s]: dicName<%s>, count<%s>, value<%s>, message<%s>", "lrem", dicName, count, value, err);
        }
    })
}

RedisCli.prototype.selectdb = function(num) {
    var _this = this;
    _this.src.select(num, function(err) {
        if (err) {
            logger.error("[%s]: num<%s>, message<%s>", "selectdb", num, err.toString());
        } else {
            logger.info('change database ' + num + '.');
        }
    })
}

module.exports = RedisCli
