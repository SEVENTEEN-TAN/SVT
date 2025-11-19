package com.seventeen.svt.common.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * SPA前端路由控制器
 *
 * <p>用于处理单页应用(SPA)的前端路由fallback机制。
 * 当用户直接访问前端路由（如 /system/userinfo）时，
 * 该控制器会将请求转发到 index.html，由前端路由接管。</p>
 *
 * <p><b>工作原理：</b></p>
 * <ul>
 *   <li>所有非API路径（不以 /api 开头）的GET请求都会被此控制器捕获</li>
 *   <li>排除静态资源路径（swagger、druid等）</li>
 *   <li>将请求转发到 index.html，由前端React Router处理路由</li>
 * </ul>
 *
 * <p><b>路由优先级：</b></p>
 * <ol>
 *   <li>后端API路径 (/api/**) - 由对应的Controller处理</li>
 *   <li>静态资源 (*.js, *.css, *.png等) - 由ResourceHandler处理</li>
 *   <li>前端路由 (/system/**, /business/**等) - 由此Controller转发到index.html</li>
 * </ol>
 *
 * @author SVT Team
 * @since 1.0.0
 */
@Controller
public class SpaForwardController {

    /**
     * 处理所有前端路由请求
     *
     * <p>匹配所有不以特定路径开头的GET请求，并转发到index.html。</p>
     *
     * <p><b>排除的路径：</b></p>
     * <ul>
     *   <li>/api/** - 后端API接口</li>
     *   <li>/swagger-ui/** - Swagger UI资源</li>
     *   <li>/doc.html - Knife4j文档</li>
     *   <li>/webjars/** - WebJars资源</li>
     *   <li>/druid/** - Druid监控页面</li>
     *   <li>静态资源（通过ResourceHandler自动处理）</li>
     * </ul>
     *
     * <p><b>示例：</b></p>
     * <ul>
     *   <li>访问 /system/userinfo → 转发到 index.html → 前端路由渲染UserInfo页面</li>
     *   <li>访问 /business/dashboard → 转发到 index.html → 前端路由渲染Dashboard页面</li>
     *   <li>访问 /api/system/user/list → 直接调用后端API（不经过此Controller）</li>
     * </ul>
     *
     * @return 前端应用入口页面的forward路径
     */
    @GetMapping(value = {
            "/{path:[^\\.]*}",              // 匹配所有不包含点号的单级路径
            "/{path1:[^\\.]*}/{path2:[^\\.]*}",     // 匹配二级路径
            "/{path1:[^\\.]*}/{path2:[^\\.]*}/{path3:[^\\.]*}"  // 匹配三级路径
    })
    public String forward() {
        // 转发到前端应用的index.html
        // Spring Boot会在classpath:/static/目录下查找index.html
        return "forward:/index.html";
    }
}
