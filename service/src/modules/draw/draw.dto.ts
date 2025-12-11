import { IsNotEmpty } from 'class-validator';

export interface Txt2ImgDto {
  prompt: string; // 文本提示，用于生成图像的主要输入
  negative_prompt: string; // 否定提示，用于生成图像时需要避免的内容
  styles: string[]; // 样式列表，可以包含多个样式
  seed: number; // 随机种子，用于控制生成的随机性
  subseed: number; // 子种子，用于进一步控制随机性
  subseed_strength: number; // 子种子强度，控制子种子的影响力
  seed_resize_from_h: number; // 从指定高度调整种子
  seed_resize_from_w: number; // 从指定宽度调整种子
  sampler_name: string; // 采样器的名称
  scheduler: string; // 调度器的名称
  batch_size: number; // 每批次生成的图像数量
  n_iter: number; // 生成的迭代次数
  steps: number; // 生成步骤数
  cfg_scale: number; // CFG比例，控制图像生成的一致性
  width: number; // 图像宽度
  height: number; // 图像高度
  restore_faces: boolean; // 是否恢复面部
  tiling: boolean; // 是否平铺图像
  do_not_save_samples: boolean; // 是否保存样本
  do_not_save_grid: boolean; // 是否保存网格
  eta: number; // eta参数，用于控制噪声
  denoising_strength: number; // 去噪强度
  s_min_uncond: number; // 无条件最小值
  s_churn: number; // 涨落参数
  s_tmax: number; // 最大温度
  s_tmin: number; // 最小温度
  s_noise: number; // 噪声参数
  override_settings: Record<string, any>; // 覆盖设置，包含自定义的设置
  override_settings_restore_afterwards: boolean; // 覆盖设置后是否恢复原有设置
  refiner_checkpoint: string; // 精炼器检查点
  refiner_switch_at: number; // 精炼器切换点
  disable_extra_networks: boolean; // 是否禁用额外的网络
  firstpass_image: string; // 第一阶段图像
  comments: Record<string, any>; // 备注
  enable_hr: boolean; // 是否启用高分辨率
  firstphase_width: number; // 第一阶段图像宽度
  firstphase_height: number; // 第一阶段图像高度
  hr_scale: number; // 高分辨率缩放比例
  hr_upscaler: string; // 高分辨率上采样器
  hr_second_pass_steps: number; // 高分辨率第二阶段步骤数
  hr_resize_x: number; // 高分辨率调整后的宽度
  hr_resize_y: number; // 高分辨率调整后的高度
  hr_checkpoint_name: string; // 高分辨率检查点名称
  hr_sampler_name: string; // 高分辨率采样器名称
  hr_scheduler: string; // 高分辨率调度器名称
  hr_prompt: string; // 高分辨率提示
  hr_negative_prompt: string; // 高分辨率否定提示
  force_task_id: string; // 强制任务ID
  sampler_index: string; // 采样器索引
  script_name: string; // 脚本名称
  script_args: []; // 脚本参数
  send_images: boolean; // 是否发送图像
  save_images: boolean; // 是否保存图像
  alwayson_scripts: Record<string, any>; // 始终启用的脚本
  infotext: string; // 信息文本
}

export interface Txt2ImgResponse {
  images: string[];
  parameters: Record<string, unknown>;
  info: string;
}

/**
 * 列表
 */
export class MediaListDto {
  mediaType: string;

  status: string;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  pageSize: number;
}
