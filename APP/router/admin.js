const express = require("express");
const router = express.Router();
const pool = require("../pool.js");
const utils = require("../utils/index.js");
const {systemSettings} =require("../utils/menuString");
//登录
router.post("/login", async (req, res) => {
    let sql = "SELECT id,admin,more_id FROM user WHERE name=? AND pwd=?", obj = req.body;
    pool.query(sql, [obj.name, obj.pwd], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        if (result.length == 0) return res.send(utils.returnData({code: -1, msg: "请输入正确的用户名和密码！",err,req}));
        let uid = result[0].id, admin = result[0].admin,name = obj.name;
        let token = utils.setToken({uid});
        res.send(utils.returnData({data: {uid, name, token, admin}}));
    });
});

//获取用户信息
router.post("/getUserInfo",async (req,res)=>{
    let user = await utils.getUserRole(req, res);
    let sql = `SELECT b.menu_bg AS menuBg,b.menu_sub_bg AS menuSubBg,b.menu_text AS menuText,b.menu_active_text AS menuActiveText,b.menu_sub_active_text AS menuSubActiveText,b.menu_hover_bg AS menuHoverBg FROM theme AS b WHERE user_id=?`;
    pool.query(sql,[user.user.id],(err,result)=>{
        if(err||result.length===0) return  res.send(utils.returnData({code:-1,err,req}));
        res.send(utils.returnData({data:{...user,theme:result[0]}}));
    })

})

function getRouter(req,res,sidebar=false){
    return new Promise(async (resolve, reject)=>{
        let sql = "SELECT id,parent_id AS parentId,path,hidden,redirect,always_show AS alwaysShow,name,layout,parent_view AS parentView,meta,component,sort,update_time AS updateTime,alone,role_key AS roleKey,menu_type AS menuType FROM router_menu ORDER BY sort ASC, update_time DESC";
        let userRole = await utils.getUserRole(req, res);
        if (userRole == -1) return res.send(utils.returnData({code: -1,req}));
        if (!userRole.userRole || userRole.userRole == null || userRole.userRole == "null") userRole.userRole = "";
        //角色权限
        let roles = userRole.userRole.split(",");
        pool.query(sql, (err, result) => {
            if (err) return res.send(utils.returnData({code: -1,err,req}));
            let list = [...result],routerArr=[];
            let filterAsyncRoutes = (lists, parentId, pathView = "") => {
                let resArr = [], obj = {};
                lists.map((t) => {
                    let objs = {...t};
                    try {objs.meta = JSON.parse(objs.meta);} catch (err) {objs.meta = {};}
                    objs.title = objs.meta.title || "---";
                    objs.pathView = t.path;
                    //按钮自动隐藏
                    if(objs.menuType==="F") objs.hidden=1;
                    //递归
                    if (objs.parentId == parentId) {
                        objs.path = pathView + objs.path;
                        obj = {...objs, children: filterAsyncRoutes(list, objs.id, objs.path)};
                        //菜单下有子级，单独拿出来
                        if(obj.menuType==="C"&&obj.children&&obj.children.length!=0){
                            routerArr.push(...obj.children)
                            sidebar&&delete obj.children;
                        }
                        //如果是总管理
                        if (userRole.user.admin == 1 || userRole.roleAdmin ) {resArr.push(obj);} else {
                            //只拿角色权限通过的
                            if (roles.some((role) => obj.id == role)) resArr.push(obj);
                        }
                    }
                });
                return resArr;
            };
            let routerMenu = filterAsyncRoutes(list, 0, "");
            //如果是独立的（一级）
            sidebar&&routerMenu.forEach(t=>{
                if(t.menuType==="C"&&(!t.children||t.children.length===0)){
                    t.layout=1;
                    t.children=[{...t, layout:0, alone:1, children:undefined,}]
                    t.path="/"+Math.random();
                }
            });
            resolve({routerMenu,routerArr})
        });

    })
}
//获取路由 侧边栏
router.post("/getRouter", async (req, res) => {
    let {routerMenu,routerArr}=await getRouter(req,res,true);
    function bianpinghua(list){
        let arr=[];
        list.map(t=>{
            if(t.children&&t.children.length) arr.push(...bianpinghua(t.children))
            arr.push({...t,layout:1,path:"/"+Math.random(),children: [{...t,layout:0, alone:1, children:undefined}],hidden:1});
        })
        return arr
    }
    routerArr=bianpinghua(routerArr);
    routerArr= routerArr.filter((obj, index, self) => index === self.findIndex((t) => (t.id === obj.id)));
    res.send(utils.returnData({data:{routerMenu:routerMenu.concat(routerArr)}}))
});
//菜单管理获取
router.post("/getRouterSystem", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.menus.menuQuery]});
    let {routerMenu}=await getRouter(req,res);
    res.send(utils.returnData({data:{routerMenu}}));
})
//添加菜单
router.post("/addMenu", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.menus.menuAdd]});
    let sql = "INSERT INTO router_menu(parent_id,path,hidden,name,layout,parent_view,meta,component,sort,alone,role_key,menu_type,update_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        obj = req.body;
    let meta = {};
    await utils.existName({sql:"SELECT id FROM router_menu WHERE role_key=?",name:obj.roleKey,res,msg:"权限字符已存在！",req});
    await utils.existName({sql:"SELECT id FROM router_menu WHERE name=?",name:obj.name,res,msg:"页面名称已存在！！",req});
    meta.title = obj.title;
    meta.icon = obj.icon;
    meta.noCache = obj.noCache;
    pool.query(sql, [obj.parentId, obj.path, obj.hidden, obj.name, obj.parentId == 0 ? 1 : 0, obj.parentView, JSON.stringify(meta), obj.component, obj.sort, obj.alone, obj.roleKey, obj.menuType,new Date(),], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});
