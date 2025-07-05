import type { ModalStaticFunctions } from 'antd/es/modal/confirm';

/**
 * 全局Modal管理器
 * 解决在axios拦截器中使用Ant Design Modal的上下文问题
 */
class ModalManager {
  private modalApi: Omit<ModalStaticFunctions, 'warn'> | null = null;

  // 设置modal实例（从App组件中获取）
  setModalApi(api: Omit<ModalStaticFunctions, 'warn'>) {
    this.modalApi = api;
  }

  // 显示确认对话框
  confirm(config: Parameters<ModalStaticFunctions['confirm']>[0]) {
    if (this.modalApi) {
      return this.modalApi.confirm(config);
    } else {
      console.error('ModalManager: modalApi未初始化，确认对话框配置:', config);
      return { destroy: () => {} };
    }
  }

  // 显示信息对话框
  info(config: Parameters<ModalStaticFunctions['info']>[0]) {
    if (this.modalApi) {
      return this.modalApi.info(config);
    } else {
      console.info('ModalManager: modalApi未初始化，信息对话框配置:', config);
      return { destroy: () => {} };
    }
  }

  // 显示成功对话框
  success(config: Parameters<ModalStaticFunctions['success']>[0]) {
    if (this.modalApi) {
      return this.modalApi.success(config);
    } else {
      console.log('ModalManager: modalApi未初始化，成功对话框配置:', config);
      return { destroy: () => {} };
    }
  }

  // 显示错误对话框
  error(config: Parameters<ModalStaticFunctions['error']>[0]) {
    if (this.modalApi) {
      return this.modalApi.error(config);
    } else {
      console.error('ModalManager: modalApi未初始化，错误对话框配置:', config);
      return { destroy: () => {} };
    }
  }

  // 显示警告对话框
  warning(config: Parameters<ModalStaticFunctions['warning']>[0]) {
    if (this.modalApi) {
      return this.modalApi.warning(config);
    } else {
      console.warn('ModalManager: modalApi未初始化，警告对话框配置:', config);
      return { destroy: () => {} };
    }
  }

  /**
   * 显示会话过期弹窗
   * @param reason 过期原因，如"认证已到期"、"长时间未操作，会话已过期"等
   * @param onConfirm 确认回调
   */
  showSessionExpiredModal(reason: string = "会话已过期", onConfirm?: () => void) {
    return this.confirm({
      title: '系统:',
      content: `${reason}，请重新登录`,
      okText: '确定',
      cancelText: null, // 隐藏取消按钮
      maskClosable: false,
      keyboard: false,
      centered: true,
      onOk: onConfirm
    });
  }
}

// 导出单例实例
export const modalManager = new ModalManager(); 