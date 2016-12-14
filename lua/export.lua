local cjson = require "cjson"
local luasql = require "luasql.mysql"
local Workbook = require "xlsxwriter.workbook"
local redis = require "redis"

local file = assert(io.input("./config/config.json"))
local data = assert(io.read("*a"))
local config = cjson.decode(data)

local redisCli = redis.connect(config.dic.host, config.dic.port)

--创建环境对象
local env = assert(luasql.mysql())
--连接数据库
local conn_local_db = assert(env:connect(config.db.database, config.db.user, config.db.password, config.db.host, config.db.port))
--操作数据库
conn_local_db:execute("SET NAMES utf8")

function queryVolunteerInfos(sql_statement)
  --conn_local_db:execute("START TRANSACTION;")
  local cursor = assert(conn_local_db:execute(sql_statement))
  local row = cursor:fetch ({}, "n")
  local result = {}
  while row do
    local _row = {}
    _row[1] = row[1]
    _row[2] = row[2]
    _row[3] = row[3]
    _row[4] = row[4]
    _row[5] = redisCli:hget('DIC.organization1List', row[5])
    _row[6] = redisCli:hget('DIC.organization2List', row[6])
    _row[7] = redisCli:hget('DIC.organization3List', row[7])
    _row[8] = row[8]
    _row[9] = redisCli:hget('DIC.platform.sex', row[9])
    _row[10] = redisCli:hget('DIC.platform.regSource', row[10])
    _row[11] = row[11]
    _row[12] = row[12]
    _row[13] = row[13]
    _row[14] = redisCli:hget('DIC.platform.pType', row[14])
    _row[15] = redisCli:hget('DIC.lineList', row[15])
    _row[16] = redisCli:hget('DIC.stationList', row[16])
    _row[17] = redisCli:hget('DIC.platform.auditStatus', row[17])
    _row[18] = redisCli:hget('DIC.platform.active', row[18])
    table.insert(result, _row)
    -- reusing the table of results
    row = cursor:fetch (row, "n")
  end
  --conn_local_db:execute("COMMIT;")
  return result
end

function createWorkBook(fileName, titles, contents)
  local workbook  = Workbook:new(fileName)
  local worksheet = workbook:add_worksheet()
  local header_format = workbook:add_format({bold = true, font_size = 14, font_name = "Times New Roman", font_color = "black"})
  local body_format = workbook:add_format({font_size = 12, font_name = "Times New Roman", font_color = "black"})
  for index, title in ipairs(titles) do
    worksheet:write(0, index - 1, title, header_format)
  end
  for row, content in ipairs(contents) do
    for col, el in ipairs(content) do
      worksheet:write_string(row, col - 1, el, body_format)
    end
 end
 workbook:close()
end

local filePathName = arg[1]
local titles = cjson.decode(arg[2])
local sql = arg[3]
local contents = queryVolunteerInfos(sql)
createWorkBook(filePathName, titles, contents)

--关闭数据库连接
conn_local_db:close()
--关闭数据库环境
env:close()

local result = {rcode=0, reason=""}
print(cjson.encode(result))
