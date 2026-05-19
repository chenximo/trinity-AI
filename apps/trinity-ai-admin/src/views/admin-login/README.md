# 登录 / 登出（UI 原型）

壳外页面，与业务模块分离；成对交付，工程期对接 SSO / MFA。

| 页面 | 路由（独立 app） | 路由（门户） |
|------|------------------|--------------|
| 登录 | `/login` | `/trinity-ai-admin/login` |
| 登出 | `/logout` | `/trinity-ai-admin/logout` |

## 登录

- 演示账号 `zhang.san`，密码任意非空
- 已登录访问登录页 → 自动进工作台
- 从登出页返回时 `?signedOut=1` 展示退出成功提示

## 登出

见 `../admin-logout/README.md`。壳层菜单 **退出登录** → 登出确认页 → 确认后回登录页。

## 文件

```
admin-login/
├── AdminLoginPage.vue
├── admin-login.css
├── assets/login-bg.svg   # 全屏背景（蓝紫渐变 + 轻网格）
└── README.md

admin-logout/
├── AdminLogoutPage.vue
├── admin-logout.css
└── README.md
```
