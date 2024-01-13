//import { render, ELEMENT_NUM, dataCountUpdate } from "./Element.js";
import { runningData } from "./Data2.js";
import DATA from "./Data.json";
import { Preview, Formula, showNotification } from "./base.js";
import DataTransfer from "./DataTransfer.js";
const DT = new DataTransfer();

// new KeyboardEventHander('\#Main')
export default class KeyboardEventHandler {
  constructor(selector) {
    this.globalKeydown = [];
    this.currentKeydown = null;
    this.currentKeyIsPress = false;

    this.tableName = document.getElementById('tableNameInput').value
    // showNotification(tableName, 'error')
    this.myFormula = new Formula(this.tableName);
    // 绑定事件处理函数
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
    document.addEventListener("keydown", this.handleKeyDown.bind(this));

    this.bindBaseElement();
    // 代理事件的好处，可以在组件时动态生成时候 动态绑定
    const app = document.querySelector(selector);
    // //console.log('class:')
    // console.log(app)
    if (app) {
      let id = null;
      let result = true;
      let deviceEvent = 'mousemove'
      if(window.innerWidth <= 1080){
        //  手机端
        deviceEvent = 'touchstart'
        alert('为了你的体验，请使用浏览器打开, 或者外接鼠标键盘')
      }
      app.addEventListener(deviceEvent, (e) => {
        result = true;
        if ( e.target.className.includes("Element") ) {
          id = e.target.id;
          // console.log(id)
          // console.table(runningData)
          if (id in runningData && runningData[id] !== undefined && "isEmpty" in runningData[id]) {
            // has added before
            // 'isEmpty' in runningData.id
            //被上面这句坑惨了。 因为上面已经检查过了，！！！
            result = false;
            //console.log('bind is already ok')
          }
          if (result) {
            console.log('add onmouse event')
            runningData[id] = { isEmpty: false };
            // ... the same, follow two way
            // e.target.addEventListener("mouseenter", (e) => this.getCurrentKeydown(e));
            // e.target.addEventListener("mouseenter", this.getCurrentKeydown.bind(this,e));
            e.target.addEventListener("mouseenter", (e) =>
              this.onMouseEnterRedyAddToMain(e)
            );
            // 添加其他事件代理  1.
            e.target.addEventListener("click", (e) => 
              this.onClickSetProperty(e)
            );
            // e.target.addEventListener("touchend", (e) => 
            //   this.onClickSetProperty(e)
            // );
            // 2. 为外键组件单独设置事件代理
            e.target.addEventListener("click", (e) =>
              this.onClickOpenIdSelect(e)
            );
            // e.target.addEventListener("touchend", (e) => 
            //   this.onClickOpenIdSelect(e)
            // );
          }
        } 
      });
    } else {
      console.log("监听代理失败，给定的id未启动该，waiting for app launch...");
    }
  }

  bindBaseElement(){
    //为了使用方便，开始的时候为base组件添加事件绑定，即左边区域的组件
    if( !('number' in runningData) ) {
      Array.from(document.getElementById('LeftSide').children).forEach((E,i) =>{
        E.addEventListener("mouseenter", e=> this.onMouseEnterRedyAddToMain(e))
        runningData[E.id] = { isEmpty: false };
        runningData['number'] = ++i ;
      })
      runningData['baseNumber'] = runningData.number;
    }
  }

  handleKeyUp(event) {
    this.currentKeyIsPress = false;
  }

  handleKeyDown(event) {
    this.currentKeyIsPress = true;
    if (this.globalKeydown.length > 5) {
      this.globalKeydown.shift();
    }
    this.globalKeydown.push(event.key);
    this.currentKeydown = event.key;

  }

  getCurrentKeydown(arg) {
    // console.log('this:',this)
    // console.log('arg:',arg)
    return this.currentKeydown;
  }

  async onClickOpenIdSelect(e) {
    if( !e.target.id.includes('idSelect') )return;
    // if( ! e.target.getAttribute('tablename') )return
    // alert("请选择一条数据")
    console.log("open id select:",e.target);
    let data
    let schema
    let names
    try {
      names = await DT.getData({
        type: 'tableNames'
      });
      names = names.data.map(obj=>(obj.name))
      // console.log("names:",{...res});
      const tableName = e.target.getAttribute('tableName');
      if(!tableName){
        throw('先设置外键关联的表哈');
      }else if(!names.includes(tableName)){
        throw('请求的表不存在，再检查一下吧')
      }
      // console.log('Attr:', e.target.getAttribute('tableName'))
      data = await DT.getData({
        type: 'queryTable',
        tableName: tableName+'_data'
      });
      schema = await DT.getData({
        type: 'queryTable',
        tableName: tableName
      });
      // console.log("tableDatas:",{...res});
      //
      // console.log("tableDatas_change:",changeServerData(res.data));
      //openDataPreview(res.data, 'server');
      const preview = new Preview(data.data, 'server', schema.data, 'div')
      const selectedData = await preview.openDataPreview('selectedData')
      // return row data, ',' v1,v2,v3. type:string
      // let dataString = ''
      // selectedData.map(data=>dataString+=data+', ')
      // e.target.textContent = selectedData.join(', ')
      const showIndex = e.target.getAttribute('show')
      const regex = /^\d+(,\d+)*$/;
      const errorMessage = '设置错啦'
      const re = regex.test(showIndex)
      const text = showIndex
        .split(",")
        .map((index) => selectedData[index])
        .join(", ");
      e.target.textContent = re ? text : errorMessage;
      //  属性不能设置为数组
      e.target.setAttribute('values', selectedData.join(','))
      // apply 
      // myformula.apply
      const myFormula = this.myFormula
      const formula = await myFormula.getFormula(this.tableName, true);
      await myFormula.applyFormula(formula, true);
    }catch(e){
      showNotification(e, 'error');
      console.error(e);
    }
  }

