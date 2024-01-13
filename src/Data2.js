import DataTransfer from "./DataTransfer.js";
import React from "react";
import Data from './Data.json'
import { Preview, openDataPreview, Formula, openNewPage, showNotification, validateString } from './base.js'
const DT = new DataTransfer();

export const runningData = {};

class DataHandle {
  constructor() {
    this.schema = Data; //数据库数据
    this.getTableNameFailed = 0
  }

  getElements() {
    return this.schema.elements;
  }

  getBaseElements() {
    this.schema.baseElements.map((e, i) => {
      e["id"] = e.type + i;
    });
    return this.schema.baseElements;
  }

  formulaButton(name){
    return (
      <a target="formula" onClick={() => this.formula()}>
        {name}
      </a>
    )
  }
  saveButton(name) {
    // 校验数据
    return (
      <input
        type="submit"
        id="tableNameInput"
        value={name}
        onClick={() => this.saveData()}
      />
    );
  }
  previewButton(name) {
    return (
      <a target="preview" onClick={() => this.preview()}>
        {name}
      </a>
    );
    //return <input type="button" value={name} onClick={func} />;
  }
  //<NavLink to='/preview' onClick={() => func()}>{name}</NavLink>
  datasButton(name) {
    return (
      <a href="/" target="datas">
        {name}
      </a>
    );
  }
  insertButton(name) {
    return (
      <a target="datas" onClick={async () => {
          const result = await this.runFormula()
          if(result)this.insertData()
        }}>
        {name}
      </a>
    );
  }

  async runFormula(){
    return true
  }
  // disabled(){
  //   const topSide = document.getElementById("TopSide");
  //   if(topSide.getAttribute("disabled") === "true"){
  //     return true;
  //   }
  //   return false;
  // }
  // setDisabled(value='true'){
  //   document.getElementById("TopSide").setAttribute("disabled", value);
  // }

  async insertData() {
    const tableNameInput = document.getElementById("tableNameInput");
    // if(this.disabled()){
    //   return;
    // }
    const tableName = tableNameInput.value;
    if (!validateString(tableName)) {
      showNotification("星星呀，给予可怜的旅人一个名字吧", "error");
      setTimeout(() => {
        showNotification("有啦，以后就叫你 ·无名人· ", "null");
      }, 2000);
      return;
    }
    this.appSchema = {};
    try {
      this.toSchemaData(tableName);
    } catch (err) {
      showNotification(err, "error");
      return;
    }
    console.log({ ...this.appSchema });
    showNotification("正在请求服务器··· ···");
    // 提取名字和值，
    const data = {
      tableName: tableName,
      type: "insertData",
      data: {},
    };
    for (let obj of this.appSchema.data) {
      data.data[obj.id] = obj.value;
    }
    //
    try {
      console.log({ ...data });
      await DT.setData(data);
      showNotification("好耶~是新数据·^·");
    } catch (err) {
      console.error(err);
      showNotification(err, "error");
    }
  }

  async saveData(e) {
    // const tableName = document.getElementById("tableNameInput").value;
    // 保存页面组件数据
    // 对接后端字段
    this.appSchema = {};
    // 设置每个{}的属性和值
    try {
      // const form = e.target;
      // if (!form.checkValidity()) {
      //   throw new Error("没有名字呢！");
      // }
      // 要写在前面，不然自己提交数据了, 所以 这个家里没有你的位置了
      // if (!e) return;
      // e.preventDefault();
      const tableName = this.getTableName();
      //执行一次公式看看，
      const myFormula = new Formula(tableName);
      const formula = await myFormula.getFormula(tableName, true);
      await myFormula.applyFormula(formula, false);
      // if (tableName === "") {
      //   throw "不写名字，我怎么知道你叫什么呀！";
      // }
      // showNotification('i run run run')
      // 如果没填写数据，e不存在
      // if (!validateString(tableName)) {
      //   throw "（￣▽￣） 这个名字一点也不可爱~　";
      // }
      // 如果表单中有自带验证属性，如 required、pattern，浏览器会自动进行验证
      this.toSchemaData(tableName);
      // 设置操作类型，这里是创建
      this.appSchema["type"] = "createTable";
      showNotification("正在请求服务器··· ···");
      // 交给后端，保存到数据库
      // 要求和数据库接口一致
      // const schema = {
      //   tableName: tableName,
      //   type:      'createTable',
      //   schema: [
      //     {},{},{}
      //   ]
      // }
      console.log("schema: save appSchema:");
      console.table(this.appSchema);
      //this.appSchema['type'] = 'queryTable';
      await DT.setData(this.appSchema);
      showNotification("保存成功啦~");
    } catch (err) {
      console.error(err);
      showNotification(err, "error");
      // throw 'save failed'
      //("保存失败！");
    }
  }

  getSchemaData() {
    let data
    try {
      const tableName = this.getTableName();
      data = this.toSchemaData(tableName);
      return data;
    } catch (e) {
      showNotification(e, "error");
      console.error(e);
      throw 'getSchemaData failed';
    }
    // console.log("getSchemaData: ", {...data});
  }

  toSchemaData(tableName) {
    //const LeftSide = document.getElementById("LeftSide");
    const Main = document.getElementById("Main");
    const schema = [];
    // console.error("schema:");
    // console.log(schema)
    this.traverseAttributes(Main, schema);
    if (Array.isArray(schema) && schema.length === 0) {
      throw "要被玩坏啦 ··· 这里真的什么也没有 ·  ";
      //throw "这里什么也没有啦!  ";
    }
    this.appSchema = {
      schemaId: schema.map((row) => row.id), //  这个表有哪些字段， 0text, 1number,...
      data: schema, // 每个字段，有哪些属性 0text:{name:xxx,...}
    };
    this.appSchema.data.forEach((S) => {
      S["tableName"] = S["tableName"] || tableName;
    });
    //
    this.appSchema["tableName"] = tableName;
    //
    return {...this.appSchema};
  }

