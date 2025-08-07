<script lang="ts" setup>
  import { computed } from 'vue';
  import { useUserStore } from '@/store/modules/user';
  import defaultAvatar from '@/assets/images/avatar.jpg';
  import logo from '@/assets/images/logo.png';

  interface Props {
    /** 是否为AI头像 */
    isAi?: boolean;
    /** 头像大小 */
    size?: string;
    /** 头像形状 */
    shape?: 'circle' | 'round' | 'square';
  }

  const props = withDefaults(defineProps<Props>(), {
    isAi: false,
    size: 'medium',
    shape: 'circle',
  });

  const userStore = useUserStore();

  /** 计算头像地址 */
  const avatarSrc = computed(() => {
    if (props.isAi) return logo;
    return userStore.userInfo?.avatar || defaultAvatar;
  });
</script>

<template>
  <t-avatar :image="avatarSrc" :size="size" :shape="shape" />
</template>
