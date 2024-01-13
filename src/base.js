import DataHandle from "./Data2";
import DataTransfer from "./DataTransfer";
import { useRef, useEffect, useState } from "react";

export class RunSync {
    constructor(async_funcs) {
        // func is main function
        this.cache = Object.keys(async_funcs).map((func) => ({
            func: func,
            status: 'pending',
            result: null,
        }));
        // 改写原来的异步函数，加入缓存机制， 调用两次
        this._old_async_funcs = {...async_funcs}
        // console.log('_old_async_funcs:', _old_async_funcs)
        // console.log('cache:', cache)
        let _func_promise = null
        this.cache.map(cache_obj=>{
            async_funcs[cache_obj.func] = () => {
                if(cache_obj.status === 'fullfilled'){
                    return cache_obj.result
                }else if(cache_obj.status === 'rejected'){
                    throw(cache_obj.result)
                }
                // 没有缓存，写入缓存
                _func_promise = this._old_async_funcs[cache_obj.func]().then((res) =>{
                    cache_obj.status = 'fullfilled'
                    cache_obj.result = res
                })
                .catch((err) =>{
                    cache_obj.status = 'rejected'
                    cache_obj.result = err
                });
                // 抛出promise对象，为了等待他的finnaly执行完毕后拿数据
                throw(_func_promise)
            }
        })
    }
    newFuncs(){
        return this.async_funcs
    }
    run(main){
        try{
            main()
        }catch(err){
            // console.log('err:', err)
            if(err instanceof Promise){
                err.finally(()=>{
                    // console.log('finally Promise ok: ', this.cache)
                    this.run(main)
                })
            }else{
                throw new Error(err)
            }
        }
    }
}

export function Box() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMove(e) {
      setPosition({ x: e.clientX, y: e.clientY + window.scrollY });
    }
    window.addEventListener("pointermove", handleMove);
    return () => {
      window.removeEventListener("pointermove", handleMove);
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: "pink",
        borderRadius: "50%",
        opacity: 0.6,
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: "none",
        left: -20,
        top: -20,
        width: 40,
        height: 40,
        zIndex: 1000,
      }}
    />
  );
}

// 以后会用到
export const openNewPage = (
  page,
  selector = "document",
  target = "_blank",
  features = ""
) => {
  return new Promise((resolve, reject) => {
    // 打开新页面
    const newWindow = window.open(page, target, features);

    // 等待新页面加载完成后执行操作
    newWindow.onload = () => {
      setTimeout(() => {
        // 添加延时以确保异步加载完成
        // 在新页面中查找具有 id="Preview" 的元素
        //console.log('openNewPage: 开始查找元素');
        //console.log('document:?');
        //console.log(newWindow.document);
        const Element =
          selector === "document"
            ? newWindow.document
            : newWindow.document.querySelector(selector);
        //console.log(Element);

        // 进行你的操作，例如修改元素的内容或样式
        if (Element) {
          // console.log('找到预览元素');
          // previewElement.innerHTML = '这是新页面中的预览元素';
          resolve(Element); // 将 previewElement 作为 Promise 的解决值返回
        } else {
          console.error("openNewPage: 没有找到预览元素");
          reject(new Error("没有找到预览元素")); // 返回一个错误
        }
      }, 1000); // 等待 1 秒
    };
  });
};

const preview = async () => {
  // 这种方法也挺复制的，还有保证前面标签的打开。不过可以先保留在这里，
  //console.log("preview func:");
  //console.log("preview data from server:");
  //const appData = await Data.getAppDataFromServers();
  //console.table(appData);
  //// 把内容放在Main函数中
  //openNewPage('/preview').then(container =>{
  //const render = [];
  //appData.schemaData.map(E => {
  //render.push(<Element container={E} />)
  //})
  ////render.push(
  ////  <Element container={{
  ////    name: "preview test",
  ////    placeholder: "表单名字?",
  ////    type: "textInput",
  ////    id: "tableNameInput",
  ////    required: true,
  ////  }} />
  ////)
  ////console.log('appending to new page:...')
  ////console.log(container)
  //const root = ReactDOM.createRoot(container);
  //root.render(render);
  //// 把内容放在Main函数中
  //}).catch((error) => {
  //console.error(error);
  //});
  //console.log('func preview done.')
};