  getTableName() {
    const tableName = document.getElementById("tableNameInput").value;
    // 保存页面组件数据
    // 对接后端字段
    this.appSchema = {};
    // 设置每个{}的属性和值
    try {
      // const form = e.target;
      // if (!form.checkValidity()) {
      //   throw new Error("没有名字呢！");
      // }
      if (tableName === "") {
        if(this.getTableNameFailed % 5 < 2)
          throw "不写名字，我怎么知道你叫什么呀！";
        else if(this.getTableNameFailed % 5 < 4)
          throw "适可而止吧！"
      }
      // showNotification('i run run run')
      if (!validateString(tableName)) {
        if(this.getTableNameFailed % 3 === 0)
          throw "（￣▽￣） 这个名字一点也不可爱~　";
        else if(this.getTableNameFailed % 3 === 1)
          throw "换个好听的名字吧！";
        else if(this.getTableNameFailed % 3 === 2)
          throw "取名字也是一件很困难的事情呢 ... 聪明的你想到了吗？";
      }
      return tableName;
      //
    }catch(err){
        this.getTableNameFailed ++;
        if(this.getTableNameFailed > 13 )
          throw "哈??? 要你何用！！！这也不会 ?( •̀ ω •́ )y?  ";
        if(this.getTableNameFailed > 8 )
          throw "啊啊啊，这个家里没有你的位置了！！！";
        if(this.getTableNameFailed > 5)
          throw "你确定要叫这个名字？"
        // showNotification(err, "error");
        console.error(err)
        throw err;
    }
  }

  async formula(){
    try{
      let tableName = this.getTableName();
      // name = 'a'
      const myFormula = new Formula(tableName)
      await myFormula.openFormulaSetting(); //保存公式到服务器, 然后
      // 渲染一次公式，  数据加载的时候也要渲染一次，待会添加
    }catch(err){
      showNotification(err, "error");
    }
  }

  async preview(tableName=false) {
    if(tableName === false)
      tableName = document.getElementById("tableNameInput").value;
    try {
      if (tableName === "") {
        throw "不写名字，想让我加班嘛 !^！";
      }
      if (!validateString(tableName)) {
        throw "哎呀呀, 是谁还没起对名字呀！";
      }
      showNotification('冰 火 雷 风 草 岩··· 正在全力加载数据···')
      const datas = await DT.getData({
        type: 'queryTable',
        tableName: tableName+'_data',
      })
      const schema = await DT.getData({
        type: 'queryTable',
        tableName: tableName,
      })
      // const schema = await DT.getData({
      //   type: 'queryTable',
      //   tableName: tableName,
      // })
      // console.log('server data:')
      // console.log('data:', {...datas})
      // console.log('schema:', {...schema})
      // const listData = []
      // for(let obj of schema.data){
      //   const objData = datas.data.map(o=>(o[obj.id]))
      //   objData.unshift(obj.name)
      //   listData.push(objData)
      // }
      // console.log('listData:', listData)
      //
      //openDataPreview(listData)
      const preview = new Preview(datas.data,'server', schema.data)
      preview.openDataPreview()
      //  try {
      //    const Main = await openNewPage("/preview", '\#Preview','preview', 'width=800,height=400');
      //    console.log(Main)
      //    showNotification()
      //    const render = [];
      //    render.push(<h1>previwe</h1>)
      //    const root = ReactDOM.createRoot(Main);
      //    root.render(render);
      //  } catch (err) {
      //    console.error("preview:", err);
      //    throw new Error(err);
      //  }
    } catch (err) {
      showNotification(err, "error");
    }
    //window.location.href = "/preview?tableName=" + tableName;
    //nothing
  }

  traverseAttributes(element, appData) {
    if (element.className.includes("Element") ) {
      const childprops = {};
      //
      Data.schemas.map((prop) => {
        switch (prop) {
          case "name":
            childprops[prop] = element.firstChild.textContent;
            break;
          // value 不是attr属性里面的
          case "value":
            if(element.lastChild.tagName === "DIV"){
              if(element.lastChild.textContent || ! element.lastChild.firstChild ){
                childprops[prop] = element.lastChild.textContent;
              }else{
                childprops[prop] = element.lastChild.firstChild.checked;
              }
            }else{
              if(element.lastChild.type === "checkbox"){
                childprops[prop] = element.lastChild.checked;
              }else{
                childprops[prop] = element.lastChild.value;
              }
            };
            break;
          default:
            //if(element.lastChild.getAttributeNames().includes(prop))
            childprops[prop] = element.lastChild.getAttribute(prop);
        }
      });
      //console.log(element.lastChild)
      //Data.schemas.map(prop =>{
      //switch(prop){
      //case 'name': childprops[prop] = element.firstChild.textContent;
      //break;
      //// value 不是attr属性里面的
      //case 'value': childprops[prop] = element.lastChild.value;
      //break;
      //default:
      //if(element.lastChild.getAttributeNames().includes(prop))
      //childprops[prop] = element.lastChild.getAttribute(prop);
      //}})
      appData.push(childprops);
      //id: id,
      //name: element.firstChild.textContent,
      //value: element.lastChild.value,
      //placeholder: element.lastChild.placeholder,
      //defaultValue: element.lastChild.defaultValue,
      //other: element.lastChild.other,
      //required: element.lastChild.required,
      //opts: element.lastChild.opts,
      //console.log("root:", element)
      // console.table(this.appData[id]);
    }
    // 递归遍历子孙元素的属性
    Array.from(element.children).forEach((child) => {
      this.traverseAttributes(child, appData);
    });
  }
}

export default DataHandle