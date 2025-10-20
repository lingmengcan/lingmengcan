#!/bin/bash

# 模块重构脚本
# 用法: ./scripts/refactor-module.sh <module-name>
# 例如: ./scripts/refactor-module.sh user

if [ -z "$1" ]; then
  echo "错误: 请提供模块名称"
  echo "用法: ./scripts/refactor-module.sh <module-name>"
  exit 1
fi

MODULE_NAME=$1
SRC_DIR="src"
MODULES_DIR="$SRC_DIR/modules"
MODULE_DIR="$MODULES_DIR/$MODULE_NAME"

echo "开始重构模块: $MODULE_NAME"

# 1. 创建模块目录
echo "1. 创建模块目录: $MODULE_DIR"
mkdir -p "$MODULE_DIR"

# 2. 检查并移动文件
echo "2. 移动文件到模块目录..."

# Controller
if [ -f "$SRC_DIR/controllers/$MODULE_NAME.controller.ts" ]; then
  echo "  - 处理 controller..."
  cp "$SRC_DIR/controllers/$MODULE_NAME.controller.ts" "$MODULE_DIR/$MODULE_NAME.controller.ts"
  
  # 更新导入路径
  sed -i '' "s|from '@/dtos/$MODULE_NAME|from './$MODULE_NAME|g" "$MODULE_DIR/$MODULE_NAME.controller.ts"
  sed -i '' "s|from '@/entities/$MODULE_NAME|from './$MODULE_NAME|g" "$MODULE_DIR/$MODULE_NAME.controller.ts"
  sed -i '' "s|from '@/services/$MODULE_NAME|from './$MODULE_NAME|g" "$MODULE_DIR/$MODULE_NAME.controller.ts"
fi

# Service
if [ -f "$SRC_DIR/services/$MODULE_NAME.service.ts" ]; then
  echo "  - 处理 service..."
  cp "$SRC_DIR/services/$MODULE_NAME.service.ts" "$MODULE_DIR/$MODULE_NAME.service.ts"
  
  # 更新导入路径
  sed -i '' "s|from '@/dtos/$MODULE_NAME|from './$MODULE_NAME|g" "$MODULE_DIR/$MODULE_NAME.service.ts"
  sed -i '' "s|from '@/entities/$MODULE_NAME|from './$MODULE_NAME|g" "$MODULE_DIR/$MODULE_NAME.service.ts"
fi

# Entity
if [ -f "$SRC_DIR/entities/$MODULE_NAME.entity.ts" ]; then
  echo "  - 处理 entity..."
  cp "$SRC_DIR/entities/$MODULE_NAME.entity.ts" "$MODULE_DIR/$MODULE_NAME.entity.ts"
fi

# DTO
if [ -f "$SRC_DIR/dtos/$MODULE_NAME.dto.ts" ]; then
  echo "  - 处理 dto..."
  cp "$SRC_DIR/dtos/$MODULE_NAME.dto.ts" "$MODULE_DIR/$MODULE_NAME.dto.ts"
fi

# Module
if [ -f "$MODULES_DIR/$MODULE_NAME.module.ts" ]; then
  echo "  - 处理 module..."
  cp "$MODULES_DIR/$MODULE_NAME.module.ts" "$MODULE_DIR/$MODULE_NAME.module.ts"
  
  # 更新导入路径
  sed -i '' "s|from '@/entities/$MODULE_NAME|from './$MODULE_NAME|g" "$MODULE_DIR/$MODULE_NAME.module.ts"
  sed -i '' "s|from '@/services/$MODULE_NAME|from './$MODULE_NAME|g" "$MODULE_DIR/$MODULE_NAME.module.ts"
  sed -i '' "s|from '@/controllers/$MODULE_NAME|from './$MODULE_NAME|g" "$MODULE_DIR/$MODULE_NAME.module.ts"
fi

# 3. 更新 app.module.ts
echo "3. 更新 app.module.ts..."
MODULE_NAME_PASCAL=$(echo "$MODULE_NAME" | sed -r 's/(^|-)([a-z])/\U\2/g')Module
sed -i '' "s|from './modules/$MODULE_NAME.module'|from './modules/$MODULE_NAME/$MODULE_NAME.module'|g" "$SRC_DIR/app.module.ts"

echo ""
echo "重构完成！请执行以下步骤："
echo ""
echo "1. 检查生成的文件是否正确:"
echo "   ls -la $MODULE_DIR"
echo ""
echo "2. 运行编译测试:"
echo "   npm run build"
echo ""
echo "3. 如果一切正常，删除旧文件:"
echo "   rm $SRC_DIR/controllers/$MODULE_NAME.controller.ts"
echo "   rm $SRC_DIR/services/$MODULE_NAME.service.ts"
echo "   rm $SRC_DIR/entities/$MODULE_NAME.entity.ts"
echo "   rm $SRC_DIR/dtos/$MODULE_NAME.dto.ts"
echo "   rm $MODULES_DIR/$MODULE_NAME.module.ts"
echo ""
echo "4. 搜索并更新其他文件中的引用:"
echo "   grep -r \"from '@/controllers/$MODULE_NAME\" src/"
echo "   grep -r \"from '@/services/$MODULE_NAME\" src/"
echo "   grep -r \"from '@/entities/$MODULE_NAME\" src/"
echo "   grep -r \"from '@/dtos/$MODULE_NAME\" src/"
echo ""
