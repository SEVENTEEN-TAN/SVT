package com.seventeen.svt.frame.aspect;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.seventeen.svt.common.annotation.permission.RequiresPermission;
import com.seventeen.svt.common.exception.BusinessException;
import com.seventeen.svt.common.util.MessageUtils;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import com.seventeen.svt.frame.cache.util.UserDetailCacheUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class PermissionAspect {

    private final UserDetailCacheUtils userDetailCacheUtils;

    @Around("@annotation(requiresPermission)")
    public Object around(ProceedingJoinPoint point, RequiresPermission requiresPermission) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = point.getSignature().getName();
        try {
            String permission = requiresPermission.value();
            boolean requireAll = requiresPermission.requireAll();
            log.debug("权限校验开始 - 方法:{}, 权限标识:{}, 需要全部权限:{}", methodName, permission, requireAll);
            if (!this.hasPermission(permission, requireAll)) {
                log.warn("权限校验失败 - 方法:{}, 权限标识:{}", methodName, permission);
                throw new BusinessException(MessageUtils.getMessage("system.forbidden"));
            }
            return point.proceed();
        } finally {
            log.debug("权限校验结束 - 方法:{}, 耗时:{}ms", methodName, System.currentTimeMillis() - startTime);
        }
    }


    /**
     * 判断是否是指定用户
     * @param permission 当前方法需要的权限
     * @param requireAll 是否需要全部满足
     * @return 是否通过授权
     */
    public boolean hasPermission(String permission,boolean requireAll) {
        //获取当前用户的ID
        String requestUserId = RequestContextUtils.getRequestUserId();
        if (StrUtil.isEmpty(requestUserId)) {
            return false;
        }
        //从缓存中获取用户信息
        UserDetailCache userDetail = userDetailCacheUtils.getUserDetail(requestUserId);
        if (ObjectUtil.isEmpty(userDetail)){
            return false;
        }
        //获取用户权限列表
        List<String> permissionList = userDetail.getPermissionKeys();
        if (ObjectUtil.isEmpty(permissionList)){
            return false;
        }
        //判断是否需要全部满足
        if (requireAll){
            //permission多个使用的使,分割
            String[] permissions = permission.split(",");
            return Arrays.stream(permissions).allMatch(permissionList::contains);
        }
        //判断是否满足任意一个
        return permissionList.stream().anyMatch(p -> p.equals(permission));
    }
}