export function validateString(formulas) {
  // 使用正则表达式进行校验
  const pattern = /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z0-9]*$/;
  const forbiddenWords = ["as", "for", "APP公式"];

  // 检查字符串是否符合规则
  if (!pattern.test(formulas)) {
    return false; // 字符串以数字或符号开头，或包含非法字符
  }

  // 检查是否包含禁止的单词
  if (forbiddenWords.includes(formulas.toLowerCase())) {
    return false; // 字符串包含禁止的单词
  }

  //console.log('true')
  return true; // 字符串符合规则
}

//// 测试字符串
//console.log(validateString('abc123'));   // true
//console.log(validateString('123abc'));   // false
//console.log(validateString('#special')); // false
//console.log(validateString('as'));       // false
//console.log(validateString('forbidden')); // true
//console.log(validateString('你好world'));  // true

// ～ ₍ᐢ..ᐢ₎♡ ˗ˋˏ♡ˎˊ˗ ૮(˶ᵔ ᵕ ᵔ˶)ა ૮꒰ ˶• ༝ •˶꒱ა ꒰ᐢ⸝⸝•༝•⸝⸝ᐢ꒱ ‿ ๑ᵒᯅᵒ๑ °꒰๑'ꀾ'๑꒱° ᕙ(` ´)ᕗ ᕙ(• ॒ ູ•)ᕘ (˚ ˃̣̣̥᷄⌓˂̣̣̥᷅ …

let notificationCount = 0;
let notificationList = []
export function showNotification(message = "", type = "success") {
  const notification = document.createElement("div");
  notification.className = "notification";

  let base;
  switch (type) {
    case "success":
      base = "♪₍ᐢ..ᐢ₎♡ ok ";
      break;
    case "error":
      base = "๑ᵒᯅᵒ๑ 出错啦!!! ";
      notification.style.color = "red";
      break;
    case "null":
      base = "";
      break;
  }
  notification.textContent = message + base;

  document.body.appendChild(notification);
  // 计算通知的垂直位置
  const topPosition = 20 + notificationCount * (notification.offsetHeight + 5);
  notification.style.top = `${topPosition}px`;

  notificationCount++;
  notificationList.push(notificationCount);

  // 使用 setTimeout 来延迟一段时间后隐藏通知
  setTimeout(() => {
    notification.classList.add("show");

    // 6 秒后隐藏通知
    setTimeout(() => {
      notification.classList.remove("show");

      // 移除通知元素
      setTimeout(() => {
        document.body.removeChild(notification);
        notificationList.shift();
        if(notificationList.length === 0)
        notificationCount = 0;
      }, 10);
    }, 6000);
  }, 1);
}
class menu {
  constructor(previewContainer) {
    this.previewContainer = previewContainer;
    this.menu = document.createElement("div");
    this.menu.className = "menu";
    this.previewContainer.appendChild(this.menu);
    // // add to menu
    this.items = [];
    this.funcsMap = {
      title: this.addTitle.bind(this),
      fullScreen: this.addFullScreen.bind(this),
      close: this.addClose.bind(this),
      right: this.addRight.bind(this),
      left: this.addLeft.bind(this),
      dragable: this.addDragable.bind(this),
    };
    // this.add(Object.keys(this.funcsMap));
    this.add();
  }

  run(itemName, arg = {}) {
    for (let item of this.items) {
      // console.log(item)
      if (item.name === itemName) {
        item.callback();
      }
    }
  }
  add(items = ["title", "close"], args = [{}, {}]) {
    if (items.length !== args.length) {
      console.error("Number of items and arguments must match");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const arg = args[i];
      // console.log('arg:',arg);
      if (Array.isArray(arg))
        this.funcsMap[item](...arg); //要求里面的函数有多个参数
      else if (typeof arg === "object" && arg !== null)
        this.funcsMap[item](...Object.values(arg)); //要求里面的函数有多个参数
      else this.funcsMap[item](arg);
      // 一个参数会把对象传进去，不会发生结构
    }
  } // add(['close', 'right'],[{}, {container: xxxx}])

  addBase(
    name,
    textContent,
    callback,
    event = "mousedown",
    keydown = false,
    containerKeybind = ""
  ) {
    const container = document.createElement("span");
    container.textContent = textContent;
    container.addEventListener(event, () => callback());
    this.menu.appendChild(container);
    this.items.push({
      name: name,
      textContent: textContent,
      callback: callback,
      container: container,
    });
    if (keydown) {
      containerKeybind.addEventListener("keydown", (event) => {
        // console.log('okkkkkkkkkkk');
        // 检查按下的键是否为F4键的键码
        if (event.shiftKey && event.key === keydown) {
          // 阻止浏览器默认行为 ,然后就输入不了了，哈哈哈
          event.preventDefault();
          callback();
        }
      });
    }
  }

