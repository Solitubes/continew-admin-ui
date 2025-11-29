import type { RouteRecordRaw } from 'vue-router'

/** 默认布局 */
const Layout = () => import('@/layout/index.vue')

/** 扩展路由元信息，支持视图模式 */
declare module 'vue-router' {
  interface RouteMeta {
    /** 允许访问的视图模式：user-仅用户视图，admin-仅管理员视图，不设置则都可访问 */
    viewMode?: 'user' | 'admin' | 'all'
  }
}

/** 系统路由 */
export const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true },
  },
  // 用户视图首页
  {
    path: '/user-home',
    name: 'UserHome',
    component: Layout,
    redirect: '/user-home/index',
    meta: { title: '首页', icon: 'home', hidden: false, viewMode: 'user' },
    children: [
      {
        path: '/user-home/index',
        name: 'UserHomeIndex',
        component: () => import('@/views/user-home/index.vue'),
        meta: { title: '首页', icon: 'home', hidden: false, affix: true, viewMode: 'user' },
      },
    ],
  },
  // 管理员视图仪表盘
  {
    path: '/',
    name: 'Dashboard',
    component: Layout,
    redirect: '/dashboard/workplace',
    meta: { title: '仪表盘', icon: 'dashboard', hidden: false, viewMode: 'admin' },
    children: [
      {
        path: '/dashboard/workplace',
        name: 'Workplace',
        component: () => import('@/views/dashboard/workplace/index.vue'),
        meta: { title: '工作台', icon: 'desktop', hidden: false, affix: true, viewMode: 'admin' },
      },
      {
        path: '/dashboard/analysis',
        name: 'Analysis',
        component: () => import('@/views/dashboard/analysis/index.vue'),
        meta: { title: '分析页', icon: 'insert-chart', hidden: false, viewMode: 'admin' },
      },
    ],
  },
  {
    path: '/social/callback',
    component: () => import('@/views/login/social/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/pwdExpired',
    component: () => import('@/views/login/pwdExpired/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/user',
    name: 'User',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: '/user/profile',
        name: 'UserProfile',
        component: () => import('@/views/user/profile/index.vue'),
        meta: { title: '个人中心', showInTabs: false },
      },
      {
        path: '/user/message',
        name: 'UserMessage',
        component: () => import('@/views/user/message/index.vue'),
        meta: { title: '消息中心', showInTabs: false },
      },
      {
        path: '/user/notice',
        name: 'UserNotice',
        component: () => import('@/views/user/message/components/view/index.vue'),
        meta: { title: '查看公告' },
      },
    ],
  },
  // 模型训练平台
  {
    path: '/training',
    name: 'Training',
    component: Layout,
    redirect: '/training/task',
    meta: { title: '模型训练', icon: 'robot', hidden: false, sort: 50 },
    children: [
      {
        path: '/training/task',
        name: 'TrainingTask',
        component: () => import('@/views/training/task/index.vue'),
        meta: { title: '训练任务', icon: 'thunderbolt', hidden: false },
      },
      {
        path: '/training/dataset',
        name: 'TrainingDataset',
        component: () => import('@/views/training/dataset/index.vue'),
        meta: { title: '数据集管理', icon: 'storage', hidden: false },
      },
      {
        path: '/training/log',
        name: 'TrainingLog',
        component: () => import('@/views/training/log/index.vue'),
        meta: { title: '训练日志', icon: 'file', hidden: true },
      },
    ],
  },
  {
    path: '/about',
    name: 'About',
    component: Layout,
    meta: { title: '关于项目', icon: 'apps', hidden: false, sort: 999, viewMode: 'admin' },
    redirect: '/about/document/api',
    children: [
      {
        path: '/about/document/api',
        component: () => import('@/views/about/document/api/index.vue'),
        meta: { title: '接口文档', icon: 'swagger', hidden: false, keepAlive: true, viewMode: 'admin' },
      },
      {
        path: '/about/document/changelog',
        component: () => import('@/views/about/document/changelog/index.vue'),
        meta: { title: '更新日志', icon: 'continew', hidden: false, keepAlive: true, viewMode: 'admin' },
      },
      {
        path: 'https://arco.design/vue/component/button',
        meta: { title: 'Arco Design文档', icon: 'arco', hidden: false, viewMode: 'admin' },
      },
      {
        path: '/about/source',
        name: 'AboutSource',
        meta: { title: '开源地址', icon: 'github', hidden: false, viewMode: 'admin' },
        children: [
          {
            path: 'https://gitee.com/continew/continew-admin',
            meta: { title: 'Gitee', icon: 'gitee', hidden: false },
          },
          {
            path: 'https://gitcode.com/continew/continew-admin',
            meta: { title: 'GitCode', icon: 'gitcode', hidden: false },
          },
          {
            path: 'https://github.com/continew-org/continew-admin',
            meta: { title: 'GitHub', icon: 'github', hidden: false },
          },
        ],
      },
    ],
  },
]

// 固定路由（默认路由）
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/default/redirect/index.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/default/error/404.vue'),
    meta: { hidden: true },
  },
  {
    path: '/403',
    component: () => import('@/views/default/error/403.vue'),
    meta: { hidden: true },
  },
]
