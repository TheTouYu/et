import { showNotification } from "./base";

//const URL = "http://localhost:3001/";
const URL = "http://47.99.157.36:3001/";
//const URL = "http://192.168.2.127:3001/";

class DataTransfer {

  constructor() {
    ;
  }


  async setData(data) {
    try {
      const res = await fetch(URL + "setData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();

      if (res.ok) {
        // console.log("123 web DT: Data set successfully");
        //console.log(resData)
        return "ok";
      } else if (res.status === 400) {
        // 处理错误请求
        console.error("123 web DT res:  Failed to set data. ");
        console.log(resData, data);
        throw new Error("前端请求错误");
      } else if (res.status === 401) {
        //用户行为错误
        console.error("123 web DT res:  user behavior error. ");
        showNotification(resData.message, "error");
        throw new Error("用户行为错误");
      } else {
        // 500服务器错误
        // 处理网络请求本身的错误
        console.error("123 web: server error");
        // 在此处抛出错误，以便上层调用者能够处理
        throw new Error("服务器... 失败···");
      }
    } catch (error) {
      console.error("123 web: unknow error:", error.message);
      throw new Error(error.message)
    }
  }

  async getData(params) {
    const queryString = new URLSearchParams(params).toString();
    const url = URL + "getData?" + queryString;
    const res = await fetch(url);
    const data = await res.json();
      if (res.ok) {
      //  
      // console.log("123 web DT: data get succeessfully")
      // console.log({...data})
      return data;
    } else {
      // 处理请求失败的情况
      console.error('123 web DT:  Failed to get data. ')
      console.log(data);
      switch(res.status){
        case 400:
          throw new Error('前端请求出错啦，快叫前端同学来看看')
        case 401:
          throw new Error(data.message)
        case 500:
          throw new Error('服务器出错啦，快叫后端同学来看看')
        default:
          throw new Error('web DT: server 未知错误')
      }
    }
  }

  deleteTable(params){
    return this.getData(params);
  }

  async downloadData(type) {
    try {
      const response = await fetch(URL + "downloadData");
      switch (type) {
        case "download":
          const blob = await response.blob();

          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "data.json";
          link.click();
          break;
        case "json":
          const json = await response.json();
          return json;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

}

// 示例数据
const myData = {
  name: "John",
  age: 30,
  city: "New York",
};

// 保存数据
//saveData(myData);

// 下载数据
//downloadData();

export default DataTransfer