//修改菜单
router.post("/changeMenu", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.menus.menuUp]});
    let sql = "UPDATE  router_menu SET parent_id=?,path=?,hidden=?,name=?,layout=?,parent_view=?,meta=?,component=?,sort=?,alone=?,role_key=?,menu_type=?,update_time=? WHERE id=?",
        obj = req.body;
    let judgeUserNameRes = await utils.judgeUserName({sql:"SELECT role_key FROM router_menu WHERE  id=?",sqlName:"role_key",name:obj.roleKey,id:obj.id});
    if(judgeUserNameRes===1)await utils.existName({sql:"SELECT id FROM router_menu WHERE role_key=?",name:obj.roleKey,res,msg:"权限字符已存在！",req});
    let judgeUserNameRes2 = await utils.judgeUserName({sql:"SELECT name FROM router_menu WHERE  id=?",sqlName:"name",name:obj.name,id:obj.id});
    let meta = {};
    if(judgeUserNameRes2===1)await utils.existName({sql:"SELECT id FROM router_menu WHERE name=?",name:obj.name,res,msg:"页面名称已存在！",req});
    meta.title = obj.title;
    meta.icon = obj.icon;
    meta.noCache = obj.noCache;
    pool.query(sql, [obj.parentId, obj.path, obj.hidden, obj.name, obj.parentId == 0 ? 1 : 0, obj.parentView, JSON.stringify(meta), obj.component, obj.sort, obj.alone, obj.roleKey, obj.menuType,new Date(), obj.id,], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});
