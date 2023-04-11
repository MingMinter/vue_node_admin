import {  constantRoutes } from '@/router'
import Layout from '@/layout'
import parentView from '@/components/parentView'
import { getRouter } from '@/api/admin'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {

  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}
export const loadView = (view) => { // 路由懒加载
  return (resolve) => require([`@/views/${view}.vue`], resolve)
}
/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes) {
  //菜单   权限数组
  const menu = [],role=[];
  routes.forEach(route => {
    const tmp = { ...route };
    // 动态加载页面
    if (tmp.component !== '') {
      tmp.component = loadView(tmp.component);
    }
    // 动态加载左边主体菜单
    if (tmp.layout) {
      tmp.component = Layout
    }
    // 如果还需要套二级
    if (tmp.menuType==="M"&&tmp.parentId!=0) {
      tmp.component = parentView
    }
    if (tmp.children && tmp.children.length != 0) {
      let childrenRes=filterAsyncRoutes(tmp.children);
      tmp.children =childrenRes.menu;
      role.push(...childrenRes.role);
    }

    tmp.roleKey&&role.push(tmp.roleKey);
    menu.push(tmp)
  })

  return {
    menu,
    role
  }
}

const state = {
  routes: [],
  addRoutes: [],
  role:[]
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  SET_ROLE:(state,role)=>state.role=role
}

const actions = {
  async generateRoutes({ commit }) {
    const {data} = await getRouter();
    return new Promise(resolve => {
      let {menu,role} = filterAsyncRoutes(data.routerMenu);
      commit('SET_ROUTES', menu);
      commit('SET_ROLE', role);
      resolve(menu)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
