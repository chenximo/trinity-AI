      (function () {
        var search = document.getElementById("or-keys-search-input");
        var table = document.getElementById("or-keys-table");
        var summary = document.getElementById("or-keys-summary");
        var expiryPanel = document.getElementById("or-keys-expiry-dd-panel");

        function getExpiryFilter() {
          var checked = document.querySelector(".or-keys-expiry-filter .or-app-filter-dd-item.is-checked");
          return checked && checked.getAttribute("data-or-expiry-filter")
            ? checked.getAttribute("data-or-expiry-filter")
            : "all";
        }

        function runKeysFilter() {
          if (!table || !summary) return;
          var q = search ? (search.value || "").trim().toLowerCase() : "";
          var ef = getExpiryFilter();
          var rows = table.querySelectorAll("tbody tr[data-or-key-name]");
          var n = 0;
          rows.forEach(function (row) {
            var name = (row.getAttribute("data-or-key-name") || "").toLowerCase();
            var expiry = row.getAttribute("data-or-key-expiry") || "not-expired";
            var nameOk = !q || name.indexOf(q) !== -1;
            var expiryOk =
              ef === "all" ||
              (ef === "expired" && expiry === "expired") ||
              (ef === "not-expired" && expiry === "not-expired");
            if (nameOk && expiryOk) {
              row.removeAttribute("hidden");
              n++;
            } else {
              row.setAttribute("hidden", "");
            }
          });
          summary.textContent = n === 1 ? "1 个密钥" : n + " 个密钥";
        }

        if (search) search.addEventListener("input", runKeysFilter);
        if (expiryPanel) {
          expiryPanel.addEventListener("click", function () {
            window.setTimeout(runKeysFilter, 0);
          });
        }

        var keysEditorShell = document.getElementById("or-keys-editor-shell");
        var keysEditName = document.getElementById("or-keys-edit-name");
        var keysEditMask = document.getElementById("or-keys-edit-key-mask");
        var keysEditLimit = document.getElementById("or-keys-edit-limit");
        var keysEditResetDdWrap = document.getElementById("or-keys-edit-reset-dd-wrap");
        var keysEditExpiryDdWrap = document.getElementById("or-keys-edit-expiry-dd-wrap");
        var keysEditExpiryDdPanel = document.getElementById("or-keys-edit-expiry-dd-panel");
        var keysEditExpiryDateWrap = document.getElementById("or-keys-edit-expiry-date-wrap");
        var keysEditExpiryDate = document.getElementById("or-keys-edit-expiry-date");
        var keysEditCreated = document.getElementById("or-keys-edit-created");
        var keysEditNote = document.getElementById("or-keys-edit-note");
        var keysEditCancel = document.getElementById("or-keys-edit-cancel");
        var keysEditSave = document.getElementById("or-keys-edit-save");

        function setKeysEditorListboxChecked(wrap, predicateFn) {
          if (!wrap) return;
          var panel = wrap.querySelector('.or-app-filter-more-panel[role="listbox"]');
          var labelSpan = wrap.querySelector("[data-dd-label]");
          if (!panel || !labelSpan) return;
          var items = panel.querySelectorAll(".or-app-filter-dd-item");
          var matched = false;
          items.forEach(function (btn) {
            var lbl = btn.querySelector(".or-app-filter-dd-label");
            var text = lbl ? lbl.textContent.trim() : "";
            var mode = btn.getAttribute("data-or-keys-expiry-mode");
            var on = predicateFn(btn, text, mode);
            if (on) matched = true;
            btn.classList.toggle("is-checked", on);
            var mk = btn.querySelector(".or-app-filter-dd-mark");
            if (mk) mk.textContent = on ? "✓" : "";
            if (on && lbl) labelSpan.textContent = text;
          });
          if (!matched && items.length) {
            var first = items[0];
            first.classList.add("is-checked");
            var mk0 = first.querySelector(".or-app-filter-dd-mark");
            if (mk0) mk0.textContent = "✓";
            var lb0 = first.querySelector(".or-app-filter-dd-label");
            if (lb0) labelSpan.textContent = lb0.textContent.trim();
          }
        }

        function syncResetDdFromRow(resetText) {
          var t = (resetText || "").trim();
          setKeysEditorListboxChecked(keysEditResetDdWrap, function (_btn, text) {
            return text === t;
          });
        }

        function readKeyRow(row) {
          var tds = row.querySelectorAll("td");
          return {
            name: (tds[0] && tds[0].textContent.trim()) || "",
            mask: (tds[1] && tds[1].textContent.trim()) || "",
            limit: (tds[2] && tds[2].textContent.trim()) || "",
            reset: (tds[3] && tds[3].textContent.trim()) || "",
            expiry: (tds[4] && tds[4].textContent.trim()) || "",
            created: (tds[5] && tds[5].textContent.trim()) || ""
          };
        }

        function syncExpiryFields(expiryText) {
          if (!keysEditExpiryDdWrap || !keysEditExpiryDateWrap) return;
          var useNever = (expiryText || "").indexOf("永不") !== -1;
          setKeysEditorListboxChecked(keysEditExpiryDdWrap, function (_btn, _text, mode) {
            return useNever ? mode === "never" : mode === "date";
          });
          if (useNever) {
            keysEditExpiryDateWrap.setAttribute("hidden", "");
          } else {
            keysEditExpiryDateWrap.removeAttribute("hidden");
            if (keysEditExpiryDate) keysEditExpiryDate.value = "";
          }
        }

        function openKeysEditor(row) {
          if (!keysEditorShell || !row) return;
          var ps = document.getElementById("or-preset-editor-shell");
          if (ps) {
            ps.setAttribute("hidden", "");
            ps.setAttribute("aria-hidden", "true");
          }
          var d = readKeyRow(row);
          if (keysEditName) keysEditName.value = d.name;
          if (keysEditMask) keysEditMask.textContent = d.mask;
          if (keysEditLimit) keysEditLimit.value = d.limit;
          syncResetDdFromRow(d.reset);
          syncExpiryFields(d.expiry);
          if (keysEditCreated) keysEditCreated.value = d.created;
          if (keysEditNote) keysEditNote.value = "";
          keysEditorShell.removeAttribute("hidden");
          keysEditorShell.setAttribute("aria-hidden", "false");
          document.body.classList.add("or-modal-open");
          window.setTimeout(function () {
            if (keysEditName) keysEditName.focus();
          }, 0);
        }

        function closeKeysEditor() {
          if (keysEditorShell) {
            keysEditorShell.setAttribute("hidden", "");
            keysEditorShell.setAttribute("aria-hidden", "true");
          }
          var ps = document.getElementById("or-preset-editor-shell");
          if (!ps || ps.hasAttribute("hidden")) {
            document.body.classList.remove("or-modal-open");
          }
        }

        var keysEditDismiss = document.getElementById("or-keys-edit-dismiss");
        if (keysEditDismiss) keysEditDismiss.addEventListener("click", closeKeysEditor);
        document.addEventListener("keydown", function (e) {
          if (e.key !== "Escape") return;
          if (!keysEditorShell || keysEditorShell.hasAttribute("hidden")) return;
          var innerOpen = keysEditorShell.querySelector('.or-app-filter-more-panel[role="listbox"]:not([hidden])');
          if (innerOpen) return;
          closeKeysEditor();
        });

        if (keysEditExpiryDdPanel && keysEditExpiryDateWrap) {
          keysEditExpiryDdPanel.addEventListener("click", function (e) {
            var item = e.target && e.target.closest("button.or-app-filter-dd-item");
            if (!item) return;
            window.setTimeout(function () {
              var mode = item.getAttribute("data-or-keys-expiry-mode");
              if (mode === "date") keysEditExpiryDateWrap.removeAttribute("hidden");
              else keysEditExpiryDateWrap.setAttribute("hidden", "");
            }, 0);
          });
        }

        if (keysEditCancel) keysEditCancel.addEventListener("click", closeKeysEditor);
        if (keysEditSave) keysEditSave.addEventListener("click", closeKeysEditor);

        (function initKeysRowMenus() {
          var openWrap = null;

          function placePanel(wrap) {
            var btn = wrap.querySelector(".or-keys-ops-trigger");
            var panel = wrap.querySelector(".or-keys-ops-panel");
            if (!btn || !panel) return;
            var br = btn.getBoundingClientRect();
            var gap = 4;
            panel.style.top = Math.round(br.bottom + gap) + "px";
            panel.style.right = Math.round(window.innerWidth - br.right) + "px";
            panel.style.left = "auto";
          }

          function closeOpen() {
            if (!openWrap) return;
            var t = openWrap.querySelector(".or-keys-ops-trigger");
            var p = openWrap.querySelector(".or-keys-ops-panel");
            if (p) {
              p.setAttribute("hidden", "");
            }
            if (t) {
              t.setAttribute("aria-expanded", "false");
            }
            openWrap = null;
          }

          function toggle(wrap) {
            var btn = wrap.querySelector(".or-keys-ops-trigger");
            var panel = wrap.querySelector(".or-keys-ops-panel");
            if (!btn || !panel) return;
            var willOpen = panel.hasAttribute("hidden");
            closeOpen();
            if (!willOpen) return;
            panel.removeAttribute("hidden");
            btn.setAttribute("aria-expanded", "true");
            openWrap = wrap;
            placePanel(wrap);
          }

          document.querySelectorAll("[data-or-keys-ops]").forEach(function (wrap) {
            var btn = wrap.querySelector(".or-keys-ops-trigger");
            var panel = wrap.querySelector(".or-keys-ops-panel");
            if (!btn || !panel) return;
            btn.addEventListener("click", function (e) {
              e.stopPropagation();
              toggle(wrap);
            });
            panel.addEventListener("click", function (e) {
              var item = e.target && e.target.closest(".or-keys-ops-item");
              if (!item) return;
              e.preventDefault();
              var row = item.closest("tr[data-or-key-name]");
              if (item.classList.contains("or-keys-ops-item--edit") && row) {
                openKeysEditor(row);
              }
              closeOpen();
            });
          });

          document.addEventListener("click", function () {
            closeOpen();
          });
          document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeOpen();
          });
          window.addEventListener("resize", function () {
            if (openWrap) placePanel(openWrap);
          });
          window.addEventListener(
            "scroll",
            function () {
              closeOpen();
            },
            true
          );
        })();
      })();
