import { useLocalStorage, usePreferredLanguages } from '@vueuse/core';
import type { DropdownOption, GlobalConfigProvider } from 'tdesign-vue-next';
import { computed } from 'vue';
import type { I18nOptions } from 'vue-i18n';
import { createI18n, useI18n } from 'vue-i18n';

// 导入语言文件
const langModules = import.meta.glob('./lang/*/index.ts', { eager: true });

// 存储语言模块和语言代码
const langModuleMap = new Map<string, unknown>();

export const langCode: Array<string> = [];

export const localeConfigKey = 'lingmengcan-locale';

// 获取浏览器默认语言环境
const languages = usePreferredLanguages();

// 生成语言模块列表
const generateLangModuleMap = () => {
  Object.keys(langModules).forEach((fullPath) => {
    const code = fullPath.replace('./lang/', '').split('/')[0];
    langCode.push(code);
    langModuleMap.set(code, langModules[fullPath]);
  });
};

// 导出 Message
const importMessages = computed(() => {
  generateLangModuleMap();

  const message: I18nOptions['messages'] = {};
  langModuleMap.forEach((value: any, key) => {
    message[key] = value.default;
  });
  return message;
});

// 创建 i18n 实例
export const i18n = createI18n({
  legacy: false,
  locale: useLocalStorage(localeConfigKey, 'zh_CN').value || languages.value[0] || 'zh_CN',
  fallbackLocale: 'zh_CN',
  messages: importMessages.value,
  globalInjection: true,
});

export const langList = computed(() => {
  if (langModuleMap.size === 0) generateLangModuleMap();

  const list: DropdownOption[] = [];
  langModuleMap.forEach((value: any, key) => {
    list.push({
      content: value.default.lang,
      value: key,
    });
  });

  return list;
});

export function useLocale() {
  const { locale } = useI18n({ useScope: 'global' });
  function changeLocale(lang: string) {
    // 如果切换的语言不在对应语言文件里则默认为简体中文
    if (!langCode.includes(lang)) {
      lang = 'zh_CN';
    }

    locale.value = lang;
    useLocalStorage(localeConfigKey, 'zh_CN').value = lang;
  }

  const getComponentsLocale = computed(() => {
    const localeMessage = i18n.global.getLocaleMessage(locale.value) as any;
    return localeMessage.componentsLocale as GlobalConfigProvider;
  });

  return {
    changeLocale,
    getComponentsLocale,
    locale,
  };
}

export default i18n;
