# 颜色硬编码审计（相对设计色板 / trinity-base）

生成方式：脚本扫描仓库内 `.css` / `.html` 中的 `#hex`；**允许集**为 `assets/trinity-base.css` 内出现的全部 hex（外加 `#fff`/`#000` 归一化）。
不在允许集中的硬编码标为 **待核对**（可能是对话页/云落地独立色、第三方品牌色、或应改为 `var(--token)`）。

- 扫描条目（去重后）：**294**
- **待核对**条数：**101**（仅待核对子表见 [`color-audit-pending.md`](./color-audit-pending.md)）

## 全表（待核对在前）

| 文件 | 行 | 原始值 | 归一化 | 与套件色板对照 |
| --- | ---: | --- | --- | --- |
| `TrinityAI_Admin/admin.css` | 3 | `#f4f6f9` | `#f4f6f9` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityAI_Admin/admin.css` | 6 | `#111827` | `#111827` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityAI_Admin/admin.css` | 7 | `#6b7280` | `#6b7280` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityAI_Admin/admin.css` | 340 | `#d1fae5` | `#d1fae5` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 324 | `#f8fafc` | `#f8fafc` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 630 | `#94a3b8` | `#94a3b8` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 630 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 668 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 952 | `#164e63` | `#164e63` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 952 | `#0f172a` | `#0f172a` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 952 | `#020617` | `#020617` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 962 | `#e2e8f0` | `#e2e8f0` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 967 | `#f1f5f9` | `#f1f5f9` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 979 | `#fffbeb` | `#fffbeb` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 979 | `#fff7ed` | `#fff7ed` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 979 | `#fafaf9` | `#fafaf9` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 988 | `#312e81` | `#312e81` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 988 | `#1e1b4b` | `#1e1b4b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 988 | `#0f172a` | `#0f172a` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 998 | `#e0e7ff` | `#e0e7ff` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1003 | `#f8fafc` | `#f8fafc` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1003 | `#e2e8f0` | `#e2e8f0` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1003 | `#cbd5e1` | `#cbd5e1` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1022 | `#9a3412` | `#9a3412` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1651 | `#155e75` | `#155e75` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1651 | `#0e7490` | `#0e7490` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1651 | `#042f2e` | `#042f2e` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1652 | `#334155` | `#334155` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1652 | `#0f172a` | `#0f172a` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1653 | `#22d3ee` | `#22d3ee` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1653 | `#06b6d4` | `#06b6d4` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1655 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1656 | `#1e293b` | `#1e293b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1656 | `#475569` | `#475569` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1657 | `#0f172a` | `#0f172a` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1658 | `#94a3b8` | `#94a3b8` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1659 | `#475569` | `#475569` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1659 | `#1e293b` | `#1e293b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1660 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1661 | `#22d3ee` | `#22d3ee` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1662 | `#5eead4` | `#5eead4` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1663 | `#67e8f9` | `#67e8f9` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1664 | `#fbbf24` | `#fbbf24` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1666 | `#7f1d1d` | `#7f1d1d` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1666 | `#fca5a5` | `#fca5a5` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1667 | `#0f172a` | `#0f172a` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1667 | `#334155` | `#334155` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1669 | `#1e293b` | `#1e293b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1669 | `#475569` | `#475569` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1669 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1712 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1713 | `#94a3b8` | `#94a3b8` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1714 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1715 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1716 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1717 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1718 | `#475569` | `#475569` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1718 | `#f8fafc` | `#f8fafc` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1721 | `#c2410c` | `#c2410c` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1721 | `#fff7ed` | `#fff7ed` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1723 | `#fb923c` | `#fb923c` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1723 | `#c2410c` | `#c2410c` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1724 | `#334155` | `#334155` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1725 | `#94a3b8` | `#94a3b8` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1770 | `#fbbf24` | `#fbbf24` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1772 | `#f59e0b` | `#f59e0b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1774 | `#d6d3d1` | `#d6d3d1` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1775 | `#fb923c` | `#fb923c` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1776 | `#fb923c` | `#fb923c` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1776 | `#f59e0b` | `#f59e0b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1778 | `#f59e0b` | `#f59e0b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1779 | `#fde68a` | `#fde68a` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1779 | `#fbbf24` | `#fbbf24` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1779 | `#f59e0b` | `#f59e0b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1781 | `#fbbf24` | `#fbbf24` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1781 | `#f59e0b` | `#f59e0b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1826 | `#34d399` | `#34d399` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1826 | `#2dd4bf` | `#2dd4bf` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1826 | `#818cf8` | `#818cf8` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1830 | `#fbbf24` | `#fbbf24` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1830 | `#94a3b8` | `#94a3b8` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1831 | `#a5b4fc` | `#a5b4fc` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1831 | `#6ee7b7` | `#6ee7b7` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1831 | `#94a3b8` | `#94a3b8` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1833 | `#67e8f9` | `#67e8f9` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1834 | `#818cf8` | `#818cf8` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1834 | `#34d399` | `#34d399` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1877 | `#f8fafc` | `#f8fafc` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1877 | `#e2e8f0` | `#e2e8f0` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1878 | `#e2e8f0` | `#e2e8f0` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1878 | `#94a3b8` | `#94a3b8` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1878 | `#f1f5f9` | `#f1f5f9` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1878 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1878 | `#475569` | `#475569` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1879 | `#f59e0b` | `#f59e0b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1879 | `#78716c` | `#78716c` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1880 | `#64748b` | `#64748b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1881 | `#f59e0b` | `#f59e0b` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1882 | `#78716c` | `#78716c` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1883 | `#fff7ed` | `#fff7ed` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `TrinityCloud/home.html` | 1883 | `#fb923c` | `#fb923c` | **待核对**：色板 :root 未收录且未在 base 中出现 |
| `apps/trinity-design/src/assets/design-tokens-main-inner.html` | （行号随模板变化） | `#2563eb` / `#7c3aed` 等 | 同左 | 已在 trinity-base.css 出现（套件登记色）；原审计针对已移除的静态 `design-tokens.html` |
| `TrinityAI_Admin/admin.css` | 4 | `#ffffff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 5 | `#e5e7eb` | `#e5e7eb` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 8 | `#9ca3af` | `#9ca3af` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 9 | `#2563eb` | `#2563eb` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 10 | `#eff6ff` | `#eff6ff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 11 | `#bfdbfe` | `#bfdbfe` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 324 | `#f9fafb` | `#f9fafb` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 341 | `#047857` | `#047857` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 345 | `#fef3c7` | `#fef3c7` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 346 | `#b45309` | `#b45309` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 350 | `#f3f4f6` | `#f3f4f6` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 429 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityAI_Admin/admin.css` | 436 | `#1d4ed8` | `#1d4ed8` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 99 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 324 | `#ffffff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 554 | `#ecfdf5` | `#ecfdf5` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 555 | `#047857` | `#047857` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 618 | `#0ea5e9` | `#0ea5e9` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 618 | `#0284c7` | `#0284c7` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 622 | `#6366f1` | `#6366f1` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 622 | `#4f46e5` | `#4f46e5` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 626 | `#f97316` | `#f97316` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 626 | `#ea580c` | `#ea580c` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 656 | `#0284c7` | `#0284c7` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 660 | `#4f46e5` | `#4f46e5` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 664 | `#ea580c` | `#ea580c` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 979 | `#fef3c7` | `#fef3c7` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1021 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1313 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1490 | `#4285F4` | `#4285f4` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1491 | `#34A853` | `#34a853` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1492 | `#FBBC05` | `#fbbc05` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1493 | `#EA4335` | `#ea4335` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1665 | `#fcd34d` | `#fcd34d` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1666 | `#ef4444` | `#ef4444` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1666 | `#fecaca` | `#fecaca` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1719 | `#0ea5e9` | `#0ea5e9` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1720 | `#0ea5e9` | `#0ea5e9` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1722 | `#ea580c` | `#ea580c` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1724 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1726 | `#fef2f2` | `#fef2f2` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1726 | `#f87171` | `#f87171` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1727 | `#dc2626` | `#dc2626` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1770 | `#ea580c` | `#ea580c` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1771 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1771 | `#fcd34d` | `#fcd34d` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1773 | `#ea580c` | `#ea580c` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1775 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1776 | `#ea580c` | `#ea580c` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1777 | `#ea580c` | `#ea580c` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1778 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1779 | `#fef3c7` | `#fef3c7` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1779 | `#fcd34d` | `#fcd34d` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1780 | `#b45309` | `#b45309` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1781 | `#fcd34d` | `#fcd34d` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1829 | `#6366f1` | `#6366f1` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1830 | `#4ade80` | `#4ade80` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1830 | `#60a5fa` | `#60a5fa` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1830 | `#a78bfa` | `#a78bfa` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1830 | `#f472b6` | `#f472b6` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1830 | `#38bdf8` | `#38bdf8` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1832 | `#38bdf8` | `#38bdf8` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1879 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1881 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1881 | `#ea580c` | `#ea580c` | 已在 trinity-base.css 出现（套件登记色） |
| `TrinityCloud/home.html` | 1883 | `#b45309` | `#b45309` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 4 | `#ffffff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 5 | `#f9fafb` | `#f9fafb` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 6 | `#f3f4f6` | `#f3f4f6` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 7 | `#e5e7eb` | `#e5e7eb` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 8 | `#d1d5db` | `#d1d5db` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 9 | `#1a1a1a` | `#1a1a1a` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 10 | `#4b5563` | `#4b5563` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 11 | `#9ca3af` | `#9ca3af` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 12 | `#2563eb` | `#2563eb` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 13 | `#eff6ff` | `#eff6ff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 14 | `#bfdbfe` | `#bfdbfe` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 15 | `#7c3aed` | `#7c3aed` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 16 | `#2563eb` | `#2563eb` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 16 | `#4f46e5` | `#4f46e5` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 16 | `#7c3aed` | `#7c3aed` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 17 | `#1d4ed8` | `#1d4ed8` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 17 | `#4338ca` | `#4338ca` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 17 | `#6d28d9` | `#6d28d9` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 18 | `#1d4ed8` | `#1d4ed8` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 19 | `#2563eb` | `#2563eb` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 21 | `#059669` | `#059669` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 22 | `#ecfdf5` | `#ecfdf5` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 23 | `#dc2626` | `#dc2626` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 24 | `#fef2f2` | `#fef2f2` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 25 | `#b91c1c` | `#b91c1c` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 26 | `#d97706` | `#d97706` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 27 | `#fef3c7` | `#fef3c7` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 28 | `#fcd34d` | `#fcd34d` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 29 | `#b45309` | `#b45309` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 30 | `#f97316` | `#f97316` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 31 | `#ea580c` | `#ea580c` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 32 | `#10b981` | `#10b981` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 33 | `#059669` | `#059669` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 34 | `#22c55e` | `#22c55e` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 35 | `#f5f3ff` | `#f5f3ff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 36 | `#ddd6fe` | `#ddd6fe` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 37 | `#e11d48` | `#e11d48` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 38 | `#15803d` | `#15803d` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 39 | `#4ade80` | `#4ade80` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 40 | `#facc15` | `#facc15` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 41 | `#f87171` | `#f87171` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 42 | `#a855f7` | `#a855f7` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 43 | `#d946ef` | `#d946ef` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 44 | `#4285f4` | `#4285f4` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 45 | `#1a73e8` | `#1a73e8` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 46 | `#10a37f` | `#10a37f` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 47 | `#4f46e5` | `#4f46e5` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 48 | `#a78bfa` | `#a78bfa` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 49 | `#8b5cf6` | `#8b5cf6` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 50 | `#7c3aed` | `#7c3aed` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 51 | `#f472b6` | `#f472b6` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 52 | `#38bdf8` | `#38bdf8` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 53 | `#0ea5e9` | `#0ea5e9` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 54 | `#991b1b` | `#991b1b` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 55 | `#ea4335` | `#ea4335` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 56 | `#fbbc05` | `#fbbc05` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 57 | `#34a853` | `#34a853` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 58 | `#ffffff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 59 | `#fecaca` | `#fecaca` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 60 | `#ef4444` | `#ef4444` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 61 | `#6366f1` | `#6366f1` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 62 | `#6d28d9` | `#6d28d9` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 63 | `#5b21b6` | `#5b21b6` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 64 | `#047857` | `#047857` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 65 | `#0284c7` | `#0284c7` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 66 | `#ede9fe` | `#ede9fe` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 67 | `#c4b5fd` | `#c4b5fd` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 126 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 222 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 327 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 334 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1075 | `#6366f1` | `#6366f1` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1171 | `#60a5fa` | `#60a5fa` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1171 | `#2563eb` | `#2563eb` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1366 | `#2563eb` | `#2563eb` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1370 | `#22c55e` | `#22c55e` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1621 | `#a3a3a3` | `#a3a3a3` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1627 | `#fafafa` | `#fafafa` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1633 | `#93c5fd` | `#93c5fd` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1640 | `#a3a3a3` | `#a3a3a3` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1646 | `#fafafa` | `#fafafa` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1652 | `#93c5fd` | `#93c5fd` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1677 | `#b91c1c` | `#b91c1c` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1678 | `#fecaca` | `#fecaca` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1682 | `#fef2f2` | `#fef2f2` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1683 | `#f87171` | `#f87171` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1854 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1863 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 1870 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 2305 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 2448 | `#ef4444` | `#ef4444` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 2540 | `#ffffff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 2686 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 2695 | `#1d4ed8` | `#1d4ed8` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 2731 | `#1d4ed8` | `#1d4ed8` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 2867 | `#1d4ed8` | `#1d4ed8` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 2897 | `#b91c1c` | `#b91c1c` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 2903 | `#7c3aed` | `#7c3aed` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 2904 | `#6d28d9` | `#6d28d9` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3095 | `#fff` | `#ffffff` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3145 | `#8b5cf6` | `#8b5cf6` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3145 | `#6d28d9` | `#6d28d9` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3151 | `#7c3aed` | `#7c3aed` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3151 | `#5b21b6` | `#5b21b6` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3178 | `#0a0a0a` | `#0a0a0a` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3179 | `#171717` | `#171717` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3180 | `#262626` | `#262626` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3181 | `#2e2e2e` | `#2e2e2e` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3182 | `#404040` | `#404040` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3183 | `#fafafa` | `#fafafa` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3184 | `#a3a3a3` | `#a3a3a3` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3185 | `#737373` | `#737373` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3188 | `#93c5fd` | `#93c5fd` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3195 | `#171717` | `#171717` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3207 | `#0a0a0a` | `#0a0a0a` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3208 | `#171717` | `#171717` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3209 | `#262626` | `#262626` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3210 | `#2e2e2e` | `#2e2e2e` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3211 | `#404040` | `#404040` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3212 | `#fafafa` | `#fafafa` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3213 | `#a3a3a3` | `#a3a3a3` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3214 | `#737373` | `#737373` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3217 | `#93c5fd` | `#93c5fd` | 已在 trinity-base.css 出现（套件登记色） |
| `assets/trinity-base.css` | 3224 | `#171717` | `#171717` | 已在 trinity-base.css 出现（套件登记色） |

## 说明

- 本表**不**解析 `rgba()` / `hsl()` / `var(--x)`；仅针对十六进制字面量。
- **`apps/trinity-design`** 色板画板中出现的 hex 多为文档说明字符串，可与产品代码区分阅读。
- 若某色为刻意设计（如图表、OAuth 品牌），请在设计文档中登记后把 hex 写入 `trinity-base.css` 任意注释或变量，再重跑脚本以纳入允许集。

---

*由 `tools/audit-colors.py` 生成。*
