<script lang="ts" setup>
  import { onMounted, ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { FormProps, MessagePlugin } from 'tdesign-vue-next';
  import { UserIcon, EmailIcon, LockOnIcon, CheckCircleIcon } from 'tdesign-icons-vue-next';
  import { ResultEnum } from '@/constants';
  import { getCaptche, forgetPassword } from '@/api/system/user';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const formRef = ref();
  const loading = ref(false);
  const captchaUrl = ref('');

  const formInline = reactive({
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    captcha: '',
  });

  const rules: FormProps['rules'] = {
    username: [{ required: true, message: t('views.login.forgetPassword.usernamePlaceholder'), trigger: 'blur' }],
    email: [
      { required: true, message: t('views.login.forgetPassword.emailPlaceholder'), trigger: 'blur' },
      { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
    ],
    newPassword: [
      { required: true, message: t('views.login.forgetPassword.newPasswordPlaceholder'), trigger: 'blur' },
      { min: 6, message: t('views.login.forgetPassword.passwordTooShort'), trigger: 'blur' },
    ],
    confirmPassword: [
      { required: true, message: t('views.login.forgetPassword.confirmPasswordPlaceholder'), trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== formInline.newPassword) {
            callback(new Error(t('views.login.forgetPassword.passwordNotMatch')));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
    captcha: [{ required: true, message: t('views.login.input.verification'), trigger: 'blur' }],
  };

  const router = useRouter();

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

  const goToLogin = () => {
    router.push('/login');
  };

  const handleSubmit = async ({ validateResult, firstError }) => {
    if (validateResult === true) {
      const { username, email, newPassword, captcha } = formInline;

      loading.value = true;

      try {
        const res = await forgetPassword({
          username,
          email,
          newPassword,
          captcha,
        });

        if (res?.code == ResultEnum.SUCCESS) {
          MessagePlugin.success(t('views.login.forgetPassword.resetSuccess'));
          setTimeout(() => {
            goToLogin();
          }, 1500);
        } else {
          MessagePlugin.error(res?.message || '密码重置失败');
          refreshCaptcha();
        }
      } catch (error) {
        MessagePlugin.error('密码重置失败，请重试');
        refreshCaptcha();
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
        <h1 class="text-4xl">{{ t('views.login.forgetPassword.title') }}</h1>
        <h1 class="text-3xl text-center">{{ t('views.login.platformName') }}</h1>
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
              :placeholder="$t('views.login.forgetPassword.usernamePlaceholder')"
              size="large"
              clearable
            >
              <template #prefix-icon>
                <UserIcon />
              </template>
            </t-input>
          </t-form-item>
          <t-form-item name="email">
            <t-input
              v-model="formInline.email"
              type="email"
              :placeholder="$t('views.login.forgetPassword.emailPlaceholder')"
              size="large"
              clearable
            >
              <template #prefix-icon>
                <EmailIcon />
              </template>
            </t-input>
          </t-form-item>
          <t-form-item name="newPassword">
            <t-input
              v-model="formInline.newPassword"
              type="password"
              :placeholder="$t('views.login.forgetPassword.newPasswordPlaceholder')"
              size="large"
              clearable
            >
              <template #prefix-icon>
                <LockOnIcon />
              </template>
            </t-input>
          </t-form-item>
          <t-form-item name="confirmPassword">
            <t-input
              v-model="formInline.confirmPassword"
              type="password"
              :placeholder="$t('views.login.forgetPassword.confirmPasswordPlaceholder')"
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
            <div class="flex justify-center items-center">
              <t-link @click="goToLogin">{{ $t('views.login.forgetPassword.backToLogin') }}</t-link>
            </div>
          </t-form-item>
          <t-form-item>
            <t-button theme="primary" size="large" type="submit" :loading="loading" block>
              {{ $t('views.login.forgetPassword.submit') }}
            </t-button>
          </t-form-item>
        </t-form>
      </div>
    </div>
  </div>
</template>
