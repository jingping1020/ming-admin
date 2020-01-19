/** 当你的路由表太长时，你可以把它分成小模块 **/

import Layout from '@/layout'

const monitorRouter = {
  path: '/monitor',
  component: Layout,
  name: 'monitor',
  meta: {
    title: '系统监控',
    icon: 'table',
    auth: ['monitor']
  },
  children: [
    {
      path: '/task/schedule/job',
      component: () => import('@/views/monitor/schedule'),
      name: 'schedule',
      meta: {
        title: '任务列表',
        auth: ['monitor:task'] // 可获访问的权限列表
      }
    },
    {
      path: '/task/schedule/job',
      component: () => import('@/views/monitor/schedule'),
      name: 'schedule',
      meta: {
        title: '任务日志',
        auth: ['monitor:task'] // 可获访问的权限列表
      }
    }
  ]
}
export default monitorRouter
