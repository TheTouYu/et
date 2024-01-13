import React, { useEffect, useState, useRef } from "react";
import ReactDOM from 'react-dom/client';
import DataHandle from "./Data2.js";
import "./Element.css";
import "./base.css";
import KeyboardEventHandler from "./UiControl.js";
import { BrowserRouter, Routes, Route  } from "react-router-dom";
import { openNewPage, showNotification, validateString } from "./base.js";
import DataTransfer from "./DataTransfer.js";
import {Formula,Box} from "./base.js"

const DT = new DataTransfer();
const DH = new DataHandle();
const TopSide = (arg) => {
  // console.log('TopSide: arg:', {...arg});
  const E = {
    name: "",
    placeholder: "表单名字?",
    type: "textInput",
    id: "tableNameInput",
    required: true,
    onChange: arg.onChange,
  };
//
  return (
    <div id="TopSide">
      <Element element={E} />
      {DH.formulaButton("公式")}
      {DH.saveButton("保存")}
      {DH.datasButton("数据")}
      {DH.previewButton("预览")}
      {DH.insertButton("新增", )}
    </div>
  );
};

const getTypeById = (id) => {
  const match = id.match(/([a-zA-z]+)(\d+)/);
  return match[1];
};

let isEventListenerAdded= false;
const changeNewPage = async (E,e,Param) => {
  // console.log("E?:");
  // console.log('E:',{...E});
  let target;
  let page;
  switch (E.type) {
    case "setTable":
      try{
        // const ObjectE = JSON.stringify(E);
        window.open(`/appSet?tableName=${E.name}`, E.name);
        //page = await openNewPage(`/appSet2?tableName=${E.name}`);
        break;
        // //
        // page = await openNewPage("/appSet");
        // //console.log(page);
        // target = page.querySelector("#tableNameInput");
        // //console.log(table);
        // target.defaultValue = E.name;
        // // set table name
        // // get Elements by tableName
        //
        // const tableData = await DT.getData({
        //   type: "queryTable",
        //   tableName: E.name,
        // })
        // console.log('queryTable:', {...tableData})
        // const render = [];
        // const Main = page.querySelector("#Main");
        // tableData.data.map((E, i) =>{
        //   render.push(<Element key={i} element={E} />)
        // });
        // console.log(page)
        // // console.log(Main)
        // //ReactDOM.render(render, Main);  old, react 18 not surport
        // const root = ReactDOM.createRoot(Main);
        // // const root = ReactDOM.createRoot(Main,
        // //    { unstable_refreshAll: true });
        // root.render(render) 
        // // .then(()=>{
        // //   console.log('render finnish')
        // // })
        // // console.log(page)
      }catch(err){
        console.error('setTable:', err)
      }
      break;
    case "deleteTable":
      try{
        await DT.setData({
          type: E.type,
          tableName: E.name,
        });
        window.location.reload();
      }catch(err){
        console.error('deleteTable:', err)
        showNotification(err, 'error')
      }
      break;
    case 'renameTable':
      //console.log('rename');
      //console.log(e)
      target = document.getElementById('globalInput');
      target.style.left = e.pageX - 150 +'px';
      target.style.top = e.pageY+'px';
      //console.log("run not set:", { ...Param });
      Param.tableName = E.name;
      Param.type = 'renameTable';
      Param.id = E.id;
      Param.E = E;
      //console.log("run before:", { ...Param });
      if (!isEventListenerAdded) {
        target.addEventListener("keydown", async (e) => {
          // console.log('new E in event')
          // console.log(E)
          isEventListenerAdded = true;
          if (e.key === "Enter") {
            if(! validateString(e.target.value) ){
              showNotification('名字不对的喀！(┬┬﹏┬┬)', 'error');
              return;
            }
            Param['newTableName'] = e.target.value;
            //console.log('input:');
            //console.log(target.value)
            try {
             // console.log("run", { ...Param });
              await DT.setData(Param);
              //const re = 'ok'
              //console.log('running!!!')
                //console.log('run ok')
                const textTartget = document.getElementById(Param.id);
                //console.log(textTartget)
                textTartget.textContent = target.value;
                //下次更新时，这个卡片的值要变了
                //否则，多点几次别的卡片，就不知道原来的卡片的值是多少了
                //还有，每次运行时要把新的E绑定到Param上，否则修改的是第一个运行的E
                Param.E.name = target.value;
                //下次更新时，不要用原来的旧名字了，只要你不点其他的卡片，
                //这个值就是对的。点了的话，其他的卡片E.name是对的
                //没有这行的话， 更新的时候还是去数据找旧的名字，会找不到的
                Param.tableName = target.value;
                target.value = "";
                window.location.reload();
                //console.log("run set:", { ...Param });
            } catch (err) {
              console.error('1234 changePage: 换个名字吧~');
              console.log(err);
            }
          }
        });
      }
      break;
    default:
      console.error("1234 changePage: wrong type input");
  }
};
// // 事件总线
// const eventBus = new EventEmitter();
//
// // 在一个页面中发布事件
// eventBus.emit('dataUpdated', 'New Value');
//
// // 在另一个页面中订阅事件
// eventBus.on('dataUpdated', (data) => {
//   console.log(data); // 在此时获取到最新的值
// });
//
//Param 是上一级的全局对象！！！！
const Element = ({ element, Param={} }) => {
  //input: element object,
  element["type"] = element["type"] ? element.type : getTypeById(element.id);
  // console.log('Element:')
  // console.log(CurElement)
  const render = [];
  const e = element;
  switch (e.type) {
    case "text":
    case "number":
    case "idSelect":
      render.push(
        <label key="0" htmlFor={e.id} >
          {e.name}
        </label>
      );
      render.push(
        <div key="1" id={e.id} show={e.show} tablename={e.tableName} >
          {e.value}
        </div>
      );
      break;
    case "textInput":
    case "numberInput":
      const type = e.type.replace("Input", "");
      render.push(
        <label key="0" htmlFor={e.id}>
          {e.name}
        </label>
      );

      render.push(
        <input
          required={e.required}
          type={type}
          key="1"
          id={e.id}
          placeholder={e.placeholder}
          defaultValue={e.value}
          onChange={e.onChange?e.onChange:null}
        />
      );
      break;
    case "switch":
    case "pressureSwitch":
      render.push(
        <label key="0" htmlFor={e.id}>
          {e.name}
        </label>
      );
      if (e.type === "pressureSwitch") {
      render.push(
        <input type="checkbox" defaultChecked={e.value} key="1" id={e.id} />
        // in react: isChecked -> ischecked
      );
      }else {
        render.push(
          <div id={e.id} key="2">
            <input type="checkbox" defaultChecked={e.value} key="1" />
          </div>
        );
      }
      break;
    case "select":
      render.push(
        <label key="0" htmlFor={e.id}>
          {e.name}
        </label>
      );
      const opts = e.opts.split(" ");
      const tmp = [];
      opts.map((opt, i) => {
        tmp.push(<option key={i}>{opt}</option>);
      });
      render.push(
        <select key="1" defaultValue={e.value} opts={e.opts} id={e.id}>
          {tmp}
        </select>
      );
      break;
    case "function":
      break;
    case "card":
      render.push(<div id={e.id} onClick={()=>{
        DH.preview(e.name)
      }} key="card">{e.name}</div>);
      const funcs = ["设计", "命名", "删除", "设置"];
      funcs.forEach((name, i) => {
        const E = {};
        let forid=undefined;
        E["name"] = e.name;
        switch (name) {
          case "设计":
            E["type"] = "setTable";
            break;
          case "删除":
            E["type"] = "deleteTable";
            break;
          case "设置":
            E["type"] = "tableSetting";
            break;
          case "命名":
            E["type"] = "renameTable";
            E['id'] = e.id;
            forid = "globalInput";
            break;
          default:
            E["type"] = "undefined";
        }
        //console.log(E)
        render.push(
          <label htmlFor={forid} key={i} type={E.type} onClick={(e) => changeNewPage(E,e,Param)}>
            {name}
          </label>
        );
      });
      break;
  }
  return (
    <div id={e.id + "Div"} className="Element">
      {render}
    </div>
  );
};

