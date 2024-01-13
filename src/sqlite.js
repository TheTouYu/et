const sqlite3 = require("sqlite3").verbose();
//const { tab } = require("@testing-library/user-event/dist/tab");
// // const runAsync = util.promisify(db.run.bind(db));
// // const allAsync = util.promisify(db.run.bind(db));
const Data = require("./Data.json")

const DataBase = "sqlite.db";
//const DataBase = "sqlite2.db";
// import sqlite3 from "sqlite3";
// import { Data } from "./Data2.js";
//const db = new sqlite3.Database(DataBase);

const { promisify } = require('util')

class Sqlite {
  constructor() {
    this.db = new sqlite3.Database(DataBase);
    // simple fy
    this.dbRunAsync = promisify(this.db.run.bind(this.db));
    //
    this.re = "unknow";
    this.log = true;
  }

  // 打印消息，返回结果
  message(err, message) {
    let msg = "";
    let re = false;
    if (err) {
      msg = `Error: ${message}:`;
      msg += err;
      re = false;
    } else {
      msg = `ok: ${message}.`;
      re = true;
    }
    if (this.log) console.log(msg);
    return re;
  }

  createTableSchema() {
    //console.log(Data.schemas);
    const data = {};
    Data.schemas.map((key) => {
      switch (key) {
        case "id":
          data[key] = "VARCHAR(50) PRIMARY KEY NOT NULL UNIQUE";
          break;
        case "opts":
          data[key] = "VARCHAR(150)";
          break;
        default:
          data[key] = "VARCHAR(50)";
      }
    });
    //console.log(data)
    return data;
  }

  // 创建表
  createTable(tableName, tableSchema = this.createTableSchema()) {
    //const tableSchema = this.createTableSchema();
    let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
    //let columnSql = "id INTEGER PRIMARY KEY AUTOINCREMENT, ";
    let columnSql = "";
    for (let key in tableSchema) {
      columnSql += `${key} ${tableSchema[key]}, `;
    }
    sql += columnSql;
    sql += ")";
    sql = sql.replace(", )", " )");

    //console.log('create table:', tableName, columns)
    //console.log(`run: ${sql} `)
    return new Promise((resolve, reject) => {
      this.db.run(sql, (err) => {
        var re = this.message(err, "create table " + tableName);
        re ? resolve(re) : reject(err);
      });
    });
  }

