import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CloudLedgerView from "../views/CloudLedgerView.vue";
import PaymentIssueView from "../views/PaymentIssueView.vue";
import InvoiceView from "../views/InvoiceView.vue";
import ReceiptsView from "../views/ReceiptsView.vue";
import ReconView from "../views/ReconView.vue";
import ContractsView from "../views/ContractsView.vue";
import FinanceLedgerView from "../views/FinanceLedgerView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/payments", name: "payments", component: PaymentIssueView },
    { path: "/receipts", name: "receipts", component: ReceiptsView },
    { path: "/invoices", name: "invoices", component: InvoiceView },
    { path: "/contracts", name: "contracts", component: ContractsView },
    { path: "/cloud", name: "cloud", component: CloudLedgerView },
    { path: "/finance", name: "finance", component: FinanceLedgerView },
    { path: "/recon", name: "recon", component: ReconView },
  ],
});

