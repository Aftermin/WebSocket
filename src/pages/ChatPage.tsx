import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  MoveUp,
  Wrench,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tenantApi, type Tenant } from "@/api/tenantApi";
import { ConfirmActionCard } from "@/components/ui/confirmActionCard";

interface BaseMessage {
  id: number;
  role: "user" | "assistant";
  timestamp: Date;
}

interface TextMessage extends BaseMessage {
  type: "text";
  content: string;
}

interface ConfirmMessage extends BaseMessage {
  type: "confirm_action";
  label: string;
  resolved?: "approved" | "rejected";
}

type Message = TextMessage | ConfirmMessage;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [activeTenantName, setActiveTenantName] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileDrawerOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    tenantApi.list().then(setTenants).catch(console.error);
  }, []);

  useEffect(() => {
    const id = sessionStorage.getItem("tenant-id");
    const name = sessionStorage.getItem("tenant-name");
    if (id && name) {
      setActiveTenantId(id);
      setActiveTenantName(name);
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!activeTenantId) return;
    wsRef.current?.close();
    setMessages([]);
    setIsTyping(false);
    setActiveTools([]);
    setConnected(false);

    const token = sessionStorage.getItem("token");
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      setIsTyping(false);
      setActiveTools([]);
    };
    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);

        if (event.type === "tool") {
          setActiveTools((prev) => [...prev, event.name]);
        } else if (event.type === "confirm_action") {
          // หยุด typing indicator แสดง confirm card แทน
          setIsTyping(false);
          setActiveTools([]);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              role: "assistant",
              type: "confirm_action",
              label: event.label,
              timestamp: new Date(),
            },
          ]);
        } else if (event.type === "message") {
          setIsTyping(false);
          setActiveTools([]);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              role: "assistant",
              type: "text",
              content: event.content,
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        setIsTyping(false);
        setActiveTools([]);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "assistant",
            type: "text",
            content: e.data,
            timestamp: new Date(),
          },
        ]);
      }
    };
    wsRef.current = ws;
    return () => ws.close();
  }, [activeTenantId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, activeTools]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  const handleSelectTenant = (tenant: Tenant) => {
    sessionStorage.setItem("tenant-id", tenant.id);
    sessionStorage.setItem("tenant-name", tenant.name);
    setActiveTenantId(tenant.id);
    setActiveTenantName(tenant.name);
    setMobileDrawerOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const handleConfirm = (msgId: number, decision: "approve" | "reject") => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.type === "confirm_action"
          ? { ...m, resolved: decision === "approve" ? "approved" : "rejected" }
          : m
      )
    );

    wsRef.current?.send(JSON.stringify({ type: "confirm", decision }));

    setIsTyping(true);
  };

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || !connected) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        type: "text",
        content: input,
        timestamp: new Date(),
      },
    ]);
    wsRef.current.send(
      JSON.stringify({ message: input, tenant_id: activeTenantId })
    );
    setActiveTools([]);
    setIsTyping(true);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const SidebarContent = () => (
    <>
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-200 cursor-pointer"
      >
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#6D071A]/10">
          <Building2 className="h-4 w-4 text-[#6D071A]" />
        </div>
        <button className="text-sm font-semibold text-gray-800 hover:text-[#6D071A] transition-colors">
          Stores
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {tenants.map((tenant) => {
            const isActive = tenant.id === activeTenantId;
            return (
              <button
                key={tenant.id}
                onClick={() => handleSelectTenant(tenant)}
                className={cn(
                  "flex flex-col items-center justify-center w-full rounded-2xl border p-4 text-center transition-all",
                  isActive
                    ? "border-[#6D071A] bg-[#6D071A] text-white shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl mb-3",
                    isActive ? "bg-white/20" : "bg-gray-100"
                  )}
                >
                  <Store
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-white" : "text-gray-600"
                    )}
                  />
                </div>
                <p className="text-xs font-semibold text-center line-clamp-2">
                  {tenant.name}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs pt-2",
                    isActive ? "text-white/70" : "text-gray-500"
                  )}
                >
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600">
                    Store
                  </span>
                </p>
              </button>
            );
          })}
        </div>
        {tenants.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">
            No stores found
          </p>
        )}
      </nav>

      <div className="px-2 py-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 text-sm font-medium"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <aside
        className={cn(
          "hidden sm:flex flex-col bg-slate-50 border-r border-gray-200 transition-all duration-300 shrink-0 overflow-hidden",
          sidebarOpen ? "w-64" : "w-0"
        )}
      >
        <SidebarContent />
      </aside>

      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 sm:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-50 border-r border-gray-200 transition-transform duration-300 sm:hidden w-64",
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileDrawerOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
        <SidebarContent />
      </aside>

      <div className="flex flex-col flex-1 min-w-0 relative">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white z-10">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 text-gray-500" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 text-gray-500" />
            )}
          </button>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex sm:hidden items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4 text-gray-500" />
          </button>

          {activeTenantName ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6D071A] flex items-center justify-center text-white text-xs font-semibold">
                {activeTenantName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 leading-none">
                  {activeTenantName}
                </p>
                <p className="text-sm mt-1">
                  {connected ? (
                    <span className="text-green-500">Online</span>
                  ) : (
                    <span className="text-gray-400">Connecting…</span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Select a store to start chatting
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-2">
          {!activeTenantId ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <MessageSquare className="w-10 h-10 text-gray-200" />
              <p className="text-sm text-gray-400">
                Select a store from the sidebar to begin
              </p>
            </div>
          ) : messages.length === 0 && !isTyping ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-300">Start chat now</p>
            </div>
          ) : null}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-0.5",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              {msg.type === "confirm_action" ? (
                <ConfirmActionCard
                  label={msg.label}
                  resolved={msg.resolved}
                  onApprove={() => handleConfirm(msg.id, "approve")}
                  onReject={() => handleConfirm(msg.id, "reject")}
                />
              ) : (
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
              )}
              <span className="text-[10px] text-gray-400 px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex flex-col gap-2 min-w-[80px]">
                {activeTools.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {activeTools.map((tool, i) => {
                      const isLatest = i === activeTools.length - 1;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex items-center gap-1.5 text-xs transition-opacity duration-300",
                            isLatest ? "opacity-100" : "opacity-40"
                          )}
                        >
                          <Wrench
                            className={cn(
                              "w-3 h-3 shrink-0",
                              isLatest ? "text-[#6D071A]" : "text-gray-400"
                            )}
                          />
                          <span
                            className={cn(
                              "font-mono",
                              isLatest ? "text-[#6D071A]" : "text-gray-400"
                            )}
                          >
                            {tool}
                          </span>
                          {isLatest && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6D071A] animate-pulse shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
          <div className="pointer-events-auto max-w-2xl mx-auto">
            <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-4xl px-4 py-2 shadow-lg shadow-gray-100/80 ring-1 ring-gray-100">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!activeTenantId || !connected}
                placeholder={
                  !activeTenantId
                    ? "Select a store first…"
                    : "Message… (Shift+Enter เพื่อขึ้นบรรทัดใหม่)"
                }
                rows={1}
                className="flex-1 border-0 bg-transparent shadow-none focus:outline-none resize-none text-sm placeholder:text-gray-400 py-1 max-h-40 overflow-y-auto leading-relaxed disabled:cursor-not-allowed"
              />
              <button
                onClick={sendMessage}
                disabled={!connected || !input.trim()}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6D071A] hover:bg-[#5A0515] disabled:bg-gray-300 transition-all shrink-0"
              >
                <MoveUp className="w-4 h-4 text-white" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
