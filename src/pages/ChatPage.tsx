import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const tenantId = sessionStorage.getItem("tenant-id");
  const tenantName = sessionStorage.getItem("tenant-name");

  useEffect(() => {
    if (!tenantId) {
      navigate("/");
      return;
    }

    const token = sessionStorage.getItem("token");
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", content: e.data },
      ]);
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [tenantId, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || !connected) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: input },
    ]);
    wsRef.current.send(JSON.stringify({ message: input, tenant_id: tenantId }));
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold">
            {tenantName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">
              {tenantName}
            </p>
            <p className="text-xs mt-0.5">
              {connected ? (
                <span className="text-green-500">Online</span>
              ) : (
                <span className="text-gray-400">Connecting…</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-300">No messages yet</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                "break-words whitespace-pre-wrap overflow-hidden",
                msg.role === "user"
                  ? "bg-black text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl px-4 py-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message… (Shift+Enter เพื่อขึ้นบรรทัดใหม่)"
            rows={1}
            className="flex-1 border-0 bg-transparent shadow-none focus:outline-none resize-none text-sm placeholder:text-gray-400 py-1 max-h-40 overflow-y-auto leading-relaxed"
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-black disabled:bg-gray-200 transition-colors mb-0.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <p className="text-xs text-gray-300 mt-1 px-1">
          Enter ส่งข้อความ · Shift+Enter ขึ้นบรรทัดใหม่
        </p>
      </div>
    </div>
  );
}
