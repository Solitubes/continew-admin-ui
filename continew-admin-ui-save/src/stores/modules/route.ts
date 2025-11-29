import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import { mapTree, toTreeArray } from 'xe-utils'
import { cloneDeep, omit } from 'lodash-es'
import { constantRoutes, systemRoutes } from '@/router/route'
import { type RouteItem, getUserRoute } from '@/apis'
import { transformPathToName } from '@/utils'
import { asyncRouteModules } from '@/router/asyncModules'
import { useUserStore, type ViewMode } from './user'

const layoutComponentMap = {
  Layout: () => import('@/layout/index.vue'),
  ParentView: () => import('@/components/ParentView/index.vue'),
}

/** 将component由字符串转成真正的模块 */
const transformComponentView = (component: string) => {
  return layoutComponentMap[component as keyof typeof layoutComponentMap] || asyncRouteModules[component]
}

/**
 * @description 前端来做排序、格式化
 * @params {menus} 后端返回的路由数据，已经根据当前用户角色过滤掉了没权限的路由
 * 1. 对后端返回的路由数据进行排序，格式化
 * 2. 同时将component由字符串转成真正的模块
 */
const formatAsyncRoutes = (menus: RouteItem[]) => {
  if (!menus.length) return []

  const pathMap = new Map()
  return mapTree(menus, (item) => {
    pathMap.set(item.id, item.path)

    if (item.children?.length) {
      item.children.sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0))
    }

    // 部分子菜单，例如：通知公告新增、查看详情，需要选中其父菜单
    if (item.parentId && item.type === 2 && item.permission) {
      item.activeMenu = pathMap.get(item.parentId)
    }

    return {
      path: item.path,
      name: item.name ?? transformPathToName(item.path),
      component: transformComponentView(item.component),
      redirect: item.redirect,
      meta: {
        title: item.title,
        hidden: item.isHidden,
        keepAlive: item.isCache,
        icon: item.icon,
        showInTabs: item.showInTabs,
        activeMenu: item.activeMenu,
      },
    }
  }) as unknown as RouteRecordRaw[]
}

/** 判断路由层级是否大于 2 */
export const isMultipleRoute = (route: RouteRecordRaw) => {
  return route.children?.some((child) => child.children?.length) ?? false
}

/** 路由降级（把三级及其以上的路由转化为二级路由） */
export const flatMultiLevelRoutes = (routes: RouteRecordRaw[]) => {
  return cloneDeep(routes).map((route) => {
    if (!isMultipleRoute(route)) return route

    return {
      ...route,
      children: toTreeArray(route.children).map((item) => omit(item, 'children')) as RouteRecordRaw[],
    }
  })
}

/** 根据视图模式过滤路由 */
const filterRoutesByViewMode = (routes: RouteRecordRaw[], viewMode: ViewMode): RouteRecordRaw[] => {
  return routes.filter((route) => {
    const routeViewMode = route.meta?.viewMode
    // 没有设置 viewMode 或设置为 all 的路由，两种模式都可访问
    if (!routeViewMode || routeViewMode === 'all') {
      // 递归过滤子路由
      if (route.children?.length) {
        route.children = filterRoutesByViewMode(route.children, viewMode)
      }
      return true
    }
    // 只有匹配当前视图模式的路由才显示
    if (routeViewMode === viewMode) {
      if (route.children?.length) {
        route.children = filterRoutesByViewMode(route.children, viewMode)
      }
      return true
    }
    return false
  })
}

const storeSetup = () => {
  // 所有路由(常驻路由 + 动态路由)
  const routes = ref<RouteRecordRaw[]>([])
  // 动态路由(异步路由)
  const asyncRoutes = ref<RouteRecordRaw[]>([])

  // 合并路由
  const setRoutes = (data: RouteRecordRaw[], viewMode: ViewMode) => {
    // 根据视图模式过滤系统路由
    const filteredSystemRoutes = filterRoutesByViewMode(cloneDeep(systemRoutes), viewMode)
    // 用户视图下，动态路由（后台管理菜单）不显示
    const filteredAsyncRoutes = viewMode === 'user' ? [] : data
    // 合并路由并排序
    routes.value = [...constantRoutes, ...filteredSystemRoutes].concat(filteredAsyncRoutes)
      .sort((a, b) => (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0))
    asyncRoutes.value = filteredAsyncRoutes
  }

  // 生成路由
  const generateRoutes = async (): Promise<RouteRecordRaw[]> => {
    const userStore = useUserStore()
    const viewMode = userStore.viewMode
    const { data } = await getUserRoute()
    const formattedAsyncRoutes = formatAsyncRoutes(data)
    // 用户视图下不加载动态路由
    const routesToAdd = viewMode === 'user' ? [] : formattedAsyncRoutes
    const flatRoutes = flatMultiLevelRoutes(cloneDeep(routesToAdd))
    setRoutes(formattedAsyncRoutes, viewMode)
    return flatRoutes
  }

  return {
    routes,
    asyncRoutes,
    generateRoutes,
  }
}

export const useRouteStore = defineStore('route', storeSetup, { persist: true })
