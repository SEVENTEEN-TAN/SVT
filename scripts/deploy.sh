#!/bin/bash
# ========================================
# SVT单体部署脚本 - Linux/MacOS版本
# ========================================
# 功能：自动构建前端并部署到后端项目
# 作者：SVT Team
# ========================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_step() {
    echo -e "${YELLOW}[$1]${NC} $2"
}

echo "========================================"
echo "SVT单体部署脚本"
echo "========================================"
echo ""

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

print_step "1/5" "检查目录结构..."

if [ ! -d "SVT-Web" ]; then
    print_error "SVT-Web目录不存在！"
    exit 1
fi

if [ ! -d "SVT-Server" ]; then
    print_error "SVT-Server目录不存在！"
    exit 1
fi

print_info "目录结构检查通过"
echo ""

# ========================================
# 步骤1：构建前端项目
# ========================================
print_step "2/5" "构建前端项目..."
cd SVT-Web

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    print_error "未检测到npm，请先安装Node.js！"
    exit 1
fi

print_step "执行" "npm install"
npm install

print_step "执行" "npm run build"
npm run build

print_info "前端构建完成"
echo ""

# ========================================
# 步骤2：复制前端文件到后端
# ========================================
print_step "3/5" "复制前端文件到后端项目..."
cd "$PROJECT_ROOT"

# 清理旧的静态文件
if [ -d "SVT-Server/src/main/resources/static" ]; then
    print_step "清理" "删除旧的静态文件..."
    rm -rf SVT-Server/src/main/resources/static
fi

# 创建static目录
mkdir -p SVT-Server/src/main/resources/static

# 复制dist目录内容
print_step "复制" "从SVT-Web/dist到SVT-Server/src/main/resources/static"
cp -r SVT-Web/dist/* SVT-Server/src/main/resources/static/

print_info "前端文件复制完成"
echo ""

# ========================================
# 步骤3：构建后端项目
# ========================================
print_step "4/5" "构建后端项目..."
cd SVT-Server

# 检查Maven是否安装
if ! command -v mvn &> /dev/null; then
    print_error "未检测到Maven，请先安装Maven！"
    exit 1
fi

print_step "执行" "mvn clean package -Dmaven.test.skip=true"
mvn clean package -Dmaven.test.skip=true

print_info "后端构建完成"
echo ""

# ========================================
# 步骤4：验证构建结果
# ========================================
print_step "5/5" "验证构建结果..."

JAR_FILE="target/SVT-Server-1.0.1-SNAPSHOT.jar"
if [ ! -f "$JAR_FILE" ]; then
    print_error "JAR文件未生成！"
    exit 1
fi

print_info "JAR文件已生成：$JAR_FILE"
echo ""

# 显示JAR包大小
JAR_SIZE=$(du -h "$JAR_FILE" | cut -f1)
print_step "信息" "JAR文件大小：$JAR_SIZE"

echo ""
echo "========================================"
echo "部署完成！🎉"
echo "========================================"
echo ""
echo "[下一步] 运行应用："
echo "  开发环境：java -jar $JAR_FILE --spring.profiles.active=dev"
echo "  生产环境：java -jar $JAR_FILE --spring.profiles.active=prod"
echo ""
echo "[验证] 访问以下URL："
echo "  - 前端页面：http://localhost:8080/"
echo "  - API文档：http://localhost:8080/doc.html"
echo "  - 前端路由：http://localhost:8080/system/menu"
echo ""

cd "$PROJECT_ROOT"
