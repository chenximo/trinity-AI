      (function () {
        document.querySelectorAll("[data-or-copy]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var t = btn.getAttribute("data-or-copy");
            if (!t || !navigator.clipboard) return;
            navigator.clipboard.writeText(t).then(function () {
              var o = btn.textContent;
              btn.textContent = "已复制";
              setTimeout(function () {
                btn.textContent = o;
              }, 1200);
            });
          });
        });

        var PRESET_DEMO = {
          new: {
            title: "未命名角色",
            intro: "",
            slug: "untitled",
            identifier: "@preset/untitled",
            presetId: "preset_new",
            system: "在这里填写系统提示词…",
            desc: "",
            primary: "openai/gpt-4o",
            fallback: "",
            temp: "0.7",
            max: "4096",
            topp: "1",
            policy: "policy_failover_std",
            sumSys: "是",
            sumMod: "1 个模型",
            sumPar: "默认",
            sumProv: "默认",
            tagA: "OpenAI: GPT-4o",
            tagB: "",
          },
          preset_default_zh: {
            title: "中文技术写作",
            intro: "中文优先的技术文档与说明，Markdown 结构清晰。",
            slug: "default-zh-tech",
            identifier: "@preset/default-zh-tech",
            presetId: "preset_default_zh",
            system:
              "你是简洁专业的技术文档助手，优先使用中文。输出使用 Markdown，小标题与列表要清晰。",
            desc: "技术文档与对内说明类回答",
            primary: "openai/gpt-4o",
            fallback: "anthropic/claude-3.5-sonnet",
            temp: "0.3",
            max: "4096",
            topp: "0.95",
            policy: "policy_failover_std",
            sumSys: "是",
            sumMod: "2 个模型",
            sumPar: "自定义",
            sumProv: "policy_failover_std",
            tagA: "OpenAI: GPT-4o",
            tagB: "Anthropic: Claude 3.5 Sonnet",
          },
          preset_code_review: {
            title: "代码审查 · 严格",
            intro: "只做 PR 问题清单与补丁建议，不写空话夸奖。",
            slug: "code-review-strict",
            identifier: "@preset/code-review-strict",
            presetId: "preset_code_review",
            system: "只输出问题清单与补丁建议；不要泛泛夸奖。对安全风险与性能问题单独分段。",
            desc: "PR 与合并前审查",
            primary: "anthropic/claude-3.5-sonnet",
            fallback: "",
            temp: "0.1",
            max: "8192",
            topp: "0.9",
            policy: "policy_failover_std",
            sumSys: "是",
            sumMod: "1 个模型",
            sumPar: "自定义",
            sumProv: "policy_failover_std",
            tagA: "Anthropic: Claude 3.5 Sonnet",
            tagB: "",
          },
          preset_cs_short: {
            title: "客服 · 简短回复",
            intro: "一线客服场景：语气友好、回复短、步骤可执行。",
            slug: "cs-short",
            identifier: "@preset/cs-short",
            presetId: "preset_cs_short",
            system: "语气友好，每条回复不超过 120 字；优先给出可执行步骤。",
            desc: "一线客服快捷回复",
            primary: "openai/gpt-4o-mini",
            fallback: "",
            temp: "0.35",
            max: "1024",
            topp: "0.92",
            policy: "policy_failover_std",
            sumSys: "是",
            sumMod: "1 个模型",
            sumPar: "自定义",
            sumProv: "policy_failover_std",
            tagA: "OpenAI: GPT-4o mini",
            tagB: "",
          },
        };

        function setDdListboxByValue(wrap, val) {
          if (!wrap) return;
          var panel = wrap.querySelector('.or-app-filter-more-panel[role="listbox"]');
          var labelSpan = wrap.querySelector("[data-dd-label]");
          if (!panel) return;
          var items = panel.querySelectorAll("button.or-app-filter-dd-item");
          var want = val == null ? "" : String(val);
          var i;
          var picked = null;
          for (i = 0; i < items.length; i++) {
            var it = items[i];
            var dv = it.getAttribute("data-dd-value");
            if (dv == null) dv = "";
            if (dv === want) {
              picked = it;
              break;
            }
          }
          if (!picked && items.length) picked = items[0];
          items.forEach(function (b) {
            var on = b === picked;
            b.classList.toggle("is-checked", on);
            var mk = b.querySelector(".or-app-filter-dd-mark");
            if (mk) mk.textContent = on ? "✓" : "";
          });
          if (labelSpan && picked) {
            var rowLabel = picked.querySelector(".or-app-filter-dd-label");
            labelSpan.textContent = rowLabel ? rowLabel.textContent.trim() : want;
          }
        }

        function applyPreset(key) {
          var p = PRESET_DEMO[key];
          if (!p) return;
          var shell = document.getElementById("or-preset-editor-shell");
          var hint = document.getElementById("or-preset-editor-hint");
          var banner = document.getElementById("or-preset-editing-banner");
          var modalTitle = document.getElementById("or-preset-modal-title");
          var titleEl = document.getElementById("or-preset-title-input");
          var introEl = document.getElementById("or-preset-intro");
          var sys = document.getElementById("or-preset-system");
          var slug = document.getElementById("or-preset-slug");
          var desc = document.getElementById("or-preset-desc");
          var tagA = document.getElementById("or-preset-model-tag-a");
          var tagB = document.getElementById("or-preset-model-tag-b");

          if (modalTitle) modalTitle.textContent = key === "new" ? "新建角色" : "编辑角色";
          var keysShell = document.getElementById("or-keys-editor-shell");
          if (keysShell) {
            keysShell.setAttribute("hidden", "");
            keysShell.setAttribute("aria-hidden", "true");
          }
          if (shell) {
            shell.removeAttribute("hidden");
            shell.setAttribute("aria-hidden", "false");
          }
          document.body.classList.add("or-modal-open");
          if (hint) {
            hint.innerHTML =
              "已打开<strong>编辑弹窗</strong>；内容与上表当前行<strong>一一对应</strong>。点「<strong>取消</strong>」或右上角关闭收起。";
          }
          if (banner) {
            banner.innerHTML =
              "正在编辑：<strong>" +
              p.title +
              '</strong> · <code style="font-size:0.85em">' +
              p.presetId +
              "</code>";
          }
          if (titleEl) titleEl.value = p.title;
          if (introEl) introEl.value = p.intro != null ? p.intro : "";
          if (sys) sys.value = p.system;
          if (slug) slug.value = p.slug;
          if (desc) desc.value = p.desc;
          setDdListboxByValue(document.getElementById("or-preset-model-primary-dd-wrap"), p.primary || "");
          setDdListboxByValue(document.getElementById("or-preset-model-fallback-dd-wrap"), p.fallback != null && p.fallback !== "" ? p.fallback : "");
          var tel = document.getElementById("or-preset-temp");
          var mx = document.getElementById("or-preset-max");
          var tp = document.getElementById("or-preset-topp");
          if (tel) tel.value = p.temp;
          if (mx) mx.value = p.max;
          if (tp) tp.value = p.topp;
          var pol = document.getElementById("or-preset-policy");
          if (pol) pol.value = p.policy;
          if (tagA) tagA.textContent = p.tagA || "—";
          if (tagB) {
            if (p.tagB) {
              tagB.textContent = p.tagB;
              tagB.removeAttribute("hidden");
            } else {
              tagB.textContent = "—";
              tagB.setAttribute("hidden", "");
            }
          }
          window.setTimeout(function () {
            if (titleEl) {
              try {
                titleEl.focus();
              } catch (e1) {}
            }
          }, 0);
        }

        function closePresetEditor() {
          var shell = document.getElementById("or-preset-editor-shell");
          var hint = document.getElementById("or-preset-editor-hint");
          if (shell) {
            shell.setAttribute("hidden", "");
            shell.setAttribute("aria-hidden", "true");
          }
          var keysShell = document.getElementById("or-keys-editor-shell");
          if (!keysShell || keysShell.hasAttribute("hidden")) {
            document.body.classList.remove("or-modal-open");
          }
          if (hint) {
            hint.innerHTML =
              "尚未打开编辑弹窗：请在上表点击「<strong>编辑</strong>」或顶部「<strong>新建角色</strong>」。";
          }
        }

        document.querySelectorAll(".or-preset-open-editor").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var key = btn.getAttribute("data-preset-key");
            if (key) applyPreset(key);
          });
        });

        function tryOpenPresetCreateFromQuery() {
          window.setTimeout(function () {
            try {
              var q = new URLSearchParams(window.location.search);
              if (q.get("create") !== "1") return;
              if ((window.location.hash || "").replace(/^#/, "") !== "preset") return;
              var nb = document.querySelector('.or-preset-open-editor[data-preset-key="new"]');
              if (nb) nb.click();
            } catch (eOpen) {}
          }, 0);
        }
        window.addEventListener("DOMContentLoaded", tryOpenPresetCreateFromQuery);
        if (document.readyState !== "loading") {
          tryOpenPresetCreateFromQuery();
        }

        var closeBtn = document.getElementById("or-preset-btn-close");
        if (closeBtn) closeBtn.addEventListener("click", closePresetEditor);
        var saveBtn = document.getElementById("or-preset-btn-save");
        if (saveBtn) saveBtn.addEventListener("click", closePresetEditor);
        var presetBackdrop = document.getElementById("or-preset-editor-backdrop");
        if (presetBackdrop) presetBackdrop.addEventListener("click", closePresetEditor);
        var presetDismiss = document.getElementById("or-preset-modal-dismiss");
        if (presetDismiss) presetDismiss.addEventListener("click", closePresetEditor);
        document.addEventListener("keydown", function (e) {
          if (e.key !== "Escape") return;
          var ps = document.getElementById("or-preset-editor-shell");
          if (!ps || ps.hasAttribute("hidden")) return;
          var innerOpen = ps.querySelector('.or-app-filter-more-panel[role="listbox"]:not([hidden])');
          if (innerOpen) return;
          closePresetEditor();
        });
      })();
