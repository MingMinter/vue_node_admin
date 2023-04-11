## 一、项目预览地址

- #### 		vue+node后台管理预览地址：<a href="http://vuenode.yknba.cn/" target="_blank">点击进入效果预览</a>

-    默认账号：admin

-    默认密码：666666




## 二、交流群、问题解答入口

- #### 	<a href="https://gitee.com/MMinter/vue_node_wiki/wikis/vue+node交流群" target="_blank">点击加入 问题解答交流社区</a>

## 三、项目启动



- ### 		前端页面启动

1. ##### #克隆项目

   ```
   git clone https://gitee.com/y_project/RuoYi-Vue
   ```

2. ##### #进入目录

   ```
   cd item
   ```

3. ##### #安装依赖（建议使用node版本16以下  10以上）

   ```
   npm install
   ```

4. ##### #启动项目

   ```
   npm run dev
   ```




- ### 		数据库导入

1. ##### 				#创建数据库  

   1. 创建数据库 名：**vue_admin**
   2. 基字符集 选：默认（default） 或者 utf8
   3. 排序规则 选：默认（default） 或者 utf8_general_ci

2. ##### #导入数据库

   1. 将APP/数据库 文件夹的vue_admin.sql导入新建的vue_admin库中。

3. ##### #数据库配置信息

   ```
   //配置文件在APP/poo.js 中，请根据自身环境配置
   const pool=mysql.createPool({
   	host:"127.0.0.1",
   	port:3306,//端口
   	user:"root",//账户名
   	password:"root",//登录密码
   	database:"vue_admin",//数据库名称
   	connectionLimit:15
   });
   ```





- ### 		后端服务启动


1. ##### 				#克隆项目（如果已经执行了前端页面启动的克隆，可略过这点）

   ```
   git clone https://gitee.com/y_project/RuoYi-Vue
   ```

2. #####  #进入目录

   ```
   cd APP
   ```

3. ##### #安装依赖

   ```
   npm install
   ```

4. ##### #启动服务

   ```
   npm run dev
   ```





## 四、功能简明

- #### 		前端功能 (<a href="https://gitee.com/MMinter/vue_node_wiki/wikis/前端功能详解" target="_blank">点击进入前端功能详细文档</a>)

  > - [x] 
  >   	​			***动态路由***	
  > - [x] ​			***菜单管理***
  > - [x] ​			***用户管理***
  > - [x] ​			***角色管理***
  > - [x] ​			***多账号管理***
  > - [x] ​			***字典管理***
  > - [x] ​			***主题自定义***	
  > - [x] ​			***菜单权限***
  > - [x] ​			***角色权限***



- #### 		后端功能 (<a href="https://gitee.com/MMinter/vue_node_wiki/wikis/后端管理详解" target="_blank">点击进入后端功能详细文档</a>)

  > - [x] 
  >   	​			***jsonwebtoken（token）***
  > - [x] ​			***菜单权限拦截***
  > - [x] ​			***角色权限拦截***
  > - [x] ​			***错误日志log`***

  

## 五、效果截图

| ![登录](https://foruda.gitee.com/images/1681197680240561436/dfbf1881_8986810.png "登录.png") | ![角色管理](https://foruda.gitee.com/images/1681197773630264222/4ec415e3_8986810.png "角色管理.png") |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| ![菜单管理](https://foruda.gitee.com/images/1681197808163981644/96f27575_8986810.png "菜单管理.png") | ![菜单修改](https://foruda.gitee.com/images/1681197825348384952/281da67c_8986810.png "菜单修改.png") |
| ![用户管理](https://foruda.gitee.com/images/1681197937191145993/c434e92e_8986810.png "用户管理.png") | ![字典管理](https://foruda.gitee.com/images/1681197948454663203/788cbd7e_8986810.png "字典管理.png") |