//删除菜单
router.post("/delMenu", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.menus.menuDelte]});
    let sql = "DELETE FROM router_menu WHERE id=?";
    let selectSql = "SELECT id FROM router_menu WHERE parent_id=?";
    let obj = req.body;
    pool.query(selectSql, [obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        if (result.length != 0) return res.send(utils.returnData({code: -1, msg: "删除失败，请先删除子级",err,req}));
        pool.query(sql, [obj.id], (err2, result2) => {
            if (err2) return res.send(utils.returnData({code: -1,err,req}));
            res.send(utils.returnData({data: result}));
        });
    });
});
//查询角色
router.post("/getRoles", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.role.roleQuery]});
    let obj=req.body;
    let {page,size}=utils.pageSize(obj.page,obj.size);
    let {total}=await utils.getSum({name:"roles",where:`WHERE name LIKE "%${obj.name||''}%"`,res,req});
    let sql = `SELECT id,name,roles,checked_roles AS checkedRoles,role_key AS roleKey,create_time AS createTime FROM roles WHERE name LIKE "%${obj.name||''}%" LIMIT ?,?`;
    pool.query(sql,[page,size] ,(err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result,total}));
    });
});
//查询角色全部
router.post("/getRolesAll", async (req, res) => {
    let sql = `SELECT id,name,roles,checked_roles AS checkedRoles,role_key AS roleKey FROM roles`;
    pool.query(sql,(err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});
//添加角色
router.post("/addRoles", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.role.roleAdd]});
    let sql = "INSERT INTO roles(name,roles,checked_roles,role_key,create_time) VALUES (?,?,?,?,?)", obj = req.body;
    await utils.existName({sql:"SELECT id FROM roles WHERE role_key=?",name:obj.roleKey,res,msg:"权限字符已存在！",req});
    // console.log(obj);
    pool.query(sql, [obj.name, obj.roles, obj.checkedRoles,obj.roleKey,new Date()], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});
//修改角色
router.post("/upRoles", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.role.roleUp]});
    let sql = "UPDATE  roles SET roles=?,name=?,checked_roles=?,role_key=? WHERE id=?", obj = req.body;
    //总管理不能操作
    await utils.upAdminRole({req,res,id:obj.id});
    let judgeUserNameRes = await utils.judgeUserName({sql:"SELECT role_key FROM roles WHERE  id=?",sqlName:"role_key",name:obj.roleKey,id:obj.id});
    if(judgeUserNameRes===1)await utils.existName({sql:"SELECT id FROM roles WHERE role_key=?",name:obj.roleKey,res,msg:"权限字符已存在！",req});
    pool.query(sql, [obj.roles, obj.name, obj.checkedRoles, obj.roleKey,obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});
//删除角色
router.post("/delRoles", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.role.roleDelte]});
    let sql = "DELETE FROM roles WHERE id=?", obj = req.body;
    //总管理不能操作
    await utils.upAdminRole({req,res,id:obj.id});
    pool.query(sql, [obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});

//添加用户
router.post("/addUser", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.user.userAdd]});
    let sql = "INSERT INTO user(name,status,roles_id,remark,pwd,more_id,create_time) VALUES (?,?,?,?,?,?,?)", obj = req.body;
    await utils.existName({sql: "SELECT id FROM user WHERE  name=?", name: obj.name,res,msg:"用户名已被使用！",req});
    pool.query(sql, [obj.name, obj.status,obj.rolesId, obj.remark, obj.pwd, obj.moreId,new Date()], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err}));
        let themeSql="INSERT INTO theme(user_id,menu_bg,menu_sub_bg,menu_text,menu_active_text,menu_sub_active_text,menu_hover_bg) VALUES (?,?,?,?,?,?,?)";
        pool.query(themeSql,[result.insertId,"#304156","#304156","#bfcad5","#409eff","#fff","#001528"],(themeErr,themeRes)=>{
            if (themeErr) return res.send(utils.returnData({code: -1,err:themeErr,req}));
            res.send(utils.returnData({data: result}));
        })

    });
});

//查询用户
router.post("/getUser", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.user.userQuery]});
    let obj=req.body;
    let {page,size}=utils.pageSize(obj.page,obj.size);
    let {total}=await utils.getSum({name:"user",where:`WHERE name LIKE "%${obj.name||''}%"`,res,req});
    let sql = `SELECT a.id AS id,name,status,roles_id AS rolesId,remark,admin,more_id AS moreId,a.create_time AS createTime,b.menu_bg AS menuBg,b.menu_sub_bg AS menuSubBg,b.menu_text AS menuText,b.menu_active_text AS menuActiveText,b.menu_sub_active_text AS menuSubActiveText,b.menu_hover_bg AS menuHoverBg FROM user AS a LEFT JOIN theme b ON a.id=b.user_id WHERE name LIKE "%${obj.name||''}%" LIMIT ?,?`;
    pool.query(sql, [page,size],(err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result,total}));
    });
});


