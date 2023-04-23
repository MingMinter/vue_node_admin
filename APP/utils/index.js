const jwt = require("jsonwebtoken");
const pool = require("../pool.js");
const {errLog}=require("../utils/err");//日志记录
module.exports = {
    setToken({uid}) {
        let token = jwt.sign({uid}, "user", {
            expiresIn: "86400s", // 授权时间
        });
        return token;
    },
    verToken(token) {
        try {
            let res = jwt.verify(token, "user");
            return res;
        } catch (err) {
            return false;
        }
    },
    /**
     * 判断名称是否重复
     * @param string sql sql语句
     * @param string name sql查询参数name
     * @param string msg 提示语
     * @param object req 请求主体
     * @param object res 响应主体
     * */
    existName({sql, name,msg="名称已存在！",req,res}) {
        return new Promise((resolve, reject) => {
            if(!name) return resolve(true);
            pool.query(sql, [name], (err, result) => {
                if (err) return res.send(this.returnData({code:-1,msg,err,req}))
                if (result.length > 0) return res.send(this.returnData({code:-1,msg,err,req}))
                resolve(true);
            })
        })
    },
    /**
     * 判断修改的名称是否和修改前的一样
     * @param string sql sql语句
     * @param string sqlName 修改前的属性名
     * @param string name 修改后的值
     * @param number id sql条件参数
     * */
    judgeUserName({sql,sqlName="name", name,id}) {
        return new Promise((resolve, reject) => {
            // let sql = "SELECT name FROM user WHERE  id=?";
            pool.query(sql, [id], (err, result) => {
                if (err) return resolve(1);
                if (result[0][sqlName] == name) return resolve(-1);
                return resolve(1);
            })
        })
    },
    /**
     * 响应总函数
     * @param number code 状态码
     * @param string msg 提示文字
     * @param number total 查询总数量
     * @param object data 数据
     * @param object err 错误信息
     * @param object req 错误信息
     * @param object funName 错误信息记录名称
     * */
    returnData({code = 1, msg, total=0,data = {},err,req={},funName} = {}) {
        if (code == 1 && !msg) msg = "请求成功！";
        if (code == -1 && !msg) msg = "服务器异常！";
        if (code == 203 && !msg) msg = "登陆失效，请重新登陆！";
        let res={code, msg, data};
        if(total!==0) res.total=total;
        if(err) res.err=err;
        //记录错误日志
        if(code!=1) errLog({err,code,msg,req,funName});
        return res;
    },
    /**
     * 获取用户信息
     * @param object req 请求主体
     * @param object res 响应主体
     * */
    getUserInfo(req, res) {
        return new Promise(resolve => {
            let token = req.headers.token;
            if (!token) return res.send(this.returnData({code: 203,req}));
            let user = this.verToken(token);
            if (!user) return res.send(this.returnData({code: 203,req}));
            let sql = "SELECT id,name,status,roles_id AS rolesId,admin,more_id AS moreId FROM user WHERE id=?";
            pool.query(sql, [user.uid], (err, result) => {
                if (err) return res.send(this.returnData({code: -1, msg: "服务端用户信息获取错误！",err,req}));
                if (result.length === 0) return res.send(this.returnData({code: -1, msg: "用户不存在！",err,req}));
                resolve(result[0]);
            })
        })
    },
    /**
     * 分页页码处理
     * @param number page 页码
     * @param number size 最大数量
     * */
    pageSize(page,size){
        if(!page){page=1};
        if(!size){size=10};
        page = (page-1)*size;
        size = parseInt(size);
        return {page,size}
    },
    /**
     * 查询总数
     * @param string name 表名
     * @param string where 查询条件
     * @param object res 主体
    * */
    getSum({name,where,res,req}) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT count(1) FROM ${name} ${where}`;
            pool.query(sql, (err, result) => {
                if (err) return res.send(this.returnData({code: -1, msg: "获取数据总数错误！",err,req}));
                resolve({ total: result[0]["count(1)"] });
            });
        })
    },
    /**
     * 获取用户权限
     * @param object req 请求主体
     * @param object res 响应主体
     * */
    getUserRole(req, res) {
        return new Promise(async (resolve, reject) => {
            let user = await this.getUserInfo(req, res);
            let userSql = "SELECT roles,role_key FROM roles WHERE FIND_IN_SET(id,?)";
            pool.query(userSql, [user.rolesId], (err, result) => {
                if (err || result.length == 0) return res.send(this.returnData({code:-1,msg:"获取权限失败！",err,req}))
                let roles = result.map(t => t.roles);
                //权限字符
                let roleKey=result.map(t=>t.role_key);
                //角色权限
                let roleAdmin=roleKey.some(t=>t==="admin");
                resolve({userRole: roles.join(","),roleKey,user,roleAdmin});
            });
        });
    },
    /**
     * 菜单字符权限拦截
     * @param object req 主体
     * @param object res 主体
     * @param array role 接口权限字符数组
     * @param boolean admin 是否管理员也要遵守（默认否）
     * */
    checkPermi({req,res,role=[],admin=false}){
        return new Promise(async (resolve, reject)=>{
            let userRole=await this.getUserRole(req,res);
            if((userRole.roleAdmin|| userRole.user.admin===1)&&!admin) return resolve(true);
            let sql = "SELECT role_key AS roleKey FROM router_menu WHERE FIND_IN_SET(id,?)";
            pool.query(sql,[userRole.userRole],(err,result)=>{
                try {
                    if(err) return res.send(this.returnData({code:-1,msg:"菜单权限判断错误！",err,req}))
                    let roleKeyArr=result.map(t=>t.roleKey).filter(t=>t);
                    const hasPermission = role.some(permission => {
                        return roleKeyArr.includes(permission)
                    });
                    if(hasPermission) return resolve(hasPermission);
                    res.send(this.returnData({code:-1,msg:"暂无对应菜单请求权限！",err,req}))
                }catch (e) {
                    res.send(this.returnData({code:-1,msg:"菜单权限判断错误！！",err:e,req}))
                }
            })
        })
    },
    /**
     * 角色权限拦截
     * @param object req 主体
     * @param object res 主体
     * @param array role 角色权限数组
     * @param boolean admin 是否管理员也要遵守（默认否）
     * */
    async checkRole({req,res,role=[],admin=false}){
        try {
            let userRole=await this.getUserRole(req,res);
            if((userRole.roleAdmin|| userRole.user.admin===1)&&!admin) return true;
            let roleKeyArr=userRole.roleKey;
            const hasPermission = role.some(permission => {
                return roleKeyArr.includes(permission)
            });
            if(hasPermission) return true;
            res.send(this.returnData({code:-1,msg:"暂无对应角色请求权限！",req}))
            return Promise.reject(false);
        }catch (e) {
            res.send(this.returnData({code:-1,msg:"角色权限判断错误！",err:e,req}))
            return Promise.reject(false);
        }

    },
    /**
     * 是否操作的是用户总管理员
     * @param object req 请求主体
     * @param object res 响应主体
     * @param number id 查询条件id
     * */
    upAdmin({req,res,id}){
        return new Promise((resolve, reject)=>{
            let sql = "SELECT admin FROM user WHERE id=?";
            pool.query(sql,[id],(err,result)=>{
                if(err||result.length===0) return res.send(this.returnData({code:-1,msg:"管理信息判断错误！",err,req}));
                if(result[0].admin===1) return res.send(this.returnData({code:-1,msg:"无法对《总管理》执行此操作！",err,req}));
                resolve(result);
            })
        })

    },
    /**
     * 是否操作的是角色总管理员
     * @param object req 请求主体
     * @param object res 响应主体
     * @param number id 查询条件id
     * */
    upAdminRole({req,res,id}){
        return new Promise((resolve, reject)=>{
            let sql = "SELECT role_key FROM roles WHERE id=?";
            pool.query(sql,[id],(err,result)=>{
                if(err||result.length===0) return res.send(this.returnData({code:-1,msg:"管理信息判断错误！！",err,req}));
                if(result[0].role_key==="admin") return res.send(this.returnData({code:-1,msg:"无法对《角色总管理》执行此操作！",err,req}));
                resolve(result);
            })
        })

    },
    /**
     * 通过id获取用户信息
     * @param object req 请求主体
     * @param object res 响应主体
     * @param number id 查询条件id
     * */
    getUserId({req,res,id}){
        return new Promise((resolve, reject)=>{
            let sql = "SELECT admin FROM user WHERE id=?";
            pool.query(sql,[id],(err,result)=>{
                if(err||result.length===0) return res.send(this.returnData({code:-1,msg:"用户信息错误！！",err,req}));
                resolve(result[0]);
            })
        })

    }
};
