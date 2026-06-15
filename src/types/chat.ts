export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select";
  value?: string | number;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[]; // สำหรับ select
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  timestamp: Date;
  type: "text" | "confirm_action" | "form_request";

  // type: text
  content?: string;

  // type: confirm_action
  label?: string;
  resolved?: "approved" | "rejected";

  // type: form_request
  title?: string;
  fields?: FormField[];
  submitted?: boolean;
}
