import { useState } from "react";
import { ClipboardList, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormField } from "@/types/chat";

interface DynamicFormProps {
  title: string;
  fields: FormField[];
  submitted?: boolean;
  onSubmit: (data: Record<string, string | number>) => void;
}

export function DynamicForm({
  title,
  fields,
  submitted,
  onSubmit,
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, string | number>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.value ?? ""]))
  );
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleChange = (name: string, value: string | number) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    fields.forEach((f) => {
      if (f.required && !String(values[f.name]).trim()) {
        newErrors[f.name] = true;
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(values);
  };

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-2xl border bg-white shadow-sm overflow-hidden transition-opacity",
        submitted && "opacity-60 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-[#6D071A]">
        <ClipboardList className="w-4 h-4 text-white/80 shrink-0" />
        <span className="text-sm font-semibold text-white">{title}</span>
        {submitted && (
          <span className="ml-auto text-xs text-white/70">ส่งแล้ว</span>
        )}
      </div>

      {/* Fields */}
      <div className="p-4 flex flex-col gap-3">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-[#6D071A]">*</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                value={String(values[field.name] ?? "")}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6D071A]/30 focus:border-[#6D071A] transition-all",
                  errors[field.name]
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                )}
              />
            ) : field.type === "select" ? (
              <select
                value={String(values[field.name] ?? "")}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D071A]/30 focus:border-[#6D071A] transition-all bg-gray-50 appearance-none",
                  errors[field.name]
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200"
                )}
              >
                <option value="">-- เลือก --</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={String(values[field.name] ?? "")}
                onChange={(e) =>
                  handleChange(
                    field.name,
                    field.type === "number"
                      ? e.target.valueAsNumber
                      : e.target.value
                  )
                }
                placeholder={field.placeholder}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D071A]/30 focus:border-[#6D071A] transition-all",
                  errors[field.name]
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                )}
              />
            )}

            {errors[field.name] && (
              <p className="text-xs text-red-500">กรุณากรอก{field.label}</p>
            )}
          </div>
        ))}

        {!submitted && (
          <button
            onClick={handleSubmit}
            className="mt-1 w-full flex items-center justify-center gap-2 bg-[#6D071A] hover:bg-[#5A0515] text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            ยืนยัน
          </button>
        )}
      </div>
    </div>
  );
}
