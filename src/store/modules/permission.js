import { asyncRoutes, constantRoutes } from '@/router'
/**
 * 检查是否有权限
 * @param  permissionList 权限列表
 * @param  route 路由
 */
function hasAuthorization(permissionList, route) {
  if (route.meta && route.meta.auth) {
    return permissionList.some(auth => {
      return route.meta.auth.some(routeAuth => {
        // console.log('检查是否有权限' + route.name + ';routeAuth:' + routeAuth + '; auth:' + auth)
        return routeAuth === auth
      })
    })
  } else {
    return false
  }
}

// function hasPermission(roles, route) {
//   if (route.meta && route.meta.roles) {
//     return roles.some(role => route.meta.roles.includes(role))
//   } else {
//     return true
//   }
// }

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param permissionList 权限列表
 */
export function filterAsyncRoutes(routes, permissionList) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasAuthorization(permissionList, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, permissionList)
      }
      res.push(tmp)
    }
  })
  return res
}

const state = {
  routes: [],
  addRoutes: [],
  fetchRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
    console.log('SET_ROUTES')
  },
  SET_FETCHROUTES: (state, routers) => {
    state.fetchRoutes = routers
  }
}

const actions = {
  generateRoutes({ commit }, authorizations) {
    return new Promise(resolve => {
      // let accessedRoutes
      // if (roles.includes('admin')) {
      //   accessedRoutes = asyncRoutes || []
      // } else {
      const accessedRoutes = filterAsyncRoutes(asyncRoutes, authorizations)
      console.log(accessedRoutes)
      // }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
