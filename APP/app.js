const express = require('express');
const bodyparser = require('body-parser'); //body中间件
const testsRouter=require("./router/tests.js");//测试信息路由
const adminRouter = require('./router/admin.js'); //管理菜单等路由
const cors = require('cors'); //解决跨域的中间件
const server = express();
const {errLog}= require("./utils/err");
const utils = require("./utils/index.js");
server.listen(3000);
server.use(cors({origin: "*",}));
server.use(express.static('./public')); //用户的静态资源
server.use(bodyparser.json());
// server.use(bodyparser.urlencoded({//body中间件
// 	extended:false
// }));
server.use(async function (req, res, next)  {
	if(req.headers.token){
		let user=await utils.getUserInfo(req,res);
		if(user.status===0) return res.send(utils.returnData({code: 203, msg: "你账号已被禁用，请联系管理员！！",req}));
	}
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
