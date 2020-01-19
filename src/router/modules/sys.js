/** 当你的路由表太长时，你可以把它分成小模块 **/

import Layout from '@/layout'

const sysRouter = {
  path: '/sys',
  component: Layout,
  name: 'sys',
  meta: {
    title: '系统设置',
    icon: 'table',
    auth: ['sys']
  },
  children: [
    {
      path: '/sys/user',
      component: () => import('@/views/sys/user/index'),
      name: 'user',
      meta: {
        title: '用户管理',
        auth: ['sys:user'] // 可获访问的权限列表
      }
    },
    {
      path: '/sys/role',
      component: () => import('@/views/sys/role'),
      name: 'role',
      meta: {
        title: '角色管理',
        auth: ['sys:role']
      }
    },
    {
      path: 'menu',
      component: () => import('@/views/sys/menu'),
      name: 'menu',
      meta: {
        title: '菜单管理',
        auth: ['sys:menu']
      }
    },
    {
      path: 'organization',
      component: () => import('@/views/sys/organization'),
      name: '组织机构',
      meta: {
        title: '组织机构',
        auth: ['sys:organization']
      }
    }
  ]
}
export default sysRouter
