-- MariaDB dump 10.19-11.3.2-MariaDB, for osx10.19 (arm64)
--
-- Host: 43.129.16.216    Database: lingmengcan
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `control_net_preprocessor`
--

DROP TABLE IF EXISTS `control_net_preprocessor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `control_net_preprocessor` (
  `preprocessor_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `preprocessor_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `preprocessor_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `preprocessor_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `params` json NOT NULL,
  `sort` int NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `updated_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`preprocessor_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `control_net_preprocessor`
--

LOCK TABLES `control_net_preprocessor` WRITE;
/*!40000 ALTER TABLE `control_net_preprocessor` DISABLE KEYS */;
INSERT INTO `control_net_preprocessor` VALUES
(1,'canny (硬边缘检测)','canny','Canny','{\"model\": \"control_v11p_sd15_canny [d14c016b]\", \"module\": \"canny\", \"weight\": 1, \"threshold_a\": 100, \"threshold_b\": 200, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0, \"threshold_step\": 1, \"max_threshold_a\": 255, \"max_threshold_b\": 255, \"min_threshold_a\": 1, \"min_threshold_b\": 1, \"threshold_a_label\": \"Low Threshold\", \"threshold_b_label\": \"High Threshold\"}',1,0,'Canny (线稿检测)','admin','admin','2024-08-12 16:29:36','2024-08-12 16:32:24'),
(2,'lineart_realistic（写实线稿）','lineart_realistic','Lineart','{\"model\": \"\", \"module\": \"lineart_realistic\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',2,0,'lineart_realistic（写实线稿）','admin','admin','2024-08-12 16:33:24','2024-08-12 16:42:46'),
(3,'lineart_anime（动漫线稿）','lineart_anime','Lineart','{\"model\": \"\", \"module\": \"lineart_anime\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',3,0,'lineart_anime（动漫线稿）','admin','admin','2024-08-12 16:42:23','2024-08-12 16:42:23'),
(4,'softedge_pidinet（软边缘检测 - PiDiNET算法）','softedge_pidinet','SoftEdge','{\"model\": \"\", \"module\": \"softedge_pidinet\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',4,0,'softedge_pidinet（软边缘检测 - PiDiNET算法）','admin','admin','2024-08-12 16:47:48','2024-08-12 16:47:48'),
(5,'softedge_hed（软边缘检测 - HED）','softedge_hed','SoftEdge','{\"model\": \"\", \"module\": \"softedge_pidinet\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',5,0,'softedge_hed（软边缘检测 - HED）','admin','admin','2024-08-12 16:49:13','2024-08-12 16:49:13'),
(6,'openpose（人体姿态检测 - 身体）','openpose','OpenPose','{\"model\": \"\", \"module\": \"openpose\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',6,0,'openpose（人体姿态检测）','admin','admin','2024-08-12 16:50:51','2024-08-12 16:51:16'),
(7,'openpose_full（人体姿态检测 - 身、手、脸）','openpose_full','OpenPose','{\"model\": \"\", \"module\": \"openpose_full\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',7,0,'openpose_full（人体姿态检测 - 身、手、脸）','admin','admin','2024-08-12 16:52:35','2024-08-12 16:52:35'),
(8,'openpose_faceonly（人体姿态检测 - 脸）','openpose_faceonly','OpenPose','{\"model\": \"\", \"module\": \"openpose_faceonly\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',8,0,'openpose_faceonly（人体姿态检测 - 脸）','admin','admin','2024-08-12 16:53:47','2024-08-12 16:53:47'),
(9,'depth_leres（LeRes 深度估算）','depth_leres','Depth','{\"model\": \"\", \"module\": \"depth_leres\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',9,0,'depth_leres（LeRes 深度估算）','admin','admin','2024-08-12 16:55:28','2024-08-12 16:55:28'),
(10,'depth_zoe（ZoE深度估算）','depth_zoe','Depth','{\"model\": \"\", \"module\": \"depth_zoe\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',10,0,'depth_zoe（ZoE深度估算）','admin','admin','2024-08-12 16:56:22','2024-08-12 16:56:22'),
(11,'mlsd（直线检测）','mlsd','MLSD','{\"model\": \"\", \"module\": \"mlsd\", \"weight\": 1, \"threshold_a\": 0.1, \"threshold_b\": 0.1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0, \"threshold_step\": 0.01, \"max_threshold_a\": 2, \"max_threshold_b\": 20, \"min_threshold_a\": 0.01, \"min_threshold_b\": 0.01, \"threshold_a_label\": \"MLSD Value Threshold\", \"threshold_b_label\": \"MLSD Distance Threshold\"}',11,0,'mlsd（直线检测）','admin','admin','2024-08-12 16:57:08','2024-08-12 16:57:08'),
(12,'normal_bae（法线贴图）','normal_bae','NormalMap','{\"model\": \"\", \"module\": \"normal_bae\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',12,0,'normal_bae（法线贴图）','admin','admin','2024-08-12 16:59:11','2024-08-12 16:59:16'),
(13,'scribble_hed（整体嵌套）','scribble_hed','Scribble','{\"model\": \"\", \"module\": \"scribble_hed\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',13,0,'scribble_hed（整体嵌套）','admin','admin','2024-08-12 17:00:40','2024-08-12 17:00:40'),
(14,'seg_ofade20k（分块检测）','seg_ofade20k','Segmentation','{\"model\": \"\", \"module\": \"seg_ofade20k\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',14,0,'seg_ofade20k（分块检测）','admin','admin','2024-08-12 17:22:14','2024-08-12 17:22:14'),
(15,'t2ia_style_clipvision（风格迁移）','t2ia_style_clipvision','T2I-Adapter','{\"model\": \"\", \"module\": \"t2ia_style_clipvision\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',15,0,'t2ia_style_clipvision（风格迁移）','admin','admin','2024-08-12 17:23:56','2024-08-12 17:23:56'),
(16,'t2ia_sketch_pidi（像素差边缘检测）','t2ia_sketch_pidi','T2I-Adapter','{\"model\": \"\", \"module\": \"t2ia_sketch_pidi\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',16,0,'t2ia_sketch_pidi（像素差边缘检测）','admin','admin','2024-08-12 17:25:09','2024-08-12 17:25:09'),
(17,'t2ia_color_grid（色彩像素化）','t2ia_color_grid','T2I-Adapter','{\"model\": \"\", \"module\": \"t2ia_color_grid\", \"weight\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0}',17,0,'t2ia_color_grid（色彩像素化）','admin','admin','2024-08-12 17:25:47','2024-08-12 17:25:47'),
(18,'tile_resample（高清修复）','tile_resample','Tile','{\"model\": \"\", \"module\": \"tile_resample\", \"weight\": 1, \"threshold_a\": 1, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0, \"threshold_step\": 0.01, \"max_threshold_a\": 8, \"min_threshold_a\": 1, \"threshold_a_label\": \"Down Sampling Rate\"}',18,0,'tile_resample（高清修复）','admin','admin','2024-08-12 17:26:30','2024-08-12 17:26:30'),
(19,'reference_only（图像参考）','reference_only','Reference','{\"model\": \"\", \"module\": \"reference_only\", \"weight\": 1, \"threshold_a\": 0.5, \"guidance_end\": 1, \"processor_res\": 512, \"guidance_start\": 0, \"threshold_step\": 0.01, \"max_threshold_a\": 1, \"min_threshold_a\": 0, \"threshold_a_label\": \"Style Fidelity (only for Balanced mode)\"}',19,0,'reference_only（图像参考）','admin','admin','2024-08-12 17:27:08','2024-08-12 17:27:23');
/*!40000 ALTER TABLE `control_net_preprocessor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation`
--

DROP TABLE IF EXISTS `conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conversation` (
  `conversation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `conversation_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `llm` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `temperature` float NOT NULL,
  `max_tokens` int NOT NULL,
  `top_p` float NOT NULL,
  `system_prompt` text COLLATE utf8mb4_bin NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dict`
