<template>
    <t-layout class="h-screen bg-gray-50 flex flex-col">
      <!-- 整体布局 -->
      <div class="flex flex-1 overflow-hidden">
        <!-- 左侧导航 -->
        <t-aside class="w-60 bg-white shadow-sm flex flex-col border-r border-gray-100">
          <!-- Logo区域 -->
          <div class="h-16 flex items-center px-6 border-b border-gray-100">
            <div class="text-xl font-bold text-blue-600">Logo</div>
          </div>
          
          <!-- 主菜单 -->
          <t-menu theme="light" class="flex-1 py-2" :value="activeMenu">
            <t-menu-item name="workspace" class="hover:bg-gray-50">
              <template #icon>
                <t-icon name="app" class="text-gray-500" />
              </template>
              <span>工作空间</span>
            </t-menu-item>
            <t-menu-item name="shop" class="hover:bg-gray-50">
              <template #icon>
                <t-icon name="shop" class="text-gray-500" />
              </template>
              <span>商店</span>
            </t-menu-item>
            <t-menu-item name="template" class="hover:bg-gray-50">
              <template #icon>
                <t-icon name="file" class="text-gray-500" />
              </template>
              <span>模板</span>
            </t-menu-item>
            <t-menu-item name="api" class="hover:bg-gray-50">
              <template #icon>
                <t-icon name="api" class="text-gray-500" />
              </template>
              <span>扣子 API</span>
            </t-menu-item>
          </t-menu>
          
          <!-- 底部图标区域 -->
          <div class="p-4 border-t border-gray-100 flex justify-between">
            <div class="relative">
              <t-button shape="circle" variant="text" class="text-gray-500 hover:bg-gray-100">
                <t-icon name="notification" class="text-lg" />
              </t-button>
              <span class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                488
              </span>
            </div>
            <t-button shape="circle" variant="text" class="text-gray-500 hover:bg-gray-100">
              <t-icon name="star" class="text-lg" />
            </t-button>
          </div>
        </t-aside>
        
        <!-- 右侧内容 -->
        <t-layout class="flex-1 flex flex-col">
          <!-- 顶部Header -->
          <t-header class="bg-white shadow-sm p-0">
            <div class="px-6 py-4">
              <div class="flex items-center mb-2">
                <h1 class="text-xl font-semibold text-gray-800 mr-2">个人空间</h1>
                <t-button variant="text" class="text-blue-500 hover:bg-blue-50 p-1">
                  <t-icon name="add" class="text-xl" />
                </t-button>
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <span>项目开发</span>
                <t-divider layout="vertical" class="mx-3" />
                <span>当前项目</span>
              </div>
            </div>
          </t-header>
          
          <!-- 内容区域 -->
          <t-content class="p-6 flex-1 overflow-auto">
            <div class="max-w-5xl mx-auto flex flex-col">
              <!-- 子菜单导航 -->
              <div class="bg-white rounded-lg shadow mb-6 overflow-hidden">
                <t-menu expand-type="popup" theme="light">
                  <t-submenu title="项目开发" value="projects">
                    <t-menu-item value="resources">资源库</t-menu-item>
                    <t-menu-item value="release">发布管理</t-menu-item>
                    <t-menu-item value="model">模型管理</t-menu-item>
                    <t-menu-item value="evaluation">效果评测</t-menu-item>
                  </t-submenu>
                </t-menu>
              </div>
              
              <!-- 收藏区域 -->
              <div class="bg-white rounded-lg shadow flex flex-col items-center justify-center py-16">
                <div class="mb-4">
                  <t-icon name="star-filled" class="text-yellow-400 text-3xl" />
                </div>
                <h3 class="text-gray-800 font-medium text-lg mb-2">还没有收藏任何内容</h3>
                <p class="text-gray-500 text-sm">
                  点击 <t-button variant="text" class="text-blue-500 p-1">+</t-button> 按钮可将内容添加到这里～
                </p>
              </div>
            </div>
          </t-content>
        </t-layout>
      </div>
    </t-layout>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import {
    Layout, Menu, Icon, Button, Badge, Divider 
  } from 'tdesign-vue-next';
  
  export default defineComponent({
    name: 'WorkspaceView',
    components: {
      TLayout: Layout,
      TAside: Layout.Aside,
      THeader: Layout.Header,
      TContent: Layout.Content,
      TMenu: Menu,
      TMenuItem: Menu.Item,
      TSubmenu: Menu.Submenu,
      TIcon: Icon,
      TButton: Button,
      TBadge: Badge,
      TDivider: Divider,
    },
    data() {
      return {
        activeMenu: 'workspace'
      };
    }
  });
  </script>
  
  <style>
  /* 覆盖默认样式以适配Tailwind */
  .t-menu__item {
    padding: 0.75rem 1.5rem;
  }
  
  .t-submenu__title {
    padding: 0.75rem 1.5rem;
  }
  
  .t-menu__operations {
    display: none;
  }
  </style>