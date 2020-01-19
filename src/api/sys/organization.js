import request from '@/utils/request'

export function listOrganization(query) {
  return request({
    url: '/sys/organization/list',
    method: 'get',
    params: query
  })
}

export function createOrganization(data) {
  return request({
    url: '/sys/organization/save',
    method: 'post',
    data
  })
}

export function updateOrganization(data) {
  return request({
    url: '/sys/organization/update',
    method: 'post',
    data
  })
}

export function deleteOrganization(id) {
  return request({
    url: `/sys/organization/delete/${id}`,
    method: 'post'
  })
}

export function changeSort(rowId, value) {
  return request({
    url: '/sys/organization/changeSort/' + rowId,
    method: 'post',
    params: { id: rowId, sort: value }
  })
}
