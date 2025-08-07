<script setup lang="tsx">
  import { onBeforeMount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Empty } from 'tdesign-vue-next';

  const route = useRoute();
  const router = useRouter();
  onBeforeMount(() => {
    const { params, query } = route;
    const { path } = params;
    router.replace({
      path: '/' + (Array.isArray(path) ? path.join('/') : path),
      query,
    });
  });
  const App = () => {
    return <Empty />;
  };
</script>

<template>
  <App />
</template>
