import { getElementError } from '@testing-library/react';
import React, { Component } from 'react';
export const Data = {};

class SaveData extends Component {
  constructor() {
    super();
    // Data.saveData = this;
    // create a save button, on the center, top
  }

  saveButton(name) {
    return (
      <button id="saveButton" onClick={this.buttonClick.bind(this)}>
        {name}
      </button>
    );
  }

  buttonClick() {
    console.table(Data);
    this.updateData.bind(this)();
  }

  updateData() {
    if (Object.keys(Data).length === 0) console.error("没有数据");
    // for(let id in Data){
    //     console.log(id)
    //     const target = document.getElementById(id);
    //     // 遍历 target 的attrs
    //     for (let name of target.getAttributeNames()) {
    //       let value = target.getAttribute(name);
    //       console.log(name, value);
    //       Data[id][name] = value;
    //     }
    // };
    // 输出当前元素的属性
    const element = document.getElementById("App");
    this.traverseAttributes.bind(this)(element);

    console.table(Data)
  }

  traverseAttributes(element) {
    //console.log(`id: ${element.id},Element: ${element.tagName}`);
    let attrs = {}
    Array.from(element.attributes).forEach((attr) => {
      //console.table(Data)
     // console.log(`  ${attr.name}: ${attr.value}`);
      if(element.id != undefined ){
       // console.log('change:')
        //console.log(Data[element.id])
        Data[element.id] = {
            ...Data[element.id],
            value:element.value,
            textContent:element.textContent,
            [attr.name]:attr.value
        }
      //  attrs = Data[element.id];
       // attrs[attr.name] = attr.value;
      }
    });

    // 递归遍历子孙元素的属性
    Array.from(element.children).forEach((child) => {
      this.traverseAttributes(child);
    });
  }

  render() {
    return (
      <div>
        {this.saveButton()}
        {/* Other components or content can be added here */}
      </div>
    );
  }
}

export default SaveData;