//修改主题
router.post("/upTheme", async (req, res) => {
    let sql = "UPDATE  theme SET menu_bg=?,menu_sub_bg=?,menu_text=?,menu_active_text=?,menu_sub_active_text=?,menu_hover_bg=? WHERE user_id=?", obj = req.body;
    pool.query(sql, [obj.menuBg,obj.menuSubBg,obj.menuText,obj.menuActiveText,obj.menuSubActiveText,obj.menuHoverBg,obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});



//修改用户
router.post("/upUser", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.user.userUp]});
    let sql = "UPDATE  user SET name=?,status=?,roles_id=?,remark=?,more_id=? WHERE id=?", obj = req.body;
    //总管理不能操作
    await utils.upAdmin({req,res,id:obj.id});
    let judgeUserNameRes = await utils.judgeUserName({sql:"SELECT name FROM user WHERE  id=?",name:obj.name,id:obj.id});
    if (judgeUserNameRes === 1) await utils.existName({sql: "SELECT id FROM user WHERE  name=?", name: obj.name,res,msg:"用户名已被使用！",req});
    pool.query(sql, [obj.name, obj.status,obj.rolesId, obj.remark, obj.moreId, obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});

//修改用户密码
router.post("/upUserPwd", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.user.userPwd]});
    let sql = "UPDATE  user SET pwd=? WHERE id=?", obj = req.body;
    let getUserIdRes=await utils.getUserId({id:obj.id,req,res});
    if(getUserIdRes.admin===1){
        let user=await utils.getUserInfo(req,res);
        if(user.admin!==1) return res.send(utils.returnData({code: -1,msg:"总管理密码只能总管理账号修改！",req}));
    }
    pool.query(sql, [obj.pwd,obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});

//删除用户
router.post("/delUser", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.user.userDelte]});
    let obj = req.body;
    //总管理不能操作
    await utils.upAdmin({req,res,id:obj.id});
    let user = await utils.getUserInfo(req, res);
    if (obj.id == user.id) return res.send(utils.returnData({code: -1, msg: "无法删除正在使用中的用户~",req}));
    let sql = "DELETE FROM user WHERE id=?";
    pool.query(sql, [obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err:err,req}));
        res.send(utils.returnData({data: result}));
    });
});


//添加多账号
router.post("/addMore", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.more.moreAdd]});
    let sql = "INSERT INTO more(name,remark,create_time) VALUES (?,?,?)", obj = req.body;
    await utils.existName({sql: "SELECT id FROM more WHERE  name=?", name: obj.name,res,msg:"账号名已存在！",req});
    pool.query(sql, [obj.name, obj.remark,new Date()], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});
//查询多账号
router.post("/getMore", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.more.moreQuery]});
    let obj=req.body;
    let {page,size}=utils.pageSize(obj.page,obj.size);
    let {total}=await utils.getSum({name:"more",where:`WHERE name LIKE "%${obj.name||''}%"`,res,req});
    let sql = `SELECT id,name,remark,create_time AS createTime FROM more WHERE name LIKE "%${obj.name||''}%" LIMIT ?,?`;
    pool.query(sql,[page,size] ,(err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result,total}));
    });
});
//查询多账号 全部
router.post("/getMoreAll", async (req, res) => {
    let sql = "SELECT id,name,remark FROM more";
    pool.query(sql, (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});
//修改多账号
router.post("/upMore", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.more.moreUp]});
    let sql = "UPDATE  more SET name=?,remark=? WHERE id=?", obj = req.body;
    pool.query(sql, [obj.name, obj.remark, obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});
