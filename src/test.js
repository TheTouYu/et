const func = () => {
    console.log('Hello');
    return new Promise((resolve, reject) => {
        reject('err1')
        resolve('World'); // 这里可以替换为异步操作
    })
}

const func2 = async() => {
    try{
        await func()
        console.log('this is not run')
    }
    catch(err){
        console.log(err)
    }
}

// func2()
//2. 学习消除异步函数的传染性

const m1 = async (msg) => {
  return new Promise((resolve) => {
    setTimeout(() => {
    //   console.log("异步函数执行完毕,"+msg);
      resolve(msg)
    }, 3000);
  });
};


async_funcs = {
    m2: async ()=>{
        const msg = await m1('hello, 我运行好了，这是数据');
        // console.log('m2: ',msg)
        // throw 'm2 error'
        return msg;
    },
    m3: async ()=>{
        const msg = await m1('hello, I am m3');
        // console.log('m2: ',msg)
        // throw 'm3 error'
        return msg;
    },
}

const main = () =>{
    console.log('main start...')
    const res=async_funcs.m2();
    console.log('res:', res);
    const res2=async_funcs.m3();
    console.log('later... res2:', res2)
    console.log('ok')
}

// 1.普通函数的修改， 通过对象传递异步函数。
// main()
// 直接运行打印promise， 现在要解决这个问题
// run(main, async_funcs)

// 2.类函数的修改

class RunSync {
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

class MyClass {
  constructor() {
    console.log("my class is running");
  }
  m1() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("m1 is running");
        resolve("hello, I am m1 from class");
      }, 1000);
    });
  }
  m2() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("m2 is running");
        resolve("hello, I am m2 from class");
      }, 1000);
    });
  }
  m3() {
    return new Promise((resolve) => {
      setTimeout(async() => {
        console.log("m3 is running");
        const msg = `${await this.m1()}, ${await this.m2()}`
        resolve("I am m3 from class, using m1 and m2:");
      }, 1000);
    });
  }
  main(){
    // console.log('this:', this)
    const m1 = this.m1()
    console.log('m1:', m1)
    const m2 = this.m2()
    console.log('m2:', m2)
    const m3 = this.m3()
    console.log('m3:', m3)
    // 使用的时候要注意，如果想捕获的话，要记得把错误继续返回
    // try{
    //     const m3 = this.m3()
    //     console.log('m3:', m3)
    // }catch(err){
    //     console.log('run m3:', err)
    //     throw(err)
    // }
  }
  main_sync(){
    const funcs = ['m1', 'm2', 'm3']
    const async_funcs = {}
    funcs.map((func) =>{
        async_funcs[func] = this[func].bind(this)
    })
    // async_funcs.m1 = ()=>{
    //     console.log('I am new m1')
    // }  //这样写里面的函数没有更新
    // console.log('async_funcs:', async_funcs)
    //
    // 更新函数并重新设置
    const runSync = new RunSync(async_funcs)
    funcs.map((func) =>{
        this[func] = async_funcs[func].bind(this)
    })
    // run
    runSync.run(this.main.bind(this))
    // run(this.main.bind(this), async_funcs)
  }
}

const my_class = new MyClass();
// my_class.main()
// 有时候甚至可以优化性能，比如重复的请求缓存了
my_class.main_sync()

function run(func, async_funcs) {
    const cache = Object.keys(async_funcs).map((func) => ({
        func: func,
        status: 'pending',
        result: null,
    }));
    // 改写原来的异步函数，加入缓存机制， 调用两次
    const _old_async_funcs = {...async_funcs}
    // console.log('_old_async_funcs:', _old_async_funcs)
    // console.log('cache:', cache)
    let _func_promise
    cache.map(cache_obj=>{
        async_funcs[cache_obj.func] = () => {
            if(cache_obj.status === 'fullfilled'){
                return cache_obj.result
            }else if(cache_obj.status === 'rejected'){
                throw(cache_obj.result)
            }
            // 没有缓存，写入缓存
            _func_promise = _old_async_funcs[cache_obj.func]().then((res) =>{
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
    //
    const run = ()=>{
        try{
            func()
        }catch(err){
            // console.log('err:', err)
            if(err instanceof Promise){
                err.finally(()=>{
                    // console.log('finally Promise ok: ', cache)
                    run()
                })
            }else{
                throw new Error(err)
            }
        }
    }
    run()
        // try {
        //     func()
        // }catch(err){
        //     // console.log('catch err: ', err)
        //     if(err instanceof promise){
        //         // console.log('catch promise ok: ', err)

        //         // return 'enter finally promise:'
        //         err.finally(()=>{
        //             console.log('finally promise ok: ', cache)
        //             func()
        //         })
        //     }else{
        //         throw(err)
        //     }
        // }
}