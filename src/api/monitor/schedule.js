import request from '@/utils/request'

export function listSchedule(data) {
  return request({
    url: '/task/schedule/job/list',
    method: 'post',
    data
  })
}

export function getSchedule(id) {
  return request({
    url: `/task/schedule/job/detail/${id}`,
    method: 'get'
  })
}

export function createSchedule(data) {
  return request({
    url: '/task/schedule/job/add',
    method: 'post',
    data
  })
}

export function updateSchedule(data) {
  return request({
    url: '/task/schedule/job/update',
    method: 'post',
    data
  })
}

export function deleteSchedule(id) {
  return request({
    url: `/task/schedule/job/delete/${id}`,
    method: 'post'
  })
}

export function batchDeleteSchedule(ids) {
  return request({
    url: '/task/schedule/job/batch/delete',
    method: 'post',
    params: { ids }
  })
}

export function refreshTask(id) {
  return request({
    url: '/task/schedule/job/refreshJob',
    method: 'post'
  })
}

export function refreshSchedule(id) {
  return request({
    url: `/task/schedule/job/updateCron/${id}`,
    method: 'post'
  })
}

export function changeJobStatus(id, cmd) {
  return request({
    url: `/task/schedule/job/changeJobStatus/${id}`,
    method: 'post',
    params: { cmd: cmd }
  })
}

