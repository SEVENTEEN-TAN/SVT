import presetUno from '@unocss/preset-uno';
import type { Theme } from '@unocss/preset-uno';
import transformerDirectives from '@unocss/transformer-directives';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import { defineConfig } from '@unocss/vite';

export default defineConfig<Theme>({
  content: {
    pipeline: {
      exclude: ['node_modules', 'dist']
    }
  },
  presets: [presetUno({ dark: 'class' })],
  rules: [
    [
      /^h-calc\((.*)\)$/, // 匹配 h-calc(xxx) 的正则表达式
      ([, d]) => ({ height: `calc(${d})` }) // 生成对应的 CSS 样式
    ]
  ],
  shortcuts: {
    // 布局相关
    'flex-col-stretch': 'flex flex-col items-stretch',
    'flex-1-hidden': 'flex-1 overflow-hidden',
    'flex-center': 'flex items-center justify-center',
    'card-wrapper': 'rounded-lg shadow-sm',
    
    // 响应式工具类
    'lt-sm:overflow-auto': 'max-sm:overflow-auto',
    'sm:flex-1-hidden': 'sm:flex-1 sm:overflow-hidden'
  },
  theme: {
    fontSize: {
      icon: '1.125rem',
      'icon-large': '1.5rem',
      'icon-small': '1rem',
      'icon-xl': '2rem',
      'icon-xs': '0.875rem'
    }
  },
  transformers: [transformerDirectives(), transformerVariantGroup()]
});