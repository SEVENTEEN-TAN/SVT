# SVT单体部署指南

## 📋 部署架构说明

本指南用于将SVT前端（SVT-Web）和后端（SVT-Server）部署为单体应用。

### 架构特点

- ✅ **前后端分离开发**：开发时前后端独立运行
- ✅ **单体部署**：生产环境打包为单个JAR文件
- ✅ **SPA路由支持**：支持前端路由直接访问和刷新
- ✅ **路径分离**：API路径与前端路由自动区分

### 路由规则

| 路径类型 | 示例 | 处理方式 |
|---------|------|---------|
| API接口 | `/api/system/user/list` | Spring Controller处理 |
| 静态资源 | `/assets/index.js` | 静态资源直接返回 |
| 前端路由 | `/system/userinfo` | 转发到index.html，前端路由处理 |
| 文档接口 | `/doc.html`, `/swagger-ui` | Knife4j/Swagger处理 |
| 监控页面 | `/druid` | Druid监控处理 |

---

## 🚀 部署步骤

### 步骤1：构建前端项目

```bash
# 进入前端项目目录
cd SVT-Web

# 安装依赖（首次构建或依赖更新时）
npm install

# 构建生产环境版本
npm run build

# 构建完成后，dist目录包含所有静态文件
```

**构建输出：**
```
SVT-Web/dist/
├── index.html          # 入口HTML文件
├── assets/            # 静态资源目录
│   ├── index-*.js     # JavaScript打包文件
│   ├── index-*.css    # CSS样式文件
│   └── *.svg, *.png   # 图片资源
└── ...
```

---

### 步骤2：复制前端文件到后端项目

**方式A：手动复制（推荐用于测试）**

```bash
# Windows系统
xcopy /E /I /Y "SVT-Web\dist\*" "SVT-Server\src\main\resources\static"

# Linux/MacOS系统
cp -r SVT-Web/dist/* SVT-Server/src/main/resources/static/
```

**方式B：使用Maven构建脚本（推荐用于生产）**

在 `SVT-Server/pom.xml` 的 `<build>` 部分添加：

```xml
<build>
    <plugins>
        <!-- 前端构建插件 -->
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>exec-maven-plugin</artifactId>
            <version>3.1.0</version>
            <executions>
                <!-- 安装npm依赖 -->
                <execution>
                    <id>npm install</id>
                    <phase>generate-resources</phase>
                    <goals>
                        <goal>exec</goal>
                    </goals>
                    <configuration>
                        <executable>npm</executable>
                        <arguments>
                            <argument>install</argument>
                        </arguments>
                        <workingDirectory>${project.parent.basedir}/SVT-Web</workingDirectory>
                    </configuration>
                </execution>
                <!-- 构建前端 -->
                <execution>
                    <id>npm build</id>
                    <phase>generate-resources</phase>
                    <goals>
                        <goal>exec</goal>
                    </goals>
                    <configuration>
                        <executable>npm</executable>
                        <arguments>
                            <argument>run</argument>
                            <argument>build</argument>
                        </arguments>
                        <workingDirectory>${project.parent.basedir}/SVT-Web</workingDirectory>
                    </configuration>
                </execution>
            </executions>
        </plugin>

        <!-- 复制前端构建文件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-resources-plugin</artifactId>
            <version>3.3.1</version>
            <executions>
                <execution>
                    <id>copy-frontend-build</id>
                    <phase>generate-resources</phase>
                    <goals>
                        <goal>copy-resources</goal>
                    </goals>
                    <configuration>
                        <outputDirectory>${project.build.outputDirectory}/static</outputDirectory>
                        <resources>
                            <resource>
                                <directory>${project.parent.basedir}/SVT-Web/dist</directory>
                                <filtering>false</filtering>
                            </resource>
                        </resources>
                    </configuration>
                </execution>
            </executions>
        </plugin>

        <!-- 现有的其他插件... -->
    </plugins>
</build>
```

使用Maven构建脚本后，只需运行：

```bash
cd SVT-Server
mvn clean package
```

Maven会自动：
1. 安装npm依赖
2. 构建前端项目
3. 复制dist文件到static目录
4. 打包成JAR文件

---

### 步骤3：构建后端项目

```bash
# 进入后端项目目录
cd SVT-Server

# 清理并打包（跳过测试）
mvn clean package -Dmaven.test.skip=true

# 构建成功后，JAR文件位于：
# SVT-Server/target/SVT-Server-1.0.1-SNAPSHOT.jar
```

---

### 步骤4：运行单体应用

```bash
# 运行JAR文件（开发环境）
java -jar target/SVT-Server-1.0.1-SNAPSHOT.jar --spring.profiles.active=dev

# 运行JAR文件（生产环境）
java -jar target/SVT-Server-1.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# 指定端口运行
java -jar target/SVT-Server-1.0.1-SNAPSHOT.jar --server.port=9090
```

---

## 🔍 验证部署

### 1. 检查静态资源

访问以下URL验证静态资源是否正确加载：

```
http://localhost:8080/                 # 前端首页（应显示登录页）
http://localhost:8080/assets/index.js  # JavaScript文件（应返回JS代码）
```

### 2. 检查API接口

```
http://localhost:8080/api/auth/login   # 后端API（应返回认证响应）
http://localhost:8080/doc.html         # API文档（应显示Knife4j界面）
```

### 3. 检查前端路由

