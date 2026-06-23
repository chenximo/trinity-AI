/**
 * @trinity/ui — 设计规范示意用 Vue 片（仅样式 + 必要 DOM/事件面，不含业务数据与接口）。
 * 目录：`filters/` · `search/` · `fields/` · `tabs/`（`TabSwitch1Underline`、`TabSwitch2Capsule`）· `modal/` · `internal/` · `select-list/` · `buttons/`
 */
export type FilterForm1MenuIconKey = "diagram" | "dial" | "user-add";

export type FilterForm1MenuItem = {
  label: string;
  disabled?: boolean;
  active?: boolean;
  icon?: FilterForm1MenuIconKey;
};

/** 形式2 listbox 选项；`dataAttrs` 与 `useDesignSpecDropdowns` 中 `getAttribute` 对齐 */
export type FilterForm2ListboxItem = {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  dataAttrs?: Record<string, string>;
};

/** 形式3 芯片分段示意 */
export type FilterForm3SegmentItem = {
  label: string;
  active?: boolean;
  disabled?: boolean;
};

export { default as FilterForm1More } from "./filters/FilterForm1More.vue";
export { default as FilterForm1MoreTrigger } from "./filters/FilterForm1More.vue";
export { default as FilterForm1MoreWithMenu } from "./filters/FilterForm1More.vue";
export { default as FilterForm2PillListbox } from "./filters/FilterForm2PillListbox.vue";
export { default as FilterForm2PillListboxTrigger } from "./filters/FilterForm2PillListbox.vue";
export { default as FilterForm3LabeledSegmented } from "./filters/FilterForm3LabeledSegmented.vue";

export { default as SearchForm1Fixed } from "./search/SearchForm1Fixed.vue";
export { default as SearchForm2Grow } from "./search/SearchForm2Grow.vue";

export { default as TextField1Labeled } from "./fields/TextField1Labeled.vue";

/** Tab 切换选项（形式1 / 形式2 共用） */
export type { TabSwitchItem } from "./tabs/TabSwitch1Underline.vue";

export { default as TabSwitch1Underline } from "./tabs/TabSwitch1Underline.vue";
export { default as TabSwitch2Capsule } from "./tabs/TabSwitch2Capsule.vue";

export { default as ModalPanel } from "./modal/ModalPanel.vue";
export { default as TrinityAuthModal } from "./auth/TrinityAuthModal.vue";
export { default as TrinityAuthSigninPanel } from "./auth/TrinityAuthSigninPanel.vue";
export { default as TrinityAuthSignupPanel } from "./auth/TrinityAuthSignupPanel.vue";
export { default as TrinityAuthTermsAgree } from "./auth/TrinityAuthTermsAgree.vue";
export type { TrinityAuthMode } from "./auth/TrinityAuthModal.vue";
export { getTrinityLegalChildRoutes } from "./legal/routes";
export {
  TRINITY_LEGAL_PATHS,
  TRINITY_LEGAL_ROUTE_NAMES,
  type TrinityLegalRouteKey,
} from "./legal/types";
export { default as TrinityPrivacyPolicyPage } from "./legal/TrinityPrivacyPolicyPage.vue";
export { default as TrinityTermsOfServicePage } from "./legal/TrinityTermsOfServicePage.vue";
export { default as InternalHelpTip } from "./internal/InternalHelpTip.vue";

export { default as SelectListForm1ModelRow } from "./select-list/SelectListForm1ModelRow.vue";

export { default as TButton } from "./buttons/TButton.vue";
export { default as TextLink } from "./buttons/TextLink.vue";

/** 兼容旧导出 */
export { default as TAppFilterMore } from "./filters/FilterForm1More.vue";
export { default as TModalPanel } from "./modal/ModalPanel.vue";
export { default as TInternalHelpTip } from "./internal/InternalHelpTip.vue";
export { default as TTextLink } from "./buttons/TextLink.vue";
export { default as FilterMoreTrigger } from "./filters/FilterForm1More.vue";
export { default as PillListboxTrigger } from "./filters/FilterForm2PillListbox.vue";
export { default as LabeledSegmented } from "./filters/FilterForm3LabeledSegmented.vue";
export { default as TSearchForm1Fixed } from "./search/SearchForm1Fixed.vue";
export { default as TSearchForm2Grow } from "./search/SearchForm2Grow.vue";
export { default as TTextField1Labeled } from "./fields/TextField1Labeled.vue";
export { default as TTabSwitch1Underline } from "./tabs/TabSwitch1Underline.vue";
export { default as TTabSwitch2Capsule } from "./tabs/TabSwitch2Capsule.vue";
