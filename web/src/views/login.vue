<script lang="ts" setup>
  import { onMounted, ref, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '@/store/modules/user';
  import { FormProps, MessagePlugin } from 'tdesign-vue-next';
  import { UserIcon, LockOnIcon, CheckCircleIcon } from 'tdesign-icons-vue-next';
  import { PageEnum } from '@/constants/page';
  import { ResultEnum } from '@/constants';
  import { LoginParams } from '@/models/user';
  import { getCaptche } from '@/api/system/user';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const formRef = ref();
  const loading = ref(false);
  const autoLogin = ref(true);
  const captchaUrl = ref('');
  const LOGIN_NAME = PageEnum.BASE_LOGIN_NAME;

  const formInline = reactive({
    username: 'admin',
    password: '123456',
    captcha: '',
  });

  const rules: FormProps['rules'] = {
    username: [{ required: true, message: t('views.login.input.account'), trigger: 'blur' }],
    password: [{ required: true, message: t('views.login.input.password'), trigger: 'blur' }],
    captcha: [{ required: true, message: t('views.login.input.verification'), trigger: 'blur' }],
  };

  const userStore = useUserStore();

  const router = useRouter();
  const route = useRoute();

  // 刷新验证码
  const refreshCaptcha = async () => {
    const res = await getCaptche();
    if (res && res.code === 0) {
      captchaUrl.value = `data:image/svg+xml;base64,${res.data}`;
    }
  };

  onMounted(() => {
    refreshCaptcha();
  });

  const handleSubmit = async ({ validateResult, firstError }) => {
    if (validateResult === true) {
      const { username, password, captcha } = formInline;

      loading.value = true;

      const params: LoginParams = {
        username,
        password,
        captcha,
      };

      try {
        const res = await userStore.login(params);
        MessagePlugin.closeAll();

        if (res?.code == ResultEnum.SUCCESS) {
          const toPath = decodeURIComponent((route.query?.redirect || '/') as string);
          MessagePlugin.success(t('views.login.loginSuccess'));
          if (route.name === LOGIN_NAME) {
            router.replace('/');
          } else router.replace(toPath);
        }
      } catch (error) {
        MessagePlugin.error(t('views.login.loginError'));
      } finally {
        loading.value = false;
      }
    } else {
      console.log('Validate Errors: ', firstError, validateResult);
      MessagePlugin.warning(firstError);
    }
  };
</script>

<template>
  <div
    class="flex flex-col h-screen overflow-auto bg-cover bg-no-repeat bg-[url('@/assets/images/login_bg.png')] place-items-center justify-center"
  >
    <div class="absolute flex-grow max-w-md px-5 mx-auto bg-white rounded-lg shadowlg w-[500px] pt-5 pb-6">
      <div class="pb-5 text-5xl text-gray-700">
        <h1 class="text-4xl">{{ t('views.login.welcome') }}</h1>
        <h1 class="text-3xl text-center">Lingmengcan</h1>
      </div>
      <div>
        <t-form
          ref="formRef"
          :data="formInline"
          :rules="rules"
          label-width="0"
          @submit="handleSubmit"
          :show-error-message="true"
        >
          <t-form-item name="username">
            <t-input
              v-model="formInline.username"
              :placeholder="$t('views.login.input.account')"
              size="large"
              clearable
            >
              <template #prefix-icon>
                <UserIcon />
              </template>
            </t-input>
          </t-form-item>
          <t-form-item name="password">
            <t-input
              v-model="formInline.password"
              type="password"
              :placeholder="$t('views.login.input.password')"
              size="large"
              clearable
            >
              <template #prefix-icon>
                <LockOnIcon />
              </template>
            </t-input>
          </t-form-item>
          <t-form-item name="captcha">
            <t-input v-model="formInline.captcha" :placeholder="$t('views.login.input.verification')" size="large">
              <template #prefix-icon>
                <CheckCircleIcon />
              </template>
              <template #suffix>
                <t-image
                  :src="captchaUrl"
                  class="cursor-pointer -mr-3"
                  @click="refreshCaptcha"
                  alt="验证码"
                  fit="contain"
                />
              </template>
            </t-input>
          </t-form-item>
          <t-form-item>
            <div class="flex justify-between items-center">
              <t-space>
                <t-checkbox v-model="autoLogin">{{ $t('views.login.remember') }}</t-checkbox>
                <t-link href="javascript:">{{ $t('views.login.forget') }}</t-link>
              </t-space>
            </div>
          </t-form-item>
          <t-form-item>
            <t-button theme="primary" size="large" type="submit" :loading="loading" block>
              {{ $t('views.login.signIn') }}
            </t-button>
          </t-form-item>
        </t-form>
      </div>
    </div>
  </div>
</template>
