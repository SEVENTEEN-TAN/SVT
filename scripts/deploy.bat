@echo off
REM ========================================
REM SVT单体部署脚本 - Windows版本
REM ========================================
REM 功能：自动构建前端并部署到后端项目
REM 作者：SVT Team
REM ========================================

echo ========================================
echo SVT单体部署脚本
echo ========================================
echo.

REM 获取脚本所在目录的父目录（项目根目录）
set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

echo [1/5] 检查目录结构...
if not exist "SVT-Web" (
    echo [错误] SVT-Web目录不存在！
    pause
    exit /b 1
)

if not exist "SVT-Server" (
    echo [错误] SVT-Server目录不存在！
    pause
    exit /b 1
)

echo [✓] 目录结构检查通过
echo.

REM ========================================
REM 步骤1：构建前端项目
REM ========================================
echo [2/5] 构建前端项目...
cd SVT-Web

REM 检查npm是否安装
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到npm，请先安装Node.js！
    pause
    exit /b 1
)

echo [执行] npm install
call npm install
if %errorlevel% neq 0 (
    echo [错误] npm install失败！
    pause
    exit /b 1
)

echo [执行] npm run build
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 前端构建失败！
    pause
    exit /b 1
)

echo [✓] 前端构建完成
echo.

REM ========================================
REM 步骤2：复制前端文件到后端
REM ========================================
echo [3/5] 复制前端文件到后端项目...
cd ..

REM 清理旧的静态文件
if exist "SVT-Server\src\main\resources\static" (
    echo [清理] 删除旧的静态文件...
    rmdir /s /q "SVT-Server\src\main\resources\static"
)

REM 创建static目录
mkdir "SVT-Server\src\main\resources\static"

REM 复制dist目录内容
echo [复制] 从SVT-Web\dist到SVT-Server\src\main\resources\static
xcopy /E /I /Y "SVT-Web\dist\*" "SVT-Server\src\main\resources\static"
if %errorlevel% neq 0 (
    echo [错误] 文件复制失败！
    pause
    exit /b 1
)

echo [✓] 前端文件复制完成
echo.

REM ========================================
REM 步骤3：构建后端项目
REM ========================================
echo [4/5] 构建后端项目...
cd SVT-Server

REM 检查Maven是否安装
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Maven，请先安装Maven！
    pause
    exit /b 1
)

echo [执行] mvn clean package -Dmaven.test.skip=true
call mvn clean package -Dmaven.test.skip=true
if %errorlevel% neq 0 (
    echo [错误] 后端构建失败！
    pause
    exit /b 1
)

echo [✓] 后端构建完成
echo.

REM ========================================
REM 步骤4：验证构建结果
REM ========================================
echo [5/5] 验证构建结果...

if not exist "target\SVT-Server-1.0.1-SNAPSHOT.jar" (
    echo [错误] JAR文件未生成！
    pause
    exit /b 1
)

echo [✓] JAR文件已生成：target\SVT-Server-1.0.1-SNAPSHOT.jar
echo.

REM 显示JAR包大小
for %%A in ("target\SVT-Server-1.0.1-SNAPSHOT.jar") do (
    set size=%%~zA
    set /A sizeMB=!size!/1048576
    echo [信息] JAR文件大小：!sizeMB! MB
)

echo.
echo ========================================
echo 部署完成！🎉
echo ========================================
echo.
echo [下一步] 运行应用：
echo   开发环境：java -jar target\SVT-Server-1.0.1-SNAPSHOT.jar --spring.profiles.active=dev
echo   生产环境：java -jar target\SVT-Server-1.0.1-SNAPSHOT.jar --spring.profiles.active=prod
echo.
echo [验证] 访问以下URL：
echo   - 前端页面：http://localhost:8080/
echo   - API文档：http://localhost:8080/doc.html
echo   - 前端路由：http://localhost:8080/system/menu
echo.

cd ..
pause
