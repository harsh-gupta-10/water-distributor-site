import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  RefreshCw,
  Users,
  Package,
  CalendarDays,
  TrendingUp,
  LogOut,
  FileText,
} from "lucide-react";
import AdminLogin from "./AdminLogin";
import InvoiceModal from "./InvoiceModal";

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoiceQuotation, setInvoiceQuotation] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchQuotations();
  }, [session]);

  async function fetchQuotations() {
    setLoading(true);
    setFetchError(null);
    const { data, error } = await supabase
      .from("quotations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Failed to fetch quotations");
      setFetchError("An error occurred while fetching quotations. Please try again later.");
    } else {
      setQuotations(data || []);
    }
    setLoading(false);
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from("quotations")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setQuotations((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q)),
      );
    }
  }

  // --- Derived analytics ---
  const totalCount = quotations.length;

  const thisMonthCount = quotations.filter((q) => {
    const d = new Date(q.created_at);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const newCount = quotations.filter((q) => q.status === "new").length;

  // Product frequency
  const productCounts = {};
  quotations.forEach((q) => {
    (q.products || []).forEach((p) => {
      productCounts[p] = (productCounts[p] || 0) + 1;
    });
  });
  const sortedProducts = Object.entries(productCounts).sort(
    (a, b) => b[1] - a[1],
  );
  const maxProductCount = sortedProducts.length > 0 ? sortedProducts[0][1] : 1;

  // Monthly submissions (last 6 months)
  const monthlyData = {};
  quotations.forEach((q) => {
    const d = new Date(q.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = (monthlyData[key] || 0) + 1;
  });
  const sortedMonths = Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);
  const maxMonthlyCount =
    sortedMonths.length > 0 ? Math.max(...sortedMonths.map((m) => m[1])) : 1;

  // Filtered list
  const filteredQuotations =
    statusFilter === "all"
      ? quotations
      : quotations.filter((q) => q.status === statusFilter);

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatMonthLabel(key) {
    const [year, month] = key.split("-");
    const d = new Date(year, parseInt(month) - 1);
    return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }

  if (authLoading) {
    return (
      <div className="admin">
        <div className="container">
          <p
            style={{
              textAlign: "center",
              padding: "100px 0",
              color: "var(--gray-400)",
            }}
          >
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLogin={setSession} />;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (loading) {
    return (
      <div className="admin">
        <div className="container">
          <p
            style={{
              textAlign: "center",
              padding: "100px 0",
              color: "var(--gray-400)",
            }}
          >
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin">
      <div className="container">
        {fetchError && (
          <div className="admin-login__error" style={{ marginBottom: "24px" }}>
            {fetchError}
          </div>
        )}
        {/* Header */}
        <div className="admin__header">
          <div className="admin__header-row">
            <div>
              <h1 className="admin__title">Quotation Dashboard</h1>
              <p className="admin__subtitle">
                Track and manage incoming quotation requests
              </p>
            </div>
            <div className="admin__header-actions">
              <button
                className="btn btn-secondary btn-small"
                onClick={fetchQuotations}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                className="btn btn-small admin__logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="admin__stats">
          <div className="admin__stat-card">
            <div className="admin__stat-icon admin__stat-icon--blue">
              <Users size={20} />
            </div>
            <div>
              <span className="admin__stat-value">{totalCount}</span>
              <span className="admin__stat-label">Total Quotations</span>
            </div>
          </div>
          <div className="admin__stat-card">
            <div className="admin__stat-icon admin__stat-icon--green">
              <CalendarDays size={20} />
            </div>
            <div>
              <span className="admin__stat-value">{thisMonthCount}</span>
              <span className="admin__stat-label">This Month</span>
            </div>
          </div>
          <div className="admin__stat-card">
            <div className="admin__stat-icon admin__stat-icon--orange">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="admin__stat-value">{newCount}</span>
              <span className="admin__stat-label">Pending (New)</span>
            </div>
          </div>
          <div className="admin__stat-card">
            <div className="admin__stat-icon admin__stat-icon--purple">
              <Package size={20} />
            </div>
            <div>
              <span className="admin__stat-value">{sortedProducts.length}</span>
              <span className="admin__stat-label">Products Requested</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="admin__charts-row">
          {/* Most Requested Products */}
          <div className="admin__chart-card">
            <h3 className="admin__chart-title">Most Requested Products</h3>
            {sortedProducts.length === 0 ? (
              <p className="admin__empty">No data yet</p>
            ) : (
              <div className="admin__bars">
                {sortedProducts.map(([product, count]) => (
                  <div key={product} className="admin__bar">
                    <span className="admin__bar-label">{product}</span>
                    <div className="admin__bar-track">
                      <div
                        className="admin__bar-fill"
                        style={{ width: `${(count / maxProductCount) * 100}%` }}
                      />
                    </div>
                    <span className="admin__bar-count">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Submissions */}
          <div className="admin__chart-card">
            <h3 className="admin__chart-title">Monthly Submissions</h3>
            {sortedMonths.length === 0 ? (
              <p className="admin__empty">No data yet</p>
            ) : (
              <div className="admin__bars">
                {sortedMonths.map(([month, count]) => (
                  <div key={month} className="admin__bar">
                    <span className="admin__bar-label">
                      {formatMonthLabel(month)}
                    </span>
                    <div className="admin__bar-track">
                      <div
                        className="admin__bar-fill admin__bar-fill--green"
                        style={{ width: `${(count / maxMonthlyCount) * 100}%` }}
                      />
                    </div>
                    <span className="admin__bar-count">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submissions Table */}
        <div className="admin__section">
          <div className="admin__section-header">
            <h3 className="admin__chart-title">All Submissions</h3>
            <div className="admin__filters">
              {["all", "new", "contacted", "completed"].map((f) => (
                <button
                  key={f}
                  className={`admin__filter-btn ${statusFilter === f ? "admin__filter-btn--active" : ""}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== "all" && (
                    <span className="admin__filter-count">
                      {
                        quotations.filter((q) => f === "all" || q.status === f)
                          .length
                      }
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {filteredQuotations.length === 0 ? (
            <p className="admin__empty">No submissions found</p>
          ) : (
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Business</th>
                    <th>Phone</th>
                    <th>Products</th>
                    <th>Location</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.map((q) => (
                    <tr key={q.id}>
                      <td className="admin__td-date">
                        {formatDate(q.created_at)}
                      </td>
                      <td>
                        <strong>{q.full_name}</strong>
                        {q.email && (
                          <span className="admin__td-email">{q.email}</span>
                        )}
                      </td>
                      <td>{q.business_name || "—"}</td>
                      <td>
                        <a href={`tel:${q.phone}`} className="admin__td-phone">
                          {q.phone}
                        </a>
                      </td>
                      <td>
                        <div className="admin__td-products">
                          {(q.products || []).map((p) => (
                            <span key={p} className="admin__product-chip">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{q.location}</td>
                      <td>
                        <span
                          className={`admin__source-badge admin__source-badge--${q.source}`}
                        >
                          {q.source}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`admin__status-select admin__status-select--${q.status}`}
                          value={q.status}
                          onChange={(e) => updateStatus(q.id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-small admin__invoice-btn"
                          onClick={() => setInvoiceQuotation(q)}
                        >
                          <FileText size={13} />
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>

    {invoiceQuotation && (
      <InvoiceModal
        quotation={invoiceQuotation}
        onClose={() => setInvoiceQuotation(null)}
      />
    )}
    </>
  );
}
