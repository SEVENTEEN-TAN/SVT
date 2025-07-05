import type { MessageInstance } from 'antd/es/message/interface';

/**
 * 全局消息管理器
 * 解决在axios拦截器中使用Ant Design message的上下文问题
 */
class MessageManager {
  private messageApi: MessageInstance | null = null;

  // 设置message实例（从App组件中获取）
  setMessageApi(api: MessageInstance) {
    this.messageApi = api;
  }

  // 显示错误消息
  error(content: string) {
    if (this.messageApi) {
      this.messageApi.error(content);
    } else {
      console.error('MessageManager: messageApi未初始化，显示错误信息:', content);
    }
  }

  // 显示警告消息
  warning(content: string) {
    if (this.messageApi) {
      this.messageApi.warning(content);
    } else {
      console.warn('MessageManager: messageApi未初始化，显示警告信息:', content);
    }
  }

  // 显示成功消息
  success(content: string) {
    if (this.messageApi) {
      this.messageApi.success(content);
    } else {
      console.log('MessageManager: messageApi未初始化，显示成功信息:', content);
    }
  }

  // 显示信息消息
  info(content: string) {
    if (this.messageApi) {
      this.messageApi.info(content);
    } else {
      console.info('MessageManager: messageApi未初始化，显示信息:', content);
    }
  }
}

// 导出单例实例
export const messageManager = new MessageManager(); 