  // addRight({container}) {
  addRight(container) {
    // console.log("arg in addright:", container);
    // console.error('container:', container)
    this.addBase(
      "right",
      ">",
      () => {
        container.scrollTo({
          top: 0,
          left: container.scrollLeft + 800,
          behavior: "smooth",
        });
      },
      "mousedown"
    );
  }
  addLeft(container) {
    // console.log("arg in addright:", container);
    // console.error('container:', container)
    this.addBase(
      "left",
      "<",
      () => {
        container.scrollTo({
          top: 0,
          left: container.scrollLeft - 800,
          behavior: "smooth",
        });
      },
      "mousedown"
    );
  }
  // const title = data['title'] ? data.title : '꒰ ˶• ༝ •˶ ꒱ '
  // previewContainer.innerHTML = `<h3>${title}</h3>`;
  addTitle(title = " ꒰ ˶• ༝ •˶ ꒱  ") {
    this.addBase("title", title, () => {});
  }
  addClose() {
    this.addBase(
      "close",
      "X",
      () => {
        this.previewContainer.style.opacity = 0;
        setTimeout(() => {
          // console.error("remove:", this.previewContainer);
          document.body.removeChild(this.previewContainer);
        }, 500);
      },
      "mousedown"
    );
  }
  addFullScreen() {
    this.isFull = false;
    this.addBase(
      "FullScreen",
      "▢",
      () => {
        const name = this.isFull
          ? this.previewContainer.className.replace(
              /\bfullSize\b/,
              "normalSize"
            )
          : this.previewContainer.className.replace(
              /\bnormalSize\b/,
              "fullSize"
            );

        this.previewContainer.className = name;
        this.isFull = !this.isFull;
      },
      "mousedown"
    );
  }
  addDragable(container, force = true, dragable = false) {
    this.isDragable = dragable;
    this.addBase(
      "dragable",
      "⨀",
      () => {
        this.isDragable = !this.isDragable;
        this.isDragable
          ? showNotification(" 🔓 现可以拖动啦 ", "null")
          : showNotification(" 🔒 ", "null");
      },
      "mousedown"
    );

    // console.log('C is:',container)
    if (
      force ||
      container.style.position === "fixed" ||
      container.style.position === "absolute"
    ) {
      let offsetX, offsetY;
      let isDragging = false;
      container.addEventListener("mousedown", (event) => {
        if (this.isDragable) {
          isDragging = true;
          offsetX = event.clientX - container.offsetLeft;
          offsetY = event.clientY - container.offsetTop;
        }
      });
      document.addEventListener("mousemove", (event) => {
        if (isDragging) {
          container.style.left = event.clientX - offsetX + "px";
          container.style.top = event.clientY - offsetY + "px";
        }
      });
      document.addEventListener("mouseup", () => {
        isDragging = false;
      });
    } else {
      console.error("请给定绝对定位或固定定位的元素，添加拖动。");
    }
  }
}
// // 使用例子
// const previewWindow = document.getElementById('previewContainer');
// dragElement(previewWindow);
// const dataFromServer = [
//   {'text1': 2, 'text2': 4},
//   {'text1': 4, 'text2': 6},
// ]
// const mydata = [
//   ['key',1,1,1,1,1],
//   ['key',2,2,2,2,2],
//   ['key',3,3,3,3,3],
//   ['key',4,4,4,4,4]
// ]
// const objData = {
//   key1: [1,1,1],
//   key2: [2,2,2],
//   key3: [3,3,3],
// }
export function changeServerData(data, schema) {
  if(schema===null){
    console.error('请输入数据的schema')
  }
  const array = [];
  data.map((obj, index) => {
    if (index === 0) {
      Object.keys(obj).map((key) => {
        array.push([key]);
      });
      // 这里的key是id，需要请求服务器把id变成名字
      array.map((a, i) => {
        schema.map((obj2) => {
          if (obj2.id === a[0]) {
            array[i][0] = obj2.name;
          }
        });
      });
    }
    Object.keys(obj).map((key, i) => {
      array[i].push(obj[key]);
    });
  });
  //
  return array;
}
//
function changeToArray(data) {
  const array = [];
  for (let key in data) {
    if (Array.isArray(data.key)) {
      array.push(data.key.unshift(key));
    } else {
      array.push([key, data[key]]);
    }
  }
  // console.log('change to array:', array)
  return array;
}
//

