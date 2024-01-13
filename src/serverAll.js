// serverAll.js

const express = require('express');
const bodyParser = require('body-parser');
const mySqlite = require('./sqlite.js')

const {splitNumId} = require('./base2.js')
const DATA = require('./Data.json')
// import express from 'express';
// import bodyParser from 'body-parser';
// import mySqlite from './sqlite.mjs';



const app = express();
const port = 3001;




let meg;
app.use(bodyParser.json());
// 允许 http://localhost:3000 访问资源
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.get("/getData", async (req, res) => {
  const type = req.query["type"];
  let data = [];
  let sq
  // console.log("query:?");
  // console.log(req.query);
  try {
    sq = new mySqlite();
    switch (type) {
      case "tableNames":
        //console.log('tables:')
        data = await sq.getTableNames();
        //console.log(data);
        break;
      case "queryTable":
       // console.log('server,input:',{...req});
        // let select = req.query['select']?req.query['select']:'*';
        // let where = req.query['where']?'WHERE '+ req.query['where']:'';
        // data = await sq.queryTable(req.query['tableName'], select, where);
        data = await sq.queryTable({
          tableName: req.query['tableName'],
          select: req.query['select'],
          where: req.query['where'],
          params: req.query['params'],
        });
        break;
      default:
        meg = "\n12 server: url: Invalid type: " + type;
        console.log(meg);
        res.status(400).json({ message: meg });
     //   throw new Error('wrong type')
    }

    res.status(200).json({ data: data, message: "12 server: Data get successfully" });
    //console.log('serverall: data:',{...data})
  } catch (err) {
    //throw new Error('database return error');
    meg = "12 server get: Error processing data:"
    console.error(meg, err); 
    console.error(data);
    if(err.message.includes('SQLITE_ERROR: no such table:')){
      //console.log('rrrrrrrrrrrrrrr')
      res.status(401).json({ message: '小提示：无表查询等同于直接取下电脑运行时的内存！ ' });
    }else{
      // console.log(err)
      // console.log(Object.keys(err))
      res.status(500).json({ data: data, message: meg, error: err});
    }
  }finally{
    await sq.close();
  }
});

// 步骤 1: 接收 JSON 数据
app.post('/setData', async(req, res) => {
  const data = req.body;
  let serversData = {};
  let sq;
  try {
    // 步骤 2: 调用另外的文件对 JSON 数据的内容进行判断
    // const validationResult = validateJsonData(data);
    //console.log(validationResult)
    sq = new mySqlite();
    switch (data.type) {
          case "createTable":
             if(data.tableName === 'APP公式'){
              const meg =  '这个不能保存的呀，求求啦~'
              res.status(401).json({ message: meg});
              return;
            }
            //console.log(data);
            //console.log('tables:')
            //console.log(tables)
            const tables = await sq.getTableNames();

            for (const t of tables) {
              if (t.name === data.tableName) {
                await sq.deleteTable(data.tableName);
                await sq.deleteTable(data.tableName+'_data');
              }
            }
            // 下面的写法，会变成异步的，然后报错，！！！
            // tables.forEach(async t => {
            //   if(t.name === data.tableName){
            //     await sq.deleteTable(data.tableName);
            //   }
            // });
            await sq.createTable(data.tableName);
            // null ---> NULL
            data.data.map(obj => {
              for(let prop of DATA.schemas){
                //obj[prop] = obj[prop] === null ? 'NULL' : obj[prop];
                if(!obj[prop])obj[prop] = 'NULL';
              }
              }
            )
            //console.log('data:',{...data})
            await sq.insertManyData(data);

            // 根据table（里面存着用户设计了多少个字段）表里面数据的多少，创建数据表
            //console.log('data:', {...data})
            const schemaMap = {
              select: 'TEXT',
              text: 'TEXT',
              textInput: 'TEXT',
              switch: 'TEXT',
              pressButton: 'TEXT',
              number: 'INTEGER',
              numberInput: 'INTEGER',
              id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
              date: 'INTEGER',
              other: 'TEXT',
            }
            const schema = {}
            data.data.map(obj =>{
              schema[obj.id] = schemaMap[splitNumId(obj.id).id];
            })
            schema['id'] = schemaMap.id
            //console.log('schema for database:', {...schema})
            await sq.createTable(data.tableName+'_data', schema);
            break;
         
          case "renameTable":
            if(data.tableName === 'APP公式'){
              const meg =  '这个不能改呀，求求啦~'
              res.status(401).json({ message: meg});
              return;
            }
            await sq.renameTable(data.tableName, data.newTableName);
            await sq.renameTable(data.tableName+'_data', data.newTableName+'_data');
            await sq.updateData({
              tableName: 'APP公式_data',
              set: 'textInput7 = ?',
              where: 'textInput7 = ?',
              // params: [data.tableName, data.newTableName],
              params: [data.newTableName, data.tableName],
            })
            break;
          case "deleteTable":
            if(data.tableName === 'APP公式'){
              meg =  '这个删了就完了，别删，求求啦~'
              res.status(401).json({ message: meg});
              return;
            }
            await sq.deleteTable(data.tableName);
            await sq.deleteTable(data.tableName+'_data');
            break;
          case "insertData":
            // data: {}
            await sq.insertData(data.tableName+'_data', data.data);
            break;
          case "insertManyData":
            // data: {tableName:'xxx', data:[{},{}]}
            await sq.insertManyData({
              tableName: data.tableName+'_data',
              data: data.data
            });
            break;
          case "updateData":
            // data: {tableName: 'xxx', data:{}, where, select}
            await sq.updateData({
              tableName: data.tableName,
              // data: data.data,
              set: data.set,
              where: data.where,
              params: data.params || []
            });
            break;
          case "deleteData":
            // data: {tableName: 'xxx', data:{}, where, select}
            await sq.deleteData({
              tableName: data.tableName,
              // data: data.data,
              where: data.where,
              // set: data.set,
              params: data.params || []
            });
            break;
          default:
            meg = "\n12 server: Invalid type: " + data.type;
            console.log(meg);
            res.status(400).json({ message: meg});
            //throw new Error('database, wrong type ');
    }

    res.status(200).json({ message: '\n12 server: success!', data: data});
     
  } catch(err){
    meg = "12 服务器: 处理数据失败:"
    console.error(meg, err); 
    console.error('data:', {...data});
    //throw new Error('database set failed');
    //这里不需要上级调用捕获错误，使用res返回结果
    if(err.message.includes('SQLITE_ERROR: no such table:')){
      res.status(401).json({ message: '小可爱， 数据库中没有该表哦'});
    }else{
      // console.log(err)
      // console.log(Object.keys(err))
      res.status(500).json({ data: data, message: meg, error: err});
    }
  }finally{
    // 关闭数据库连接
    await sq.close();
  }
});

app.listen(port, () => {
  console.log(`  ---all Server is running on port ${port}`);
});
