<template>
  <div v-if="finishUploaded" class="relative w-full h-48 overflow-hidden border group">
    <div class="flex items-center justify-center w-full h-full">
      <img :src="imageUrl" class="object-contain max-w-full max-h-full" />
    </div>
    <div
      class="absolute inset-0 flex items-center justify-center text-white transition-opacity duration-300 bg-opacity-0 opacity-0 bg-slate-400 group-hover:bg-opacity-70 group-hover:opacity-100 text-shadow"
    >
      <t-icon name="close-circle" size="48px" class="cursor-pointer" @click="removeImage" />
    </div>
  </div>

  <t-upload
    v-else
    ref="uploadRef"
    v-model="fileList"
    accept="image/*"
    action="/api/file/upload-image"
    :show-upload-list="false"
    :with-credentials="true"
    :headers="{ Authorization: `Bearer ${token}` }"
    :before-upload="beforeUpload"
    theme="image"
    :size-limit="{ size: 5, unit: 'MB' }"
    @remove="removeImage"
    @success="afterUploaded"
  >
    <template #default>
      <div
        class="flex flex-col h-48 place-content-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
      >
        <div class="flex justify-center w-full pb-3">
          <t-icon name="upload" size="48px" class="text-gray-400" />
        </div>
        <div class="flex justify-center w-full text-gray-600">
          {{ $t('views.draw.stableDiffusion.controlNet.upload') }}
        </div>
      </div>
    </template>
  </t-upload>
</template>

<script setup lang="ts">
  import { PropType, ref, watch, onMounted } from 'vue';
  import storage from '@/utils/storage';
  import { ACCESS_TOKEN } from '@/constants';
  import { MessagePlugin } from 'tdesign-vue-next';
  import { fileToBase64 } from '@/utils';
  import type { UploadFile } from 'tdesign-vue-next';

  const props = defineProps({
    base64Image: {
      type: String as PropType<string>,
      default: '',
    },
  });

  const emit = defineEmits(['update:base64Image']);

  const base64ImageRef = ref(props.base64Image || '');

  const token = storage.get(ACCESS_TOKEN, '');

  const imageUrl = ref('');
  const finishUploaded = ref(false);
  const fileList = ref<UploadFile[]>([]);

  // 监听 props 变化
  watch(
    () => props.base64Image,
    (newValue) => {
      base64ImageRef.value = newValue || '';
      if (newValue) {
        imageUrl.value = newValue;
        finishUploaded.value = true;
      } else {
        imageUrl.value = '';
        finishUploaded.value = false;
      }
    },
    { immediate: true },
  );

  // 初始化
  onMounted(() => {
    if (props.base64Image) {
      imageUrl.value = props.base64Image;
      finishUploaded.value = true;
    }
  });

  //上传之前
  function beforeUpload(file: UploadFile) {
    const fileInfo = file.raw;

    // 最大2M
    const maxSize = 2 * 1024 * 1024;

    // 设置最大值，则判断
    if (maxSize && fileInfo && fileInfo?.size >= maxSize) {
      MessagePlugin.error(`上传文件最大值不能超过${maxSize / 1024 / 1024}M`);
      return false;
    }

    return true;
  }

  async function afterUploaded(context: { response: any; file: UploadFile }) {
    const { response, file } = context;

    if (response?.code === 0) {
      // const filePath = response.data;
      // imageUrl.value = `${import.meta.env.VITE_APP_CDN_BASEURL}${filePath}`;

      base64ImageRef.value = await fileToBase64(file.raw as File);
      emit('update:base64Image', base64ImageRef.value);
      imageUrl.value = base64ImageRef.value;

      finishUploaded.value = true;
    }
  }

  function removeImage() {
    imageUrl.value = '';
    finishUploaded.value = false;
    base64ImageRef.value = '';
    emit('update:base64Image', '');
  }
</script>