export class Preview {
  constructor(data, dataType = "array", schema = null, type = "div") {
    // changeData
    if (dataType === "object") {
      data = changeToArray(data);
    } else if (dataType === "server") {
      data = changeServerData(data, schema);
    }
    this.data = data;
    this.type = type;
    this.renderLimit = 14;
    this.page = 1;
    // console.log('data:', data)
    if(Array.isArray(data) && data.length === 0){
      showNotification('还没有数据呢。快去添加吧 ')
      this.lastPage = 0;
    }else{
      this.lastPage = Math.ceil(data[0].length / this.renderLimit);
    }
    // openDataPreview(data, dataType, type);
  }

  //create window, render partly data( 14行数据)
  openDataPreview(returnType='null') {
    const data = this.data
    const type = this.type
    return new Promise((resolve, reject) => {
      // Create the preview container
      const previewContainer = document.createElement("div");
      previewContainer.id = "previewContainer";
      previewContainer.className = "draggableElement normalSize";
      //
      const tableContainer = document.createElement("div");
      tableContainer.id = "tableContainer";
      
      // add menu buttons needed
      const myMenu = new menu(previewContainer);
      myMenu.addLeft(tableContainer);
      myMenu.add(
        ["dragable", "fullScreen"],
        [
          {
            container: previewContainer,
            force: true,
            dragable: true,
          },
          {},
        ]
      );
      myMenu.addRight(tableContainer);
      myMenu.addBase("nextPage", "+", () => {
        this.nextPage(tableContainer, "+");
      });
      myMenu.addBase("prePage", "-", () => {
        this.nextPage(tableContainer, "-");
      });
      // add others based on type
      if (type === "edit") {
        myMenu.addBase("Save", "✓", () => {
          //return preview data object
          const dataArray = [];
          try {
            Array.from(tableContainer.children).forEach((child) => {
              const datas = [];
              Array.from(child.children).forEach((dataDiv, i) => {
                let data = dataDiv.textContent;
                if (i > 0) {
                  data = dataDiv.value;
                }
                datas.push(data);
              });
              dataArray.push(datas);
            });
            console.log("exit,ok. new datas:", dataArray);
            resolve(dataArray);
          } catch (err) {
            console.error("exit,error:", err);
            reject("保存失败啦(┬┬﹏┬┬)");
          } finally {
            myMenu.run("close");
          }
        });
      }
      // create and render some data, then use update() render more data
      data.forEach((col) => {
        const colDiv = document.createElement("div");
        colDiv.className = "colDiv";
        tableContainer.appendChild(colDiv);
        //add datas to this
        // 部分加载，每次渲染20行
        const colLimited = col.slice(0, this.renderLimit);
        colLimited.forEach((data, i) => {
          let dataDiv = document.createElement("div");
          dataDiv.textContent = data;
          if (i > 0)
            // 第一个是表头
            switch (type) {
              case "div":
                dataDiv = document.createElement("div");
                dataDiv.textContent = data;
                break;
              case "edit":
                dataDiv = document.createElement("input");
                dataDiv.defaultValue = data;
                break;
              default:
                throw new Error("preview data: dataDiv -> Invalid type");
            }
          colDiv.appendChild(dataDiv);
        });
      });
      // Append the preview container to the body
      previewContainer.appendChild(tableContainer);
      document.body.appendChild(previewContainer);
      tableContainer.addEventListener('mousedown', (e)=>{
        // console.log(e.target)
        var rect = tableContainer.getBoundingClientRect(); // 获取元素相对于视口的位置信息
        console.log(rect)

        // 计算鼠标相对于左上角的百分比坐标
        // var relativeX = ((e.clientX - rect.left) / rect.width) * 100;
        var relativeY = ((e.clientY - rect.top) / rect.height) * 100;
        //
        var row = Math.floor(relativeY / (100 / Math.min(this.renderLimit, this.data[0].length)))
        // console.log('pos:', relativeY+'%')
        // console.log('row:', row)
        // var col = Math.floor(relativeX / (100 / this.data.length))
        if (returnType === "selectedData") {
          // console.log(` pos: ${row} `);
          if (row > 0){
            // 0:是表头
            let dataDiv
            resolve(
              Array.from(tableContainer.children).map((dataCol) => {
                // console.log(row)
                dataDiv = dataCol.children[row];
                console.error(dataDiv)
                switch (this.type) {
                  case "div":
                    return dataDiv.textContent;
                  case "edit":
                    return dataDiv.value;
                  default:
                    reject("type of dataDiv: 错误的类别");
                    console.error("type of dataDiv: 错误的类别");
                    myMenu.run("close");
                }
              })
            );
            //
            myMenu.run("close");
          }
        }
      })
      // Show the preview container,  这是为了有动画效果
      setTimeout(() => {
        previewContainer.style.opacity = 1;
      }, 300);
    });
  }

