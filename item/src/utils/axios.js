// 1.引入vue
// import Vue from 'vue'
// 2.引入axios库
import requestAxios from "axios";
import router from "@/router/index";
import store from '@/store'//引入store(vuex)
import { Message } from "element-ui";
import { getToken, setToken, removeToken } from "@/utils/auth";

requestAxios.defaults.timeout = 5000; // 请求超时时间

requestAxios.interceptors.request.use(
  // 请求拦截
  (config) => {
    if (getToken()) config.headers.common["token"] = getToken();
    return config;
  },

  (err) => {
    return Promise.reject(err);
  }
);

requestAxios.interceptors.response.use(
  (response) => {
    // 相应拦截
    let { data } = response;
    if (data.code == -1) {
      Message.error(data.msg || "请求异常！");
      return Promise.reject(data);
    }
    if (data.code == 203) {
      Message.error(data.msg || "登陆失效！");
      removeToken();
      store.dispatch('user/logout');
      router.push("/login");
      return Promise.reject(data);
    }
    try {
      if (data.data.token) setToken(data.data.token);
    } catch (err) {

    }
    return response;
  },
  (err) => {
    Message.error("请求异常！！");
    return Promise.reject(err);
  }
);
// requestAxios.defaults.baseURL=""
const axios = function ({ path, method = "POST", data = {} } = {}) {
  return new Promise((resolve, reject) => {
    let datas = { params: { ...data } };
    if (method === "POST") datas = { ...{ data } };
    requestAxios({
      url:process.env.VUE_APP_BASE_API+path,
      method,
      ...datas,
    })
      .then((res) => {
          resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export default axios;
