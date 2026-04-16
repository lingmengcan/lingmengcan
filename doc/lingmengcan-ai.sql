-- ============================================
-- Lingmengcan AI Platform - Database Schema
-- 
-- 使用前请：
-- 1. 创建数据库: CREATE DATABASE `lingmengcan` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
-- 2. 导入此文件: mysql -u root -p lingmengcan < lingmengcan-ai.sql
-- 3. 配置实际的 LLM API Key 等信息
-- ============================================


--
-- Table structure for table `application`
--


DROP TABLE IF EXISTS `application`;
CREATE TABLE `application` (
  `app_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `app_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `app_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `app_type_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '1.0.0',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0:草稿 1:已发布 2:运行中 3:已停止',
  `workflow_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '关联的工作流ID',
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`app_id`) USING BTREE,
  KEY `idx_app_name` (`app_name`) USING BTREE,
  KEY `idx_app_type` (`app_type`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_created_user` (`created_user`) USING BTREE,
  KEY `idx_application_workflow_id` (`workflow_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='工作流应用表';

--
-- Dumping data for table `application`
--

INSERT INTO `application` VALUES ('8c9c9cec-e145-45e0-93fd-96a576131a3b','测试','workflow','工作流','测试工作流','1.0.0',0,'500dd802-5b0f-44b4-9357-2ae3951bcaca','admin','admin','2025-08-19 17:17:39','2025-09-11 11:47:08');
INSERT INTO `application` VALUES ('b4afa206-ceff-45ea-a2e4-8b4ddc80480c','2','AGENT_APP','工作流','2','1.0.0',0,NULL,'admin','admin','2025-09-15 10:58:50','2025-09-15 10:58:50');


DROP TABLE IF EXISTS `control_net_preprocessor`;
CREATE TABLE `control_net_preprocessor` (
  `preprocessor_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `preprocessor_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `preprocessor_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `preprocessor_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `params` json NOT NULL,
  `sort` int NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`preprocessor_id`) USING BTREE,
  KEY `idx_preprocessor_type` (`preprocessor_type`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `control_net_preprocessor`
--

INSERT INTO `control_net_preprocessor` VALUES (1,'canny (硬边缘检测)','canny','Canny','{\"model\": \"control_v11p_sd15_canny [d14c016b]\", \"module\": \"canny\", \"weight\": 1, \"threshold_a\": 100, \"threshold_b\": 200, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0, \"threshold_step\": 1, \"max_threshold_a\": 255, \"max_threshold_b\": 255, \"min_threshold_a\": 1, \"min_threshold_b\": 1, \"threshold_a_label\": \"Low Threshold\", \"threshold_b_label\": \"High Threshold\"}',1,0,'Canny (线稿检测)','admin','admin','2024-08-12 16:29:36','2024-08-12 16:32:24');
INSERT INTO `control_net_preprocessor` VALUES (2,'lineart_realistic（写实线稿）','lineart_realistic','Lineart','{\"model\": \"\", \"module\": \"lineart_realistic\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',2,0,'lineart_realistic（写实线稿）','admin','admin','2024-08-12 16:33:24','2024-08-12 16:42:46');
INSERT INTO `control_net_preprocessor` VALUES (3,'lineart_anime（动漫线稿）','lineart_anime','Lineart','{\"model\": \"\", \"module\": \"lineart_anime\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',3,0,'lineart_anime（动漫线稿）','admin','admin','2024-08-12 16:42:23','2024-08-12 16:42:23');
INSERT INTO `control_net_preprocessor` VALUES (4,'softedge_pidinet（软边缘检测 - PiDiNET算法）','softedge_pidinet','SoftEdge','{\"model\": \"\", \"module\": \"softedge_pidinet\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',4,0,'softedge_pidinet（软边缘检测 - PiDiNET算法）','admin','admin','2024-08-12 16:47:48','2024-08-12 16:47:48');
INSERT INTO `control_net_preprocessor` VALUES (5,'softedge_hed（软边缘检测 - HED）','softedge_hed','SoftEdge','{\"model\": \"\", \"module\": \"softedge_pidinet\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',5,0,'softedge_hed（软边缘检测 - HED）','admin','admin','2024-08-12 16:49:13','2024-08-12 16:49:13');
INSERT INTO `control_net_preprocessor` VALUES (6,'openpose（人体姿态检测 - 身体）','openpose','OpenPose','{\"model\": \"\", \"module\": \"openpose\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',6,0,'openpose（人体姿态检测）','admin','admin','2024-08-12 16:50:51','2024-08-12 16:51:16');
INSERT INTO `control_net_preprocessor` VALUES (7,'openpose_full（人体姿态检测 - 身、手、脸）','openpose_full','OpenPose','{\"model\": \"\", \"module\": \"openpose_full\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',7,0,'openpose_full（人体姿态检测 - 身、手、脸）','admin','admin','2024-08-12 16:52:35','2024-08-12 16:52:35');
INSERT INTO `control_net_preprocessor` VALUES (8,'openpose_faceonly（人体姿态检测 - 脸）','openpose_faceonly','OpenPose','{\"model\": \"\", \"module\": \"openpose_faceonly\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',8,0,'openpose_faceonly（人体姿态检测 - 脸）','admin','admin','2024-08-12 16:53:47','2024-08-12 16:53:47');
INSERT INTO `control_net_preprocessor` VALUES (9,'depth_leres（LeRes 深度估算）','depth_leres','Depth','{\"model\": \"\", \"module\": \"depth_leres\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',9,0,'depth_leres（LeRes 深度估算）','admin','admin','2024-08-12 16:55:28','2024-08-12 16:55:28');
INSERT INTO `control_net_preprocessor` VALUES (10,'depth_zoe（ZoE深度估算）','depth_zoe','Depth','{\"model\": \"\", \"module\": \"depth_zoe\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',10,0,'depth_zoe（ZoE深度估算）','admin','admin','2024-08-12 16:56:22','2024-08-12 16:56:22');
INSERT INTO `control_net_preprocessor` VALUES (11,'mlsd（直线检测）','mlsd','MLSD','{\"model\": \"\", \"module\": \"mlsd\", \"weight\": 1, \"threshold_a\": 0.1, \"threshold_b\": 0.1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0, \"threshold_step\": 0.01, \"max_threshold_a\": 2, \"max_threshold_b\": 20, \"min_threshold_a\": 0.01, \"min_threshold_b\": 0.01, \"threshold_a_label\": \"MLSD Value Threshold\", \"threshold_b_label\": \"MLSD Distance Threshold\"}',11,0,'mlsd（直线检测）','admin','admin','2024-08-12 16:57:08','2024-08-12 16:57:08');
INSERT INTO `control_net_preprocessor` VALUES (12,'normal_bae（法线贴图）','normal_bae','NormalMap','{\"model\": \"\", \"module\": \"normal_bae\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',12,0,'normal_bae（法线贴图）','admin','admin','2024-08-12 16:59:11','2024-08-12 16:59:16');
INSERT INTO `control_net_preprocessor` VALUES (13,'scribble_hed（整体嵌套）','scribble_hed','Scribble','{\"model\": \"\", \"module\": \"scribble_hed\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',13,0,'scribble_hed（整体嵌套）','admin','admin','2024-08-12 17:00:40','2024-08-12 17:00:40');
INSERT INTO `control_net_preprocessor` VALUES (14,'seg_ofade20k（分块检测）','seg_ofade20k','Segmentation','{\"model\": \"\", \"module\": \"seg_ofade20k\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',14,0,'seg_ofade20k（分块检测）','admin','admin','2024-08-12 17:22:14','2024-08-12 17:22:14');
INSERT INTO `control_net_preprocessor` VALUES (15,'t2ia_style_clipvision（风格迁移）','t2ia_style_clipvision','T2I-Adapter','{\"model\": \"\", \"module\": \"t2ia_style_clipvision\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',15,0,'t2ia_style_clipvision（风格迁移）','admin','admin','2024-08-12 17:23:56','2024-08-12 17:23:56');
INSERT INTO `control_net_preprocessor` VALUES (16,'t2ia_sketch_pidi（像素差边缘检测）','t2ia_sketch_pidi','T2I-Adapter','{\"model\": \"\", \"module\": \"t2ia_sketch_pidi\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',16,0,'t2ia_sketch_pidi（像素差边缘检测）','admin','admin','2024-08-12 17:25:09','2024-08-12 17:25:09');
INSERT INTO `control_net_preprocessor` VALUES (17,'t2ia_color_grid（色彩像素化）','t2ia_color_grid','T2I-Adapter','{\"model\": \"\", \"module\": \"t2ia_color_grid\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',17,0,'t2ia_color_grid（色彩像素化）','admin','admin','2024-08-12 17:25:47','2024-08-12 17:25:47');
INSERT INTO `control_net_preprocessor` VALUES (18,'tile_resample（高清修复）','tile_resample','Tile','{\"model\": \"\", \"module\": \"tile_resample\", \"weight\": 1, \"threshold_a\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0, \"threshold_step\": 0.01, \"max_threshold_a\": 8, \"min_threshold_a\": 1, \"threshold_a_label\": \"Down Sampling Rate\"}',18,0,'tile_resample（高清修复）','admin','admin','2024-08-12 17:26:30','2024-08-12 17:26:30');
INSERT INTO `control_net_preprocessor` VALUES (19,'reference_only（图像参考）','reference_only','Reference','{\"model\": \"\", \"module\": \"reference_only\", \"weight\": 1, \"threshold_a\": 0.5, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0, \"threshold_step\": 0.01, \"max_threshold_a\": 1, \"min_threshold_a\": 0, \"threshold_a_label\": \"Style Fidelity (only for Balanced mode)\"}',19,0,'reference_only（图像参考）','admin','admin','2024-08-12 17:27:08','2024-08-12 17:27:23');


DROP TABLE IF EXISTS `conversation`;
CREATE TABLE `conversation` (
  `conversation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `conversation_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `llm` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `temperature` float NOT NULL,
  `max_tokens` int NOT NULL,
  `top_p` float NOT NULL,
  `system_prompt` text COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`) USING BTREE,
  KEY `idx_user_name` (`user_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `conversation`
--


DROP TABLE IF EXISTS `dict`;
CREATE TABLE `dict` (
  `dict_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `dict_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `dict_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `dict_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sort` int NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`dict_id`) USING BTREE,
  UNIQUE KEY `dict_unique` (`dict_code`),
  KEY `idx_dict_type` (`dict_type`)
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `dict`
--

INSERT INTO `dict` VALUES (1,'','0_ROOT_TYPE','根字典',0,0,'根字典','admin','admin','2024-07-31 15:30:10','2024-07-31 15:30:10');
INSERT INTO `dict` VALUES (2,'0_ROOT_TYPE','SYS_STATUS','状态',1,0,'状态（0：正常，1：停用，-1：删除）','admin','admin','2024-01-08 11:03:52','2025-08-05 17:28:01');
INSERT INTO `dict` VALUES (3,'SYS_STATUS','0','正常',1,0,'正常','admin','admin','2024-01-08 11:06:22','2024-01-08 11:06:22');
INSERT INTO `dict` VALUES (4,'SYS_STATUS','1','停用',2,0,'停用','admin','admin','2024-01-08 11:07:59','2024-01-08 11:12:48');
INSERT INTO `dict` VALUES (5,'SYS_STATUS','-1','删除',3,1,'状态软删除','admin','admin','2024-01-08 11:08:47','2024-01-08 11:12:54');
INSERT INTO `dict` VALUES (6,'SYS_SEX','MALE','男',1,0,'男','admin','admin','2024-01-08 11:10:05','2024-01-08 11:10:29');
INSERT INTO `dict` VALUES (7,'SYS_SEX','FEMALE','女',2,0,'女','admin','admin','2024-01-08 11:10:24','2024-01-08 11:10:24');
INSERT INTO `dict` VALUES (8,'SYS_SEX','UNKNOW','未知',3,0,'未知','admin','admin','2024-01-08 11:10:56','2024-01-08 11:10:56');
INSERT INTO `dict` VALUES (9,'LLM_TYPE','GENERAL_LLM','通用模型',1,0,'通用模型','admin','admin','2024-01-08 10:57:05','2024-06-24 20:13:46');
INSERT INTO `dict` VALUES (10,'LLM_TYPE','EMBEDDING_LLM','Embedding',2,0,'Embedding模型','admin','admin','2024-01-08 10:57:05','2024-06-24 20:13:36');
INSERT INTO `dict` VALUES (11,'DIFFUSION_MODEL_TYPE','BASE_MODEL','基础模型',1,0,'基础模型','admin','admin','2024-06-24 20:10:08','2024-06-24 20:10:08');
INSERT INTO `dict` VALUES (12,'DIFFUSION_MODEL_TYPE','LORA_DIFFUSION','LoRA',3,0,'LoRA模型','admin','admin','2024-06-24 20:11:47','2024-07-31 10:29:12');
INSERT INTO `dict` VALUES (13,'DIFFUSION_MODEL_TYPE','EMBEDDING_ DIFFUSION','Embedding',4,0,'Embedding模型','admin','admin','2024-06-24 20:12:30','2024-07-31 10:29:18');
INSERT INTO `dict` VALUES (14,'DIFFUSION_TAGS','TOPIC','主题',1,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (15,'DIFFUSION_TAGS','STYLE','风格',2,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (16,'TOPIC','COMIC_GAME','动漫游戏',1,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (17,'TOPIC','REALISTIC','摄影写实',2,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (18,'TOPIC','CHINESE_STYLE','中国风',3,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (19,'TOPIC','ILLUSTRATION','插画',4,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (20,'TOPIC','3D','3D立体',5,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (21,'TOPIC','FLAT_ABSTRACTION','扁平抽象',6,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (22,'TOPIC','HAND_DAWN','手绘风格',7,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (23,'STYLE','PERSON','人物',1,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (24,'STYLE','SCENE','场景',2,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (25,'STYLE','IP','IP形象',3,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (26,'STYLE','DRESS','服饰',4,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (27,'STYLE','ANIMAL','动物',5,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (28,'STYLE','SCENERY','风景',6,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (30,'STYLE','GOODS','商品',7,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (31,'STYLE','BULIDING','建筑',8,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54');
INSERT INTO `dict` VALUES (32,'0_ROOT_TYPE','SAMPLER','采样器',6,0,'stable diffusion 采样器','admin','admin','2024-07-08 11:21:42','2024-07-08 11:24:43');
INSERT INTO `dict` VALUES (33,'0_ROOT_TYPE','DIFFUSION_MODEL_TYPE','SD模型类型',4,0,'SD模型类型','admin','admin','2024-07-08 11:22:41','2024-07-08 11:22:41');
INSERT INTO `dict` VALUES (34,'0_ROOT_TYPE','DIFFUSION_TAGS','SD模型标签',5,0,'SD模型标签','admin','admin','2024-07-08 11:23:45','2024-07-08 11:23:45');
INSERT INTO `dict` VALUES (35,'0_ROOT_TYPE','LLM_TYPE','大语言模型类型',3,0,'大语言模型类型','admin','admin','2024-07-08 11:24:30','2024-07-08 11:24:30');
INSERT INTO `dict` VALUES (36,'SAMPLER','Euler','Euler',2,0,'Euler Sampler','admin','admin','2024-07-08 11:38:49','2024-07-17 17:06:48');
INSERT INTO `dict` VALUES (37,'SAMPLER','Euler a','Euler a',1,0,'Euler Ancestral Sampler','admin','admin','2024-07-08 11:40:33','2024-07-17 17:06:42');
INSERT INTO `dict` VALUES (38,'SAMPLER','LMS','LMS',3,0,'LMS Sampler','admin','admin','2024-07-08 11:41:40','2024-07-17 17:06:56');
INSERT INTO `dict` VALUES (39,'SAMPLER','Heun','Heun',4,0,'Heun Sampler','admin','admin','2024-07-08 11:42:18','2024-07-17 17:07:01');
INSERT INTO `dict` VALUES (40,'SAMPLER','DPM2','DPM2',5,0,'DPM Sampler 2nd Order','admin','admin','2024-07-08 11:43:15','2024-07-17 17:07:49');
INSERT INTO `dict` VALUES (41,'SAMPLER','DPM2 a','DPM2 a',6,0,'DPM Ancestral Sampler 2nd Order','admin','admin','2024-07-08 11:43:46','2024-07-17 17:07:56');
INSERT INTO `dict` VALUES (42,'SAMPLER','DPM++ 2S a','DPM++ 2S a',7,0,'DPM++ 2S Ancestral Sampler','admin','admin','2024-07-08 11:45:27','2024-07-17 17:08:03');
INSERT INTO `dict` VALUES (43,'SAMPLER','DPM++ 2M','DPM++ 2M',8,0,'DPM++ 2M Sampler','admin','admin','2024-07-08 11:46:03','2024-07-17 17:08:09');
INSERT INTO `dict` VALUES (44,'SAMPLER','DPM++ SDE','DPM++ SDE',9,0,'DPM++ SDE Sampler','admin','admin','2024-07-08 11:46:33','2024-07-17 17:08:16');
INSERT INTO `dict` VALUES (45,'SAMPLER','DPM adaptive','DPM adaptive',10,0,'Adaptive DPM Sampler','admin','admin','2024-07-08 11:47:31','2024-07-17 17:09:23');
INSERT INTO `dict` VALUES (46,'SAMPLER','LMS Karras','LMS Karras',11,1,'LMS Karras Sampler','admin','admin','2024-07-08 11:48:46','2024-08-01 14:51:50');
INSERT INTO `dict` VALUES (47,'SAMPLER','DPM2 Karras','DPM2 Karras',12,1,'DPM Sampler 2nd Order Karras','admin','admin','2024-07-08 14:27:25','2024-08-01 14:51:54');
INSERT INTO `dict` VALUES (48,'SAMPLER','DPM2 a Karras','DPM2 a Karras',13,1,'DPM Ancestral Sampler 2nd Order Karras','admin','admin','2024-07-08 14:28:51','2024-08-01 14:51:58');
INSERT INTO `dict` VALUES (50,'SAMPLER','DPM++ 2S a Karras','DPM++ 2S a Karras',14,1,'DPM++ 2S Ancestral Sampler Karras','admin','admin','2024-07-08 14:43:17','2024-08-01 14:52:03');
INSERT INTO `dict` VALUES (51,'SAMPLER','DPM++ 2M Karras','DPM++ 2M Karras',15,1,'DPM++ 2M Sampler Karras','admin','admin','2024-07-08 14:54:58','2024-08-01 14:52:07');
INSERT INTO `dict` VALUES (52,'SAMPLER','DPM++ 2M SDE Exponential','DPM++ 2M SDE Exponential',16,0,'DPM++ 2M SDE Exponential','admin','admin','2024-07-08 14:59:17','2024-07-17 17:10:10');
INSERT INTO `dict` VALUES (53,'SAMPLER','DPM++ 2M SDE Karras','DPM++ 2M SDE Karras',17,1,'DPM++ 2M SDE Karras','admin','admin','2024-07-08 15:10:43','2024-08-01 14:52:13');
INSERT INTO `dict` VALUES (54,'SAMPLER','DPM++ 2M SDE Heun Karras','DPM++ 2M SDE Heun Karras',18,1,'DPM++ 2M SDE Heun Karras','admin','admin','2024-07-08 15:20:48','2024-08-01 14:52:20');
INSERT INTO `dict` VALUES (55,'SAMPLER','DPM++ 2M SDE Heun Exponential','DPM++ 2M SDE Heun Exponential',19,0,'DPM++ 2M SDE Heun Exponential','admin','admin','2024-07-08 15:23:17','2024-07-17 17:10:29');
INSERT INTO `dict` VALUES (56,'SAMPLER','DPM++ SDE Karras','DPM++ SDE Karras',20,1,'DPM+ SDE Karras','admin','admin','2024-07-08 15:25:23','2024-08-01 14:52:25');
INSERT INTO `dict` VALUES (57,'SAMPLER','DDIM','DDIM',21,0,'Denoising Diffusion Implicit Models','admin','admin','2024-07-08 15:27:08','2024-07-17 17:10:42');
INSERT INTO `dict` VALUES (58,'SAMPLER','PLMS','PLMS',22,0,'Pseudonormal Langevin Method Sampler','admin','admin','2024-07-08 15:27:43','2024-07-17 17:10:46');
INSERT INTO `dict` VALUES (59,'SAMPLER','UniPC','UniPC',23,0,'Unified Predictor-Corrector Sampler','admin','admin','2024-07-08 15:29:57','2024-07-17 17:10:51');
INSERT INTO `dict` VALUES (60,'SAMPLER','Restart','Restart',24,0,'Restart Sampler','admin','admin','2024-07-08 15:32:00','2024-07-17 17:10:57');
INSERT INTO `dict` VALUES (61,'DIFFUSION_MODEL_TYPE','CHECKPOINT_DIFFUSION','Checkpoint',2,0,'Checkpoint model','admin','admin','2024-07-31 10:28:34','2024-07-31 10:29:05');
INSERT INTO `dict` VALUES (62,'0_ROOT_TYPE','SYS_SEX','性别',2,0,'性别','admin','admin','2024-01-08 10:57:05','2024-01-08 11:09:18');
INSERT INTO `dict` VALUES (64,'DIFFUSION_MODEL_TYPE','NOT_DIFFUSION_MODEL','非SD模型',9,0,'生图，非SD模型','admin','admin','2024-07-31 15:44:54','2024-07-31 15:44:54');
INSERT INTO `dict` VALUES (65,'0_ROOT_TYPE','HIRES_FIX_UPSCALER','高分辨率算法',7,0,'SD高分辨率算法','admin','admin','2024-08-01 14:46:36','2024-08-01 14:46:36');
INSERT INTO `dict` VALUES (66,'HIRES_FIX_UPSCALER','Latent','Latent',1,0,'Latent','admin','admin','2024-08-01 14:47:05','2024-08-01 14:47:05');
INSERT INTO `dict` VALUES (67,'HIRES_FIX_UPSCALER','Latent (antialiased)','Latent (antialiased)',2,0,'Latent (antialiased)','admin','admin','2024-08-01 14:54:12','2024-08-01 14:54:19');
INSERT INTO `dict` VALUES (68,'HIRES_FIX_UPSCALER','Latent (bicubic)','Latent (bicubic)',3,0,'Latent (bicubic)','admin','admin','2024-08-01 14:54:35','2024-08-01 14:54:35');
INSERT INTO `dict` VALUES (69,'HIRES_FIX_UPSCALER','Latent (bicubic antialiased)','Latent (bicubic antialiased)',4,0,'Latent (bicubic antialiased)','admin','admin','2024-08-01 14:54:52','2024-08-01 14:54:52');
INSERT INTO `dict` VALUES (70,'HIRES_FIX_UPSCALER','Latent (nearest)','Latent (nearest)',5,0,'Latent (nearest)','admin','admin','2024-08-01 14:55:06','2024-08-01 14:55:06');
INSERT INTO `dict` VALUES (71,'HIRES_FIX_UPSCALER','Latent (nearest-exact)','Latent (nearest-exact)',6,0,'Latent (nearest-exact)','admin','admin','2024-08-01 14:55:21','2024-08-01 14:55:21');
INSERT INTO `dict` VALUES (72,'HIRES_FIX_UPSCALER','None','None',7,0,'None','admin','admin','2024-08-01 14:55:37','2024-08-01 14:55:37');
INSERT INTO `dict` VALUES (73,'HIRES_FIX_UPSCALER','Lanczos','Lanczos',8,0,'Lanczos','admin','admin','2024-08-01 14:55:52','2024-08-01 14:55:52');
INSERT INTO `dict` VALUES (74,'HIRES_FIX_UPSCALER','Nearest','Nearest',9,0,'Nearest','admin','admin','2024-08-01 14:56:06','2024-08-01 14:56:15');
INSERT INTO `dict` VALUES (75,'HIRES_FIX_UPSCALER','DAT x2','DAT x2',10,0,'DAT x2','admin','admin','2024-08-01 14:56:42','2024-08-01 14:56:42');
INSERT INTO `dict` VALUES (76,'HIRES_FIX_UPSCALER','DAT x3','DAT x3',11,0,'DAT x3','admin','admin','2024-08-01 14:56:54','2024-08-01 14:56:54');
INSERT INTO `dict` VALUES (77,'HIRES_FIX_UPSCALER','DAT x4','DAT x4',12,0,'DAT x4','admin','admin','2024-08-01 14:57:24','2024-08-01 14:57:24');
INSERT INTO `dict` VALUES (78,'HIRES_FIX_UPSCALER','ESRGAN_4x','ESRGAN_4x',13,0,'ESRGAN_4x','admin','admin','2024-08-01 14:59:55','2024-08-01 14:59:55');
INSERT INTO `dict` VALUES (79,'HIRES_FIX_UPSCALER','LDSR','LDSR',14,0,'LDSR','admin','admin','2024-08-01 15:00:33','2024-08-01 15:00:33');
INSERT INTO `dict` VALUES (80,'HIRES_FIX_UPSCALER','R-ESRGAN 4x+','R-ESRGAN 4x+',15,0,'R-ESRGAN 4x+','admin','admin','2024-08-01 15:00:59','2024-08-01 15:00:59');
INSERT INTO `dict` VALUES (81,'HIRES_FIX_UPSCALER','R-ESRGAN 4x+ Anime6B','R-ESRGAN 4x+ Anime6B',16,0,'R-ESRGAN 4x+ Anime6B','admin','admin','2024-08-01 15:01:14','2024-08-01 15:01:14');
INSERT INTO `dict` VALUES (82,'HIRES_FIX_UPSCALER','ScuNET GAN','ScuNET GAN',17,0,'ScuNET GAN','admin','admin','2024-08-01 15:01:28','2024-08-01 15:01:28');
INSERT INTO `dict` VALUES (83,'HIRES_FIX_UPSCALER','ScuNET PSNR','ScuNET PSNR',18,0,'ScuNET PSNR','admin','admin','2024-08-01 15:01:46','2024-08-01 15:01:46');
INSERT INTO `dict` VALUES (84,'HIRES_FIX_UPSCALER','SwinIR 4x','SwinIR 4x',19,0,'SwinIR 4x','admin','admin','2024-08-01 15:02:08','2024-08-01 15:02:08');
INSERT INTO `dict` VALUES (85,'0_ROOT_TYPE','CONTROL_NET_TYPE','控制类型',8,0,'stable diffusion ControlNet 控制类型','admin','admin','2024-08-12 16:26:58','2024-08-12 16:26:58');
INSERT INTO `dict` VALUES (86,'CONTROL_NET_TYPE','Canny','Canny (硬边缘)',1,0,'Canny (硬边缘)','admin','admin','2024-08-12 16:29:36','2024-08-12 16:32:24');
INSERT INTO `dict` VALUES (87,'CONTROL_NET_TYPE','Depth','Depth (深度)',2,0,'Depth (深度)','admin','admin','2024-08-12 16:33:24','2024-08-12 16:42:46');
INSERT INTO `dict` VALUES (88,'CONTROL_NET_TYPE','IP-Adapter','IP-Adapter',3,0,'IP-Adapter','admin','admin','2024-08-12 16:42:23','2024-08-12 16:42:23');
INSERT INTO `dict` VALUES (89,'CONTROL_NET_TYPE','Inpaint','Inpaint (局部重绘)',4,0,'Inpaint (局部重绘)','admin','admin','2024-08-12 16:47:48','2024-08-12 16:47:48');
INSERT INTO `dict` VALUES (90,'CONTROL_NET_TYPE','Instant-ID','Instant-ID',5,0,'Instant-ID','admin','admin','2024-08-12 16:49:13','2024-08-12 16:49:13');
INSERT INTO `dict` VALUES (91,'CONTROL_NET_TYPE','InstructP2P','InstructP2P',6,0,'InstructP2P','admin','admin','2024-08-12 16:50:51','2024-08-12 16:51:16');
INSERT INTO `dict` VALUES (92,'CONTROL_NET_TYPE','Lineart','Lineart (线稿)',7,0,'Lineart (线稿)','admin','admin','2024-08-12 16:52:35','2024-08-12 16:52:35');
INSERT INTO `dict` VALUES (93,'CONTROL_NET_TYPE','MLSD','MLSD (直线)',8,0,'MLSD (直线)','admin','admin','2024-08-12 16:53:47','2024-08-12 16:53:47');
INSERT INTO `dict` VALUES (94,'CONTROL_NET_TYPE','NormalMap','NormalMap (法线贴图)',9,0,'NormalMap (法线贴图)','admin','admin','2024-08-12 16:55:28','2024-08-12 16:55:28');
INSERT INTO `dict` VALUES (95,'CONTROL_NET_TYPE','OpenPose','OpenPose (姿态)',10,0,'OpenPose (姿态)','admin','admin','2024-08-12 16:56:22','2024-08-12 16:56:22');
INSERT INTO `dict` VALUES (96,'CONTROL_NET_TYPE','Recolor','Recolor (重上色)',11,0,'Recolor (重上色)','admin','admin','2024-08-12 16:57:08','2024-08-12 16:57:08');
INSERT INTO `dict` VALUES (97,'CONTROL_NET_TYPE','Reference','Reference (参考)',12,0,'Reference (参考)','admin','admin','2024-08-12 16:59:11','2024-08-12 16:59:16');
INSERT INTO `dict` VALUES (98,'CONTROL_NET_TYPE','Revision','Revision',13,0,'Revision','admin','admin','2024-08-12 17:00:40','2024-08-12 17:00:40');
INSERT INTO `dict` VALUES (99,'CONTROL_NET_TYPE','Scribble','Scribble (涂鸦)',14,0,'Scribble (涂鸦)','admin','admin','2024-08-12 17:22:14','2024-08-12 17:22:14');
INSERT INTO `dict` VALUES (100,'CONTROL_NET_TYPE','Segmentation','Segmentation (语义分割)',15,0,'Segmentation (语义分割)','admin','admin','2024-08-12 17:23:56','2024-08-12 17:23:56');
INSERT INTO `dict` VALUES (101,'CONTROL_NET_TYPE','Shuffle','Shuffle (随机洗牌)',16,0,'Shuffle (随机洗牌)','admin','admin','2024-08-12 17:25:09','2024-08-12 17:25:09');
INSERT INTO `dict` VALUES (102,'CONTROL_NET_TYPE','SoftEdge','SoftEdge (软边缘)',17,0,'SoftEdge (软边缘)','admin','admin','2024-08-12 17:25:47','2024-08-12 17:25:47');
INSERT INTO `dict` VALUES (103,'CONTROL_NET_TYPE','SparseCtrl','SparseCtrl (稀疏控制)',18,0,'SparseCtrl (稀疏控制)','admin','admin','2024-08-12 17:26:30','2024-08-12 17:26:30');
INSERT INTO `dict` VALUES (104,'CONTROL_NET_TYPE','T2I-Adapter','T2I-Adapter',19,0,'T2I-Adapter','admin','admin','2024-08-12 17:27:08','2024-08-12 17:27:23');
INSERT INTO `dict` VALUES (105,'CONTROL_NET_TYPE','Tile','Tile (分块)',20,0,'Tile (分块)','admin','admin','2024-08-12 17:27:09','2024-08-12 17:27:09');
INSERT INTO `dict` VALUES (106,'0_ROOT_TYPE','LLM_API_TYPE','大语言模型访问类型',9,0,'大语言模型访问类型','admin','admin','2024-09-24 16:53:33','2024-09-24 16:53:40');
INSERT INTO `dict` VALUES (107,'LLM_API_TYPE','openai','openai',1,0,'openai','admin','admin','2024-09-24 16:54:46','2025-12-01 20:01:24');
INSERT INTO `dict` VALUES (108,'LLM_API_TYPE','ollama','ollama',2,0,'ollama','admin','admin','2024-09-24 16:55:13','2025-12-01 20:02:30');
INSERT INTO `dict` VALUES (109,'0_ROOT_TYPE','KNOWLEDGE_TYPE','知识库类型',10,0,'知识库类型','admin','admin','2024-10-29 10:53:07','2024-10-29 10:53:07');
INSERT INTO `dict` VALUES (110,'KNOWLEDGE_TYPE','TEXT_KNOWLEDGE','文本知识库',0,0,'文本知识库','admin','admin','2024-10-29 10:56:31','2024-10-29 10:56:31');
INSERT INTO `dict` VALUES (111,'KNOWLEDGE_TYPE','Q_A_KNOWLEDGE','问答知识库',0,0,'问答知识库','admin','admin','2024-10-29 10:57:44','2024-10-29 10:57:44');
INSERT INTO `dict` VALUES (112,'0_ROOT_TYPE','APP_TYPE','应用类型',11,0,'应用类型','admin','admin','2025-08-07 16:41:38','2025-08-07 16:41:46');
INSERT INTO `dict` VALUES (113,'APP_TYPE','FLOW_APP','工作流应用',1,0,'','admin','admin','2025-08-07 16:53:09','2025-08-07 16:53:09');
INSERT INTO `dict` VALUES (114,'APP_TYPE','AGENT_APP','智能体',2,0,'','admin','admin','2025-08-07 16:54:04','2025-08-07 16:54:04');
INSERT INTO `dict` VALUES (120,'0_ROOT_TYPE','PLUGIN_TYPE','插件类型',12,0,'工作流插件类型','admin','admin','2025-08-25 14:56:35','2025-08-25 14:57:19');
INSERT INTO `dict` VALUES (121,'PLUGIN_TYPE','PLUGIN_AI','AI 插件',1,0,'AI 插件','admin','admin','2025-08-25 14:59:58','2025-08-25 14:59:58');
INSERT INTO `dict` VALUES (122,'PLUGIN_TYPE','PLUGIN_RULE','规则插件',2,0,'规则插件','admin','admin','2025-08-25 15:00:20','2025-08-25 15:00:20');
INSERT INTO `dict` VALUES (123,'PLUGIN_TYPE','PLUGIN_LOGIC','逻辑插件',3,0,'逻辑插件','admin','admin','2025-08-25 15:00:48','2025-08-25 15:00:48');
INSERT INTO `dict` VALUES (124,'PLUGIN_TYPE','PLUGIN_COMMON','公共插件',4,0,'公共插件','admin','admin','2025-08-25 15:01:15','2025-08-25 15:01:15');
INSERT INTO `dict` VALUES (125,'PLUGIN_TYPE','PLUGIN_HTTP','HTTP 插件',5,0,'HTTP 插件','admin','admin','2025-08-25 15:01:38','2025-08-25 15:01:38');
INSERT INTO `dict` VALUES (126,'PLUGIN_TYPE','PLUGIN_CUSTOM','自定义插件',6,0,'自定义插件','admin','admin','2025-08-25 15:02:02','2025-08-25 15:02:02');
INSERT INTO `dict` VALUES (127,'0_ROOT_TYPE','INPUT_TYPE','输入类型',13,0,'输入类型','admin','admin','2025-10-22 10:19:59','2025-10-22 10:20:08');
INSERT INTO `dict` VALUES (128,'INPUT_TYPE','text','Text',1,0,'Text','admin','admin','2025-10-22 10:20:57','2025-10-22 10:20:57');
INSERT INTO `dict` VALUES (129,'INPUT_TYPE','json','Json',2,0,'json','admin','admin','2025-10-22 10:21:12','2025-10-22 10:21:12');
INSERT INTO `dict` VALUES (130,'INPUT_TYPE','number','Number',3,0,'number','admin','admin','2025-10-22 10:21:31','2025-10-22 10:22:04');
INSERT INTO `dict` VALUES (131,'INPUT_TYPE','boolean','Boolean',4,0,'boolean','admin','admin','2025-10-22 10:21:47','2025-10-22 10:21:47');
INSERT INTO `dict` VALUES (132,'LLM_API_TYPE','anthropic','anthropic',3,0,'anthropic','admin','admin','2025-12-01 20:02:55','2025-12-01 20:02:55');


DROP TABLE IF EXISTS `diffusion_model`;
CREATE TABLE `diffusion_model` (
  `model_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `base_model_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `model_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `model_code` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `model_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `model_type_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `model_cover` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tags` json NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`model_id`) USING BTREE,
  KEY `idx_model_type` (`model_type`),
  KEY `idx_base_model_id` (`base_model_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `diffusion_model`
--

INSERT INTO `diffusion_model` VALUES ('4d63aa33-abb8-4d56-b5a8-26b9b8e49ef8','','SD 2.1','SD 2.1','BASE_MODEL','基础模型','upload-files/2025-08-05/7ced5787-eb14-4774-99c2-47c75fa537e9.png','null',0,'SD 2.2','admin','admin','2024-07-01 15:40:19','2025-08-05 10:32:42');
INSERT INTO `diffusion_model` VALUES ('4e41b90e-a7a5-456c-89d0-03e95102bccb','8102fc23-1892-4bda-8822-84b3a349dbc2','waiANINSFWPONYXL_v60','waiANINSFWPONYXL_v60.safetensors [4a11de18c7]','CHECKPOINT_DIFFUSION','Checkpoint','','[\"COMIC_GAME\"]',0,'waiANINSFWPONYXL_v60','admin','admin','2024-07-01 15:42:29','2024-08-01 11:40:57');
INSERT INTO `diffusion_model` VALUES ('8102fc23-1892-4bda-8822-84b3a349dbc2','','SD 1.5','SD 1.5','BASE_MODEL','基础模型','','null',0,'基础SD V1.5模型','admin','admin','2024-07-31 15:53:09','2024-07-31 17:32:40');
INSERT INTO `diffusion_model` VALUES ('a71d6f60-7379-4b0d-b233-e4fa7d5b9ab1','8102fc23-1892-4bda-8822-84b3a349dbc2','SD V1.5 emaonly','v1-5-pruned-emaonly.safetensors [6ce0161689]','CHECKPOINT_DIFFUSION','Checkpoint','','null',0,'SD 1.5','admin','admin','2024-06-28 16:34:52','2024-08-01 11:39:35');
INSERT INTO `diffusion_model` VALUES ('b744005e-c792-4da2-a6ef-34e73168d9df','','SDXL 1.0','SDXL 1.0','BASE_MODEL','基础模型','','null',0,'SDXL 1.0','admin','admin','2024-07-01 15:41:47','2024-07-31 17:32:52');
INSERT INTO `diffusion_model` VALUES ('c7a11ee3-4892-4ade-ba6c-f07ce6433961','8102fc23-1892-4bda-8822-84b3a349dbc2','wedding dress','<lora:wedding dress_SD_V1.0:1>','LORA_DIFFUSION','LoRA','upload-files/2024-08-01/8948eda5-3aa1-43ed-ab31-42a947238d3b.png','[\"DRESS\", \"PERSON\"]',0,'lora, wedding dress','admin','admin','2024-07-05 15:32:52','2024-08-01 11:27:21');
INSERT INTO `diffusion_model` VALUES ('dd1b8d34-21df-4d11-a9bc-4342e8600803','','SD 3','SD 3','BASE_MODEL','基础模型','','null',0,'SD 3','admin','admin','2024-07-01 15:40:43','2024-07-31 17:32:48');
INSERT INTO `diffusion_model` VALUES ('eeb00fdc-90e0-40be-8323-3a70a5783b40','','SD 1.4','SD 1.4','BASE_MODEL','基础模型','','null',0,'SD 1.4','admin','admin','2024-07-01 15:22:36','2024-07-31 17:32:36');


DROP TABLE IF EXISTS `file`;
CREATE TABLE `file` (
  `file_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `conversation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_size` bigint NOT NULL,
  `path` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint(1) NOT NULL,
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`file_id`) USING BTREE,
  KEY `idx_conversation_id` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `file`
--


DROP TABLE IF EXISTS `knowledge`;
CREATE TABLE `knowledge` (
  `knowledge_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `knowledge_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `knowledge_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `knowledge_type_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `llm` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `embedding_model` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `params` json NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`knowledge_id`) USING BTREE,
  KEY `idx_knowledge_type` (`knowledge_type`),
  KEY `idx_created_user` (`created_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `knowledge`
--


DROP TABLE IF EXISTS `knowledge_file`;
CREATE TABLE `knowledge_file` (
  `knowledge_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`knowledge_id`,`file_id`) USING BTREE,
  KEY `idx_knowledge_id` (`knowledge_id`),
  KEY `idx_file_id` (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `knowledge_file`
--


DROP TABLE IF EXISTS `llm`;
CREATE TABLE `llm` (
  `model_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `model_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `model_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `model_type_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `base_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `api_key` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `api_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `default_embedding_model` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`model_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `llm`
--

-- 示例 LLM 配置（请根据实际情况配置，api_key 需要替换为真实值）
INSERT INTO `llm` VALUES ('sample-001','gpt-3.5-turbo','GENERAL_LLM','通用模型','https://api.openai.com/v1','sk-your-api-key-here','openai','',0,'GPT-3.5 Turbo','admin','admin','2024-06-11 15:10:05','2024-06-11 15:10:05');
INSERT INTO `llm` VALUES ('sample-002','bge-large-zh-v1.5','EMBEDDING_LLM','Embedding','','','','',0,'中文嵌入模型','admin','admin','2024-06-11 19:31:29','2024-06-24 20:16:43');


DROP TABLE IF EXISTS `media`;
CREATE TABLE `media` (
  `media_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `media_type` enum('image','video') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ai` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `generation_parameters` json NOT NULL,
  `status` enum('completed','in_progress','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'completed',
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`media_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `media`
--


DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `menu_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint DEFAULT NULL,
  `menu_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `menu_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `component` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `path` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `query` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `redirect` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `permissions` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `menu_type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hidden` int DEFAULT NULL,
  `cached` int DEFAULT NULL,
  `icon` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort` int DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`menu_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` VALUES (1,0,'系统设置','system','layout','system','','/system/user','','contents',0,0,'setting-1',3,0,'系统管理目录','admin','admin','2021-09-26 14:42:01','2025-07-31 20:08:18');
INSERT INTO `menu` VALUES (2,0,'AI Draw','draw','layout','draw','','/draw/generate','draw_generate','contents',0,0,'edit-1',2,0,'AI Draw','admin','admin','2021-09-26 14:46:28','2025-07-31 16:16:10');
INSERT INTO `menu` VALUES (3,0,'LLM','llm','layout','chat/',NULL,'/chat','chat_index','contents',0,0,'chat-bubble',1,0,'LLM','admin','admin','2022-06-08 16:46:18','2025-10-11 17:14:04');
INSERT INTO `menu` VALUES (4,0,'画布','canvas','parent','canvas',NULL,'/llm/workflow/design','','contents',1,0,'tv-2',4,0,'画布','admin','admin','2022-05-19 11:11:06','2025-08-20 11:36:32');
INSERT INTO `menu` VALUES (5,0,'仪表盘','dashboard','layout','dashboard','','/dashboard/list','dashboard_list','contents',0,0,'dashboard',5,0,'','admin','admin','2022-08-15 11:06:50','2025-07-31 16:17:16');
INSERT INTO `menu` VALUES (7,0,'lingmengcan','https://github.com/lingmengcan/lingmengcan-ai','layout','lingmengcan',NULL,NULL,'','contents',0,0,'chart-radial',6,0,'lingmengcan 主页','admin','admin','2022-05-19 11:16:45','2025-07-31 16:17:31');
INSERT INTO `menu` VALUES (8,1,'用户管理','user','/system/user/index','user','',NULL,'system_user_index','menu',0,0,'',1,0,'用户管理菜单','admin','admin','2021-10-21 10:34:32','2023-12-28 14:26:37');
INSERT INTO `menu` VALUES (9,1,'角色管理','role','/system/role/index','role','','','system_role_index','menu',0,0,'',2,0,'角色管理菜单','admin','admin','2021-10-21 10:36:49','2023-11-23 11:11:08');
INSERT INTO `menu` VALUES (10,1,'菜单管理','menu','/system/menu/index','menu','',NULL,'system_menu_index','menu',0,0,'',3,0,'菜单管理菜单','admin','admin','2021-10-21 10:38:03','2023-11-23 11:12:12');
INSERT INTO `menu` VALUES (11,1,'字典管理','dict','/system/dict/index','param',NULL,NULL,'system_dict_index','menu',0,0,'',4,0,'字典管理','admin','admin','2022-05-20 11:09:04','2024-01-03 16:08:24');
INSERT INTO `menu` VALUES (12,2,'生成',NULL,'/draw/generate','generate','','','draw_generate','menu',0,0,'',2,0,'数据门户列表','admin','admin','2022-08-15 17:01:20','2024-07-02 10:45:42');
INSERT INTO `menu` VALUES (13,3,'对话','chat','/chat/index',':conversationId?',NULL,NULL,'chat_index','menu',0,0,'chat-bubble-1',1,0,'chat','admin','admin','2022-08-25 17:16:46','2025-07-31 20:28:24');
INSERT INTO `menu` VALUES (14,4,'日志管理',NULL,'/monitor/log/index','log',NULL,NULL,'monitor:log:index','menu',0,0,'',1,0,'301','admin','admin','2022-05-19 11:18:49','2022-07-12 15:07:32');
INSERT INTO `menu` VALUES (15,4,'服务运行',NULL,'/monitor/server/index','server','','','monitor:server:index','menu',0,0,'',1,0,'','admin','admin','2022-07-04 14:09:38','2022-07-12 17:14:00');
INSERT INTO `menu` VALUES (16,5,'仪表盘列表',NULL,'/dashboard/index','list','','','dashboard_list','menu',0,0,'',1,0,'','admin','admin','2022-08-15 16:52:15','2022-08-15 17:15:24');
INSERT INTO `menu` VALUES (18,3,'api 文档','api_doc','/llm/app/api/doc','app/api/:appId?','','','','menu',1,1,'file-word',7,0,'api 文档','admin','admin','2023-11-21 15:38:20','2025-10-11 17:17:28');
INSERT INTO `menu` VALUES (21,8,'用户查询',NULL,'','',NULL,NULL,'system_user_query','action',0,0,'',1,0,'','admin','admin','2022-05-23 14:25:32','2023-12-28 14:16:20');
INSERT INTO `menu` VALUES (22,8,'用户新增',NULL,'','',NULL,NULL,'system_user_add','action',0,0,'',2,0,'','admin','admin','2022-05-23 14:28:27','2023-12-28 14:15:35');
INSERT INTO `menu` VALUES (23,8,'用户修改',NULL,'','',NULL,NULL,'system_user_edit','action',0,0,'',3,0,'','admin','admin','2022-05-23 14:28:45','2023-12-28 14:15:24');
INSERT INTO `menu` VALUES (24,8,'用户删除',NULL,'','',NULL,NULL,'system_user_delete','action',0,0,'',4,0,'','admin','admin','2022-05-23 14:29:14','2023-12-28 14:15:13');
INSERT INTO `menu` VALUES (25,9,'角色查询',NULL,'','',NULL,NULL,'system_role_query','action',0,0,'',3,0,'','admin','admin','2022-06-08 16:44:56','2023-12-28 14:16:58');
INSERT INTO `menu` VALUES (26,9,'角色新增',NULL,'','',NULL,NULL,'system_role_add','action',0,0,'',4,0,'','admin','admin','2022-06-08 16:45:27','2023-12-28 14:16:54');
INSERT INTO `menu` VALUES (27,9,'角色修改',NULL,'','',NULL,NULL,'system_role_edit','action',0,0,'',5,0,'','admin','admin','2022-06-08 16:45:53','2023-12-28 14:17:23');
INSERT INTO `menu` VALUES (28,9,'角色删除',NULL,'','',NULL,NULL,'system_role_delete','action',0,0,'',6,0,'','admin','admin','2022-06-08 16:46:18','2023-12-28 14:17:31');
INSERT INTO `menu` VALUES (29,9,'分配用户',NULL,'system/role/role-user','user',NULL,NULL,'system_role_user','action',1,0,'',2,0,'','admin','admin','2022-06-08 16:48:01','2023-11-23 11:11:39');
INSERT INTO `menu` VALUES (30,10,'菜单新增',NULL,'','list','',NULL,'system_menu_add','action',1,0,'',1,0,'','admin','admin','2022-06-29 16:19:21','2023-11-23 11:10:27');
INSERT INTO `menu` VALUES (31,10,'菜单删除','','','','','','system_menu_delete','action',0,0,'',3,0,'','admin','admin','2023-11-21 21:00:38','2023-11-23 11:31:55');
INSERT INTO `menu` VALUES (32,10,'菜单编辑','','','','','','system_menu_edit','action',0,0,'',2,0,'','admin','admin','2023-11-23 11:30:47','2023-11-23 11:30:47');
INSERT INTO `menu` VALUES (33,10,'菜单查询','','','','','','system_menu_query','action',0,0,'',4,0,'','admin','admin','2023-11-23 11:33:03','2023-11-23 11:34:02');
INSERT INTO `menu` VALUES (34,8,'重置密码','reset_pwd','','','','','system_user_resetpwd','action',0,0,'',5,0,'重置密码','admin','admin','2023-12-28 19:55:49','2023-12-28 19:55:49');
INSERT INTO `menu` VALUES (35,11,'字典查询','dict_query','','','','','system_dict_query','action',0,0,'',1,0,'','admin','admin','2024-01-08 10:48:08','2024-01-08 10:48:08');
INSERT INTO `menu` VALUES (36,11,'字典新增','','','','','','system_dict_add','action',0,0,'',2,0,'','admin','admin','2024-01-08 10:49:10','2024-01-08 10:49:21');
INSERT INTO `menu` VALUES (37,11,'字典修改','','','','','','system_dict_edit','action',0,0,'',3,0,'','admin','admin','2024-01-08 10:49:42','2024-01-08 10:49:48');
INSERT INTO `menu` VALUES (38,11,'字典删除','','','','','','system_dict_delete','action',0,0,'',0,0,'','admin','admin','2024-01-08 10:52:23','2024-01-08 10:52:23');
INSERT INTO `menu` VALUES (39,3,'应用','app','/llm/app/index','app','','','llm_app_index','menu',0,0,'app',2,0,'应用管理','admin','admin','2024-05-20 11:39:09','2025-08-06 17:25:14');
INSERT INTO `menu` VALUES (40,3,'模型库','llm-list','/llm/model/index','model','','','llm_model_index','menu',0,0,'module',4,0,'模型库管理','admin','admin','2024-05-20 11:42:25','2025-08-06 17:26:01');
INSERT INTO `menu` VALUES (41,3,'知识库','knowledge','/llm/knowledge/index','knowledge','','','llm_knowledge_index','menu',0,0,'book-open',3,0,'知识库管理','admin','admin','2024-05-20 11:43:40','2025-08-06 17:23:15');
INSERT INTO `menu` VALUES (42,3,'工作流','workflow','/llm/workflow/index','workflow','','','llm_workflow_index','menu',0,0,'usercase-link-filled',5,0,'workflow','admin','admin','2024-05-20 11:46:34','2025-08-19 17:37:10');
INSERT INTO `menu` VALUES (43,2,'模型库','model','/draw/model/index','model','','','draw_model_index','menu',0,0,'',3,0,'','admin','admin','2024-06-24 20:00:15','2024-06-24 20:01:11');
INSERT INTO `menu` VALUES (45,2,'创意市场','market','/draw/market/index','market','','','draw_market_index','menu',0,0,'',1,0,'','admin','admin','2024-07-02 10:47:10','2024-07-02 10:47:10');
INSERT INTO `menu` VALUES (46,2,'训练','diffusion-train','draw/train/index','train','','','draw_train_index','menu',0,0,'',4,0,'','admin','admin','2024-07-02 10:49:51','2024-07-02 10:50:01');
INSERT INTO `menu` VALUES (47,3,'插件市场','plugin','/llm/plugin/index','plugin','','','llm_plugin_index','menu',0,0,'animation',6,0,'插件市场','admin','admin','2025-06-03 20:35:26','2025-08-25 14:43:45');
INSERT INTO `menu` VALUES (48,4,'设计工作流','workflow-design','/llm/workflow/designer','llm-workflow/design','','','llm_workflow_design','menu',1,1,'',5,0,'设计工作流','admin','admin','2025-07-09 11:32:37','2025-08-20 11:37:27');


DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `message_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `conversation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `content` json DEFAULT NULL COMMENT '消息内容',
  `role` enum('user','assistant','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user' COMMENT '消息角色',
  `status` enum('pending','streaming','complete','stop','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending' COMMENT '消息状态：pending-等待中，streaming-流式传输中，complete-已完成，stop-已停止，error-错误',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`message_id`) USING BTREE,
  KEY `idx_conversation_id` (`conversation_id`) USING BTREE,
  KEY `idx_role` (`role`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_created_at` (`created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='消息表';


DROP TABLE IF EXISTS `model_tag`;
CREATE TABLE `model_tag` (
  `tag_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`tag_id`,`model_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `plugin`;
CREATE TABLE `plugin` (
  `plugin_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '插件ID',
  `plugin_name` varchar(128) COLLATE utf8mb4_general_ci NOT NULL COMMENT '插件名称',
  `plugin_type` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '插件类型',
  `plugin_type_name` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '插件类型名称',
  `description` varchar(512) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '插件描述',
  `icon` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '图标',
  `version` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '版本',
  `author` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '作者',
  `config` json DEFAULT NULL COMMENT '配置',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '-1 deleted, 0 normal, 1 deactivated',
  `created_user` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '创建人',
  `updated_user` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '更新人',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`plugin_id`),
  KEY `idx_plugin_type` (`plugin_type`),
  KEY `idx_plugin_name` (`plugin_name`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='插件表';

--
-- Dumping data for table `plugin`
--

INSERT INTO `plugin` VALUES ('0c355799-9c0f-419c-85b4-8e38722b4631','条件分支','PLUGIN_LOGIC','逻辑插件','连接多个下游分支，若设定的条件成立则仅运行对应的分支，若均不成立则只运行"否则"分支','bifurcate','1.0.0','admin','{\"nodeType\": \"condition\", \"componentPath\": \"condition-node.vue\", \"nodeConfigSchema\": {\"type\": \"object\", \"required\": [\"inputs\", \"conditions\"], \"properties\": {\"inputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"input\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输入变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"text\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输入变量的数据类型\"}, \"source\": {\"type\": \"string\", \"title\": \"数据源\", \"default\": \"\", \"description\": \"选择数据来源（上游节点的输出）\"}}}, \"title\": \"输入变量\", \"default\": [{\"name\": \"input\", \"type\": \"text\", \"source\": \"\"}], \"description\": \"定义条件判断所需的输入变量\"}, \"conditions\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"variable\", \"operator\"], \"properties\": {\"value\": {\"type\": \"string\", \"title\": \"比较值\", \"default\": \"\", \"description\": \"输入要比较的值（某些操作符不需要此值）\"}, \"operator\": {\"enum\": [\"==\", \"!=\", \">\", \"<\", \">=\", \"<=\", \"contains\", \"startsWith\", \"endsWith\", \"isEmpty\", \"isNotEmpty\", \"isTrue\", \"isFalse\", \"matches\"], \"type\": \"string\", \"title\": \"操作符\", \"default\": \"==\", \"enumNames\": [\"等于\", \"不等于\", \"大于\", \"小于\", \"大于等于\", \"小于等于\", \"包含\", \"开头是\", \"结尾是\", \"为空\", \"不为空\", \"为真\", \"为假\", \"正则匹配\"], \"description\": \"选择比较操作符\"}, \"variable\": {\"type\": \"string\", \"title\": \"变量\", \"default\": \"\", \"description\": \"选择要判断的变量，使用{{变量名}}格式引用\"}, \"logicalOperator\": {\"enum\": [\"AND\", \"OR\"], \"type\": \"string\", \"title\": \"逻辑操作符\", \"default\": \"AND\", \"enumNames\": [\"且\", \"或\"], \"description\": \"与前一个条件的逻辑关系\"}}}, \"title\": \"条件列表\", \"default\": [{\"value\": \"\", \"operator\": \"==\", \"variable\": \"\", \"logicalOperator\": \"AND\"}], \"description\": \"定义工作流的条件分支，支持多条件组合\"}, \"description\": {\"type\": \"string\", \"title\": \"条件描述\", \"format\": \"textarea\", \"default\": \"\", \"description\": \"对这个条件节点的简要描述\"}}}}',0,'admin','admin','2025-09-04 20:30:14','2025-10-31 17:27:28');
INSERT INTO `plugin` VALUES ('1f2e3d4c-5b6a-7988-9c0d-1e2f3a4b5c6d','并行处理节点','PLUGIN_LOGIC','逻辑插件','支持多分支并行执行和结果合并','layers','1.0.0','system','{\"nodeType\": \"parallel\", \"componentPath\": \"parallel-node.vue\", \"nodeConfigSchema\": {\"type\": \"object\", \"required\": [\"inputs\", \"outputs\"], \"properties\": {\"inputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"input\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输入变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"text\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输入变量的数据类型\"}, \"source\": {\"type\": \"string\", \"title\": \"数据源\", \"default\": \"\", \"description\": \"选择数据来源（上游节点的输出）\"}}}, \"title\": \"输入变量\", \"default\": [{\"name\": \"input\", \"type\": \"text\", \"source\": \"\"}], \"description\": \"定义并行处理所需的输入变量\"}, \"outputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"output\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输出变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"array\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输出变量的数据类型\"}}}, \"title\": \"输出变量\", \"default\": [{\"name\": \"output\", \"type\": \"array\"}], \"description\": \"定义并行处理的输出变量\"}, \"timeout\": {\"type\": \"number\", \"title\": \"超时时间\", \"default\": 60, \"minimum\": 1, \"maximum\": 3600, \"description\": \"并行任务的超时时间（秒）\"}, \"strategy\": {\"enum\": [\"all\", \"any\", \"race\"], \"type\": \"string\", \"title\": \"执行策略\", \"default\": \"all\", \"enumNames\": [\"等待全部完成\", \"任一完成即可\", \"竞速模式\"], \"description\": \"并行分支的执行策略\"}, \"errorHandling\": {\"enum\": [\"fail-fast\", \"continue\", \"ignore\"], \"type\": \"string\", \"title\": \"错误处理\", \"default\": \"fail-fast\", \"enumNames\": [\"快速失败\", \"继续执行\", \"忽略错误\"], \"description\": \"当某个分支出错时的处理方式\"}, \"mergeStrategy\": {\"enum\": [\"collect\", \"merge\", \"first\", \"last\"], \"type\": \"string\", \"title\": \"合并策略\", \"default\": \"collect\", \"enumNames\": [\"收集为数组\", \"合并对象\", \"取第一个\", \"取最后一个\"], \"description\": \"多个分支结果的合并方式\"}}}}',0,'system','admin','2025-10-13 15:58:21','2025-10-13 16:58:41');
INSERT INTO `plugin` VALUES ('310d47c8-e7b8-4270-9643-9a5241e0e2ab','LLM','PLUGIN_AI','AI 插件','调用大语言模型进行文本处理','chat','1.0.0','admin','{\"nodeType\": \"llm\", \"displayField\": \"model\", \"nodeConfigSchema\": {\"type\": \"object\", \"required\": [\"inputs\", \"outputs\"], \"properties\": {\"topP\": {\"type\": \"number\", \"title\": \"Top P\", \"default\": 1, \"maximum\": 1, \"minimum\": 0}, \"model\": {\"type\": \"string\", \"title\": \"模型\", \"default\": \"\", \"description\": \"选择要使用的大语言模型\"}, \"inputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"input\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"类型\", \"default\": \"text\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"]}, \"source\": {\"type\": \"string\", \"title\": \"来源\", \"default\": \"\", \"description\": \"选择数据来源（上游节点的输出）\"}}}, \"title\": \"输入变量\", \"default\": [{\"name\": \"input\", \"type\": \"text\", \"source\": \"\"}], \"description\": \"定义LLM节点的输入变量，可以引用上游节点的输出\"}, \"outputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"output\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"类型\", \"default\": \"text\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"]}}}, \"title\": \"输出变量\", \"default\": [{\"name\": \"output\", \"type\": \"text\"}, {\"name\": \"reasoning_content\", \"type\": \"text\"}], \"description\": \"定义LLM节点的输出变量\"}, \"maxTokens\": {\"type\": \"number\", \"title\": \"最大令牌数\", \"default\": 2000, \"maximum\": 32000, \"minimum\": 1}, \"userPrompt\": {\"type\": \"string\", \"title\": \"用户提示词\", \"format\": \"textarea\", \"default\": \"\", \"description\": \"用户提示词，可以使用{{变量名}}、{{变量名.子变量名}}、{{变量名[数组索引]}}的方式引用输入参数中的变量\"}, \"temperature\": {\"type\": \"number\", \"title\": \"温度\", \"default\": 0.7, \"maximum\": 2, \"minimum\": 0}, \"systemPrompt\": {\"type\": \"string\", \"title\": \"系统提示词\", \"format\": \"textarea\", \"default\": \"\", \"description\": \"系统提示词，可以使用{{变量名}}、{{变量名.子变量名}}、{{变量名[数组索引]}}的方式引用输入参数中的变量\"}}}}',0,'admin','admin','2025-08-26 11:42:34','2025-10-27 16:42:30');
INSERT INTO `plugin` VALUES ('3f563ad2-5700-4e16-8d39-583315a88b00','结束','PLUGIN_COMMON','公共插件','工作流的最终节点，用于返回工作流运行后的结果信息','logout','1.0.0','admin','{\"nodeType\": \"end\", \"nodeConfigSchema\": {\"type\": \"object\", \"required\": [\"outputs\"], \"properties\": {\"outputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"output\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输出变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"text\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输出变量的数据类型\"}, \"source\": {\"type\": \"string\", \"title\": \"数据源\", \"default\": \"\", \"description\": \"输出变量的数据来源（引用其他节点的变量）\"}}}, \"title\": \"输出变量\", \"default\": [{\"name\": \"output\", \"type\": \"text\", \"source\": \"\", \"description\": \"\"}], \"description\": \"定义工作流的输出变量列表\"}}}}',0,'admin','admin','2025-08-26 11:24:22','2025-10-27 10:58:15');
INSERT INTO `plugin` VALUES ('5bdbf954-5264-4b87-a5de-a35b6742e896','HTTP 请求','PLUGIN_HTTP','HTTP 插件','用于发送API请求，从接口返回数据','net','1.0.0','admin','{\"nodeType\": \"http\", \"componentPath\": \"http-node.vue\", \"nodeConfigSchema\": {\"type\": \"object\", \"required\": [\"url\", \"method\", \"outputs\"], \"properties\": {\"inputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"input\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输入变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"text\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输入变量的数据类型\"}, \"source\": {\"type\": \"string\", \"title\": \"数据源\", \"default\": \"\", \"description\": \"选择数据来源（上游节点的输出）\"}}}, \"title\": \"输入变量\", \"default\": [], \"description\": \"定义HTTP请求所需的输入变量，可在URL、请求头、请求体中引用\"}, \"outputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"response\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输出变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"json\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输出变量的数据类型\"}}}, \"title\": \"输出变量\", \"default\": [{\"name\": \"response\", \"type\": \"json\"}, {\"name\": \"statusCode\", \"type\": \"number\"}, {\"name\": \"headers\", \"type\": \"object\"}], \"description\": \"定义HTTP请求的输出变量\"}, \"url\": {\"type\": \"string\", \"title\": \"请求地址\", \"default\": \"\", \"description\": \"HTTP请求的URL地址，支持使用{{变量名}}引用输入变量\"}, \"method\": {\"enum\": [\"GET\", \"POST\", \"PUT\", \"DELETE\", \"PATCH\", \"HEAD\", \"OPTIONS\"], \"type\": \"string\", \"title\": \"请求方法\", \"default\": \"GET\", \"enumNames\": [\"GET\", \"POST\", \"PUT\", \"DELETE\", \"PATCH\", \"HEAD\", \"OPTIONS\"], \"description\": \"HTTP请求方法\"}, \"headers\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"properties\": {\"key\": {\"type\": \"string\", \"title\": \"键\", \"default\": \"\"}, \"value\": {\"type\": \"string\", \"title\": \"值\", \"default\": \"\"}}}, \"title\": \"请求头\", \"default\": [], \"description\": \"HTTP请求头，支持使用{{变量名}}引用输入变量\"}, \"body\": {\"type\": \"string\", \"title\": \"请求体\", \"format\": \"textarea\", \"default\": \"\", \"description\": \"HTTP请求体内容，支持使用{{变量名}}引用输入变量\"}, \"bodyType\": {\"enum\": [\"none\", \"json\", \"form\", \"text\", \"xml\"], \"type\": \"string\", \"title\": \"请求体类型\", \"default\": \"json\", \"enumNames\": [\"无\", \"JSON\", \"表单\", \"文本\", \"XML\"], \"description\": \"请求体的内容类型\"}, \"timeout\": {\"type\": \"number\", \"title\": \"超时时间\", \"default\": 30, \"minimum\": 1, \"maximum\": 300, \"description\": \"请求超时时间（秒）\"}, \"retryCount\": {\"type\": \"number\", \"title\": \"重试次数\", \"default\": 0, \"minimum\": 0, \"maximum\": 5, \"description\": \"请求失败时的重试次数\"}, \"errorHandling\": {\"enum\": [\"fail\", \"continue\", \"default\"], \"type\": \"string\", \"title\": \"错误处理\", \"default\": \"fail\", \"enumNames\": [\"抛出错误\", \"继续执行\", \"使用默认值\"], \"description\": \"请求失败时的处理方式\"}}}}',0,'admin','admin','2025-09-08 14:28:21','2025-09-08 14:28:40');
INSERT INTO `plugin` VALUES ('7c8e9f12-3456-7890-abcd-ef1234567890','循环控制节点','PLUGIN_LOGIC','逻辑插件','支持for、while、foreach等循环控制逻辑','refresh','1.0.0','system','{\"nodeType\": \"loop\", \"componentPath\": \"loop-node.vue\", \"nodeConfigSchema\": {\"type\": \"object\", \"required\": [\"inputs\", \"outputs\", \"loopType\"], \"properties\": {\"inputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"items\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输入变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"array\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输入变量的数据类型\"}, \"source\": {\"type\": \"string\", \"title\": \"数据源\", \"default\": \"\", \"description\": \"选择数据来源（上游节点的输出）\"}}}, \"title\": \"输入变量\", \"default\": [{\"name\": \"items\", \"type\": \"array\", \"source\": \"\"}], \"description\": \"定义循环所需的输入变量\"}, \"outputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"output\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输出变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"array\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输出变量的数据类型\"}}}, \"title\": \"输出变量\", \"default\": [{\"name\": \"output\", \"type\": \"array\"}, {\"name\": \"index\", \"type\": \"number\"}, {\"name\": \"item\", \"type\": \"object\"}], \"description\": \"定义循环的输出变量\"}, \"loopType\": {\"enum\": [\"foreach\", \"for\", \"while\"], \"type\": \"string\", \"title\": \"循环类型\", \"default\": \"foreach\", \"enumNames\": [\"遍历数组\", \"计数循环\", \"条件循环\"], \"description\": \"选择循环的类型\"}, \"iterateVariable\": {\"type\": \"string\", \"title\": \"迭代变量\", \"default\": \"\", \"description\": \"foreach模式下要遍历的数组变量，使用{{变量名}}格式引用\"}, \"startIndex\": {\"type\": \"number\", \"title\": \"起始索引\", \"default\": 0, \"minimum\": 0, \"description\": \"for循环的起始索引\"}, \"endIndex\": {\"type\": \"number\", \"title\": \"结束索引\", \"default\": 10, \"minimum\": 0, \"description\": \"for循环的结束索引\"}, \"step\": {\"type\": \"number\", \"title\": \"步长\", \"default\": 1, \"minimum\": 1, \"description\": \"for循环的步长\"}, \"condition\": {\"type\": \"string\", \"title\": \"循环条件\", \"default\": \"\", \"description\": \"while循环的条件表达式，支持使用{{变量名}}引用变量\"}, \"maxIterations\": {\"type\": \"number\", \"title\": \"最大迭代次数\", \"default\": 100, \"minimum\": 1, \"maximum\": 10000, \"description\": \"防止无限循环的最大迭代次数\"}, \"breakCondition\": {\"type\": \"string\", \"title\": \"中断条件\", \"default\": \"\", \"description\": \"满足此条件时提前中断循环，支持使用{{变量名}}引用变量\"}, \"aggregation\": {\"enum\": [\"collect\", \"sum\", \"concat\", \"last\", \"first\"], \"type\": \"string\", \"title\": \"结果聚合\", \"default\": \"collect\", \"enumNames\": [\"收集为数组\", \"求和\", \"字符串连接\", \"取最后一个\", \"取第一个\"], \"description\": \"每次迭代结果的聚合方式\"}}}}',0,'system','admin','2025-10-13 15:58:06','2025-10-13 17:09:03');
INSERT INTO `plugin` VALUES ('9a8b7c6d-5e4f-3210-9876-543210fedcba','数据库操作节点','PLUGIN_COMMON','公共插件','支持数据库的增删改查操作和SQL执行','database','1.0.0','system','{\"nodeType\": \"database\", \"componentPath\": \"database-node.vue\", \"nodeConfigSchema\": {\"type\": \"object\", \"required\": [\"outputs\", \"operationType\"], \"properties\": {\"inputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"input\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输入变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"text\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输入变量的数据类型\"}, \"source\": {\"type\": \"string\", \"title\": \"数据源\", \"default\": \"\", \"description\": \"选择数据来源（上游节点的输出）\"}}}, \"title\": \"输入变量\", \"default\": [], \"description\": \"定义数据库操作所需的输入变量，可在SQL或条件中引用\"}, \"outputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"result\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输出变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"array\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输出变量的数据类型\"}}}, \"title\": \"输出变量\", \"default\": [{\"name\": \"result\", \"type\": \"array\"}, {\"name\": \"affectedRows\", \"type\": \"number\"}], \"description\": \"定义数据库操作的输出变量\"}, \"dataSource\": {\"type\": \"string\", \"title\": \"数据源\", \"default\": \"default\", \"description\": \"选择要连接的数据库配置\"}, \"operationType\": {\"enum\": [\"select\", \"insert\", \"update\", \"delete\", \"raw\"], \"type\": \"string\", \"title\": \"操作类型\", \"default\": \"select\", \"enumNames\": [\"查询\", \"插入\", \"更新\", \"删除\", \"原生SQL\"], \"description\": \"数据库操作的类型\"}, \"tableName\": {\"type\": \"string\", \"title\": \"表名\", \"default\": \"\", \"description\": \"要操作的数据库表名\"}, \"fields\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"字段名\", \"default\": \"\"}, \"alias\": {\"type\": \"string\", \"title\": \"别名\", \"default\": \"\"}, \"value\": {\"type\": \"string\", \"title\": \"值\", \"default\": \"\"}}}, \"title\": \"字段列表\", \"default\": [], \"description\": \"要查询或操作的字段，支持使用{{变量名}}引用输入变量\"}, \"conditions\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"properties\": {\"field\": {\"type\": \"string\", \"title\": \"字段\", \"default\": \"\"}, \"operator\": {\"enum\": [\"=\", \"!=\", \">\", \"<\", \">=\", \"<=\", \"LIKE\", \"IN\", \"NOT IN\", \"IS NULL\", \"IS NOT NULL\"], \"type\": \"string\", \"title\": \"操作符\", \"default\": \"=\", \"enumNames\": [\"等于\", \"不等于\", \"大于\", \"小于\", \"大于等于\", \"小于等于\", \"模糊匹配\", \"在列表中\", \"不在列表中\", \"为空\", \"不为空\"]}, \"value\": {\"type\": \"string\", \"title\": \"值\", \"default\": \"\"}, \"logicalOperator\": {\"enum\": [\"AND\", \"OR\"], \"type\": \"string\", \"title\": \"逻辑操作符\", \"default\": \"AND\", \"enumNames\": [\"且\", \"或\"]}}}, \"title\": \"查询条件\", \"default\": [], \"description\": \"数据库查询/更新/删除的条件，支持使用{{变量名}}引用输入变量\"}, \"sql\": {\"type\": \"string\", \"title\": \"原生SQL\", \"format\": \"textarea\", \"default\": \"\", \"description\": \"原生SQL语句，仅在操作类型为原生SQL时使用，支持使用{{变量名}}引用输入变量\"}, \"orderBy\": {\"type\": \"string\", \"title\": \"排序\", \"default\": \"\", \"description\": \"排序字段和方向，如：id DESC\"}, \"limit\": {\"type\": \"number\", \"title\": \"限制条数\", \"default\": 100, \"minimum\": 1, \"maximum\": 10000, \"description\": \"查询结果的最大条数\"}, \"errorHandling\": {\"enum\": [\"fail\", \"continue\", \"rollback\"], \"type\": \"string\", \"title\": \"错误处理\", \"default\": \"fail\", \"enumNames\": [\"抛出错误\", \"继续执行\", \"回滚事务\"], \"description\": \"数据库操作失败时的处理方式\"}}}}',0,'system','admin','2025-10-13 15:58:41','2025-10-13 16:58:33');
INSERT INTO `plugin` VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890','数据转换节点','PLUGIN_COMMON','公共插件','支持字段映射、数据过滤、格式转换等数据转换操作','swap','1.0.0','system','{\"nodeType\": \"transform\", \"componentPath\": \"transform-node.vue\", \"nodeConfigSchema\": {\"type\": \"object\", \"required\": [\"inputs\", \"outputs\", \"transformType\"], \"properties\": {\"inputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"input\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输入变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"object\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输入变量的数据类型\"}, \"source\": {\"type\": \"string\", \"title\": \"数据源\", \"default\": \"\", \"description\": \"选择数据来源（上游节点的输出）\"}}}, \"title\": \"输入变量\", \"default\": [{\"name\": \"input\", \"type\": \"object\", \"source\": \"\"}], \"description\": \"定义数据转换所需的输入变量\"}, \"outputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"output\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输出变量的名称\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"object\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输出变量的数据类型\"}}}, \"title\": \"输出变量\", \"default\": [{\"name\": \"output\", \"type\": \"object\"}], \"description\": \"定义数据转换的输出变量\"}, \"transformType\": {\"enum\": [\"mapping\", \"filter\", \"format\", \"script\", \"extract\", \"merge\"], \"type\": \"string\", \"title\": \"转换类型\", \"default\": \"mapping\", \"enumNames\": [\"字段映射\", \"数据过滤\", \"格式转换\", \"自定义脚本\", \"数据提取\", \"数据合并\"], \"description\": \"选择数据转换的类型\"}, \"rules\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"properties\": {\"sourceField\": {\"type\": \"string\", \"title\": \"源字段\", \"default\": \"\", \"description\": \"输入数据的字段路径，支持点号分隔的嵌套路径\"}, \"targetField\": {\"type\": \"string\", \"title\": \"目标字段\", \"default\": \"\", \"description\": \"输出数据的字段名称\"}, \"transform\": {\"enum\": [\"copy\", \"toString\", \"toNumber\", \"toBoolean\", \"toArray\", \"toJSON\", \"uppercase\", \"lowercase\", \"trim\", \"split\", \"join\", \"custom\"], \"type\": \"string\", \"title\": \"转换函数\", \"default\": \"copy\", \"enumNames\": [\"直接复制\", \"转为字符串\", \"转为数字\", \"转为布尔值\", \"转为数组\", \"转为JSON\", \"转大写\", \"转小写\", \"去空格\", \"分割\", \"合并\", \"自定义\"]}, \"defaultValue\": {\"type\": \"string\", \"title\": \"默认值\", \"default\": \"\", \"description\": \"当源字段不存在时使用的默认值\"}}}, \"title\": \"转换规则\", \"default\": [], \"description\": \"定义字段映射和转换规则\"}, \"filterCondition\": {\"type\": \"string\", \"title\": \"过滤条件\", \"format\": \"textarea\", \"default\": \"\", \"description\": \"数据过滤条件表达式，支持使用{{变量名}}引用输入变量\"}, \"inputFormat\": {\"enum\": [\"json\", \"xml\", \"csv\", \"text\", \"yaml\"], \"type\": \"string\", \"title\": \"输入格式\", \"default\": \"json\", \"enumNames\": [\"JSON\", \"XML\", \"CSV\", \"文本\", \"YAML\"], \"description\": \"输入数据的格式\"}, \"outputFormat\": {\"enum\": [\"json\", \"xml\", \"csv\", \"text\", \"yaml\"], \"type\": \"string\", \"title\": \"输出格式\", \"default\": \"json\", \"enumNames\": [\"JSON\", \"XML\", \"CSV\", \"文本\", \"YAML\"], \"description\": \"输出数据的格式\"}, \"customScript\": {\"type\": \"string\", \"title\": \"自定义脚本\", \"format\": \"textarea\", \"default\": \"\", \"description\": \"自定义JavaScript转换脚本，可使用input变量访问输入数据，返回转换后的数据\"}, \"errorHandling\": {\"enum\": [\"skip\", \"fail\", \"default\"], \"type\": \"string\", \"title\": \"错误处理\", \"default\": \"skip\", \"enumNames\": [\"跳过错误\", \"抛出错误\", \"使用默认值\"], \"description\": \"转换失败时的处理方式\"}}}}',0,'system','admin','2025-10-13 15:58:32','2025-10-13 17:00:36');
INSERT INTO `plugin` VALUES ('a5d4e858-2926-463f-a095-e81f0b20e4f7','开始','PLUGIN_COMMON','公共插件','工作流的起始节点，用于设定启动工作流需要的信息','login','1.0.0','admin','{\"nodeType\": \"start\", \"nodeConfigSchema\": {\"type\": \"object\", \"required\": [\"inputs\"], \"properties\": {\"inputs\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"required\": [\"name\", \"type\"], \"properties\": {\"name\": {\"type\": \"string\", \"title\": \"变量名\", \"default\": \"input\", \"pattern\": \"^[a-zA-Z_][a-zA-Z0-9_]*$\", \"description\": \"输入变量的名称，用于在工作流中引用\"}, \"type\": {\"enum\": [\"text\", \"json\", \"number\", \"boolean\", \"array\", \"object\"], \"type\": \"string\", \"title\": \"变量类型\", \"default\": \"text\", \"enumNames\": [\"文本\", \"JSON\", \"数字\", \"布尔值\", \"数组\", \"对象\"], \"description\": \"输入变量的数据类型\"}, \"required\": {\"type\": \"boolean\", \"title\": \"是否必填\", \"default\": true, \"description\": \"该输入变量是否为必填项\"}}}, \"title\": \"输入变量\", \"default\": [{\"name\": \"input\", \"type\": \"text\", \"required\": true, \"description\": \"\"}], \"description\": \"定义工作流的输入变量列表\"}}}}',0,'admin','admin','2025-08-25 19:36:56','2025-10-24 10:23:46');


DROP TABLE IF EXISTS `prompt`;
CREATE TABLE `prompt` (
  `prompt_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `content` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`prompt_id`) USING BTREE,
  KEY `idx_user_name` (`user_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `prompt`
--

INSERT INTO `prompt` VALUES ('e007b2ca-32df-4eb7-b141-39602f7dbe72','1','1','admin',0,'2024-09-09 16:30:56');


DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `role_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sort` int NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`role_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `role`
--

INSERT INTO `role` VALUES (1,'管理员','admin',1,0,'超级管理员','admin','admin','2021-11-02 10:37:56','2023-11-14 17:15:19');
INSERT INTO `role` VALUES (2,'客人','guest',2,0,'客人','admin','admin','2021-11-02 10:38:34','2023-11-14 17:15:29');



DROP TABLE IF EXISTS `role_menu`;
CREATE TABLE `role_menu` (
  `role_id` bigint unsigned NOT NULL,
  `menu_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`menu_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `role_menu`
--

INSERT INTO `role_menu` VALUES (1,1);
INSERT INTO `role_menu` VALUES (1,2);
INSERT INTO `role_menu` VALUES (1,3);
INSERT INTO `role_menu` VALUES (1,4);
INSERT INTO `role_menu` VALUES (1,5);
INSERT INTO `role_menu` VALUES (1,7);
INSERT INTO `role_menu` VALUES (1,8);
INSERT INTO `role_menu` VALUES (1,9);
INSERT INTO `role_menu` VALUES (1,10);
INSERT INTO `role_menu` VALUES (1,11);
INSERT INTO `role_menu` VALUES (1,12);
INSERT INTO `role_menu` VALUES (1,13);
INSERT INTO `role_menu` VALUES (1,14);
INSERT INTO `role_menu` VALUES (1,15);
INSERT INTO `role_menu` VALUES (1,16);
INSERT INTO `role_menu` VALUES (1,18);
INSERT INTO `role_menu` VALUES (1,21);
INSERT INTO `role_menu` VALUES (1,22);
INSERT INTO `role_menu` VALUES (1,23);
INSERT INTO `role_menu` VALUES (1,24);
INSERT INTO `role_menu` VALUES (1,25);
INSERT INTO `role_menu` VALUES (1,26);
INSERT INTO `role_menu` VALUES (1,27);
INSERT INTO `role_menu` VALUES (1,28);
INSERT INTO `role_menu` VALUES (1,29);
INSERT INTO `role_menu` VALUES (1,30);
INSERT INTO `role_menu` VALUES (1,31);
INSERT INTO `role_menu` VALUES (1,32);
INSERT INTO `role_menu` VALUES (1,33);
INSERT INTO `role_menu` VALUES (1,34);
INSERT INTO `role_menu` VALUES (1,35);
INSERT INTO `role_menu` VALUES (1,36);
INSERT INTO `role_menu` VALUES (1,37);
INSERT INTO `role_menu` VALUES (1,38);
INSERT INTO `role_menu` VALUES (1,39);
INSERT INTO `role_menu` VALUES (1,40);
INSERT INTO `role_menu` VALUES (1,41);
INSERT INTO `role_menu` VALUES (1,42);
INSERT INTO `role_menu` VALUES (1,43);
INSERT INTO `role_menu` VALUES (1,45);
INSERT INTO `role_menu` VALUES (1,46);
INSERT INTO `role_menu` VALUES (1,47);
INSERT INTO `role_menu` VALUES (1,48);


DROP TABLE IF EXISTS `role_user`;
CREATE TABLE `role_user` (
  `role_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `role_user`
--

INSERT INTO `role_user` VALUES (1,1);


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nick_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sex` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `avatar` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `login_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `login_date` datetime NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `user`
--

INSERT INTO `user` VALUES (1,'admin','管理员','admin@example.com','','MALE','','$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx','127.0.0.1','2024-01-01 00:00:00',0,'超级管理员','admin','admin','2024-01-01 00:00:00','2024-01-01 00:00:00');
-- INSERT INTO `user` VALUES (1,'admin','管理员','admin@example.com','','MALE','','$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx','127.0.0.1','2024-01-01 00:00:00',0,'超级管理员','admin','admin','2024-01-01 00:00:00','2024-01-01 00:00:00');


DROP TABLE IF EXISTS `workflow`;
CREATE TABLE `workflow` (
  `workflow_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL COMMENT '工作流ID',
  `workflow_name` varchar(128) COLLATE utf8mb4_general_ci NOT NULL COMMENT '工作流名称',
  `description` varchar(512) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '工作流描述',
  `version` varchar(32) COLLATE utf8mb4_general_ci DEFAULT '1.0.0' COMMENT '版本号',
  `status` tinyint(1) DEFAULT '0' COMMENT '状态：0-草稿，1-已发布，2-已归档',
  `config` json DEFAULT NULL COMMENT '工作流配置',
  `created_user` varchar(32) COLLATE utf8mb4_general_ci NOT NULL COMMENT '创建用户',
  `updated_user` varchar(32) COLLATE utf8mb4_general_ci NOT NULL COMMENT '更新用户',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`workflow_id`),
  KEY `idx_workflow_name` (`workflow_name`),
  KEY `idx_workflow_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='工作流表';

--
-- Dumping data for table `workflow`
--

INSERT INTO `workflow` VALUES ('500dd802-5b0f-44b4-9357-2ae3951bcaca','1','1','1.0.0',0,'{\"edges\": [{\"id\": \"edge-1761549337127\", \"data\": {}, \"type\": \"default\", \"label\": \"\", \"style\": {\"strokeWidth\": 2, \"strokeDasharray\": \"none\"}, \"events\": {}, \"source\": \"start-1761548693737\", \"target\": \"llm-1761549334583\", \"sourceX\": 246, \"sourceY\": 37.5, \"targetX\": 344, \"targetY\": 71.5, \"animated\": true, \"markerEnd\": {\"type\": \"arrow\", \"width\": 20, \"height\": 20}, \"sourceNode\": {\"id\": \"start-1761548693737\", \"data\": {\"label\": \"开始\", \"config\": {\"inputs\": [{\"name\": \"input\", \"type\": \"text\", \"required\": true, \"description\": \"\"}]}}, \"type\": \"start\", \"style\": {\"border\": \"none\", \"borderRadius\": \"8px\"}, \"events\": {}, \"dragging\": false, \"isParent\": false, \"position\": {\"x\": 0, \"y\": 0}, \"resizing\": false, \"selected\": false, \"dimensions\": {\"width\": 240, \"height\": 75}, \"initialized\": false, \"handleBounds\": {\"source\": [{\"x\": 234, \"y\": 31.5, \"id\": null, \"type\": \"source\", \"width\": 12, \"height\": 12, \"nodeId\": \"start-1761548693737\", \"position\": \"right\"}], \"target\": [{\"x\": -6, \"y\": 31.5, \"id\": null, \"type\": \"target\", \"width\": 12, \"height\": 12, \"nodeId\": \"start-1761548693737\", \"position\": \"left\"}]}, \"computedPosition\": {\"x\": 0, \"y\": 0, \"z\": 0}}, \"targetNode\": {\"id\": \"llm-1761549334583\", \"data\": {\"label\": \"LLM\", \"config\": {\"topP\": 1, \"model\": \"deepseek/deepseek-r1-0528-qwen3-8b\", \"inputs\": [{\"name\": \"input\", \"type\": \"text\", \"source\": \"start-1761548693737.input\"}], \"outputs\": [{\"name\": \"output\", \"type\": \"text\"}, {\"name\": \"reasoning_content\", \"type\": \"text\"}], \"maxTokens\": 2000, \"userPrompt\": \"\", \"temperature\": 0.7, \"systemPrompt\": \"\"}}, \"type\": \"llm\", \"style\": {\"border\": \"none\", \"borderRadius\": \"8px\"}, \"events\": {}, \"dragging\": false, \"isParent\": false, \"position\": {\"x\": 350, \"y\": 0}, \"resizing\": false, \"selected\": false, \"dimensions\": {\"width\": 240, \"height\": 143}, \"initialized\": false, \"handleBounds\": {\"source\": [{\"x\": 234, \"y\": 65.5, \"id\": null, \"type\": \"source\", \"width\": 12, \"height\": 12, \"nodeId\": \"llm-1761549334583\", \"position\": \"right\"}], \"target\": [{\"x\": -6, \"y\": 65.5, \"id\": null, \"type\": \"target\", \"width\": 12, \"height\": 12, \"nodeId\": \"llm-1761549334583\", \"position\": \"left\"}]}, \"computedPosition\": {\"x\": 350, \"y\": 0, \"z\": 0}}, \"sourceHandle\": null, \"targetHandle\": null}, {\"id\": \"edge-1761549338504\", \"data\": {}, \"type\": \"default\", \"label\": \"\", \"style\": {\"strokeWidth\": 2, \"strokeDasharray\": \"none\"}, \"events\": {}, \"source\": \"llm-1761549334583\", \"target\": \"end-1761548700720\", \"sourceX\": 596, \"sourceY\": 71.5, \"targetX\": 694, \"targetY\": 37.5, \"animated\": true, \"markerEnd\": {\"type\": \"arrow\", \"width\": 20, \"height\": 20}, \"sourceNode\": {\"id\": \"llm-1761549334583\", \"data\": {\"label\": \"LLM\", \"config\": {\"topP\": 1, \"model\": \"deepseek/deepseek-r1-0528-qwen3-8b\", \"inputs\": [{\"name\": \"input\", \"type\": \"text\", \"source\": \"start-1761548693737.input\"}], \"outputs\": [{\"name\": \"output\", \"type\": \"text\"}, {\"name\": \"reasoning_content\", \"type\": \"text\"}], \"maxTokens\": 2000, \"userPrompt\": \"\", \"temperature\": 0.7, \"systemPrompt\": \"\"}}, \"type\": \"llm\", \"style\": {\"border\": \"none\", \"borderRadius\": \"8px\"}, \"events\": {}, \"dragging\": false, \"isParent\": false, \"position\": {\"x\": 350, \"y\": 0}, \"resizing\": false, \"selected\": false, \"dimensions\": {\"width\": 240, \"height\": 143}, \"initialized\": false, \"handleBounds\": {\"source\": [{\"x\": 234, \"y\": 65.5, \"id\": null, \"type\": \"source\", \"width\": 12, \"height\": 12, \"nodeId\": \"llm-1761549334583\", \"position\": \"right\"}], \"target\": [{\"x\": -6, \"y\": 65.5, \"id\": null, \"type\": \"target\", \"width\": 12, \"height\": 12, \"nodeId\": \"llm-1761549334583\", \"position\": \"left\"}]}, \"computedPosition\": {\"x\": 350, \"y\": 0, \"z\": 0}}, \"targetNode\": {\"id\": \"end-1761548700720\", \"data\": {\"label\": \"结束\", \"config\": {\"outputs\": [{\"name\": \"output\", \"type\": \"text\", \"source\": \"llm-1761549334583.output\", \"description\": \"\"}, {\"name\": \"output2\", \"type\": \"text\", \"source\": \"llm-1761549334583.reasoning_content\"}, {\"name\": \"output3\", \"type\": \"text\", \"source\": \"start-1761548693737.input\"}]}}, \"type\": \"end\", \"style\": {\"border\": \"none\", \"borderRadius\": \"8px\"}, \"events\": {}, \"dragging\": false, \"isParent\": false, \"position\": {\"x\": 700, \"y\": 0}, \"resizing\": false, \"selected\": false, \"dimensions\": {\"width\": 240, \"height\": 75}, \"initialized\": false, \"handleBounds\": {\"source\": [{\"x\": 233.99996948242188, \"y\": 31.5, \"id\": null, \"type\": \"source\", \"width\": 12, \"height\": 12, \"nodeId\": \"end-1761548700720\", \"position\": \"right\"}], \"target\": [{\"x\": -6, \"y\": 31.5, \"id\": null, \"type\": \"target\", \"width\": 12, \"height\": 12, \"nodeId\": \"end-1761548700720\", \"position\": \"left\"}]}, \"computedPosition\": {\"x\": 700, \"y\": 0, \"z\": 0}}, \"sourceHandle\": null, \"targetHandle\": null}], \"nodes\": [{\"id\": \"start-1761548693737\", \"data\": {\"label\": \"开始\", \"config\": {\"inputs\": [{\"name\": \"input\", \"type\": \"text\", \"required\": true, \"description\": \"\"}]}}, \"type\": \"start\", \"style\": {\"border\": \"none\", \"borderRadius\": \"8px\"}, \"events\": {}, \"dragging\": false, \"isParent\": false, \"position\": {\"x\": 0, \"y\": 0}, \"resizing\": false, \"selected\": false, \"dimensions\": {\"width\": 240, \"height\": 75}, \"initialized\": false, \"handleBounds\": {\"source\": [{\"x\": 234, \"y\": 31.5, \"id\": null, \"type\": \"source\", \"width\": 12, \"height\": 12, \"nodeId\": \"start-1761548693737\", \"position\": \"right\"}], \"target\": [{\"x\": -6, \"y\": 31.5, \"id\": null, \"type\": \"target\", \"width\": 12, \"height\": 12, \"nodeId\": \"start-1761548693737\", \"position\": \"left\"}]}, \"computedPosition\": {\"x\": 0, \"y\": 0, \"z\": 0}}, {\"id\": \"end-1761548700720\", \"data\": {\"label\": \"结束\", \"config\": {\"outputs\": [{\"name\": \"output\", \"type\": \"text\", \"source\": \"llm-1761549334583.output\", \"description\": \"\"}, {\"name\": \"output2\", \"type\": \"text\", \"source\": \"llm-1761549334583.reasoning_content\"}, {\"name\": \"output3\", \"type\": \"text\", \"source\": \"start-1761548693737.input\"}]}}, \"type\": \"end\", \"style\": {\"border\": \"none\", \"borderRadius\": \"8px\"}, \"events\": {}, \"dragging\": false, \"isParent\": false, \"position\": {\"x\": 700, \"y\": 0}, \"resizing\": false, \"selected\": false, \"dimensions\": {\"width\": 240, \"height\": 75}, \"initialized\": false, \"handleBounds\": {\"source\": [{\"x\": 233.99996948242188, \"y\": 31.5, \"id\": null, \"type\": \"source\", \"width\": 12, \"height\": 12, \"nodeId\": \"end-1761548700720\", \"position\": \"right\"}], \"target\": [{\"x\": -6, \"y\": 31.5, \"id\": null, \"type\": \"target\", \"width\": 12, \"height\": 12, \"nodeId\": \"end-1761548700720\", \"position\": \"left\"}]}, \"computedPosition\": {\"x\": 700, \"y\": 0, \"z\": 0}}, {\"id\": \"llm-1761549334583\", \"data\": {\"label\": \"LLM\", \"config\": {\"topP\": 1, \"model\": \"deepseek/deepseek-r1-0528-qwen3-8b\", \"inputs\": [{\"name\": \"input\", \"type\": \"text\", \"source\": \"start-1761548693737.input\"}], \"outputs\": [{\"name\": \"output\", \"type\": \"text\"}, {\"name\": \"reasoning_content\", \"type\": \"text\"}], \"maxTokens\": 2000, \"userPrompt\": \"\", \"temperature\": 0.7, \"systemPrompt\": \"\"}}, \"type\": \"llm\", \"style\": {\"border\": \"none\", \"borderRadius\": \"8px\"}, \"events\": {}, \"dragging\": false, \"isParent\": false, \"position\": {\"x\": 350, \"y\": 0}, \"resizing\": false, \"selected\": false, \"dimensions\": {\"width\": 240, \"height\": 143}, \"initialized\": false, \"handleBounds\": {\"source\": [{\"x\": 234, \"y\": 65.5, \"id\": null, \"type\": \"source\", \"width\": 12, \"height\": 12, \"nodeId\": \"llm-1761549334583\", \"position\": \"right\"}], \"target\": [{\"x\": -6, \"y\": 65.5, \"id\": null, \"type\": \"target\", \"width\": 12, \"height\": 12, \"nodeId\": \"llm-1761549334583\", \"position\": \"left\"}]}, \"computedPosition\": {\"x\": 350, \"y\": 0, \"z\": 0}}], \"variables\": []}','admin','admin','2025-08-21 10:34:17','2026-01-23 17:01:54');


DROP TABLE IF EXISTS `workflow_execution`;
CREATE TABLE `workflow_execution` (
  `execution_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL COMMENT '执行ID',
  `workflow_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL COMMENT '工作流ID',
  `inputs` json DEFAULT NULL COMMENT '输入参数',
  `outputs` json DEFAULT NULL COMMENT '输出结果',
  `status` tinyint(1) DEFAULT '0' COMMENT '执行状态：0-运行中，1-成功，2-失败，3-已停止',
  `error_message` text COLLATE utf8mb4_general_ci COMMENT '错误信息',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `duration` int DEFAULT NULL COMMENT '执行时长(秒)',
  `created_user` varchar(32) COLLATE utf8mb4_general_ci NOT NULL COMMENT '创建用户',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`execution_id`),
  KEY `idx_workflow_id` (`workflow_id`),
  KEY `idx_execution_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='工作流执行记录表';
