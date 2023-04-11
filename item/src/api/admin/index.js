import request from "@/utils/axios";

export function getRouter(data) {
	return request({
		path: "/admin/getRouter",
		data
	});
}
export function getRouterSystem(data) {
	return request({
		path: "/admin/getRouterSystem",
		data
	});
}
export function getUserInfo(data) {
	return request({
		path: "/admin/getUserInfo",
	});
}
export function getRoles(data) {
	return request({
		path: "/admin/getRoles",
		data
	});
}
export function getRolesAll(data) {
	return request({
		path: "/admin/getRolesAll",
		data
	});
}
export function addRoles(data) {
	return request({
		path: "/admin/addRoles",
		data,
	});
}
export function upRoles(data) {
	return request({
		path: "/admin/upRoles",
		data,
	});
}
export function delRoles(data) {
	return request({
		path: "/admin/delRoles",
		data,
	});
}

export function addMenu(data) {
	return request({
		path: "/admin/addMenu",
		data,
	});
}
export function changeMenu(data) {
	return request({
		path: "/admin/changeMenu",
		data,
	});
}
export function delMenu(data) {
	return request({
		path: "/admin/delMenu",
		data,
	});
}
export function getUser(data) {
	return request({
		path: "/admin/getUser",
		data,
	});
}

export function addUser(data) {
	return request({
		path: "/admin/addUser",
		data,
	});
}

export function upUser(data) {
	return request({
		path: "/admin/upUser",
		data,
	});
}
export function upUserPwd(data) {
	return request({
		path: "/admin/upUserPwd",
		data,
	});
}
export function delUser(data) {
	return request({
		path: "/admin/delUser",
		data,
	});
}
export function upTheme(data) {
	return request({
		path: "/admin/upTheme",
		data,
	});
}
export function login(data) {
	return request({
		path: "/admin/login",
		data,
	});
}

export function addMore(data) {
	return request({
		path: "/admin/addMore",
		data,
	});
}

export function getMore(data) {
	return request({
		path: "/admin/getMore",
		data,
	});
}
export function getMoreAll(data) {
	return request({
		path: "/admin/getMoreAll",
		data,
	});
}
export function upMore(data) {
	return request({
		path: "/admin/upMore",
		data,
	});
}
export function delMore(data) {
	return request({
		path: "/admin/delMore",
		data,
	});
}

export function addDict(data) {
	return request({
		path: "/admin/addDict",
		data,
	});
}

export function getDict(data) {
	return request({
		path: "/admin/getDict",
		data,
	});
}

export function upDict(data) {
	return request({
		path: "/admin/upDict",
		data,
	});
}

export function delDict(data) {
	return request({
		path: "/admin/delDict",
		data,
	});
}

export function getDictAll(data) {
	return request({
		path: "/admin/getDictAll",
		data,
	});
}

export function addDictItem(data) {
	return request({
		path: "/admin/addDictItem",
		data,
	});
}

export function getDictItem(data) {
	return request({
		path: "/admin/getDictItem",
		data,
	});
}

export function upDictItem(data) {
	return request({
		path: "/admin/upDictItem",
		data,
	});
}

export function delDictItem(data) {
	return request({
		path: "/admin/delDictItem",
		data,
	});
}
//根据类型查询字典
export function getDictType(type="") {
	return request({
		path: "/admin/getDictType",
		data:{type},
	});
}
