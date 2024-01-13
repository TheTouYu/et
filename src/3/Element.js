import './Element copy.css'
import React, { useState } from 'react';
import './ScrollingCheckbox.css'; // 导入样式

export const ELEMENT_NUM = 7 // 组件的数量
const typesCn = {
  text: "文本",
  number: "数字",
  textInput: "文本输入",
  numberInput: "数字输入",
  radio: "单选框",
  checkbox: "多选框",
  select: "下拉列表",
  switch: "滑动开关",
  image: "图片",
  video: "视频",
  button: "压力开关",
  divider: "分割线",
  slider: "滑块",
  rate: "评分",
};

const defaultContent = {
  text: "这是文本.",
  number: 0,
  textInput: "输入文本.",
  numberInput: "输入数字.",
  checkbox: "多选",
  radio: "单选",
  select: "下拉列表",
  switch: ["关","开"],  // read only , first value is 关, don't change !
  image: "上传图片:",
  video: "上传视频:",
  button: "按钮",
  divider: "请输入分割线文字:",
  slider: "请选择滑块:",
  rate: "请选择评分:",
};

export const mainData = {
  props: {
    optionNum: 4,
    optionDefaultValueIndex: 0,
    textNode: undefined,
    dropdownContentStyle: 'dropdownContent'
  }
 // name: undefined,
 // type: undefined,
 // value: undefined,
 // defaultValue: undefined,
 // className: undefined,
 // createAt: 1582755400000,
 // schemaId: "1234567890",
 // style: {
 //   backgroundColor: "#000000",
 //   color: "#ffffff",
 //   fontSize: "20px",
 //   fontWeight: "bold",
 //   border: "1px solid #000000",
 //   borderRadius: "10px",
 //   padding: "10px",
 //   margin: "10px",
 //   func: "null",
 // },
};

const dataGenerator = (types,num) =>{
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

export const dataCountUpdate = () => {
  const d = mainData;
  d.i_odd = d.i_odd === undefined ? 1 : d.i_odd + 1; //react会运行两次，所以odd两次计数， 在增加一
  d.i = d.i === undefined ? 1 : d.i + (d.i_odd % 2); // d.i 代表当前渲染了多少个用户设计的组件
  //console.log('dataCount:', d.i_odd, d.i);
  return d.i
}

const dataUpdate = (e, d) => { //input: Element, mainData
  // output: updated mainData
    dataCountUpdate()  
    if (e.type === undefined) {
      mainData.Error = "^.^温馨提示：请至少输入类型！";
      return <Error />;
    }
    // update Element props
    for(let key of Object.keys(e)){
        d[key] = e[key]
    }
    // update default value by type and placeholder
    let defaultValue_ = [null];
    let placeholder_ = null;
    switch (d.type) {
      case "select":
      case "checkbox":
      case "radio":
        defaultValue_ = Array.from(
          { length: d.props.optionNum },
          (_, i) => defaultContent[d.type] + (i + 1)
        );
        break;

      case "numberInput":
      case "textInput":
        placeholder_ = defaultContent[d.type];
        break;

      case "text":
      case "number":
        defaultValue_ = defaultContent[d.type];
      case "button":
      case "switch":
    }
    d.defaultValue = e.defaultValue ? e.defaultValue : defaultValue_;
    d.placeholder = e.placeholder ? e.placeholder : placeholder_;

    // to chinese
    d.name = e.name ? e.name : typesCn[d.type]

 //        //just for test use.!!!
 //   d.defaultValue = e.defaultValue ? e.defaultValue : defaultValue_;
 //   d.placeholder = e.placeholder ? e.placeholder : placeholder_;

 // console.log('type:' ,d.type  ,'render:')
 // console.log(d.placeholder, e.placeholder)
 // console.log(d)  //这里控制台输出有问题，直接输出d，部分值没有更新！ 即d.placeholder != d直接输出的
 //   d.Error = []
 //   d.Error.push('d:' + d.placeholder)
 //   d.Error.push('e:' + e.placeholder)
 //   return <Error />  
    return d;
}

const RenderBox = (arg) => {
  const d = mainData;
  //console.log('i:', arg.id, d.type+d.i)
  let padding = d.props.padding ? d.props.padding : '1vw';
  let type = 'text'
  switch (d.type) {
    case "numberInput": type='number'
    case "textInput":
      return (<input id={arg.id}className={arg.className} placeholder={d.placeholder} type={type} />);
    case "number": padding = d.props.numberPadding ? d.props.numberPadding : '3vw';
    case "text": 
      return (<div className={arg.className} style={{paddingInline:padding}}>{d.value ? d.value : d.defaultValue}</div>);
    case "select":
    case "radio":
    case "checkbox":
      const renders = [];
      const selectedIndex = d.props.optionDefaultValueIndex
      d.defaultValue.map((opt, i) => {
        renders.push(
          <option className={d.props.dropdownContentStyle} key={"select" + i}>
            {opt}
          </option>
        );
      });
      return (
        <select
          id={arg.id} className={arg.className}
        >
          {renders}
        </select>
      );
    case "switch":
        return (
          <div id={arg.id}>
            <input type="checkbox" defaultValue={d.defaultValue} />
          </div>
        );
    case "button":
        return <input id={arg.id} type="checkbox"/> ;
    default:
        d.Error = d.type + ":is a Error type, 还请联系小海开发此组件QAQ。"
      return <Error />
  }
};

const Error = () => {return (<div style={{color:'red'}}>{mainData.Error}</div>)}

export default function Element(e) {
  const d = dataUpdate(e, mainData) // default data schema
  return (
    <div className="Element" >
      <label htmlFor={d.type+d.i} >{mainData.name}</label>
      <RenderBox id={d.type+d.i} />
    </div>
  );
};
