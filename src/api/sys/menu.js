import request from '@/utils/request'

export function getMenus(query) {
  return request({
    url: '/sys/menu/getMenus',
    method: 'get',
    params: query
  })
}

export function fetchNoAuthList(query) {
  return request({
    url: '/menu/getNoAuthMenus',
    method: 'get',
    params: query
  })
}

export function fetchAuthList(query) {
  return request({
    url: '/menu/getAuthMenus',
    method: 'get',
    params: query
  })
}

export function createMenu(data) {
  return request({
    url: '/sys/menu/save',
    method: 'post',
    data
  })
}

export function changeSort(rowId, value) {
  return request({
    url: '/sys/menu/' + rowId + '/changeSort',
    method: 'post',
    params: { sort: value }
  })
}

export function updateMenu(data) {
  return request({
    url: '/sys/menu/update',
    method: 'post',
    data
  })
}

export function deleteMenu(id) {
  return request({
    url: `/sys/menu/delete/${id}`,
    method: 'post'
  })
}

export function generateButton(data) {
  return request({
    url: '/sys/menu/' + data.menuId + '/generate/button',
    method: 'post',
    data
  })
}