  // pre/next page
  nextPage(tableContainer, op = "+") {
    const type = this.type
    // calculate next page
    op === '+' ? this.page++ : this.page--;
    this.page = this.page < 1 ? 1 : this.page;
    this.page = this.page > this.lastPage ? this.lastPage : this.page;
    let start = (this.page - 1) * this.renderLimit;
    //index为0的时候渲染表头去了，所以start往前一行
    let end = this.page * this.renderLimit;
    end = Math.min(end, this.data[0].length);
    // update data
    let colLimited
    let dataDiv
    this.data.forEach((col, index) => {
      // const colDiv = document.createElement("div");
      // colDiv.className = "colDiv";
      // tableContainer.appendChild(colDiv);
      //add datas to this
      // 部分加载，每次渲染20行
      colLimited = this.page > 1 ? col.slice(start-1, end)
      : col.slice(start, end);
      // console.error(start-1, end)
      colLimited.forEach((data, i) => {
        dataDiv = tableContainer.children[index].children[i];
        // data = this.data[index][i]
        // 第一个是表头
        if(i===0){
          // let dataHeader = document.createElement("div");
          dataDiv.textContent = this.data[index][0];
          // tableContainer.children[index].insertBefore(dataHeader, dataDiv);
        }
        else if(i<this.renderLimit){
          switch (type) {
            case "div":
              // dataDiv = document.createElement("div");
              dataDiv.textContent = data;
              break;
            case "edit":
              // dataDiv = document.createElement("input");
              dataDiv.defaultValue = data;
              break;
            default:
              throw new Error("preview data: dataDiv -> Invalid type");
          }
        }
      // colDiv.appendChild(dataDiv);
      });
    });
  }

  //
  getSelectedData(index, start, end) {
    return new Promise((resolve, reject) => {
      resolve('success,ok,ar')
    });
  }
}
//
// export function openDataPreview(data, dataType = "array", type = "div") {
//   return new Promise((resolve, reject) => {
//     if (dataType === "object") {
//       data = changeToArray(data);
//     } else if (dataType === "server") {
//       data = changeServerData(data);
//     }
//     // data = mydata

//     // Create the preview container
//     const previewContainer = document.createElement("div");
//     previewContainer.id = "previewContainer";
//     previewContainer.className = "draggableElement normalSize";
//     // const title = data['title'] ? data.title : '꒰ ˶• ༝ •˶ ꒱ '
//     // previewContainer.innerHTML = `<h3>${title}</h3>`;
//     // dragable
//     // dragElement(previewContainer, true)

//     const tableContainer = document.createElement("div");
//     tableContainer.id = "tableContainer";

//     const myMenu = new menu(previewContainer);
//     myMenu.add(
//       ["dragable", "fullScreen", "right"],
//       [
//         {
//           container: previewContainer,
//           force: true,
//           dragable: true,
//         },
//         {},
//         {
//           container: tableContainer,
//         },
//       ]
//     );
//     // myMenu.addDragable(previewContainer, false, true);
//     // myMenu.addRight({tableContainer});
//     if (type === "edit") {
//       myMenu.addBase("Save", "✓", () => {
//         //return preview data object
//         const dataArray = [];
//         try {
//           Array.from(tableContainer.children).forEach((child) => {
//             const datas = [];
//             Array.from(child.children).forEach((dataDiv, i) => {
//               let data = dataDiv.textContent;
//               if (i > 0) {
//                 data = dataDiv.value;
//               }
//               datas.push(data);
//             });
//             dataArray.push(datas);
//           });
//           console.log("exit,ok. new datas:", dataArray);
//           resolve(dataArray);
//         } catch (err) {
//           console.error("exit,error:", err);
//           reject("保存失败啦(┬┬﹏┬┬)");
//         } finally {
//           myMenu.run("close");
//         }
//       });
//     }
//     previewContainer.appendChild(tableContainer);
//     //previewContainer.classList.add("Element");

