import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/routes',
    method: 'get'
  })
}

export function listAllRole() {
  return request({
    url: '/sys/role/listAll',
    method: 'get'
  })
}

export function listRole(data) {
  return request({
    url: '/sys/role/list',
    method: 'post',
    data
  })
}

export function getRoles() {
  return request({
    url: '/roles',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/sys/role/save',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: `/sys/role/update/${data.id}`,
    method: 'post',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/sys/role/delete/${id}`,
    method: 'post'
  })
}

export function getRoleMenuId(roleId) {
  return request({
    url: `/sys/menu/ids/${roleId}`,
    method: 'get'
  })
}

export function getVueTreeMenu() {
  return request({
    url: '/sys/menu/getVueTreeMenu',
    method: 'get'
  })
}

/**
 * 设置权限
 * @param roleId
 */
export function setMenu(data) {
  return request({
    url: '/sys/role/setMenu',
    method: 'post',
    params: data
  })
}
