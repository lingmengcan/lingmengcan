import { Method } from '@/utils/http/axiosplus';
import { Txt2ImgDto, Txt2ImgResponse } from '@/modules/draw/draw.dto';
import httpHandler from '@/utils/http';

export class StableDiffusionService {
  async txt2img(dto: Txt2ImgDto, baseUrl: string) {
    const url = `${baseUrl}/sdapi/v1/txt2img`;

    const res = await httpHandler.request<Txt2ImgResponse>(url, Method.POST, dto);

    return res;
  }
}
