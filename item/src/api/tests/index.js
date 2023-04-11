import request from "@/utils/axios";

export function addTests(data) {
	return request({
		path: "/tests/addTests",
        data
	});
}

export function getTests(data) {
	return request({
		path: "/tests/getTests",
        data
	});
}

export function upTests(data) {
	return request({
		path: "/tests/upTests",
        data
	});
}

export function delTests(data) {
	return request({
		path: "/tests/delTests",
        data
	});
}
//菜单权限接口测试
export function checkMenu(data) {
	return request({
		path: "/tests/checkMenu",
        data
	});
}

//角色权限接口测试
export function checkRole(data) {
	return request({
		path: "/tests/checkRole",
        data
	});
}
