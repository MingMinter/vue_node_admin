const log4js = require("log4js");
module.exports={
    /**
     * 记录错误信息日志
     * @param object err  错误信息
     * @param number code  状态值
     * @param string msg  提示语
     * @param string funName  等级函数名：trace debug info warn error fatal
     * @param object req  req主体
    * **/
    errLog({err,code,msg,funName="error",req={}}){
        log4js.configure({
            appenders:{
                console:{
                    type:'dateFile',
                    filename:`./logs/${funName}.log`,
                    pattern:'yyyy-MM-dd',
                    // pattern:'yyyy-MM-dd-hh-mm-ss',
                    keepFileExt: true,
                    alwaysIncludePattern: true,
                    daysToKeep: 14,//保留时间（天）
                    layout:{
                        type: "pattern",
                        pattern:'{"date":"%d{yyyy-MM-dd hh:mm:ss}","type":"%p","data":"%m"} %n'
                    }
                },
            },
            categories:{
                default: { appenders: ["console"], level: "all" },
            }
        });
        let init=log4js.getLogger();
        try {
            let data={err,code,msg,portName:req.originalUrl,body:req.body,query:req.query,method:req.method};
            init[funName](data);
        }catch (e) {
            init[funName]("错误日志--记录错误："+e);
        }

    }
}
