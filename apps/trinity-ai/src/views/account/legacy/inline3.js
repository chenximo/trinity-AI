      (function () {
        var shell = document.getElementById("or-pay-credits-shell");
        if (!shell) return;

        var backdrop = document.getElementById("or-pay-credits-backdrop");
        var dismiss = document.getElementById("or-pay-credits-dismiss");
        var purchaseBtn = document.getElementById("or-pay-credits-purchase");
        var amountInput = document.getElementById("or-pay-amount-input");
        var amountWrap = document.querySelector(".or-pay-amount-input-wrap");
        var amountError = document.getElementById("or-pay-amount-error");
        var totalDueEl = document.getElementById("or-pay-total-due");
        var cardPanel = document.getElementById("or-pay-panel-card");
        var scanPanel = document.getElementById("or-pay-panel-scan");
        var scanHintText = document.getElementById("or-pay-scan-hint-text");
        var enterprisePanel = document.getElementById("or-pay-panel-enterprise");
        var statusEl = document.getElementById("or-pay-status");
        var tabBtns = shell.querySelectorAll("[data-or-pay-method]");
        var presetBtns = shell.querySelectorAll("[data-or-pay-preset]");
        var openBtns = document.querySelectorAll(".or-credits-btn-recharge, [data-or-open-purchase-credits]");

        var qrShell = document.getElementById("or-pay-qr-shell");
        var qrDismiss = document.getElementById("or-pay-qr-dismiss");
        var qrDone = document.getElementById("or-pay-qr-done");
        var qrTitle = document.getElementById("or-pay-qr-title");
        var qrAmount = document.getElementById("or-pay-qr-amount");
        var qrTip = document.getElementById("or-pay-qr-tip");

        var MIN_AMOUNT = 5;
        var activeMethod = "card";

        function formatUsd(n) {
          return "$" + n.toFixed(2);
        }

        function parseRawAmount() {
          if (!amountInput) return NaN;
          var raw = String(amountInput.value || "").trim();
          if (!raw) return NaN;
          var v = parseFloat(raw.replace(/[^\d.]/g, ""));
          return isNaN(v) ? NaN : Math.round(v * 100) / 100;
        }

        function validateAmount() {
          var v = parseRawAmount();
          if (isNaN(v)) {
            return { ok: false, code: "empty", message: "请输入充值金额。" };
          }
          if (v < MIN_AMOUNT) {
            return {
              ok: false,
              code: "min",
              message: "单笔最低充值 " + formatUsd(MIN_AMOUNT) + "，请调整金额。"
            };
          }
          return { ok: true, value: v, message: "" };
        }

        function setAmountError(state) {
          var invalid = !state.ok;
          if (amountWrap) amountWrap.classList.toggle("is-invalid", invalid);
          if (amountInput) amountInput.setAttribute("aria-invalid", invalid ? "true" : "false");
          if (amountError) {
            amountError.hidden = !invalid;
            amountError.textContent = invalid ? state.message : "";
          }
          if (purchaseBtn) {
            purchaseBtn.disabled = invalid && activeMethod !== "enterprise";
          }
        }

        function syncTotal() {
          var state = validateAmount();
          setAmountError(state);
          if (totalDueEl) {
            totalDueEl.textContent = state.ok ? formatUsd(state.value) : "—";
          }
          if (amountInput) {
            var v = parseRawAmount();
            presetBtns.forEach(function (btn) {
              var p = parseFloat(btn.getAttribute("data-or-pay-preset") || "0");
              btn.classList.toggle("is-active", state.ok && Math.abs(p - v) < 0.001);
            });
          }
          if (state.ok && statusEl && statusEl.dataset.kind === "error") {
            statusEl.hidden = true;
            statusEl.textContent = "";
            delete statusEl.dataset.kind;
          }
        }

        function isScanMethod(method) {
          return method === "wechat" || method === "alipay";
        }

        function setMethod(method) {
          activeMethod = method;
          tabBtns.forEach(function (btn) {
            var m = btn.getAttribute("data-or-pay-method");
            var on = m === method;
            btn.classList.toggle("is-selected", on);
            btn.setAttribute("aria-selected", on ? "true" : "false");
          });
          if (cardPanel) cardPanel.hidden = method !== "card";
          if (scanPanel) scanPanel.hidden = !isScanMethod(method);
          if (enterprisePanel) enterprisePanel.hidden = method !== "enterprise";
          if (scanHintText && isScanMethod(method)) {
            scanHintText.textContent =
              method === "wechat"
                ? "您将看到一个二维码，请使用微信支付扫描。"
                : "您将看到一个二维码，请使用支付宝扫描。";
          }
          if (purchaseBtn) {
            purchaseBtn.textContent = method === "enterprise" ? "Contact Sales" : "Purchase";
            purchaseBtn.classList.toggle("is-enterprise-cta", method === "enterprise");
          }
          syncTotal();
        }

        function closeQrModal() {
          if (!qrShell) return;
          qrShell.setAttribute("hidden", "");
          qrShell.setAttribute("aria-hidden", "true");
        }

        function openQrModal(method, amount) {
          if (!qrShell) return;
          if (qrTitle) qrTitle.textContent = method === "wechat" ? "微信支付" : "支付宝";
          if (qrAmount) qrAmount.textContent = formatUsd(amount);
          if (qrTip) {
            qrTip.textContent =
              method === "wechat" ? "请使用微信扫描二维码完成支付" : "请使用支付宝扫描二维码完成支付";
          }
          qrShell.removeAttribute("hidden");
          qrShell.setAttribute("aria-hidden", "false");
        }

        function closeOtherModals() {
          closeQrModal();
          ["or-keys-editor-shell", "or-preset-editor-shell", "or-contact-sales-shell"].forEach(function (id) {
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
            delete statusEl.dataset.kind;
          }
          if (amountInput) amountInput.value = "10";
          setMethod("card");
          shell.removeAttribute("hidden");
          shell.setAttribute("aria-hidden", "false");
          document.body.classList.add("or-modal-open");
          window.setTimeout(function () {
            if (amountInput) amountInput.focus();
          }, 0);
        }

        function closeModal() {
          closeQrModal();
          shell.setAttribute("hidden", "");
          shell.setAttribute("aria-hidden", "true");
          var keysShell = document.getElementById("or-keys-editor-shell");
          var presetShell = document.getElementById("or-preset-editor-shell");
          var salesShell = document.getElementById("or-contact-sales-shell");
          var otherOpen =
            (keysShell && !keysShell.hasAttribute("hidden")) ||
            (presetShell && !presetShell.hasAttribute("hidden")) ||
            (salesShell && !salesShell.hasAttribute("hidden"));
          if (!otherOpen) document.body.classList.remove("or-modal-open");
        }

        function openContactSalesFromPay() {
          closeModal();
          window.setTimeout(function () {
            var openSales = document.querySelector("[data-or-open-contact-sales]");
            if (openSales) openSales.click();
          }, 0);
        }

        function mockPurchase() {
          if (activeMethod === "enterprise") {
            openContactSalesFromPay();
            return;
          }
          var state = validateAmount();
          syncTotal();
          if (!state.ok) {
            if (statusEl) {
              statusEl.hidden = false;
              statusEl.dataset.kind = "error";
              statusEl.className = "or-pay-status is-error";
              statusEl.textContent = state.message;
            }
            if (amountInput) amountInput.focus();
            return;
          }
          if (isScanMethod(activeMethod)) {
            openQrModal(activeMethod, state.value);
            return;
          }
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.dataset.kind = "success";
            statusEl.className = "or-pay-status is-success";
            statusEl.textContent =
              "原型：已模拟支付 " +
              formatUsd(state.value) +
              "（银行卡）· 接入 Stripe 后将托管 Payment Element。";
          }
        }

        function mockQrPaid() {
          var state = validateAmount();
          closeQrModal();
          if (statusEl && state.ok) {
            statusEl.hidden = false;
            statusEl.dataset.kind = "success";
            statusEl.className = "or-pay-status is-success";
            statusEl.textContent =
              "原型：已模拟扫码支付 " + formatUsd(state.value) + " · 接入 Stripe webhook 后刷新余额。";
          }
        }

        openBtns.forEach(function (btn) {
          btn.addEventListener("click", function (e) {
            e.preventDefault();
            openModal();
          });
        });

        var enterpriseLink = document.getElementById("or-pay-contact-sales-link");
        if (enterpriseLink) {
          enterpriseLink.addEventListener("click", function (e) {
            e.preventDefault();
            openContactSalesFromPay();
          });
        }

        if (backdrop) {
          backdrop.addEventListener("click", function () {
            if (qrShell && !qrShell.hasAttribute("hidden")) {
              closeQrModal();
              return;
            }
            closeModal();
          });
        }
        if (dismiss) dismiss.addEventListener("click", closeModal);
        if (purchaseBtn) purchaseBtn.addEventListener("click", mockPurchase);
        if (qrDismiss) qrDismiss.addEventListener("click", closeQrModal);
        if (qrDone) qrDone.addEventListener("click", mockQrPaid);

        if (amountInput) {
          amountInput.addEventListener("input", syncTotal);
          amountInput.addEventListener("blur", syncTotal);
        }

        presetBtns.forEach(function (btn) {
          btn.addEventListener("click", function () {
            var p = btn.getAttribute("data-or-pay-preset");
            if (amountInput && p) amountInput.value = p;
            syncTotal();
          });
        });

        tabBtns.forEach(function (btn) {
          btn.addEventListener("click", function () {
            var m = btn.getAttribute("data-or-pay-method");
            if (m) setMethod(m);
          });
        });

        document.addEventListener("keydown", function (e) {
          if (e.key !== "Escape") return;
          if (qrShell && !qrShell.hasAttribute("hidden")) {
            closeQrModal();
            return;
          }
          if (shell.hasAttribute("hidden")) return;
          closeModal();
        });

        syncTotal();
      })();
