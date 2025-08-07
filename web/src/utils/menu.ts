import { PageEnum } from '@/constants/page';
import { RouteRecordRaw } from 'vue-router';

/**
 * 递归组装菜单格式
 */
export function generatorMenu(routerMap: Array<RouteRecordRaw>) {
  return filterRouter(routerMap).map((item) => {
    const currentMenu = {
      ...item,
      ...item.meta,
      label: item.meta?.title,
      key: item.name,
      icon: item.meta?.icon,
    };
    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      currentMenu.children = generatorMenu(item.children);
    }

    return currentMenu;
  });
}

/**
 * 排除Router
 * */
export function filterRouter(routerMap: Array<RouteRecordRaw>) {
  return routerMap.filter((item) => {
    return (
      (item.meta?.hidden || false) != true &&
      !['/:path(.*)*', '/', PageEnum.REDIRECT, PageEnum.BASE_LOGIN].includes(item.path)
    );
  });
}

/**
 * 判断根路由 Router
 * */
export function isRootRouter(item) {
  return item.meta?.alwaysShow != true && item?.children?.filter((item) => !Boolean(item?.meta?.hidden))?.length === 1;
}

/**
 * 构造tree组件的树型结构数据
 */
export const handleTree = <T>(
  data: T[],
  idField = 'id',
  parentIdField = 'parentId',
  childrenField = 'children',
): T[] => {
  const childrenListMap: T[][] = [];
  // 按父节点排序节点以得到第一层node
  const nodeIds: T[] = [];
  const tree: T[] = [];

  data.forEach((d) => {
    const parentId = d[parentIdField];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[idField]] = d;
    childrenListMap[parentId].push(d);
  });

  data.forEach((item) => {
    // 确定树的第一层
    const parentId = item[parentIdField];
    if (nodeIds[parentId] == null) {
      tree.push(item);
    }
  });

  tree.forEach((item) => {
    adaptToChildrenList(item);
  });

  function adaptToChildrenList<T>(o: T) {
    if (childrenListMap[o[idField]] !== null) {
      o[childrenField] = childrenListMap[o[idField]];
    }
    if (o[childrenField]) {
      o[childrenField].forEach((item: T) => {
        adaptToChildrenList(item);
      });
    }
  }

  return tree;
};