  //get tableNames
  getTableNames() {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err, rows) => {
          var re = this.message(err, "get table names");
          re ? resolve(rows) : reject(err);
        }
      );
    });
  }

  getTable(tableName) {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
        var re = this.message(err, "get table " + tableName);
        re ? resolve(rows) : reject(err);
      });
    });
  }

  // delete
  deleteTable(tableName) {
    return new Promise((resolve, reject) => {
      this.db.run(`DROP TABLE ${tableName}`, (err) => {
        var re = this.message(err, "delete table " + tableName);
        re ? resolve(re) : reject(err);
      });
    });
  }

  // 插入数据
  insertData(tableName, data) {
    // 使用占位符 ? 来防止 SQL 注入攻击
    const columns = Object.keys(data).join(", "); // 获取属性名，用于构建 SQL 语句
    const values = Object.values(data); // 获取属性值，用于构建参数数组
    const placeholders = Array(values.length).fill("?").join(", "); // 生成与值数量相等的占位符字符串
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, values, (err) => {
        const re = this.message(err, "insert data to " + tableName);
        re ? resolve(re) : reject(err);
      });
    });
  }

  // input
  insertManyData(data) {
    // 构建占位符部分 (?,?), (?,?), ...
    //console.log('data is:',{...data})
    const placeholders = data.data
      .map(
        (obj) => "(" + Array(Object.keys(obj).length).fill("?").join(", ") + ")"
      )
      .join(", ");

    // 构建值部分
    const values = data.data.reduce(
      (acc, obj) => acc.concat(Object.values(obj)),
      []
    );
    //  console.log('v and p')
    //  console.log(values)
    //  console.log(placeholders)

    // 使用占位符 ? 来防止 SQL 注入攻击
    const columns = Object.keys(data.data[0]).join(", "); // 获取属性名，用于构建 SQL 语句
    const sql = `INSERT INTO ${data.tableName} (${columns}) VALUES ${placeholders}`;
    // console.log(sql)

    return new Promise((resolve, reject) => {
      this.db.run(sql, values, (err) => {
        const re = this.message(err, "insert data to " + data.tableName);
        re ? resolve(re) : reject(err);
      });
    });
  }

  // 查询数据
  queryTable({tableName, select = "*", where=true , params = []}) {
    return new Promise((resolve, reject) => {
      console.log(`run: [select from ${tableName} where ${where}, params:[${params}]]`)
      this.db.all(
        // `SELECT ${select} FROM ${tableName} ${where}`,
        `SELECT ${select} FROM ${tableName} WHERE ${where}`, params,
        (err, rows) => {
          const re = this.message(
            err,
            "query info for table:" + tableName
          );
          re ? resolve(rows) : reject(err);
        }
      );
    });
  }

  // 更新数据
  // updateData('table1', 'col1 = "2"', "col1 > '10'")
  // updateData('a', 'col1=?, col2=?', 'col1<? OR col2<?,[1,2,0,0])
  // params 不传，则默认设置为NULL
  updateData({tableName, set, where, params = []}) {
    // 构建 UPDATE 语句
    const updateQuery = `UPDATE ${tableName} SET ${set} WHERE ${where}`;

    // 执行更新语句
    return new Promise((resolve, reject)=>{
      this.db.run(updateQuery, params, function (err) {
        if (err) {
          console.error(`Error: updating data in ${tableName}: ${err.message}`);
        } else {
          console.log(`ok: Rows updated in ${tableName}: ${this.changes}`);
        }
        err ? reject(err) : resolve(this.changes);
      });
    })
  }

  // 删除数据
  deleteData({tableName, where, params = []}) {
    // 构建 DELETE 语句
    const deleteQuery = `DELETE FROM ${tableName} WHERE ${where}`;

    return new Promise((resolve, reject) => {
      // 执行删除语句，使用参数绑定
      this.db.run(deleteQuery, params, function (err) {
        if (err) {
          console.error(`Error: deleting data from ${tableName}: ${err.message}`);
        } else {
          console.log(`ok: Rows deleted from ${tableName}: ${this.changes}`);
        }
        err ? reject(err) : resolve(this.changes);
      });
    });
  }

  async renameTable(oldTableName, newTableName) {
    try {
      await this.dbRunAsync("PRAGMA foreign_keys=off");
      await this.dbRunAsync(
        `ALTER TABLE ${oldTableName} RENAME TO ${newTableName}`
      );
      await this.dbRunAsync("PRAGMA foreign_keys=on");
      console.log("ok: Table renamed.");
      console.log(`${oldTableName}  -->  ${newTableName}`);
    } catch (err) {
      console.error("rename failed:", err);
      throw err; // 抛出异常以便外部捕获
    }
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        const re = this.message(err, "close database");
        re ? resolve(re) : reject(err);
      });
    });
  }
}

const data = {
  tableName: "users",
  tableSchema: {
    名字: "VARCHAR(50) UNIQUE",
    日期: "DATE DEFAULT CURRENT_DATE",
    address: "VARCHAR(100) ",
  },
  data: {
    名字: "e3",
  },
};

const dataWeb = {
  schemaId : ['1textInput', '2numberInput', '3select'],
  data: [{
    id: '1textInput', type: 'text', name: '姓名',
     placeholder: '请输入姓名', value: '...', 
     required: true
    }]
}

const data1 = {
  tableName: "new",

  data: [{
    name: 'myname',
    id: '999select',
    value: 'I am text',
    placeholder: 'show a text',
  },{
    name: '2myname',
    id: '3box',
    value: 'I am number',
    placeholder: 'show a text',
  }]
}

//DB.deleteTable(data.tableName);
async function run() {
  const DB = new Sqlite();
  //await DB.deleteTable(data1.tableName);
  //await DB.createTable(data1.tableName)
  await DB.insertData(data1.tableName, data1.data[0])
  //await DB.insertManyData(data1)
  const rows = await DB.queryData(data1.tableName)

  console.table(rows)

  //await DB.createTable(data.tableName, data.tableSchema);
  //await DB.insertData(data.tableName, data.data);
  //await DB.insertData(data.tableName, data.data);
  DB.close()

//   await DB.ryData(data.tableName);
}

//run()

module.exports = Sqlite;
//export default Sqlite;

//调用函数，插入新数据，例如包含 name、age、sex 的对象
// DB.insertDataIntoDatabase({ name: 'Alice', age: 30, sex: 'female' });
//
//下一次调用，插入新数据，例如包含 text、context、string 的对象
// DB.insertDataIntoDatabase({ text: 'Lorem Ipsum', context: 'Some context', string: 'example' });
//
// }
//
// db.run('CREATE TABLE IF NOT EXISTS testTable(id INTEGER PRIMARY KEY AUTOINCREMENT,  \
// name TEXT, age INTEGER, sex TEXT)')

//插入一些数据
//db.run('INSERT INTO users (name, age) VALUES (?, ?)', ['John Doe', 25]);
// db.run('INSERT INTO users (name, age) VALUES (?, ?)', ['Jane Doe', 30]);
//
//关闭数据库连接
