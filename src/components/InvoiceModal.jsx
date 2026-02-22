import { useState } from "react";
import { X, Plus, Trash2, Eye, Printer, ArrowLeft } from "lucide-react";
import siteConfig from "../data/siteConfig";

function fmt(n) {
  return `₹${Number(n).toFixed(2)}`;
}

export default function InvoiceModal({ quotation, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const shortId = String(quotation.id || "")
    .replace(/-/g, "")
    .slice(-6)
    .toUpperCase();

  const [view, setView] = useState("edit");
  const [invoiceNo, setInvoiceNo] = useState(
    `INV-${new Date().getFullYear()}-${shortId}`,
  );
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [items, setItems] = useState(
    (quotation.products || []).length > 0
      ? (quotation.products || []).map((p) => ({
          name: p,
          qty: "",
          unitPrice: "",
        }))
      : [{ name: "", qty: "", unitPrice: "" }],
  );
  const [gstRate, setGstRate] = useState(18);
  const [gstType, setGstType] = useState("CGST+SGST");
  const [notes, setNotes] = useState("");

  const subtotal = items.reduce((sum, item) => {
    return (
      sum + (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0)
    );
  }, 0);
  const gstAmount = (subtotal * gstRate) / 100;
  const grandTotal = subtotal + gstAmount;

  function updateItem(index, field, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { name: "", qty: "", unitPrice: "" }]);
  }

  function removeItem(index) {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  // ── EDIT VIEW ──────────────────────────────────────────────────────────────
  if (view === "edit") {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal invoice-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>

          <div className="invoice-edit">
            <h2 className="invoice-edit__title">Create Invoice</h2>

            {/* Invoice meta */}
            <div className="invoice-edit__meta-row">
              <div className="invoice-edit__field">
                <label>Invoice No.</label>
                <input
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>
              <div className="invoice-edit__field">
                <label>Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
            </div>

            {/* Customer info */}
            <div className="invoice-edit__customer">
              <p className="invoice-edit__section-label">Bill To</p>
              <div className="invoice-edit__customer-info">
                <span>
                  <strong>{quotation.full_name}</strong>
                </span>
                {quotation.business_name && (
                  <span>{quotation.business_name}</span>
                )}
                {quotation.phone && <span>{quotation.phone}</span>}
                {quotation.email && <span>{quotation.email}</span>}
                {quotation.location && <span>{quotation.location}</span>}
              </div>
            </div>

            {/* Line items */}
            <div className="invoice-edit__items">
              <p className="invoice-edit__section-label">Line Items</p>
              <div className="invoice-edit__table-wrap">
                <table className="invoice-edit__table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Price (₹)</th>
                      <th>Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            value={item.name}
                            onChange={(e) =>
                              updateItem(i, "name", e.target.value)
                            }
                            placeholder="Product / description"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) =>
                              updateItem(i, "qty", e.target.value)
                            }
                            placeholder="0"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(i, "unitPrice", e.target.value)
                            }
                            placeholder="0.00"
                            min="0"
                          />
                        </td>
                        <td className="invoice-edit__line-total">
                          {fmt(
                            (parseFloat(item.qty) || 0) *
                              (parseFloat(item.unitPrice) || 0),
                          )}
                        </td>
                        <td>
                          <button
                            className="invoice-edit__delete-btn"
                            onClick={() => removeItem(i)}
                            disabled={items.length === 1}
                            aria-label="Remove row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="invoice-edit__add-btn" onClick={addItem}>
                <Plus size={13} /> Add Item
              </button>
            </div>

            {/* GST settings */}
            <div className="invoice-edit__gst-row">
              <div className="invoice-edit__field">
                <label>GST Rate (%)</label>
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
              </div>
              <div className="invoice-edit__field">
                <label>GST Type</label>
                <select
                  value={gstType}
                  onChange={(e) => setGstType(e.target.value)}
                >
                  <option value="CGST+SGST">CGST + SGST (Intra-State)</option>
                  <option value="IGST">IGST (Inter-State)</option>
                </select>
              </div>
            </div>

            {/* Totals summary */}
            <div className="invoice-edit__totals">
              <div className="invoice-edit__total-row">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="invoice-edit__total-row">
                <span>GST ({gstRate}%)</span>
                <span>{fmt(gstAmount)}</span>
              </div>
              <div className="invoice-edit__total-row invoice-edit__total-row--grand">
                <span>Grand Total</span>
                <span>{fmt(grandTotal)}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="invoice-edit__field">
              <label>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Payment terms, additional instructions..."
              />
            </div>

            {/* Actions */}
            <div className="invoice-edit__actions">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setView("preview")}
              >
                <Eye size={16} />
                Preview Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PREVIEW VIEW ───────────────────────────────────────────────────────────
  const printDate = new Date(invoiceDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="modal-overlay">
      <div
        className="modal invoice-modal invoice-modal--preview"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action bar — hidden on print */}
        <div className="invoice-actions">
          <button
            className="btn btn-secondary btn-small"
            onClick={() => setView("edit")}
          >
            <ArrowLeft size={14} />
            Back to Edit
          </button>
          <button
            className="btn btn-primary btn-small"
            onClick={() => window.print()}
          >
            <Printer size={14} />
            Print / Save PDF
          </button>
          <button
            className="invoice-actions__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── PRINTABLE INVOICE ── */}
        <div className="invoice-print">
          {/* Company header */}
          <div className="invoice-print__header">
            <div className="invoice-print__company">
              <div className="invoice-print__company-name">
                {siteConfig.businessName}
                <span>{siteConfig.businessNameHighlight}</span>
              </div>
              <div className="invoice-print__company-detail">
                {siteConfig.addressFull}
              </div>
              <div className="invoice-print__company-detail">
                {siteConfig.phoneDisplay} &nbsp;|&nbsp; {siteConfig.email}
              </div>
              <div className="invoice-print__company-gst">
                {siteConfig.gstInfo}
              </div>
            </div>
            <div className="invoice-print__meta">
              <div className="invoice-print__invoice-title">INVOICE</div>
              <div className="invoice-print__meta-item">
                <span>Invoice No.</span>
                <strong>{invoiceNo}</strong>
              </div>
              <div className="invoice-print__meta-item">
                <span>Date</span>
                <strong>{printDate}</strong>
              </div>
            </div>
          </div>

          <hr className="invoice-print__rule" />

          {/* Bill To */}
          <div className="invoice-print__bill">
            <div className="invoice-print__bill-label">Bill To</div>
            <div className="invoice-print__bill-name">
              {quotation.full_name}
            </div>
            {quotation.business_name && <div>{quotation.business_name}</div>}
            {quotation.phone && <div>{quotation.phone}</div>}
            {quotation.email && <div>{quotation.email}</div>}
            {quotation.location && <div>{quotation.location}</div>}
          </div>

          {/* Items table */}
          <table className="invoice-print__table">
            <thead>
              <tr>
                <th className="invoice-print__th invoice-print__th--sr">#</th>
                <th className="invoice-print__th">Description</th>
                <th className="invoice-print__th invoice-print__th--num">
                  Qty
                </th>
                <th className="invoice-print__th invoice-print__th--num">
                  Unit Price
                </th>
                <th className="invoice-print__th invoice-print__th--num">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter((item) => item.name)
                .map((item, i) => (
                  <tr key={i}>
                    <td className="invoice-print__td invoice-print__td--sr">
                      {i + 1}
                    </td>
                    <td className="invoice-print__td">{item.name}</td>
                    <td className="invoice-print__td invoice-print__td--num">
                      {item.qty || "—"}
                    </td>
                    <td className="invoice-print__td invoice-print__td--num">
                      {item.unitPrice ? fmt(parseFloat(item.unitPrice)) : "—"}
                    </td>
                    <td className="invoice-print__td invoice-print__td--num">
                      {fmt(
                        (parseFloat(item.qty) || 0) *
                          (parseFloat(item.unitPrice) || 0),
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="invoice-print__tfoot-label">
                  Subtotal
                </td>
                <td className="invoice-print__tfoot-value">{fmt(subtotal)}</td>
              </tr>
              {gstType === "CGST+SGST" ? (
                <>
                  <tr>
                    <td colSpan={4} className="invoice-print__tfoot-label">
                      CGST ({gstRate / 2}%)
                    </td>
                    <td className="invoice-print__tfoot-value">
                      {fmt(gstAmount / 2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="invoice-print__tfoot-label">
                      SGST ({gstRate / 2}%)
                    </td>
                    <td className="invoice-print__tfoot-value">
                      {fmt(gstAmount / 2)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={4} className="invoice-print__tfoot-label">
                    IGST ({gstRate}%)
                  </td>
                  <td className="invoice-print__tfoot-value">
                    {fmt(gstAmount)}
                  </td>
                </tr>
              )}
              <tr className="invoice-print__tfoot-grand">
                <td colSpan={4} className="invoice-print__tfoot-label">
                  Grand Total
                </td>
                <td className="invoice-print__tfoot-value">
                  {fmt(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>

          {notes && (
            <div className="invoice-print__notes">
              <strong>Notes:</strong> {notes}
            </div>
          )}

          <div className="invoice-print__footer">
            <p>Thank you for your business!</p>
            <p>
              For queries, contact us at {siteConfig.phoneDisplay} or{" "}
              {siteConfig.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
