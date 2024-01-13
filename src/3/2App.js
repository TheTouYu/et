import React from 'react'
import './App.css';
import Element from './Element';

const drag = e => {console.log(e);e.dataTransfer.setData("Text",e.target.id);}
const dragEndSetPos = e => {  //适合fixed布局， MenuEntrance
  const target= document.getElementById(e.target.id)
   if (target) {
    console.log('drag end...')
    target.style.left = e.clientX+'px'
    target.style.top = e.clientY+'px'
    console.log('set className...')
    target.className = 'MenuEntrance Box';  //react 的bug， 先不要使用ondragleave and ondragover
      // Your code here
    console.log(e.clientX, target)
  } else {
    console.error('Target element is null.');
  }
}
const dragOver = e => e.preventDefault()

const dragToRightSide = (dragElement, targetElement, ...arg) => {
  console.log('drag to right side... changing to side box style')
  targetElement.appendChild(dragElement)
  dragElement.className=targetElement.firstChild.className //style
  console.log(arg)
}

const dragInsertBefore = (dragElement, targetElement, ...arg) => {
  console.log('drag, to insert before this box... changing to side box style')
  console.log(arg)
  // 插入之前，检查是否在同一个区域
  const parentElement = targetElement.parentNode
  if(parentElement.id === dragElement.parentNode.id || dragElement.id === 'Menu_id'){
    parentElement.insertBefore(dragElement, targetElement)
    dragElement.className=targetElement.className //style
    dragElement.style.position = 'static'
  }
}

const drop = (e, handleFunc, targetId, ...arg) => {
  e.preventDefault();
  console.log("droping...");
  const id = e.dataTransfer.getData("Text");
  const dragElement = document.getElementById(id);
  const targetElement = document.getElementById(targetId);
  console.log("drag Element: ");
  console.log(dragElement);
  console.log("target Element: ");
  console.log(e.target); // 嵌套的div，获取的target变成了child div,  所以改成参数传递
  console.log(targetElement);
  console.log("run handleFunc... arg:");
  console.log(arg, handleFunc);
  handleFunc(dragElement, targetElement, ...arg);
};

const DataGenerator = (types,num) =>{
  let data={}
  for(let t of types){
  //for(let t in types){  注意，！！！
    data[t]=[t+1]
    for(let i=2;i<=num;i++)
      data[t].push(t+i)
  }
  return data
}
//DataGenerator(['input', 'text', 'button', 'ref', 'checkbox'], 10)
const mainData = [
  {
    data: {
      type: "text",
      name: "名字",
      value: ["I am a text"],
      defaultValue: "I am a text",
      placeholder: "please input text...",
      createAt: 1582755400000,
    },
    props: {
      schemaId:"1234567890",
      dataStyle: "dataBox",
      Style: "Box",
      additonalStyle: {
        backgroundColor: "#000000",
        color: "#ffffff",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid #000000",
        borderRadius: "10px",
        padding: "10px",
        margin: "10px",
      },
    func: "null",
    },
  },
];


function Left(){
  const leftListData = ['input', 'text', 'button', 'ref', 'checkbox'];
  const leftList = [];
  let i=0;
  for(let data in leftListData){
    leftList.push(<div key={i} className="Box">{data}</div>); i++
  }
  return (
    <div className="Side">
      {leftList}
    </div>
  );
}

function Right(){
  const rightListData = ['default', 'number', 'needed' , 'img', 'color'];
  const rightList = [];
  let i=0;
  for (let data in rightListData) {
    const key='Side_box'+i
    rightList.push(
      <div
        key={key}
        id={key}
        className="Box"
        onDragOver={dragOver}
        onDrop={(e) =>
          drop(e, dragInsertBefore, key, {
            data: { type: "text", value: "hello world", id: "1234567890" },
          })
        }
      >
        {data}
      </div>
    );
    i++;
  }
  return (
    <div id="rightSideId" className="Side">
      {rightList}
    </div>
  );
}

function MainBox() {
  const mainList = []; //render list
  const dataShema = mainData[0].data; //mainData: global data,  json file
  const name = dataShema.name;
  const value = dataShema.value[0];
  //const type = dataShema.type;
  //const types = ['button','checkbox','color','date','email','file','image','mouth','number','password',
  //'radio','range','search','select','submit','text','textarea','time','url','week'];
  const tag = "Element";
  const type = 'text';
  const num = 3;
  const data = DataGenerator([name, value], num);
  // {name: [name1,name2],  value: [value1, value2]}

  // console.log(data.name)
  // console.log(data[name])   有中文时第一种失效
  data[name].map((n, i) => {
    const key = "Main_box" + i;
    mainList.push(
      <div
        key={key}
        id={key}
        draggable="true"
        onDragStart={drag}
        onDragOver={dragOver}
        onDrop={(e) => drop(e, dragInsertBefore, key)}
      >
        <div className="BoxText">{n}</div>
        {tag === "div" && (
          <div className="Box" style={{ width: "auto" }}>
            {data[value][i]}
          </div>
        )}
        {tag === "Element" && (
          <Element className="Box" type={type} placeholder={data[value][i]} style={{}} />
        )}
      </div>
    );
  });

  return <div className="Main">{mainList}</div>;
}

      //<input className="Box MainBox" placeholder='input'></input>
function Menu() {
  return (
    <div
      draggable="true"
      id="Menu_id"
      onDragEnd={dragEndSetPos} //dragEnd  最后触发
      onDragStart={drag}
      className="MenuEntrance Box"
    >
      <div>menu</div>
    </div>
  );
}

function App() {
  return (
    <div
      className="App"
      id="App"
    >
      <Menu />
      <Left />
      <MainBox />
      <Right />
    </div>
  );
}

      //<div style={{width:20, height:20}} onDrop={drop}>div</div>
export default App;
