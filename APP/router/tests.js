const express = require('express');
const router = express.Router();
const pool = require('../pool.js');
const utils = require("../utils/index.js");
const {primary}=require("../utils/roleString");
//添加测试账号
router.post("/addTests", async (req, res) => {
	let sql = "INSERT INTO tests(name,remark,more_id) VALUES (?,?,?)",
		obj = req.body;
	let user = await utils.getUserInfo(req, res);
    if(user.admin==1) return res.send(utils.returnData({ code:-1,msg:"终极管理员无权 增加多账号数据~" }));
	pool.query(sql, [obj.name, obj.remark,user.moreId], (err, result) => {
		if (err) return res.send(utils.returnData({ code: -1 ,err,req}));
		res.send(utils.returnData({ data: result }));
	});
});
//查询测试账号
router.post("/getTests", async (req, res) => {
	let user = await utils.getUserInfo(req, res),obj=req.body;
	let {page,size}=utils.pageSize(obj.page,obj.size);
    //如果不是终极管理，要根据多账号进行取
	let sql = `SELECT id,name,remark FROM tests WHERE name LIKE "%${obj.name||''}%" ${user.admin?"":"AND more_id="+user.moreId} ORDER BY id DESC LIMIT ?,?`;
	let {total}=await utils.getSum({name:"tests",where:`WHERE name LIKE "%${obj.name||''}%" ${user.admin?"":"AND more_id="+user.moreId}`,res,req});
	pool.query(sql,[page,size],(err, result) => {
		if (err) return res.send(utils.returnData({ code: -1 ,err,req}));
		res.send(utils.returnData({ data: result ,total}));
	});
});

//修改测试账号
router.post("/upTests", async (req, res) => {
	let sql = "UPDATE  tests SET name=?,remark=? WHERE id=?",
		obj = req.body;
	pool.query(sql, [obj.name, obj.remark, obj.id], (err, result) => {
		if (err) return res.send(utils.returnData({ code: -1 ,err,req}));
		res.send(utils.returnData({ data: result }));
	});
});

//删除测试账号
router.post("/delTests", async (req, res) => {
	let sql = "DELETE FROM tests WHERE id=?",
		obj = req.body;
	pool.query(sql, [obj.id], (err, result) => {
		if (err) return res.send(utils.returnData({ code: -1 ,err,req}));
		res.send(utils.returnData({ data: result }));
	});
});

//测试菜单接口权限
router.post("/checkMenu",async (req,res)=>{
	//需要有roleKey1 这个菜单权限才能请求！
	await utils.checkPermi({role:["roleKey1"],res,req});
	res.send(utils.returnData({data:{msg:"请求成功了！"}}));
});
//测试角色接口权限
router.post("/checkRole",async (req,res)=>{
	//需要有primary 这个角色权限才能请求！
	await utils.checkRole({req,res,role:[primary]});
	res.send(utils.returnData({data:{msg:"请求成功了！"}}));
});
module.exports = router;
