import { defineStore } from 'pinia';
import { store } from '@/store';
import { Dict } from '@/models/dict';
import { ResultEnum } from '@/constants';
import { getDictListByType } from '@/api/system/dict';

export const useDictStore = defineStore({
  id: 'app-dict',
  state: (): Dict => ({
    dictId: '',
    dictName: '',
    dictCode: '',
    dictType: '',
    sort: 0,
    status: 0,
  }),

  actions: {
    // 按字典类型获取所有子字典列表
    async getDictListByType(dictType: string | string[] | number | number[]): Promise<Dict[]> {
      const res = await getDictListByType(dictType);

      if (res && res.code === ResultEnum.SUCCESS) {
        return res.data;
      }
      return [];
    },
  },
});

// Need to be used outside the setup
export function useDict() {
  return useDictStore(store);
}
