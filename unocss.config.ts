import { defineConfig } from 'unocss'

export default defineConfig({
  // 配置选项
  rules: [],
  shortcuts: {},
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
    },
  },
})