//绘制基本的组件，
const LeftSide = () => {
  const elements = DH.getBaseElements();
  const renders = [];
  // console.log("LeftSide:");
  // console.log("elements:");
  // console.table(elements);
  //console.log('E:',{...elements})
  elements.map((E) => {
    renders.push(<Element tabIndex='0' key={E.id} element={E} />);
  });
  //
  return <div id="LeftSide">{renders}</div>;
};

const Main = (arg) => {
  // console.log("Main: ", {...arg});
  const [elements, setElements] = useState('loading... 加载中...'); // 
  useEffect(()=>{
    const loadElements = async () => {
      try {
        setElements('loading... 加载中...');
        const tableData = await DT.getData({
          type: 'queryTable',
          tableName: arg.tableName,
        });
        console.log('tableData: ', { ...tableData })
        setElements(
          tableData.data.map((E,i) => (
            <Element key={i} element={E} /> // 渲染元素
          ))
        );
        // showNotification('render new elements: ')
        // setElements(tableData);
      }catch(e){
        showNotification(e,'error')
        console.error(e)
        setElements(`未能加载组件... error loading elements...
        是不是没经费了？？？`);
        throw new Error(e)
      }
  }
  //
  const loadFormulas = async (tableName = arg.tableName) => {
    try{
      const myFormula = new Formula(tableName);
      const formula = await myFormula.getFormula(tableName, false);
      await myFormula.applyFormula(formula, false);
      myFormula.onloadApplyFormula();
    }catch(e){
      showNotification(e,'error')
      console.log(e)
      throw new Error(e)
    }
  };
  //
  const run = async()=>{
    try{
      //1. load elements
      await loadElements()
      //2. load formulas
      await loadFormulas()
      //
      showNotification('好耶！加载完毕... load: ')
    }catch(e){
      showNotification('加载失败了，呜呜！！！不能去大冒险了！！')
    }
  }
  run(arg.tableName)
  //
  },[arg.tableName]);
  //
  return <div id="Main">{elements}</div>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Datas />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/appSet" element={<AppSet />} />
      </Routes>
    </BrowserRouter>
  );
}