//删除多账号
router.post("/delMore", async (req, res) => {
    await utils.checkPermi({req,res,role:[systemSettings.more.moreDelte]});
    let sql = "DELETE FROM more WHERE id=?", obj = req.body;
    pool.query(sql, [obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});

//添加字典
router.post("/addDict", async (req, res) => {
    let sql = "INSERT INTO dict(name,type,create_time,remark) VALUES (?,?,?,?)", obj = req.body;
    await utils.existName({sql: "SELECT id FROM dict WHERE  type=?", name: obj.type,res,msg:"字典类型已存在！",req});
    pool.query(sql, [obj.name,obj.type,new Date(),obj.remark], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});
//查询字典
router.post("/getDict", async (req, res) => {
    let obj=req.body;
    let sql = `SELECT id,name,create_time AS createTime,remark,type FROM dict WHERE name LIKE "%${obj.name||''}%" LIMIT ?,?`;
    let {total}=await utils.getSum({name:"dict",where:`WHERE name LIKE "%${obj.name||''}%"`,res,req});
    let {page,size}=utils.pageSize(obj.page,obj.size);
    pool.query(sql, [page,size],(err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result,total}));
    });
});

//查询字典(不分页)
router.post("/getDictAll", async (req, res) => {
    let obj=req.body;
    let sql = `SELECT id,name,create_time AS createTime,remark,type FROM dict WHERE name LIKE "%${obj.name||''}%"`;
    pool.query(sql,(err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});

//修改字典
router.post("/upDict", async (req, res) => {
    let sql = "UPDATE  dict SET name=?,type=?,remark=? WHERE id=?", obj = req.body;
    let judgeUserNameRes = await utils.judgeUserName({sql:"SELECT type FROM dict WHERE  id=?",name:obj.type,id:obj.id,sqlName:"type"});
    if (judgeUserNameRes === 1) await utils.existName({sql: "SELECT id FROM dict WHERE  type=?", name: obj.type,res,msg:"字典类型已存在！",req});

    pool.query(sql, [obj.name, obj.type, obj.remark, obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});

//删除字典
router.post("/delDict", async (req, res) => {
    let sql = "DELETE FROM dict WHERE id=?", obj = req.body;
    pool.query(sql, [obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});

//添加字典项目
router.post("/addDictItem", async (req, res) => {
    let sql = "INSERT INTO dict_item(dict_id,dict_label,dict_value,dict_sort,dict_class,status,create_time,remark) VALUES (?,?,?,?,?,?,?,?)", obj = req.body;
    pool.query(sql, [obj.dictId,obj.dictLabel,obj.dictValue,obj.dictSort,obj.dictClass,obj.status,new Date(),obj.remark], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});

//查询字典项目
router.post("/getDictItem", async (req, res) => {
    let obj=req.body;
    let sql = `SELECT a.id AS id,dict_id AS dictId,dict_label AS dictLabel,dict_value AS dictValue,dict_sort AS dictSort,dict_class AS dictClass,status,a.create_time AS dictItemCreateTime,a.remark AS remark,type FROM dict_item AS a LEFT JOIN dict b ON a.dict_id=b.id WHERE dict_id=? ORDER BY dict_sort ASC`;
    pool.query(sql,[obj.dictId],(err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});

//修改字典项目
router.post("/upDictItem", async (req, res) => {
    let obj=req.body;
    let sql = `UPDATE  dict_item SET dict_label=?,dict_value=?,dict_sort=?,dict_class=?,status=?,remark=? WHERE id=?`;
    pool.query(sql,[obj.dictLabel,obj.dictValue,obj.dictSort,obj.dictClass,obj.status,obj.remark,obj.id],(err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});
//删除字典项目
router.post("/delDictItem", async (req, res) => {
    let sql = "DELETE FROM dict_item WHERE id=?", obj = req.body;
    pool.query(sql, [obj.id], (err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});

//根据类型查询字典项目
router.post("/getDictType", async (req, res) => {
    let obj=req.body;
    let sql = `SELECT a.id AS id,dict_label AS dictLabel,dict_value AS dictValue,dict_sort AS dictSort,dict_class AS dictClass,a.remark AS remark,type FROM dict_item AS a LEFT JOIN dict b ON a.dict_id=b.id WHERE b.type=? AND a.status=1 ORDER BY dict_sort ASC`;
    pool.query(sql,[obj.type],(err, result) => {
        if (err) return res.send(utils.returnData({code: -1,err,req}));
        res.send(utils.returnData({data: result}));
    });
});



module.exports = router;
