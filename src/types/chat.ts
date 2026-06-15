import { type Tenant } from "@/api/tenantApi";

export interface BaseMessage {
  id: number;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface TextMessage extends BaseMessage {
  type: "text";
  content: string;
}

export interface ConfirmMessage extends BaseMessage {
  type: "confirm_action";
  label: string;
  resolved?: "approved" | "rejected";
}

export interface ChatSidebarProps {
  tenants: Tenant[];
  activeTenantId: string | null;
  onSelectTenant: (tenant: Tenant) => void;
  onLogout: () => void;
  open: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export type Message = TextMessage | ConfirmMessage;
