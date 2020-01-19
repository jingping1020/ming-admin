
import request from '@/utils/request'

export function listUser(data) {
  return request({
    url: '/sys/user/list',
    method: 'post',
    data
  })
}

export function getUser() {
  return request({
    url: '/sys/user/detail',
    method: 'get'
  })
}

export function createUser(data) {
  return request({
    url: '/sys/user/save',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/sys/user/update',
    method: 'post',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/sys/user/' + id + '/delete',
    method: 'post'
  })
}

export function modifyPassword(data) {
  return request({
    url: '/sys/user/' + data.id + '/changePassword',
    method: 'post',
    params: data
  })
}

export function exportUser(data) {
  return request({
    url: '/sys/user/export',
    method: 'post',
    data
  })
}

export function myUpdateUser(data) {
  return request({
    url: '/sys/user/my/update',
    method: 'post',
    data
  })
}

export function myUpdateChangePassword(data) {
  return request({
    url: '/sys/user/my/changePassword',
    method: 'post',
    data
  })
}