  onClickSetProperty(e) {
    if(e.target.tagName !== "LABEL")return;
    const element = e.target.parentElement;
    console.log("click set property:",e.target.parentElement);
    const childprops = {}
    DATA.schemas.map((prop) => {
        switch (prop) {
          case "name":
            childprops[prop] = element.firstChild.textContent;
            break;
          // value 不是attr属性里面的
          case "value":
            if(element.lastChild.tagName === "DIV"){
              if(! element.lastChild.textContent && element.lastChild.firstChild ){  // label  div > input
                childprops[prop] = element.lastChild.firstChild.checked 
              }else{ // div text
                childprops[prop] = element.lastChild.textContent;
              }
            }
            else if(element.lastChild.type === "checkbox"){ // label input ,checkbox
                childprops[prop] = element.lastChild.checked;
              }
            else{  // label input ,text/number
              childprops[prop] = element.lastChild.value;
            };
            break;
          default:
            // childprops[prop] = element.lastChild[prop];
            if(element.lastChild.getAttributeNames().includes(prop.toLocaleLowerCase()))
            childprops[prop] = element.lastChild.getAttribute(prop);
            // childprops['tableName'] = element.lastChild.getAttribute('tableName');
            // console.error(childprops)
        }
      });
    // console.log("props:", { ...childprops });
    //
    // preview.openDataPreview(childprops, "object", "edit").then(data => {
    const preview = new Preview(childprops, 'object', 'null', 'edit')
    preview.openDataPreview().then(data => {
      showNotification('好耶，又可以愉快的编程啦q(≧▽≦q)')
      console.log("修改后的data:", data);

      const objData = {};
      data.map(row=>{
        objData[row[0]] = row[1];
      })
      console.log(objData);

      DATA.schemas.map((prop) => {
          switch (prop) {
            case "id": 
              // showNotification('id不能乱改哦，小心被关禁闭室哦')
              break;
            case "name":
              element.firstChild.textContent = objData.name
              break;
            // value 不是attr属性里面的
            case "value":
              if(element.lastChild.tagName === "DIV"){
                if(! element.lastChild.textContent && element.lastChild.firstChild ){  // label  div > input
                  // console.error('ok')
                  // console.log(objData.value)
                  // console.log(element.lastChild)
                  element.lastChild.firstChild.checked = objData.value
                  element.lastChild.firstChild.checked = objData.value === 'true' ? true : false
                  // ..........
                }else{
                  element.lastChild.textContent = objData.value;
                }
              }else if(element.lastChild.type === "checkbox"){
                element.lastChild.checked = objData.value;
              }else{
                element.lastChild.value = objData.value;
              };
              break;
            default:
              //if(element.lastChild.getAttributeNames().includes(prop))
              element.lastChild.setAttribute(prop, objData[prop]);
          }
        });

    }).catch(e =>{
      showNotification(e, 'error');
    })
  }

  copyNode(e, selector) {
    //copy a node to main
    console.log("copy new:");
    // 复制, 需要修改id的值, 确保每个组件的id唯一
    const target = e.target.cloneNode(true);
    if(this.getElementId(target)){
        const type = this.getElementId(target).type;
    // 第一个孩子是label for=id
    // 第二个孩子是... id=number+type

      // update id, by count ++

      // changing
      let number = ++runningData.number;
      const Main = document.querySelector('#Main');
      //下面如果是复制过来的页面，会有比较大的id数字过来，导致出错,  直接选择最后一个（最大的id）加1
      //number = 1 + Main.childElementCount + runningData.baseNumber;
      number = 1 + JSON.parse(this.getElementId(Main.lastChild).number);

      const newid =  type + number;
      target.id = newid+'Div'
      target.children[0].setAttribute("for", newid);

       //可能有多层，id在比较深的地方, switch
      switch(type){
        // case "switch": target.children[1].firstChild.id = newid;
            // break;
        default:
            target.children[1].id = newid;
      }

      //console.log("redy to add copy one to main");
      console.log(target);
      document.querySelector(selector).appendChild(target);
    } 
  }

  getElementId(target) { //input: Element, return id object
    const id = target.firstElementChild.getAttribute("for");
    // 使用正则表达式匹配数字和字符
    var match = id.match(/([a-zA-Z]+)(\d+)/);
    //console.log('match:');
    //console.log(match);
    if (match) {
      // input:    button4
      // match[1] 匹配字母部分，match[2] 匹配数字部分
      var type = match[1];
      var number = match[2];
    return {'id': id, 'type': type, 'number': number};
    }
    else {
      console.error("copy new node to main, but no find id, No match found.");
      return false;
    }
  }

  onMouseEnterRedyAddToMain(e) {
    //console.log("Mouse Enter:");

    if (this.currentKeyIsPress)
      switch (this.currentKeydown) {
        case "v": //copy
          this.copyNode(e, '#Main');
          break;
        case "V": //copy to LeftSide
          this.copyNode(e, '#LeftSide');
          break;
        case "X":
          console.log('delete')
            if( this.getElementId(e.target).number > runningData.baseNumber )
                setTimeout(()=> e.target.remove(), 1000);
                // e.target.remove();
            //          console.log("delete");
            //删除逻辑， 根据id进行标识， 最开始渲染的几个id最小，不能删除
          break;
          default:
      }
    //console.log("cur:" + this.currentKeydown);
  }
}
