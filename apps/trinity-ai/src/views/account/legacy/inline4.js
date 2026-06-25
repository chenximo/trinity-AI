      (function () {
        var shell = document.getElementById("or-contact-sales-shell");
        if (!shell) return;

        var backdrop = document.getElementById("or-contact-sales-backdrop");
        var dismiss = document.getElementById("or-contact-sales-dismiss");
        var cancelBtn = document.getElementById("or-contact-sales-cancel");
        var submitBtn = document.getElementById("or-contact-sales-submit");
        var statusEl = document.getElementById("or-contact-sales-status");
        var form = document.getElementById("or-contact-sales-form");
        var openBtns = document.querySelectorAll("[data-or-open-contact-sales]");

        function closeOtherModals() {
          ["or-keys-editor-shell", "or-preset-editor-shell", "or-pay-credits-shell"].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) {
              el.setAttribute("hidden", "");
              el.setAttribute("aria-hidden", "true");
            }
          });
        }

        function openModal() {
          closeOtherModals();
          if (statusEl) {
            statusEl.hidden = true;
            statusEl.textContent = "";
            statusEl.className = "or-contact-sales-status";
          }
          shell.removeAttribute("hidden");
          shell.setAttribute("aria-hidden", "false");
          document.body.classList.add("or-modal-open");
          var first = document.getElementById("or-sales-company");
          window.setTimeout(function () {
            if (first) first.focus();
          }, 0);
        }

        function closeModal() {
          shell.setAttribute("hidden", "");
          shell.setAttribute("aria-hidden", "true");
          var keysShell = document.getElementById("or-keys-editor-shell");
          var presetShell = document.getElementById("or-preset-editor-shell");
          var payShell = document.getElementById("or-pay-credits-shell");
          var otherOpen =
            (keysShell && !keysShell.hasAttribute("hidden")) ||
            (presetShell && !presetShell.hasAttribute("hidden")) ||
            (payShell && !payShell.hasAttribute("hidden"));
          if (!otherOpen) document.body.classList.remove("or-modal-open");
        }

        function readField(id) {
          var el = document.getElementById(id);
          return el ? String(el.value || "").trim() : "";
        }

        openBtns.forEach(function (btn) {
          btn.addEventListener("click", function (e) {
            e.preventDefault();
            openModal();
          });
        });

        if (backdrop) backdrop.addEventListener("click", closeModal);
        if (dismiss) dismiss.addEventListener("click", closeModal);
        if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

        if (form) {
          form.addEventListener("submit", function (e) {
            e.preventDefault();
            var company = readField("or-sales-company");
            var email = readField("or-sales-email");
            var spend = readField("or-sales-spend");
            var needs = readField("or-sales-needs");

            if (!company || !email) {
              if (statusEl) {
                statusEl.hidden = false;
                statusEl.className = "or-contact-sales-status is-error";
                statusEl.textContent = "请填写公司名称与工作邮箱。";
              }
              return;
            }

            if (statusEl) {
              statusEl.hidden = false;
              statusEl.className = "or-contact-sales-status is-success";
              statusEl.textContent =
                "原型：已提交企业咨询（" +
                company +
                " · " +
                email +
                (spend ? " · 月消耗 " + spend : "") +
                "）。接入后将发送至 sales@trinitydesk.ai。";
            }
            if (needs) {
              /* prototype: keep form values visible after submit */
            }
          });
        }

        if (submitBtn && form) {
          submitBtn.addEventListener("click", function () {
            if (typeof form.requestSubmit === "function") form.requestSubmit();
            else form.dispatchEvent(new Event("submit", { cancelable: true }));
          });
        }

        document.addEventListener("keydown", function (e) {
          if (e.key !== "Escape") return;
          if (shell.hasAttribute("hidden")) return;
          closeModal();
        });
      })();
