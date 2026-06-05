import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tenantApi, type Tenant } from "@/api/tenantApi";
import { Button } from "@/components/ui/button";
import { Store, LogOut, ChevronRight, Building2 } from "lucide-react";

export default function TenantListPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    tenantApi
      .list()
      .then(setTenants)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (tenant: Tenant) => {
    sessionStorage.setItem("tenant-id", tenant.id);
    sessionStorage.setItem("tenant-name", tenant.name);
    navigate("/chat");
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-[#6D071A] animate-spin" />
          Loading stores...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6D071A]/10">
              <Building2 className="h-7 w-7 text-[#6D071A]" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Select Your Store
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Choose a store to start chatting with the AI assistant.
            </p>
          </div>

          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Store Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => handleSelect(tenant)}
              className="
                group
                text-left
                bg-white
                rounded-2xl
                border
                border-gray-200
                p-5
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:border-[#6D071A]/30
              "
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#6D071A]/10">
                  <Store className="h-5 w-5 text-[#6D071A]" />
                </div>

                <ChevronRight
                  className="
                    h-5
                    w-5
                    text-gray-400
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </div>

              <div className="mt-5">
                <h2 className="font-semibold text-gray-900 text-lg">
                  {tenant.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Access conversations and AI support for this store.
                </p>
              </div>

              <div className="mt-5">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  Active Store
                </span>
              </div>
            </button>
          ))}
        </div>

        {tenants.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-white py-16 text-center">
            <Store className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No stores found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no stores available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
