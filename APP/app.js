const express = require('express');
const bodyparser = require('body-parser'); //body中间件
const testsRouter=require("./router/tests.js");//测试信息路由
const adminRouter = require('./router/admin.js'); //管理菜单等路由
const cors = require('cors'); //解决跨域的中间件
const server = express();
const {errLog}= require("./utils/err");
server.listen(3000);
server.use(cors({origin: "*",}));
server.use(express.static('./public')); //用户的静态资源
server.use(bodyparser.json());
// server.use(bodyparser.urlencoded({//body中间件
// 	extended:false
// }));
server.use(function (req, res, next)  {
	next();
})
process.on('unhandledRejection', (err, test) => {
	errLog({err,code:500,msg:"后端系统错误！",funName:"fatal"});
	}).on('uncaughtException', err => {
	errLog({err,code:500,msg:"后端系统错误！！",funName:"fatal"});
	});

server.use('/admin', adminRouter); //挂载用户信息路由
server.use("/tests",testsRouter);//挂载测试信息路由
console.log('后端接口启动成功');