在浏览器中直接访问以下URL：

```
http://localhost:8080/system/menu      # 前端路由（应正常显示，不是404）
http://localhost:8080/system/user      # 前端路由（应正常显示）
http://localhost:8080/business/dashboard  # 前端路由（应正常显示）
```

**✅ 成功标志：**
- 直接访问前端路由URL时，页面正常加载
- 刷新前端路由页面时，不会出现404错误
- API调用正常工作

**❌ 失败标志：**
- 访问前端路由时出现404错误
- 页面空白或报错
- API调用失败（检查CORS和加密配置）

---

## 📁 目录结构

**部署后的目录结构：**

```
SVT-Server/
└── src/main/resources/
    └── static/                    # 前端静态资源目录
        ├── index.html             # 入口HTML（所有前端路由都返回此文件）
        └── assets/               # 静态资源
            ├── index-*.js
            ├── index-*.css
            └── ...

最终JAR包结构：
SVT-Server-1.0.1-SNAPSHOT.jar
├── BOOT-INF/
│   ├── classes/
│   │   ├── static/              # 打包后的前端文件
│   │   │   ├── index.html
│   │   │   └── assets/
│   │   ├── application.yml
│   │   └── com/seventeen/svt/   # 后端代码
│   └── lib/                     # 依赖jar
└── ...
```

---

## ⚙️ 关键配置说明

### 后端配置（已完成）

**1. WebMvcConfig.java**
- 配置静态资源处理器，映射 `/**` 到 `classpath:/static/`
- 保证Swagger、Druid等资源优先级

**2. SpaForwardController.java**
- 捕获所有非API、非静态资源的GET请求
- 转发到 `index.html`，由前端路由处理
- 排除 `/api/**`、`/swagger-ui/**`、`/doc.html`、`/druid/**`

**3. application.yml**
```yaml
server:
  servlet:
    context-path: /api   # API路径前缀
```

### 前端配置（已完成）

**1. vite.config.ts**
```typescript
base: '/',              // 根路径部署
assetsDir: 'assets',    // 资源目录
```

**2. 路由配置**
- 使用 `BrowserRouter`（不是HashRouter）
- 路由路径使用相对路径

---

## 🐛 常见问题排查

### 问题1：直接访问前端路由404

**症状：** 访问 `http://localhost:8080/system/userinfo` 返回404

**原因：** SpaForwardController未生效或静态资源配置错误

**解决：**
1. 确认 `SpaForwardController.java` 已创建并被Spring扫描
2. 确认 `WebMvcConfig.java` 已配置静态资源处理器
3. 检查 `static/index.html` 是否存在

```bash
# 检查JAR包内容
jar -tf target/SVT-Server-1.0.1-SNAPSHOT.jar | grep "static/index.html"
```

---

### 问题2：API请求返回index.html

**症状：** 调用API时返回HTML内容而不是JSON

**原因：** API路径被前端路由拦截

**解决：**
1. 确认所有API路径都以 `/api` 开头
2. 检查 `SpaForwardController` 的路径匹配规则
3. 前端请求确保使用完整路径：`/api/system/user/list`

---

### 问题3：静态资源404

**症状：** JavaScript或CSS文件加载失败

**原因：** 资源路径错误或base配置问题

**解决：**
1. 确认 `vite.config.ts` 中 `base: '/'`
2. 检查 `index.html` 中的资源路径（应为 `/assets/...`）
3. 确认前端构建文件已正确复制到 `src/main/resources/static/`

---

### 问题4：页面空白或报错

**症状：** 页面加载后空白或控制台报错

**原因：** 环境变量配置错误或API地址问题

**解决：**
1. 检查前端环境变量配置
2. 单体部署时，API_BASE_URL应为空或相对路径
3. 打开浏览器控制台查看具体错误信息

**生产环境变量（.env.production）：**
```env
# 单体部署时，API与前端在同一域名下，使用相对路径
VITE_API_BASE_URL=
VITE_AES_KEY=YOUR_ACTUAL_AES_KEY_HERE
VITE_DEBUG_MODE=false
```

---

## 🔒 安全注意事项

1. **生产环境配置：**
   - 禁用Swagger/Knife4j（`knife4j.enable=false`）
   - 启用HTTPS和SSL数据库连接
   - 配置正确的CORS策略

2. **密钥管理：**
   - 确保SM4_ENCRYPTION_KEY环境变量已设置
   - 不要在代码中硬编码密钥
   - 定期更新AES密钥

3. **性能优化：**
   - 开启Gzip压缩
   - 配置静态资源缓存
   - 使用CDN加速静态资源（可选）

---

## 📚 更多信息

- **项目架构文档：** 参考 `CLAUDE.md`
- **API文档：** 访问 `http://localhost:8080/doc.html`
- **日志位置：** `logs/log.log`

---

## ✅ 部署检查清单

- [ ] 前端项目成功构建（`npm run build`）
- [ ] 前端文件复制到 `src/main/resources/static/`
- [ ] 后端项目成功打包（`mvn clean package`）
- [ ] JAR文件包含 `static/index.html`
- [ ] 应用成功启动，无错误日志
- [ ] 访问根路径显示前端页面
- [ ] 直接访问前端路由正常工作
- [ ] API接口调用正常
- [ ] 页面刷新不出现404
- [ ] 静态资源正常加载

---

**部署完成！🎉**
