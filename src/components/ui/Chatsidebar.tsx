import { useNavigate } from "react-router-dom";
import { Store, LogOut, Building2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Tenant } from "@/api/tenantApi";

interface ChatSidebarProps {
  tenants: Tenant[];
  activeTenantId: string | null;
  onSelectTenant: (tenant: Tenant) => void;
  onLogout: () => void;
  open: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function SidebarContent({
  tenants,
  activeTenantId,
  onSelectTenant,
  onLogout,
}: Pick<
  ChatSidebarProps,
  "tenants" | "activeTenantId" | "onSelectTenant" | "onLogout"
>) {
  const navigate = useNavigate();

  return (
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
                onClick={() => onSelectTenant(tenant)}
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
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 text-sm font-medium"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </>
  );
}

export function ChatSidebar({
  tenants,
  activeTenantId,
  onSelectTenant,
  onLogout,
  open,
  mobileOpen,
  onCloseMobile,
}: ChatSidebarProps) {
  const sharedProps = { tenants, activeTenantId, onSelectTenant, onLogout };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden sm:flex flex-col bg-slate-50 border-r border-gray-200 transition-all duration-300 shrink-0 overflow-hidden",
          open ? "w-64" : "w-0"
        )}
      >
        <SidebarContent {...sharedProps} />
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 sm:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-50 border-r border-gray-200 transition-transform duration-300 sm:hidden w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={onCloseMobile}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
        <SidebarContent {...sharedProps} />
      </aside>
    </>
  );
}