--

DROP TABLE IF EXISTS `dict`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dict` (
  `dict_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `dict_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `dict_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `dict_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sort` int NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `updated_user` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`dict_id`) USING BTREE,
  UNIQUE KEY `dict_unique` (`dict_code`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dict`
--

LOCK TABLES `dict` WRITE;
/*!40000 ALTER TABLE `dict` DISABLE KEYS */;
INSERT INTO `dict` VALUES
(1,'','0_ROOT_TYPE','根字典',0,0,'根字典','admin','admin','2024-07-31 15:30:10','2024-07-31 15:30:10'),
(2,'0_ROOT_TYPE','SYS_STATUS','状态',1,0,'状态（0：正常，1：停用，-1：删除）','admin','admin','2024-01-08 11:03:52','2024-01-08 11:03:52'),
(3,'SYS_STATUS','0','正常',1,0,'正常','admin','admin','2024-01-08 11:06:22','2024-01-08 11:06:22'),
(4,'SYS_STATUS','1','停用',2,0,'停用','admin','admin','2024-01-08 11:07:59','2024-01-08 11:12:48'),
(5,'SYS_STATUS','-1','删除',3,1,'状态软删除','admin','admin','2024-01-08 11:08:47','2024-01-08 11:12:54'),
(6,'SYS_SEX','MALE','男',1,0,'男','admin','admin','2024-01-08 11:10:05','2024-01-08 11:10:29'),
(7,'SYS_SEX','FEMALE','女',2,0,'女','admin','admin','2024-01-08 11:10:24','2024-01-08 11:10:24'),
(8,'SYS_SEX','UNKNOW','未知',3,0,'未知','admin','admin','2024-01-08 11:10:56','2024-01-08 11:10:56'),
(9,'LLM_TYPE','GENERAL_LLM','通用模型',1,0,'通用模型','admin','admin','2024-01-08 10:57:05','2024-06-24 20:13:46'),
(10,'LLM_TYPE','EMBEDDING_LLM','Embedding',2,0,'Embedding模型','admin','admin','2024-01-08 10:57:05','2024-06-24 20:13:36'),
(11,'DIFFUSION_MODEL_TYPE','BASE_MODEL','基础模型',1,0,'基础模型','admin','admin','2024-06-24 20:10:08','2024-06-24 20:10:08'),
(12,'DIFFUSION_MODEL_TYPE','LORA_DIFFUSION','LoRA',3,0,'LoRA模型','admin','admin','2024-06-24 20:11:47','2024-07-31 10:29:12'),
(13,'DIFFUSION_MODEL_TYPE','EMBEDDING_ DIFFUSION','Embedding',4,0,'Embedding模型','admin','admin','2024-06-24 20:12:30','2024-07-31 10:29:18'),
(14,'DIFFUSION_TAGS','TOPIC','主题',1,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(15,'DIFFUSION_TAGS','STYLE','风格',2,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(16,'TOPIC','COMIC_GAME','动漫游戏',1,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(17,'TOPIC','REALISTIC','摄影写实',2,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(18,'TOPIC','CHINESE_STYLE','中国风',3,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(19,'TOPIC','ILLUSTRATION','插画',4,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(20,'TOPIC','3D','3D立体',5,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(21,'TOPIC','FLAT_ABSTRACTION','扁平抽象',6,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(22,'TOPIC','HAND_DAWN','手绘风格',7,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(23,'STYLE','PERSON','人物',1,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(24,'STYLE','SCENE','场景',2,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(25,'STYLE','IP','IP形象',3,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(26,'STYLE','DRESS','服饰',4,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(27,'STYLE','ANIMAL','动物',5,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(28,'STYLE','SCENERY','风景',6,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(30,'STYLE','GOODS','商品',7,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(31,'STYLE','BULIDING','建筑',8,0,'','admin','admin','2024-06-24 20:12:30','2024-06-24 20:12:54'),
(32,'0_ROOT_TYPE','SAMPLER','采样器',6,0,'stable diffusion 采样器','admin','admin','2024-07-08 11:21:42','2024-07-08 11:24:43'),
(33,'0_ROOT_TYPE','DIFFUSION_MODEL_TYPE','SD模型类型',4,0,'SD模型类型','admin','admin','2024-07-08 11:22:41','2024-07-08 11:22:41'),
(34,'0_ROOT_TYPE','DIFFUSION_TAGS','SD模型标签',5,0,'SD模型标签','admin','admin','2024-07-08 11:23:45','2024-07-08 11:23:45'),
(35,'0_ROOT_TYPE','LLM_TYPE','大语言模型类型',3,0,'大语言模型类型','admin','admin','2024-07-08 11:24:30','2024-07-08 11:24:30'),
(36,'SAMPLER','Euler','Euler',2,0,'Euler Sampler','admin','admin','2024-07-08 11:38:49','2024-07-17 17:06:48'),
(37,'SAMPLER','Euler a','Euler a',1,0,'Euler Ancestral Sampler','admin','admin','2024-07-08 11:40:33','2024-07-17 17:06:42'),
(38,'SAMPLER','LMS','LMS',3,0,'LMS Sampler','admin','admin','2024-07-08 11:41:40','2024-07-17 17:06:56'),
(39,'SAMPLER','Heun','Heun',4,0,'Heun Sampler','admin','admin','2024-07-08 11:42:18','2024-07-17 17:07:01'),
(40,'SAMPLER','DPM2','DPM2',5,0,'DPM Sampler 2nd Order','admin','admin','2024-07-08 11:43:15','2024-07-17 17:07:49'),
(41,'SAMPLER','DPM2 a','DPM2 a',6,0,'DPM Ancestral Sampler 2nd Order','admin','admin','2024-07-08 11:43:46','2024-07-17 17:07:56'),
(42,'SAMPLER','DPM++ 2S a','DPM++ 2S a',7,0,'DPM++ 2S Ancestral Sampler','admin','admin','2024-07-08 11:45:27','2024-07-17 17:08:03'),
(43,'SAMPLER','DPM++ 2M','DPM++ 2M',8,0,'DPM++ 2M Sampler','admin','admin','2024-07-08 11:46:03','2024-07-17 17:08:09'),
(44,'SAMPLER','DPM++ SDE','DPM++ SDE',9,0,'DPM++ SDE Sampler','admin','admin','2024-07-08 11:46:33','2024-07-17 17:08:16'),
(45,'SAMPLER','DPM adaptive','DPM adaptive',10,0,'Adaptive DPM Sampler','admin','admin','2024-07-08 11:47:31','2024-07-17 17:09:23'),
(46,'SAMPLER','LMS Karras','LMS Karras',11,1,'LMS Karras Sampler','admin','admin','2024-07-08 11:48:46','2024-08-01 14:51:50'),
(47,'SAMPLER','DPM2 Karras','DPM2 Karras',12,1,'DPM Sampler 2nd Order Karras','admin','admin','2024-07-08 14:27:25','2024-08-01 14:51:54'),
(48,'SAMPLER','DPM2 a Karras','DPM2 a Karras',13,1,'DPM Ancestral Sampler 2nd Order Karras','admin','admin','2024-07-08 14:28:51','2024-08-01 14:51:58'),
(50,'SAMPLER','DPM++ 2S a Karras','DPM++ 2S a Karras',14,1,'DPM++ 2S Ancestral Sampler Karras','admin','admin','2024-07-08 14:43:17','2024-08-01 14:52:03'),
(51,'SAMPLER','DPM++ 2M Karras','DPM++ 2M Karras',15,1,'DPM++ 2M Sampler Karras','admin','admin','2024-07-08 14:54:58','2024-08-01 14:52:07'),
(52,'SAMPLER','DPM++ 2M SDE Exponential','DPM++ 2M SDE Exponential',16,0,'DPM++ 2M SDE Exponential','admin','admin','2024-07-08 14:59:17','2024-07-17 17:10:10'),
(53,'SAMPLER','DPM++ 2M SDE Karras','DPM++ 2M SDE Karras',17,1,'DPM++ 2M SDE Karras','admin','admin','2024-07-08 15:10:43','2024-08-01 14:52:13'),
(54,'SAMPLER','DPM++ 2M SDE Heun Karras','DPM++ 2M SDE Heun Karras',18,1,'DPM++ 2M SDE Heun Karras','admin','admin','2024-07-08 15:20:48','2024-08-01 14:52:20'),
(55,'SAMPLER','DPM++ 2M SDE Heun Exponential','DPM++ 2M SDE Heun Exponential',19,0,'DPM++ 2M SDE Heun Exponential','admin','admin','2024-07-08 15:23:17','2024-07-17 17:10:29'),
(56,'SAMPLER','DPM++ SDE Karras','DPM++ SDE Karras',20,1,'DPM+ SDE Karras','admin','admin','2024-07-08 15:25:23','2024-08-01 14:52:25'),
(57,'SAMPLER','DDIM','DDIM',21,0,'Denoising Diffusion Implicit Models','admin','admin','2024-07-08 15:27:08','2024-07-17 17:10:42'),
(58,'SAMPLER','PLMS','PLMS',22,0,'Pseudonormal Langevin Method Sampler','admin','admin','2024-07-08 15:27:43','2024-07-17 17:10:46'),
(59,'SAMPLER','UniPC','UniPC',23,0,'Unified Predictor-Corrector Sampler','admin','admin','2024-07-08 15:29:57','2024-07-17 17:10:51'),
(60,'SAMPLER','Restart','Restart',24,0,'Restart Sampler','admin','admin','2024-07-08 15:32:00','2024-07-17 17:10:57'),
(61,'DIFFUSION_MODEL_TYPE','CHECKPOINT_DIFFUSION','Checkpoint',2,0,'Checkpoint model','admin','admin','2024-07-31 10:28:34','2024-07-31 10:29:05'),
(62,'0_ROOT_TYPE','SYS_SEX','性别',2,0,'性别','admin','admin','2024-01-08 10:57:05','2024-01-08 11:09:18'),
(64,'DIFFUSION_MODEL_TYPE','NOT_DIFFUSION_MODEL','非SD模型',9,0,'生图，非SD模型','admin','admin','2024-07-31 15:44:54','2024-07-31 15:44:54'),
(65,'0_ROOT_TYPE','HIRES_FIX_UPSCALER','高分辨率算法',7,0,'SD高分辨率算法','admin','admin','2024-08-01 14:46:36','2024-08-01 14:46:36'),
(66,'HIRES_FIX_UPSCALER','Latent','Latent',1,0,'Latent','admin','admin','2024-08-01 14:47:05','2024-08-01 14:47:05'),
(67,'HIRES_FIX_UPSCALER','Latent (antialiased)','Latent (antialiased)',2,0,'Latent (antialiased)','admin','admin','2024-08-01 14:54:12','2024-08-01 14:54:19'),
(68,'HIRES_FIX_UPSCALER','Latent (bicubic)','Latent (bicubic)',3,0,'Latent (bicubic)','admin','admin','2024-08-01 14:54:35','2024-08-01 14:54:35'),
(69,'HIRES_FIX_UPSCALER','Latent (bicubic antialiased)','Latent (bicubic antialiased)',4,0,'Latent (bicubic antialiased)','admin','admin','2024-08-01 14:54:52','2024-08-01 14:54:52'),
(70,'HIRES_FIX_UPSCALER','Latent (nearest)','Latent (nearest)',5,0,'Latent (nearest)','admin','admin','2024-08-01 14:55:06','2024-08-01 14:55:06'),
(71,'HIRES_FIX_UPSCALER','Latent (nearest-exact)','Latent (nearest-exact)',6,0,'Latent (nearest-exact)','admin','admin','2024-08-01 14:55:21','2024-08-01 14:55:21'),
(72,'HIRES_FIX_UPSCALER','None','None',7,0,'None','admin','admin','2024-08-01 14:55:37','2024-08-01 14:55:37'),
(73,'HIRES_FIX_UPSCALER','Lanczos','Lanczos',8,0,'Lanczos','admin','admin','2024-08-01 14:55:52','2024-08-01 14:55:52'),
(74,'HIRES_FIX_UPSCALER','Nearest','Nearest',9,0,'Nearest','admin','admin','2024-08-01 14:56:06','2024-08-01 14:56:15'),
(75,'HIRES_FIX_UPSCALER','DAT x2','DAT x2',10,0,'DAT x2','admin','admin','2024-08-01 14:56:42','2024-08-01 14:56:42'),
(76,'HIRES_FIX_UPSCALER','DAT x3','DAT x3',11,0,'DAT x3','admin','admin','2024-08-01 14:56:54','2024-08-01 14:56:54'),
(77,'HIRES_FIX_UPSCALER','DAT x4','DAT x4',12,0,'DAT x4','admin','admin','2024-08-01 14:57:24','2024-08-01 14:57:24'),
(78,'HIRES_FIX_UPSCALER','ESRGAN_4x','ESRGAN_4x',13,0,'ESRGAN_4x','admin','admin','2024-08-01 14:59:55','2024-08-01 14:59:55'),
(79,'HIRES_FIX_UPSCALER','LDSR','LDSR',14,0,'LDSR','admin','admin','2024-08-01 15:00:33','2024-08-01 15:00:33'),
(80,'HIRES_FIX_UPSCALER','R-ESRGAN 4x+','R-ESRGAN 4x+',15,0,'R-ESRGAN 4x+','admin','admin','2024-08-01 15:00:59','2024-08-01 15:00:59'),
(81,'HIRES_FIX_UPSCALER','R-ESRGAN 4x+ Anime6B','R-ESRGAN 4x+ Anime6B',16,0,'R-ESRGAN 4x+ Anime6B','admin','admin','2024-08-01 15:01:14','2024-08-01 15:01:14'),
(82,'HIRES_FIX_UPSCALER','ScuNET GAN','ScuNET GAN',17,0,'ScuNET GAN','admin','admin','2024-08-01 15:01:28','2024-08-01 15:01:28'),
(83,'HIRES_FIX_UPSCALER','ScuNET PSNR','ScuNET PSNR',18,0,'ScuNET PSNR','admin','admin','2024-08-01 15:01:46','2024-08-01 15:01:46'),
(84,'HIRES_FIX_UPSCALER','SwinIR 4x','SwinIR 4x',19,0,'SwinIR 4x','admin','admin','2024-08-01 15:02:08','2024-08-01 15:02:08'),
(85,'0_ROOT_TYPE','CONTROL_NET_TYPE','控制类型',8,0,'stable diffusion ControlNet 控制类型','admin','admin','2024-08-12 16:26:58','2024-08-12 16:26:58'),
(86,'CONTROL_NET_TYPE','Canny','Canny (硬边缘)',1,0,'Canny (硬边缘)','admin','admin','2024-08-12 16:29:36','2024-08-12 16:32:24'),
(87,'CONTROL_NET_TYPE','Depth','Depth (深度)',2,0,'Depth (深度)','admin','admin','2024-08-12 16:33:24','2024-08-12 16:42:46'),
(88,'CONTROL_NET_TYPE','IP-Adapter','IP-Adapter',3,0,'IP-Adapter','admin','admin','2024-08-12 16:42:23','2024-08-12 16:42:23'),
(89,'CONTROL_NET_TYPE','Inpaint','Inpaint (局部重绘)',4,0,'Inpaint (局部重绘)','admin','admin','2024-08-12 16:47:48','2024-08-12 16:47:48'),
(90,'CONTROL_NET_TYPE','Instant-ID','Instant-ID',5,0,'Instant-ID','admin','admin','2024-08-12 16:49:13','2024-08-12 16:49:13'),
(91,'CONTROL_NET_TYPE','InstructP2P','InstructP2P',6,0,'InstructP2P','admin','admin','2024-08-12 16:50:51','2024-08-12 16:51:16'),
(92,'CONTROL_NET_TYPE','Lineart','Lineart (线稿)',7,0,'Lineart (线稿)','admin','admin','2024-08-12 16:52:35','2024-08-12 16:52:35'),
(93,'CONTROL_NET_TYPE','MLSD','MLSD (直线)',8,0,'MLSD (直线)','admin','admin','2024-08-12 16:53:47','2024-08-12 16:53:47'),
(94,'CONTROL_NET_TYPE','NormalMap','NormalMap (法线贴图)',9,0,'NormalMap (法线贴图)','admin','admin','2024-08-12 16:55:28','2024-08-12 16:55:28'),
(95,'CONTROL_NET_TYPE','OpenPose','OpenPose (姿态)',10,0,'OpenPose (姿态)','admin','admin','2024-08-12 16:56:22','2024-08-12 16:56:22'),
(96,'CONTROL_NET_TYPE','Recolor','Recolor (重上色)',11,0,'Recolor (重上色)','admin','admin','2024-08-12 16:57:08','2024-08-12 16:57:08'),
(97,'CONTROL_NET_TYPE','Reference','Reference (参考)',12,0,'Reference (参考)','admin','admin','2024-08-12 16:59:11','2024-08-12 16:59:16'),
(98,'CONTROL_NET_TYPE','Revision','Revision',13,0,'Revision','admin','admin','2024-08-12 17:00:40','2024-08-12 17:00:40'),
(99,'CONTROL_NET_TYPE','Scribble','Scribble (涂鸦)',14,0,'Scribble (涂鸦)','admin','admin','2024-08-12 17:22:14','2024-08-12 17:22:14'),
(100,'CONTROL_NET_TYPE','Segmentation','Segmentation (语义分割)',15,0,'Segmentation (语义分割)','admin','admin','2024-08-12 17:23:56','2024-08-12 17:23:56'),
(101,'CONTROL_NET_TYPE','Shuffle','Shuffle (随机洗牌)',16,0,'Shuffle (随机洗牌)','admin','admin','2024-08-12 17:25:09','2024-08-12 17:25:09'),
(102,'CONTROL_NET_TYPE','SoftEdge','SoftEdge (软边缘)',17,0,'SoftEdge (软边缘)','admin','admin','2024-08-12 17:25:47','2024-08-12 17:25:47'),
(103,'CONTROL_NET_TYPE','SparseCtrl','SparseCtrl (稀疏控制)',18,0,'SparseCtrl (稀疏控制)','admin','admin','2024-08-12 17:26:30','2024-08-12 17:26:30'),
(104,'CONTROL_NET_TYPE','T2I-Adapter','T2I-Adapter',19,0,'T2I-Adapter','admin','admin','2024-08-12 17:27:08','2024-08-12 17:27:23'),
(105,'CONTROL_NET_TYPE','Tile','Tile (分块)',20,0,'Tile (分块)','admin','admin','2024-08-12 17:27:09','2024-08-12 17:27:09'),
(106,'0_ROOT_TYPE','LLM_API_TYPE','大语言模型访问类型',9,0,'大语言模型访问类型','admin','admin','2024-09-24 16:53:33','2024-09-24 16:53:40'),
(107,'LLM_API_TYPE','LLM_API_OPENAI','OpenAI',1,0,'openai','admin','admin','2024-09-24 16:54:46','2024-09-24 16:55:53'),
(108,'LLM_API_TYPE','LLM_API_OLLAMA','Ollama',2,0,'Ollama','admin','admin','2024-09-24 16:55:13','2024-09-24 16:55:13');
/*!40000 ALTER TABLE `dict` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diffusion_model`
--

DROP TABLE IF EXISTS `diffusion_model`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `diffusion_model` (
  `model_id` varchar(36) COLLATE utf8mb4_bin NOT NULL,
  `base_model_id` varchar(36) COLLATE utf8mb4_bin NOT NULL,
  `model_name` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `model_code` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `model_type` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `model_type_name` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `model_cover` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `tags` json NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `updated_user` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`model_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diffusion_model`
--

LOCK TABLES `diffusion_model` WRITE;
/*!40000 ALTER TABLE `diffusion_model` DISABLE KEYS */;
INSERT INTO `diffusion_model` VALUES
('4d63aa33-abb8-4d56-b5a8-26b9b8e49ef8','','SD 2.1','SD 2.1','BASE_MODEL','基础模型','','null',0,'SD 2.1','admin','admin','2024-07-01 15:40:19','2024-07-31 17:32:44'),
('4e41b90e-a7a5-456c-89d0-03e95102bccb','8102fc23-1892-4bda-8822-84b3a349dbc2','waiANINSFWPONYXL_v60','waiANINSFWPONYXL_v60.safetensors [4a11de18c7]','CHECKPOINT_DIFFUSION','Checkpoint','','[\"COMIC_GAME\"]',0,'waiANINSFWPONYXL_v60','admin','admin','2024-07-01 15:42:29','2024-08-01 11:40:57'),
('8102fc23-1892-4bda-8822-84b3a349dbc2','','SD 1.5','SD 1.5','BASE_MODEL','基础模型','','null',0,'基础SD V1.5模型','admin','admin','2024-07-31 15:53:09','2024-07-31 17:32:40'),
('a71d6f60-7379-4b0d-b233-e4fa7d5b9ab1','8102fc23-1892-4bda-8822-84b3a349dbc2','SD V1.5 emaonly','v1-5-pruned-emaonly.safetensors [6ce0161689]','CHECKPOINT_DIFFUSION','Checkpoint','','null',0,'SD 1.5','admin','admin','2024-06-28 16:34:52','2024-08-01 11:39:35'),
('b744005e-c792-4da2-a6ef-34e73168d9df','','SDXL 1.0','SDXL 1.0','BASE_MODEL','基础模型','','null',0,'SDXL 1.0','admin','admin','2024-07-01 15:41:47','2024-07-31 17:32:52'),
('c7a11ee3-4892-4ade-ba6c-f07ce6433961','8102fc23-1892-4bda-8822-84b3a349dbc2','wedding dress','<lora:wedding dress_SD_V1.0:1>','LORA_DIFFUSION','LoRA','upload-files/2024-08-01/8948eda5-3aa1-43ed-ab31-42a947238d3b.png','[\"DRESS\", \"PERSON\"]',0,'lora, wedding dress','admin','admin','2024-07-05 15:32:52','2024-08-01 11:27:21'),
('dd1b8d34-21df-4d11-a9bc-4342e8600803','','SD 3','SD 3','BASE_MODEL','基础模型','','null',0,'SD 3','admin','admin','2024-07-01 15:40:43','2024-07-31 17:32:48'),
('eeb00fdc-90e0-40be-8323-3a70a5783b40','','SD 1.4','SD 1.4','BASE_MODEL','基础模型','','null',0,'SD 1.4','admin','admin','2024-07-01 15:22:36','2024-07-31 17:32:36');
/*!40000 ALTER TABLE `diffusion_model` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `file` (
  `file_id` varchar(36) COLLATE utf8mb4_bin NOT NULL,
  `conversation_id` varchar(36) COLLATE utf8mb4_bin NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `file_type` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `file_size` bigint NOT NULL,
  `path` varchar(1024) COLLATE utf8mb4_bin NOT NULL,
  `status` tinyint(1) NOT NULL,
  `created_user` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`file_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `llm`
--

DROP TABLE IF EXISTS `llm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `llm` (
  `model_id` varchar(36) COLLATE utf8mb4_bin NOT NULL,
  `model_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `model_type` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `model_type_name` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `base_url` varchar(512) COLLATE utf8mb4_bin NOT NULL,
  `api_key` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `api_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `default_embedding_model` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `updated_user` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`model_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `llm`
--

LOCK TABLES `llm` WRITE;
/*!40000 ALTER TABLE `llm` DISABLE KEYS */;
INSERT INTO `llm` VALUES
('3ada5390-cd0a-4dc5-89f4-a25aba1355a9','hunyuan-13B','GENERAL_LLM','通用模型','http://hunyuanapi.tencent.com/openapi/v1','','',0,'腾讯公司开发的大型语言模型混元大模型（HunYuan）。主要功能是通过丰富的语义理解和计算能力，为用户提供问答式的服务。','admin','admin','2024-06-25 10:49:53','2024-06-25 14:36:06'),
('51770c03-75dc-4f72-84f8-73e7a1a96739','qwen2.5','GENERAL_LLM','通用模型','','','LLM_API_OLLAMA','bge-large-zh-v1.5',0,'qwen2.5','admin','admin','2024-09-24 16:33:29','2024-09-25 15:46:53'),
('601278f2-8bf1-4eff-a684-a7eff61d1274','text-embedding-3-small','EMBEDDING_LLM','Embedding','','','',0,'openai 嵌入式模型','admin','admin','2024-06-11 19:34:12','2024-06-24 20:16:39'),
('78e33981-4e01-445d-89e1-bfacc0affb0d','ChatGLM3-6B','GENERAL_LLM','通用模型','http://127.0.0.1:8000/v1/','','bge-large-zh-v1.5',0,'ChatGLM3 是智谱AI和清华大学 KEG 实验室联合发布的对话预训练模型','admin','admin','2024-06-11 16:47:27','2024-06-24 20:16:31'),
('86409bd7-666d-4ddb-9809-7c52ef3dc56a','gpt-4','GENERAL_LLM','通用模型','https://oai.hconeai.com/v1','','',0,'GPT-4（Generative Pretrained Transformer 4）是一种自然语言处理（NLP）AI模型。','admin','admin','2024-06-07 17:13:21','2024-06-24 20:16:16'),
('930c4de3-3706-4a44-b14e-ff6b5ec70f28','GLM-4-9B','GENERAL_LLM','通用模型','','','bge-large-zh-v1.5',0,'GLM-4-9B 是智谱 AI 推出的最新一代预训练模型 GLM-4 系列中的开源版本','admin','admin','2024-06-11 19:29:51','2024-06-24 20:16:26'),
('c0db3b5b-9afb-40f7-b0bd-9426dc0c25c3','gpt-3.5-turbo','GENERAL_LLM','通用模型','https://oai.hconeai.com/v1','','text-embedding-3-small',0,'由OpenAI开发的，基于GPT-3的模型。设计来帮助用户回答问题，提供建议和解决问题。','admin','admin','2024-06-11 15:10:05','2024-06-25 15:43:16'),
('e5de59e7-e71f-45f4-b0f7-4f5d0c3d14fc','bge-large-zh-v1.5','EMBEDDING_LLM','Embedding','','','',0,'bge-large-zh是由智源研究院研发的中文版文本表示模型，可将任意文本映射为低维稠密向量，以用于检索、分类、聚类或语义匹配等任务，并可支持为大模型调用外部知识','admin','admin','2024-06-11 19:31:29','2024-06-24 20:16:43');
/*!40000 ALTER TABLE `llm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `media` (
  `media_id` varchar(36) COLLATE utf8mb4_bin NOT NULL,
  `media_type` enum('image','video') COLLATE utf8mb4_bin NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_bin NOT NULL,
  `ai` varchar(64) COLLATE utf8mb4_bin NOT NULL,
  `generation_parameters` json NOT NULL,
  `status` enum('completed','in_progress','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'completed',
  `created_user` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`media_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menu` (
  `menu_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint DEFAULT NULL,
  `menu_name` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `menu_code` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `component` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `path` varchar(256) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `query` varchar(128) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `redirect` varchar(128) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `permissions` varchar(256) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `menu_type` varchar(16) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hidden` int DEFAULT NULL,
  `cached` int DEFAULT NULL,
  `icon` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort` int DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `description` varchar(512) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_user` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_user` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`menu_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu`
--

LOCK TABLES `menu` WRITE;
/*!40000 ALTER TABLE `menu` DISABLE KEYS */;
INSERT INTO `menu` VALUES
(1,0,'系统设置','system','admin','system','','/system/user','','contents',0,0,'SettingsOutline',3,0,'系统管理目录','admin','admin','2021-09-26 14:42:01','2024-01-08 16:00:35'),
(2,0,'AI Draw','draw','layout','draw','','/draw/generate','draw_generate','contents',0,0,'BrushOutline',2,0,'AI Draw','admin','admin','2021-09-26 14:46:28','2022-09-06 10:41:04'),
(3,0,'LLM Chat','llm','layout','chat/',NULL,'/chat','chat_index','contents',0,0,'ChatboxOutline',1,0,'LLM Chat','admin','admin','2022-06-08 16:46:18','2024-01-08 16:04:36'),
(4,0,'系统监控','monitor','admin','monitor',NULL,'/monitor/log','','contents',0,0,'TvOutline',4,0,'系统工具','admin','admin','2022-05-19 11:11:06','2024-01-10 10:30:59'),
(5,0,'仪表盘','dashboard','layout','dashboard','','/dashboard/list','dashboard_list','contents',0,0,'StatsChartOutline',5,0,'','admin','admin','2022-08-15 11:06:50','2023-11-24 19:30:15'),
(7,0,'lingmengcan','https://github.com/lingmengcan/lingmengcan-ai','layout','lingmengcan',NULL,NULL,'','contents',0,0,'DiamondOutline',6,0,'lingmengcan 主页','admin','admin','2022-05-19 11:16:45','2024-08-01 15:10:50'),
(8,1,'用户管理','user','/system/user/index','user','',NULL,'system_user_index','menu',0,0,'',1,0,'用户管理菜单','admin','admin','2021-10-21 10:34:32','2023-12-28 14:26:37'),
(9,1,'角色管理','role','/system/role/index','role','','','system_role_index','menu',0,0,'',2,0,'角色管理菜单','admin','admin','2021-10-21 10:36:49','2023-11-23 11:11:08'),
(10,1,'菜单管理','menu','/system/menu/index','menu','',NULL,'system_menu_index','menu',0,0,'',3,0,'菜单管理菜单','admin','admin','2021-10-21 10:38:03','2023-11-23 11:12:12'),
(11,1,'字典管理','dict','/system/dict/index','param',NULL,NULL,'system_dict_index','menu',0,0,'',4,0,'字典管理','admin','admin','2022-05-20 11:09:04','2024-01-03 16:08:24'),
(12,2,'生成',NULL,'/draw/generate','generate','','','draw_generate','menu',0,0,'',2,0,'数据门户列表','admin','admin','2022-08-15 17:01:20','2024-07-02 10:45:42'),
(13,3,'对话','chat','/chat/index',':conversationId?',NULL,NULL,'chat_index','menu',0,0,'',1,0,'chat','admin','admin','2022-08-25 17:16:46','2024-06-25 14:15:30'),
(14,4,'日志管理',NULL,'/monitor/log/index','log',NULL,NULL,'monitor:log:index','menu',0,0,'',1,0,'301','admin','admin','2022-05-19 11:18:49','2022-07-12 15:07:32'),
(15,4,'服务运行',NULL,'/monitor/server/index','server','','','monitor:server:index','menu',0,0,'',1,0,'','admin','admin','2022-07-04 14:09:38','2022-07-12 17:14:00'),
(16,5,'仪表盘列表',NULL,'/dashboard/index','list','','','dashboard_list','menu',0,0,'',1,0,'','admin','admin','2022-08-15 16:52:15','2022-08-15 17:15:24'),
(18,3,'chat_index','chat_noid','/chat/index','noid','','','llm_test','menu',1,1,'AirplaneOutline',0,0,'test','admin','admin','2023-11-21 15:38:20','2024-06-25 14:15:08'),
(21,8,'用户查询',NULL,'','',NULL,NULL,'system_user_query','action',0,0,'',1,0,'','admin','admin','2022-05-23 14:25:32','2023-12-28 14:16:20'),
(22,8,'用户新增',NULL,'','',NULL,NULL,'system_user_add','action',0,0,'',2,0,'','admin','admin','2022-05-23 14:28:27','2023-12-28 14:15:35'),
(23,8,'用户修改',NULL,'','',NULL,NULL,'system_user_edit','action',0,0,'',3,0,'','admin','admin','2022-05-23 14:28:45','2023-12-28 14:15:24'),
(24,8,'用户删除',NULL,'','',NULL,NULL,'system_user_delete','action',0,0,'',4,0,'','admin','admin','2022-05-23 14:29:14','2023-12-28 14:15:13'),
(25,9,'角色查询',NULL,'','',NULL,NULL,'system_role_query','action',0,0,'',3,0,'','admin','admin','2022-06-08 16:44:56','2023-12-28 14:16:58'),
(26,9,'角色新增',NULL,'','',NULL,NULL,'system_role_add','action',0,0,'',4,0,'','admin','admin','2022-06-08 16:45:27','2023-12-28 14:16:54'),
(27,9,'角色修改',NULL,'','',NULL,NULL,'system_role_edit','action',0,0,'',5,0,'','admin','admin','2022-06-08 16:45:53','2023-12-28 14:17:23'),
(28,9,'角色删除',NULL,'','',NULL,NULL,'system_role_delete','action',0,0,'',6,0,'','admin','admin','2022-06-08 16:46:18','2023-12-28 14:17:31'),
(29,9,'分配用户',NULL,'system/role/role-user','user',NULL,NULL,'system_role_user','action',1,0,'',2,0,'','admin','admin','2022-06-08 16:48:01','2023-11-23 11:11:39'),
(30,10,'菜单新增',NULL,'','list','',NULL,'system_menu_add','action',1,0,'',1,0,'','admin','admin','2022-06-29 16:19:21','2023-11-23 11:10:27'),
(31,10,'菜单删除','','','','','','system_menu_delete','action',0,0,'',3,0,'','admin','admin','2023-11-21 21:00:38','2023-11-23 11:31:55'),
(32,10,'菜单编辑','','','','','','system_menu_edit','action',0,0,'',2,0,'','admin','admin','2023-11-23 11:30:47','2023-11-23 11:30:47'),
(33,10,'菜单查询','','','','','','system_menu_query','action',0,0,'',4,0,'','admin','admin','2023-11-23 11:33:03','2023-11-23 11:34:02'),
(34,8,'重置密码','reset_pwd','','','','','system_user_resetpwd','action',0,0,'',5,0,'重置密码','admin','admin','2023-12-28 19:55:49','2023-12-28 19:55:49'),
(35,11,'字典查询','dict_query','','','','','system_dict_query','action',0,0,'',1,0,'','admin','admin','2024-01-08 10:48:08','2024-01-08 10:48:08'),
(36,11,'字典新增','','','','','','system_dict_add','action',0,0,'',2,0,'','admin','admin','2024-01-08 10:49:10','2024-01-08 10:49:21'),
(37,11,'字典修改','','','','','','system_dict_edit','action',0,0,'',3,0,'','admin','admin','2024-01-08 10:49:42','2024-01-08 10:49:48'),
(38,11,'字典删除','','','','','','system_dict_delete','action',0,0,'',0,0,'','admin','admin','2024-01-08 10:52:23','2024-01-08 10:52:23'),
(39,3,'应用','app','/llm/app/index','app','','','llm_app_index','menu',0,0,'',2,0,'应用管理','admin','admin','2024-05-20 11:39:09','2024-06-25 14:14:34'),
(40,3,'模型库','llm-list','/llm/model/index','model','','','llm_model_index','menu',0,0,'',4,0,'模型库管理','admin','admin','2024-05-20 11:42:25','2024-06-25 14:32:38'),
(41,3,'知识库','knowledge','/llm/knowledge/index','knowledge','','','llm_knowledge_index','menu',0,0,'',3,0,'知识库管理','admin','admin','2024-05-20 11:43:40','2024-06-25 14:32:10'),
(42,3,'训练','llm-train','/llm/train/index','train','','','llm_train_index','menu',0,0,'',5,0,'模型微调','admin','admin','2024-05-20 11:46:34','2024-07-02 10:48:13'),
(43,2,'模型库','model','/draw/model/index','model','','','draw_model_index','menu',0,0,'',3,0,'','admin','admin','2024-06-24 20:00:15','2024-06-24 20:01:11'),
(45,2,'创意市场','market','/draw/market/index','market','','','draw_market_index','menu',0,0,'',1,0,'','admin','admin','2024-07-02 10:47:10','2024-07-02 10:47:10'),
(46,2,'训练','diffusion-train','draw/train/index','train','','','draw_train_index','menu',0,0,'',4,0,'','admin','admin','2024-07-02 10:49:51','2024-07-02 10:50:01');
/*!40000 ALTER TABLE `menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `message` (
  `message_id` varchar(36) COLLATE utf8mb4_bin NOT NULL,
  `previous_id` varchar(36) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `file_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `conversation_id` varchar(36) COLLATE utf8mb4_bin NOT NULL,
  `message_text` text COLLATE utf8mb4_bin NOT NULL,
  `sender` enum('Human','Assistant','System') COLLATE utf8mb4_bin NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '1',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `model_tag`
--

DROP TABLE IF EXISTS `model_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_tag` (
  `tag_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`tag_id`,`model_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_tag`
--

LOCK TABLES `model_tag` WRITE;
/*!40000 ALTER TABLE `model_tag` DISABLE KEYS */;
/*!40000 ALTER TABLE `model_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prompt`
--

DROP TABLE IF EXISTS `prompt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prompt` (
  `prompt_id` varchar(36) COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `content` varchar(1024) COLLATE utf8mb4_bin NOT NULL,
  `user_name` varchar(32) COLLATE utf8mb4_bin NOT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prompt_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prompt`
--

LOCK TABLES `prompt` WRITE;
/*!40000 ALTER TABLE `prompt` DISABLE KEYS */;
INSERT INTO `prompt` VALUES
('e007b2ca-32df-4eb7-b141-39602f7dbe72','1','1','admin',0,'2024-09-09 16:30:56');
/*!40000 ALTER TABLE `prompt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `role_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_name` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `role_code` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `sort` int NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `updated_user` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`role_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES
(1,'管理员','admin',1,0,'超级管理员','admin','admin','2021-11-02 10:37:56','2023-11-14 17:15:19'),
(2,'客人','guest',2,0,'客人','admin','admin','2021-11-02 10:38:34','2023-11-14 17:15:29');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_menu`
--

DROP TABLE IF EXISTS `role_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_menu` (
  `role_id` bigint unsigned NOT NULL,
  `menu_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`menu_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_menu`
--

LOCK TABLES `role_menu` WRITE;
/*!40000 ALTER TABLE `role_menu` DISABLE KEYS */;
INSERT INTO `role_menu` VALUES
(1,1),
(1,2),
(1,3),
(1,4),
(1,5),
(1,7),
(1,8),
(1,9),
(1,10),
(1,11),
(1,12),
(1,13),
(1,14),
(1,15),
(1,16),
(1,21),
(1,22),
(1,23),
(1,24),
(1,25),
(1,26),
(1,27),
(1,28),
(1,29),
(1,30),
(1,31),
(1,32),
(1,33),
(1,34),
(1,35),
(1,36),
(1,37),
(1,38),
(1,39),
(1,40),
(1,41),
(1,42),
(1,43),
(1,44),
(1,45),
(1,46),
(2,12);
/*!40000 ALTER TABLE `role_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_user`
--

DROP TABLE IF EXISTS `role_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_user` (
  `role_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_user`
--

LOCK TABLES `role_user` WRITE;
/*!40000 ALTER TABLE `role_user` DISABLE KEYS */;
INSERT INTO `role_user` VALUES
(1,1);
/*!40000 ALTER TABLE `role_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `user_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_name` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `nick_name` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `sex` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `avatar` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(512) COLLATE utf8mb4_general_ci NOT NULL,
  `login_ip` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `login_date` datetime NOT NULL,
  `status` tinyint(1) NOT NULL,
  `description` varchar(512) COLLATE utf8mb4_general_ci NOT NULL,
  `created_user` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `updated_user` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
(1,'admin','超级管理员','admin@lmc.com','12345678901','MALE','','$2b$10$bgJ1x5CdyFAbt13v4.efFOT51F2Gxeg/C7xdfrdciDkgeayZPzl2K','127.0.0.1','2021-10-22 09:54:19',0,'超级管理员','admin','admin','2021-10-22 09:54:19','2024-09-10 16:04:31');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'lingmengcan'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-24 11:25:08

-- 工作流应用表
DROP TABLE IF EXISTS `application`;
CREATE TABLE `application` (
  `app_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `app_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `app_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `app_type_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '1.0.0',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0:草稿 1:已发布 2:运行中 3:已停止',
  `workflow_config` json NOT NULL COMMENT '工作流配置',
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `updated_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`app_id`) USING BTREE,
  KEY `idx_app_name` (`app_name`) USING BTREE,
  KEY `idx_app_type` (`app_type`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_created_user` (`created_user`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC COMMENT='工作流应用表';

-- 工作流执行记录表
DROP TABLE IF EXISTS `workflow_execution`;
CREATE TABLE `workflow_execution` (
  `execution_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `app_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `inputs` json DEFAULT NULL COMMENT '输入参数',
  `outputs` json DEFAULT NULL COMMENT '输出结果',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0:运行中 1:成功 2:失败 3:已停止',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT '错误信息',
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration` int DEFAULT NULL COMMENT '执行时长(秒)',
  `created_user` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`execution_id`) USING BTREE,
  KEY `idx_app_id` (`app_id`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_created_user` (`created_user`) USING BTREE,
  KEY `idx_start_time` (`start_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC COMMENT='工作流执行记录表';