function AppSet() {
  const queryParams = new URLSearchParams(window.location.search);
  const nameFromQuery = queryParams.get("tableName");
  const [tableName, setTableName] = useState(nameFromQuery);
  let names
  DT.getData({type: 'tableNames' }).then(res=>{
    names = res.data.map(obj => (obj.name))
  }).catch(e=>{
    showNotification('服务器连不上啦，包租婆是不是又没电费了！！！','error')
    showNotification(e, 'error')
    console.error(e)
  })
  const onChange = (e) => {
    if( e.target.value === '' ){
      setTableName(nameFromQuery);
    }
    else if( validateString(e.target.value) ){
          if( names.includes(e.target.value) ){
            setTableName(e.target.value);
          }
    }else  {
      showNotification('换个名字吧···','null');
    }
  }
  // 2. load keyboard event when main is ready
  let KEH 
  useEffect(() => {
    const tableNameInput = document.getElementById("tableNameInput");
    tableNameInput.value =
    tableNameInput.defaultValue = tableName;
    // console.log(tableName)
    //
    KEH = KEH || new KeyboardEventHandler("#Main");
    //
  }, [tableName]); // 空数组作为 useEffect 的依赖数组，表示仅在组件挂载时运行一次
  //
  return (
    <div id="App">
      <Box />
      <TopSide onChange={onChange} />
      <LeftSide />
      <Main tableName={tableName} />
    </div>
  );
}

function Datas() {
  const [appData, setAppData] = useState([]);
  useEffect(() => {
    fetchData({
      type: "tableNames"
    }, setAppData);
  }, []);

  const render = [];
  const Param = {};
  //console.log(appData);
  if (appData.data) {
    appData.data.forEach((obj, i) => {
      //db default table sqlite_sequence is forbiden
      if (obj.name != "sqlite_sequence" && !obj.name.includes("_data") ){
        obj["type"] = "card";
        obj["id"] = "card" + i;
        render.push(<Element key={i} element={obj} Param={Param}/>);
      }
    });
  }

  //render.push(<div className='Element' key={i}>{obj.name}</div>);
  return (
    <div>
      <Box />
      <input id="globalInput" />
      <div id="Datas">{render.length > 0 ? render : '正在拼命加载ing...'}</div>
    </div>
  );
}

const fetchData = async (param, func) => {
  try {
    // const params = {
    //   type: type,
    // }
    const data = await DT.getData({ ...param });
    func(data); // setdata
    //  console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

function Preview(tableName) {
  return <div id="Preview">数据列表</div>;
}
