import {getToken, setToken, removeToken} from '@/utils/auth';
import router, {resetRouter} from '@/router';
import {getUserInfo} from "@/api/admin";

const state = {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],//角色权限
    admin:false//总管理员判断
};
const mutations = {
    SET_TOKEN: (state, token) => {
        state.token = token;
    },
    SET_INTRODUCTION: (state, introduction) => {
        state.introduction = introduction;
    },
    SET_NAME: (state, name) => {
        state.name = name;
    },
    SET_AVATAR: (state, avatar) => {
        state.avatar = avatar;
    },
    SET_ROLES: (state, roles) => {
        state.roles = roles;
    },
    SET_ADMIN: (state, admin) => {
        state.admin = admin;
    },
};
function setTheme(name,val){
    document.getElementsByTagName('body')[0].style.setProperty(name,val);
};
const actions = {
    // user login
    login({commit}, userInfo) {
        const {username, password} = userInfo;
        return new Promise((resolve, reject) => {
            const {data} = response;
            commit('SET_TOKEN', data.token);
            setToken(data.token);
            resolve();
        });
    },
    // get user info
    async getInfo({commit,dispatch}) {
        let {data:user}=await getUserInfo();
        commit('SET_ROLES', user.roleKey);
        commit('SET_NAME', user.user.name);
        commit('SET_ADMIN', !!user.user.admin||!!user.roleAdmin);
        commit('SET_AVATAR', "http://ordermobile.yknba.cn/img/bg.2fa5cb09.jpg");
        try {
            //处理主题
            let {menuBg,menuHoverBg,menuActiveText,menuSubActiveText,menuSubBg,menuText}=user.theme;
            setTheme("--menuBg-color",menuBg);setTheme("--menuSubBg-color",menuSubBg);setTheme("--menuText-color",menuText);setTheme("--menuActiveText-color",menuActiveText);setTheme("--menuSubActiveText-color",menuSubActiveText);setTheme("--menuHoverBg-color",menuHoverBg);
            this.dispatch('settings/changeSetting', {
                key: 'theme',
                value: menuBg
            });
        }catch (e) {

        }
        return user;
    },
    // user logout
    logout({commit, state, dispatch}) {
        return new Promise((resolve, reject) => {
            commit('SET_TOKEN', '');
            commit('SET_ROLES', []);
            removeToken();
            resetRouter();
            // reset visited views and cached views
            // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
            dispatch('tagsView/delAllViews', null, {root: true});
            resolve();
        });
    },
    // remove token
    resetToken({commit}) {
        return new Promise((resolve) => {
            commit('SET_TOKEN', '');
            commit('SET_ROLES', []);
            removeToken();
            resolve();
        });
    },
    // dynamically modify permissions
    async changeRoles({commit, dispatch}, role) {
        const token = role + '-token';
        commit('SET_TOKEN', token);
        setToken(token);
        await dispatch('getInfo');
        resetRouter();
        // generate accessible routes map based on roles
        const accessRoutes = await dispatch('permission/generateRoutes');
        // dynamically add accessible routes
        router.addRoutes(accessRoutes);
        // reset visited views and cached views
        dispatch('tagsView/delAllViews', null, {root: true});
    },
};
export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
