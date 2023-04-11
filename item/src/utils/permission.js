import store from '@/store'

/**
 * 菜单权限字符
 * @param {Array} value
 * @returns {Boolean}
 */
export function checkPermi(value=[]) {
  try {
    const hasPermission = value.some(permission => {
      return store.getters.getRole.includes(permission)
    });
    return hasPermission
  }catch (e) {
    return false
  }

}

/**
 * 角色权限字符
 * @param {Array} value
 * @param {Boolean} admin 总管理是否也要遵守
 * @returns {Boolean}
 */
export function checkRole(value=[],admin=false) {
  try {
    if(store.getters.getAdmin&&!admin) return true;
    const hasPermission = value.some(permission => {
      return store.getters.roles.includes(permission)
    });
    return hasPermission
  }catch (e) {
    return false
  }
}

