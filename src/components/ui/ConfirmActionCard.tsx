interface Props {
  label: string;
  resolved?: "approved" | "rejected";
  onApprove: () => void;
  onReject: () => void;
}

export function ConfirmActionCard({
  label,
  resolved,
  onApprove,
  onReject,
}: Props) {
  if (resolved) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-2xl rounded-bl-sm bg-gray-100 text-xs text-gray-400 max-w-[80%]">
        {resolved === "approved" ? (
          <span>ยืนยันการลบ {label} แล้ว</span>
        ) : (
          <span>ยกเลิกการลบ {label} แล้ว</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-gray-50 rounded-2xl px-6 py-6 max-w-[300px]">
      <p className="text-sm font-bold text-center text-gray-900">ต้องการลบ</p>
      <p className="text-xl text-center text-gray-900 px-4">{label}</p>
      <p className="text-sm font-bold text-center text-gray-900">ใช่หรือไม่</p>
      <div className="flex gap-3 mt-1">
        <button
          onClick={onApprove}
          className="flex-1 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white text-sm font-semibold"
        >
          ยืนยัน
        </button>
        <button
          onClick={onReject}
          className="flex-1 py-3 rounded-2xl bg-[#6D071A] hover:bg-[#5A0515] text-white text-sm font-semibold"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
