/**
 * 清理浏览器存储工具
 * 用于清理损坏的存储数据
 */

export function clearAllStorage() {
  console.log('=== 开始清理浏览器存储 ===');
  
  // 清理 localStorage
  const keysToRemove = [
    'auth-storage',
    'user-storage',
    'svt_secure_auth_token',
    'svt_secure_user_data',
    'svt_secure_session_data',
    'expiryDate'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✓ 已清理: ${key}`);
    }
  });
  
  // 清理 sessionStorage
  sessionStorage.clear();
  console.log('✓ 已清理 sessionStorage');
  
  console.log('=== 存储清理完成 ===');
  console.log('请刷新页面测试新的存储功能');
}

// 导出到 window 对象
if (typeof window !== 'undefined') {
  (window as any).clearAllStorage = clearAllStorage;
}