//     data.forEach((col) => {
//       const colDiv = document.createElement("div");
//       colDiv.className = "colDiv";
//       tableContainer.appendChild(colDiv);
//       //add datas to this
//       // 部分加载，每次渲染20行
//       const lineNumber = Math.ceil(col.length / 20);
//       const colLimited = col.slice(0, 14);
//       colLimited.forEach((data, i) => {
//         let dataDiv = document.createElement("div");
//         dataDiv.textContent = data;
//         if (i > 0)
//           // 第一个是表头
//           switch (type) {
//             case "div":
//               dataDiv = document.createElement("div");
//               dataDiv.textContent = data;
//               break;
//             case "edit":
//               dataDiv = document.createElement("input");
//               dataDiv.defaultValue = data;
//               break;
//             default:
//               throw new Error("preview data: dataDiv -> Invalid type");
//           }
//         colDiv.appendChild(dataDiv);
//       });
//     });

//     // Append the preview container to the body
//     document.body.appendChild(previewContainer);

//     // Show the preview container,  这是为了有动画效果
//     setTimeout(() => {
//       previewContainer.style.opacity = 1;
//     }, 300);
//   });
// }

export class Formula {
  constructor(tableName) {
    this.tableName = tableName;
    // console.log('Formula init: tableName:'+tableName)
    this.DT = new DataTransfer();
    this.DH = new DataHandle();
    this.onmousedownHandle = null;
  }

