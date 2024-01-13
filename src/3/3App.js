import React from 'react'
import './App.css';
import Element from './Element.js';

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
  if(parentElement.id === dragElement.parentNode.id ){
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



function Left(){
  return (
    <div className="Side">
      <Element type="switch" />
      <Element type="text" />
      <Element type="textInput" />
      <Element type="number" />
      <Element type="numberInput" name="月份"  />
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
  return (
    <div
      className="Main" id='MainBox_Id'
      onDragOver={dragOver}
      onDrop={(e) =>
        drop(e, dragInsertBefore, 'MainBox_Id', {
          data: { type: "text", value: "hello world", id: "1234567890" },
        })
      }
    >
      <Element type="switch" />
      <Element type="text" />
      <Element type="textInput" />
    </div>
  );
}

      //<input className="Box MainBox" placeholder='input'></input>
function Menu() {
  return (
    <div
      draggable="true"
      id="Menu_id"
      onDragEnd={dragEndSetPos} //dragEnd  最后触发 */
      onDragStart={drag}
      className="MenuEntrance"
    >
      <div>Q</div>
    </div>
  );
}

function App() {
  return (
    <div
      className="App"
      id="App"
    >
      <Left />
      <MainBox />
      <Menu />
    </div>
  );
}

      //<div style={{width:20, height:20}} onDrop={drop}>div</div>
export default App;
