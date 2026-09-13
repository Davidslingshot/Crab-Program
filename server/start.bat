@echo off
echo ========================================
echo 蟹卡提货小程序后端服务器
echo ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo [INFO] 首次启动，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo [ERROR] 依赖安装失败！
        pause
        exit /b 1
    )
    echo [SUCCESS] 依赖安装完成！
    echo.
)

echo [INFO] 正在启动服务器...
echo [INFO] 服务器地址: http://localhost:3000
echo [INFO] 按 Ctrl+C 停止服务器
echo.

node server.js

pause