  getCurrentFormula() {
    let formulas = document.querySelector("#previewContainer textarea").value;
    // 去除多行注释
    formulas = formulas.replace(/\/\*这是帮助[\s\S]*?\*\//g, "");
    // // 删除单行注释
    // formulas = formulas.replace(/\/\/.*/g, "");
    return formulas;
  }

  offloadApplyFormula() {
    if (this.onmousedownHandle) {
      const Main = document.querySelector("#Main");
      Main.removeEventListener("mousedown", this.onmousedownHandle);
    }
  }

  async onloadApplyFormula() {
    this.i = 1;
    const tableName = this.tableName;
    try {
      const formula = await this.getFormula(tableName, true);
      // add event
      const Main = document.querySelector("#Main");
      this.onmousedownHandle = () => {
        setTimeout(() => {
          this.applyFormula(formula, true);
          // showNotification(this.i+'  ')
          this.i++;
        }, 1000);
      };
      Main.onmouseup = this.onmousedownHandle;
      // run one times
      // console.log(tableName)
      // console.error(formula)
      //this.applyFormula(formula)
    } catch (err) {
      showNotification(err);
      throw new Error(err);
    }
  }

  async getFormula(tableName, silent = false) {
    try {
      // tableName = 'c'
      // const userFormulaFieldId = await DT.getData({
      //   tableName: 'APP公式',
      //   type: 'queryTable',
      //   select: 'id',
      //   where: 'name="表单名字"'
      // });
      // console.log(userFormulaFieldId)
      const userFormulas = await this.DT.getData({
        tableName: "APP公式_data",
        type: "queryTable",
        select: "textInput8",
        // where: `${userFormulaFieldId.data[0].id}='${tableName}'`
        where: `textInput7 = '${tableName}'`,
      });
      // console.log(userFormulas)
      // return userFormulas[tableName];
      if (userFormulas.data.length < 1) {
        if (!silent)
          showNotification("(✿◠‿◠) 她还没有公式呢，快去添加吧!", "null");
        await this.DT.setData({
          tableName: "APP公式",
          type: "insertData",
          data: {
            textInput7: tableName,
            textInput8: "",
          },
        });
        // return undefind
      } else {
        //  每张表 与 一条公式数据对应
        return userFormulas.data[0].textInput8;
      }
    } catch (err) {
      console.error(err);
      showNotification(err, "error");
    }
  }

  saveSetting(userFormulas, tableName) {
    // console.log("userFormulas:", userFormulas);
    // userFormulas.split(/[;\n]/).map((formula, i) => {
    //   console.log(++i, ": ", formula);
    // }{va{}});

    return new Promise(async (resolve, reject) => {
      try {
        await this.DT.setData({
          tableName: "APP公式_data",
          type: "updateData",
          set: "textInput8 = ?",
          where: "textInput7 = ?",
          params: [userFormulas, tableName],
        });
        resolve(userFormulas);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  MapToCode(id, prop, Data) {
    const type = id.replace(/\d/g, "");
    switch (prop) {
      case "value":
        // const target = document.getElementById(id)
        // let showIndex = target.getAttribute("show")
        let value = 'value'
        let showIndex = Data[id]['show']
        let regex = /^\d+(,\d+)*$/
        if( regex.test(showIndex) ){
          // console.error('show:',showIndex)
          let tableName = document.getElementById(id).getAttribute("tableName")
          let tableNameValues = tableName+'values'
          if(tableNameValues in Data){
            // console.log(tableName,'values:',Data[tableNameValues])
            switch (type){
              case 'pressureSwitch':
              case 'switch':
              case 'select':
                // 这类数值不能有多个
                value = `Data['${tableNameValues}']['${showIndex}']`
                break;
              default:
                value = `'${showIndex}'.split(',').map(i=>Data['${tableNameValues}'][i]).join(', ') || '写错啦'`
            }
            // console.log('values:', value)
          }
        }
        switch (type) {
          case `text`:
          case `idSelect`:
            return `e.textContent=${value}`;
          case `textInput`:
          case `select`:
          case `numberInput`:
            return `e.value=${value}`;
          case `pressureSwitch`:
            return showIndex ? `value=${value}
            e.checked=JSON.parse(value)`
            : `e.checked=JSON.parse(value)`;
          case `switch`:
            return showIndex ? `value=${value}
            e.firstChild.checked=JSON.parse(value)`
            : `e.firstChild.checked=JSON.parse(value)`;
            // return `e.firstChild.checked=JSON.parse(${value})`;
          default:
            showNotification(
              "未知的元素id type: " + id.replace(/\d/g, ""),
              "error"
            );
            return `console.error('unknow element id type: ${id}')`;
        }
      case "color":
      case "backgroundColor":
        return `e.style.${prop}=value`;
      case "width":
        return `e.parentElement.classList.add(value)`;
      case "place":
        return `e.parentElement.style.placeSelf = value`;
      case "opts":
        switch (type) {
          case "select":
            return `
            const oldValue=e.value;
            while(e.firstChild)e.removeChild(e.firstChild);
            value.split(' ').map((opt, i)=>{
              e.appendChild(
                document.createElement('option')
                ).textContent = opt;
            })
            e.value=oldValue
            `;
        }
        break; //这个break，花费我大量时间调试，麻了
      case "name":
        // return "e.parentElement.firstChild.textContent=value";
        // console.log('id:',id,'value:',value)
        // document.getElementById(id+'Div').firstChild.textContent = value;
        return `
        const E=document.getElementById('${id}Div')
        //console.log('E is:', E)
        //console.log('value:', value)
        E.firstChild.textContent=value
        `;
      case "tableName":
      case "show":
        return `e.setAttribute('${prop}', value)`;
    }
  }

  async applyFormula(formulas, silent = false ) {
    try {
      // provide some interface
      // const tableName = this.DH.getTableName();
      const DT = this.DT;
      const DH = this.DH;
      const Data = {};
      const dataOrigin = this.DH.getSchemaData();
      // console.log('dataOrigin:', dataOrigin)
      // const notification = showNotification;
      let e;
      let value;
      let code;
      // const Data = this.getUsingData()['数据结构'].Data
      const res = await DT.getData({type: 'tableNames'})
      //
      Data[this.tableName+'values'] = [];
      dataOrigin.data.map((obj, i) => {
        Data[obj.id] = obj;
        // 数据接口，本表单的单条数据
        Data[this.tableName+'values'].push(obj.value);
        // 其他表单的单条数据，在用户选择了哪条数据之后，添加
        // 见uicontrol
        // 添加其他的表单的数据接口
        e = document.getElementById(obj.id);
        let names = res.data.map(obj => obj.name)
        let tableName = e.getAttribute('tableName');
        if( e.hasAttribute('tableName') && e.hasAttribute('values') ){
          // console.log('tableName:', tableName)
          if( names.includes( tableName ) ){
              // console.log('set tableName')
              // 避免重复执行
              if(!Data.hasOwnProperty(tableName+'values')){
                Data[tableName+'values'] = e.getAttribute('values').split(',')
              }
          }else{
            throw new Error(`[${tableName}] 不存在！再检查一下哦！`)
          }
        }
      });

      console.log('Data is:', {...Data});
      //
      const lastFormulas = []
      if (formulas)
        formulas.split(/[;]/).map((formula, i) => {
          // 使用正则表达式去除空行
          formula = formula.replace(/^\s*[\r\n]/gm, "");
          //
          // if(formula.includes('DH.')){
          //   lastFormulas.push(formula)
          // }
          // changto: Data.onDataInsert = () => {
          //          xxxx
          //      }
          // eval(formula);
          console.log(`${i}: run ->[\n${formula}\n]<-`);
          const exec = new Function("Data", 'show' ,'DT', formula);
          exec(Data, showNotification, DT);
        });
      // render Data for apply change
      // console.log('Data is:',{...Data})
      for (let id in Data) {
        for (let prop in Data[id]) {
          e = document.getElementById(id);
          value = Data[id][prop];
          code = this.MapToCode(id, prop, Data);
          // code = this.MapToCode(id, prop);
          // eval(code)
          if (code) {
            // console.log(`update: ->[\n${code}\n]<-`)
            const exec = new Function("e", "value", "Data", code);
            exec(e, value, Data );
            // exec(e, value, Data);
            // console.log('arg:', e, value)
          }
        }
      }

      // 执行保存等等操作
      // lastFormulas.map((formula, i) => {
      //   console.log(`${i}: run ->[\n${formula}\n]<-`);
      //   const exec = new Function("Data", "show", "DH", formula);
      //   exec(Data, showNotification, DH);
      // });
      // //
      if (!silent)
        showNotification("代码运行正确, 距离智慧又进一步啦！q(≧▽≦q)", "null");
    } catch (e) {
      // if(!silent)
      showNotification("公式有语法错误啦，快去学习改正", "error");
      throw e;
    }
  }

  getUsingData() {
    const data = this.DH.getSchemaData(this.tableName);
    const usingData = {
      当前表单名字: data.tableName,
      组件id: data.schemaId,
      单个组件的结构: data.data[0],
      数据结构: {
        Data: {
          id1xxx: {
            属性1: "值1",
            属性2: "值2",
            "...": "...",
          },
          id2xxx: {
            属性1: "值1",
            属性2: "值2",
            "...": "...",
          },
          "...更多": "...更多",
        },
      },
    };
    return usingData;
  }

  async setTextValue(formulaInput, tableName) {
    let inputValue = await this.getFormula(tableName);
    //
    formulaInput.defaultValue = inputValue ? inputValue : "";
    //
    const examples = `

/*这是帮助 
//  可以使用的数据：
  ${JSON.stringify(this.getUsingData(), null, 2)}

//下面是一些用法： 每个公式结尾记得添加分隔符号';'

data.textInput7 = 'hi' + data.textInput7;
//  修改变量的值，   字符串拼接 

if(data.textInput8 > 100){
  // 条件修改
    data.textInput8.style.color = 'red'
    data.textInput8.style.background = 'grey' 
    //改变其他属性
};

*/

 `;
    formulaInput.defaultValue += examples;
  }

  async openFormulaSetting() {
    return new Promise(async (resolve, reject) => {
      const tableName = this.tableName;
      // Create the preview container
      const previewContainer = document.createElement("div");
      previewContainer.id = "previewContainer";
      previewContainer.className = "draggableElement normalSize";
      previewContainer.style.top = "70%";
      const title = "o(*≧▽≦)ツ: " + tableName;
      previewContainer.innerHTML = `<h3>${title}</h3>`;
      previewContainer.firstChild.style.color = "grey";
      // previewContainer.firstChild.style.left = '50%';
      previewContainer.firstChild.style.transform = "translateX(-17%)";
      //
      const myMenu = new menu(previewContainer);
      //
      const formulaInput = document.createElement("textarea");
      await this.setTextValue(formulaInput, tableName);
      previewContainer.appendChild(formulaInput);
      // formulaInput.rows = 6;
      // formulaInput.cols = 25;
      document.body.appendChild(previewContainer);
      //
      myMenu.addDragable(previewContainer);
      myMenu.addBase(
        "quickRun", // run one time
        "▷",
        () => {
          try {
            // console.log('run')
            this.applyFormula(this.getCurrentFormula());
          } catch (e) {
            // console.log('run failed')
            console.error(e);
            showNotification(
              "你的代码几乎是对的啦，还是还有一点小错误，继续加油吧! ::>_<:: ",
              "error"
            );
          }
        },
        "mousedown",
        "Enter",
        formulaInput
      );
      myMenu.addBase(
        "saveButton",
        "✓",
        async () => {
          try {
            //
            let formulas = this.getCurrentFormula();
            this.applyFormula(formulas);
            //
            await this.saveSetting(formulas, tableName);
            showNotification("保存成功啦(●'◡'●)", "null");
            //
            showNotification("应用公式中...", "null");
            if (this.onmousedownHandle) {
              this.offloadApplyFormula();
            }
            this.onloadApplyFormula();
            //
            resolve(formulas);
          } catch (err) {
            console.error("保存失败：", err);
            // throw err;
            showNotification("保存失败::>_<::", "null");
            reject(err);
          } finally {
            myMenu.run("close");
          }
        },
        "mousedown"
      );
      //
      setTimeout(() => {
        previewContainer.style.opacity = 1;
      }, 300);
    });
  }
}
