import { useState, useCallback } from "react";

const FORTNIGHTLY_INCOME = 1900;

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateShort(d) {
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

function formatDateInput(d) {
  return new Date(d).toISOString().split("T")[0];
}

function getFortnight(startDateStr, offset = 0) {
  const start = addDays(new Date(startDateStr), offset * 14);
  const end = addDays(start, 13);
  return { start, end, label: `${formatDateShort(start)} – ${formatDateShort(end)}` };
}

const DEFAULT_ACCOUNT_TEMPLATE = [
  {
    id: "needs",
    label: "Account 1: Household & Bills",
    color: "#4a7c59",
    items: [
      { id: "mortgage", label: "Mortgage", amount: 700, note: "Fixed shared amount" },
      { id: "groceries", label: "Groceries & Essentials", amount: 200, note: "Food & household" },
      { id: "utilities", label: "Utilities", amount: 45, note: "Elec/Gas/Water" },
      { id: "phone", label: "Phone & Internet", amount: 40, note: "Mobile + NBN share" },
      { id: "petrol", label: "Petrol / Transport", amount: 15, note: "Commuting & school" },
    ],
  },
  {
    id: "wants",
    label: "Account 2: Personal & Spending",
    color: "#7c5a8a",
    items: [
      { id: "afterpay", label: "Afterpay", amount: 282.84, note: "Current schedule" },
      { id: "gym", label: "Gym Membership", amount: 70, note: "Direct debit" },
      { id: "hair", label: "Hair Sinking Fund", amount: 40, note: "Lean fortnight" },
      { id: "pocket", label: "Kids' Pocket Money", amount: 40, note: "$20 each" },
      { id: "clothing", label: "Kids' Clothing & Misc", amount: 25, note: "Sinking fund" },
      { id: "discretionary", label: "General Discretionary", amount: 200, note: "Coffees, play centres" },
    ],
  },
  {
    id: "savings",
    label: "Account 3: Savings",
    color: "#7a6a4a",
    items: [
      { id: "emergency", label: "Emergency Buffer", amount: 200, note: "Building to $2,000" },
    ],
  },
];

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

function formatCurrency(val) {
  return `$${Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function expenseFortnight(dateStr, fortnights) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  for (let i = 0; i < fortnights.length; i++) {
    if (d >= fortnights[i].start && d <= fortnights[i].end) return i;
  }
  return 0;
}

function ConfirmDialog({ item, accountColor, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, padding: "28px 24px", maxWidth: 340, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔁</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 17, fontFamily: "sans-serif", color: "#222" }}>Apply to all fortnights?</h3>
        <p style={{ margin: "0 0 6px", fontSize: 14, color: "#555", fontFamily: "sans-serif" }}><strong>{item.label}</strong></p>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888", fontFamily: "sans-serif" }}>Set to <strong style={{ color: accountColor }}>{formatCurrency(item.amount)}</strong> as your new ongoing amount.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px 0", borderRadius: 9, border: "1.5px solid #ddd", background: "white", fontSize: 14, fontFamily: "sans-serif", color: "#666", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "11px 0", borderRadius: 9, border: "none", background: accountColor, fontSize: 14, fontFamily: "sans-serif", color: "white", cursor: "pointer", fontWeight: "bold" }}>Yes, apply</button>
        </div>
      </div>
    </div>
  );
}

function DateEditModal({ fortnights, onSave, onCancel }) {
  const [startDate, setStartDate] = useState(formatDateInput(fortnights[0].start));

  const preview = [0, 1].map(i => getFortnight(startDate, i));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, padding: "28px 24px", maxWidth: 360, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 17, fontFamily: "sans-serif", color: "#222" }}>📅 Edit Fortnight Dates</h3>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: "#888", fontFamily: "sans-serif" }}>Set the start date of your first fortnight. The second follows automatically.</p>

        <label style={{ fontSize: 12, fontFamily: "sans-serif", color: "#555", display: "block", marginBottom: 6 }}>Fortnight 1 starts on:</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #3d6b55", borderRadius: 8, fontSize: 14, fontFamily: "sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 18 }}
        />

        <div style={{ background: "#f7f4f0", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
          {preview.map((f, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: i === 0 ? 6 : 0 }}>
              <span style={{ fontSize: 12, fontFamily: "sans-serif", color: "#666" }}>Fortnight {i + 1}</span>
              <span style={{ fontSize: 12, fontFamily: "sans-serif", color: "#333", fontWeight: "bold" }}>{f.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px 0", borderRadius: 9, border: "1.5px solid #ddd", background: "white", fontSize: 14, fontFamily: "sans-serif", color: "#666", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(startDate)} style={{ flex: 1, padding: "11px 0", borderRadius: 9, border: "none", background: "#3d6b55", fontSize: 14, fontFamily: "sans-serif", color: "white", cursor: "pointer", fontWeight: "bold" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetDashboard() {
  const [fortnightStart, setFortnightStart] = useState("2026-06-11");
  const [fortnightAccounts, setFortnightAccounts] = useState([
    deepClone(DEFAULT_ACCOUNT_TEMPLATE),
    deepClone(DEFAULT_ACCOUNT_TEMPLATE),
  ]);
  const [upcomingExpenses, setUpcomingExpenses] = useState([
    { id: Date.now(), description: "", amount: "", date: "" },
  ]);
  const [editingCell, setEditingCell] = useState(null);
  const [splitView, setSplitView] = useState(false);
  const [activeFortnight, setActiveFortnight] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [lockedItems, setLockedItems] = useState(new Set());
  const [justLocked, setJustLocked] = useState(null);
  const [showDateEdit, setShowDateEdit] = useState(false);

  const fortnights = [0, 1].map(i => getFortnight(fortnightStart, i));

  const updateItemLabel = useCallback((fn, accountId, itemId, newLabel) => {
    setFortnightAccounts(prev => {
      const next = deepClone(prev);
      // Apply label change to both fortnights so they stay in sync
      [0, 1].forEach(f => {
        const acc = next[f].find(a => a.id === accountId);
        if (acc) { const item = acc.items.find(i => i.id === itemId); if (item) item.label = newLabel; }
      });
      return next;
    });
  }, []);

  const updateItemAmount = useCallback((fn, accountId, itemId, value, applyAll = false) => {
    const newVal = parseFloat(value) || 0;
    setFortnightAccounts(prev => {
      const next = deepClone(prev);
      (applyAll ? [0, 1] : [fn]).forEach(f => {
        const acc = next[f].find(a => a.id === accountId);
        if (acc) { const item = acc.items.find(i => i.id === itemId); if (item) item.amount = newVal; }
      });
      return next;
    });
    if (applyAll) {
      const key = `${accountId}-${itemId}`;
      setLockedItems(prev => new Set([...prev, key]));
      setJustLocked(key);
      setTimeout(() => setJustLocked(null), 2000);
    }
  }, []);

  const handleLockClick = (fn, accountId, itemId) => setConfirmDialog({ fn, accountId, itemId });

  const handleConfirmLock = () => {
    if (confirmDialog) {
      const { fn, accountId, itemId } = confirmDialog;
      const acc = fortnightAccounts[fn].find(a => a.id === accountId);
      const item = acc?.items.find(i => i.id === itemId);
      if (item) updateItemAmount(fn, accountId, itemId, item.amount, true);
    }
    setConfirmDialog(null);
  };

  const totalFixed = (fn) => fortnightAccounts[fn].reduce((sum, acc) => sum + acc.items.reduce((s, i) => s + i.amount, 0), 0);
  const expensesForFn = (fn) => upcomingExpenses.filter(e => expenseFortnight(e.date, fortnights) === fn);
  const totalUpcoming = (fn) => expensesForFn(fn).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const leftover = (fn) => FORTNIGHTLY_INCOME - totalFixed(fn) - totalUpcoming(fn);

  const addExpense = () => setUpcomingExpenses(prev => [...prev, { id: Date.now(), description: "", amount: "", date: "" }]);
  const removeExpense = (id) => setUpcomingExpenses(prev => prev.filter(e => e.id !== id));
  const updateExpense = (id, field, value) => setUpcomingExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));

  const confirmAccount = confirmDialog ? fortnightAccounts[confirmDialog.fn].find(a => a.id === confirmDialog.accountId) : null;
  const confirmItem = confirmAccount ? confirmAccount.items.find(i => i.id === confirmDialog.itemId) : null;

  const FortnightColumn = ({ fn, compact }) => {
    const accounts = fortnightAccounts[fn];
    const fixed = totalFixed(fn);
    const upcoming = totalUpcoming(fn);
    const left = leftover(fn);
    const expenses = expensesForFn(fn);

    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Fixed", value: fixed, color: "#c0392b" },
            { label: "Upcoming", value: upcoming, color: "#e67e22" },
            { label: "Left", value: left, color: left >= 0 ? "#27ae60" : "#c0392b" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "white", borderRadius: 8, padding: "7px 5px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: `3px solid ${color}` }}>
              <p style={{ margin: 0, fontSize: 8, letterSpacing: 1, color: "#888", textTransform: "uppercase", fontFamily: "sans-serif" }}>{label}</p>
              <p style={{ margin: "3px 0 0", fontSize: compact ? 11 : 14, fontWeight: "bold", color, fontFamily: "sans-serif" }}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        {accounts.map(account => (
          <div key={account.id} style={{ background: "white", borderRadius: 10, marginBottom: 8, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ background: account.color, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "white", fontSize: 10, fontWeight: "bold", fontFamily: "sans-serif" }}>{account.label}</span>
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 10, fontFamily: "sans-serif" }}>{formatCurrency(account.items.reduce((s, i) => s + i.amount, 0))}</span>
            </div>
            {account.items.map(item => {
              const cellKey = `${fn}-${account.id}-${item.id}`;
              const labelKey = `label-${fn}-${account.id}-${item.id}`;
              const globalKey = `${account.id}-${item.id}`;
              const isLocked = lockedItems.has(globalKey);
              const isJustLocked = justLocked === globalKey;
              const isEditing = editingCell === cellKey;
              const isEditingLabel = editingCell === labelKey;
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "7px 8px", borderBottom: "1px solid #f0ece6", gap: 5, background: isJustLocked ? "#f0faf4" : "white", transition: "background 0.4s" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isEditingLabel ? (
                      <input
                        type="text"
                        defaultValue={item.label}
                        autoFocus
                        onBlur={e => { updateItemLabel(fn, account.id, item.id, e.target.value); setEditingCell(null); }}
                        onKeyDown={e => { if (e.key === "Enter") { updateItemLabel(fn, account.id, item.id, e.target.value); setEditingCell(null); } }}
                        style={{ width: "100%", padding: "2px 5px", border: `2px solid ${account.color}`, borderRadius: 5, fontSize: compact ? 10 : 12, fontFamily: "sans-serif", outline: "none", boxSizing: "border-box" }}
                      />
                    ) : (
                      <p
                        onClick={() => setEditingCell(labelKey)}
                        title="Tap to rename"
                        style={{ margin: 0, fontSize: compact ? 10 : 12, color: "#2c2c2c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer", borderBottom: "1px dashed #ddd" }}
                      >{item.label}</p>
                    )}
                    {isLocked && <span style={{ fontSize: 8, background: "#e8f5e9", color: "#4a7c59", borderRadius: 3, padding: "1px 4px", fontFamily: "sans-serif" }}>ALL</span>}
                  </div>
                  {isEditing ? (
                    <input type="number" defaultValue={item.amount} autoFocus
                      onBlur={e => { updateItemAmount(fn, account.id, item.id, e.target.value); setEditingCell(null); }}
                      onKeyDown={e => { if (e.key === "Enter") { updateItemAmount(fn, account.id, item.id, e.target.value); setEditingCell(null); } }}
                      style={{ width: 60, padding: "3px 5px", border: `2px solid ${account.color}`, borderRadius: 5, fontSize: 11, fontFamily: "sans-serif", textAlign: "right", outline: "none" }}
                    />
                  ) : (
                    <button onClick={() => setEditingCell(cellKey)}
                      style={{ background: "#f7f4f0", border: "1px solid #e8e0d8", borderRadius: 5, padding: "3px 7px", fontSize: 11, fontFamily: "sans-serif", color: "#333", cursor: "pointer", minWidth: 56, textAlign: "right" }}>
                      {formatCurrency(item.amount)}
                    </button>
                  )}
                  <button onClick={() => handleLockClick(fn, account.id, item.id)} title="Apply to all fortnights"
                    style={{ background: isLocked ? "#e8f5e9" : "#f5f5f5", border: isLocked ? `1.5px solid ${account.color}` : "1.5px solid #ddd", borderRadius: 5, padding: "3px 5px", cursor: "pointer", fontSize: 11, lineHeight: 1 }}>
                    {isLocked ? "🔁" : "↻"}
                  </button>
                </div>
              );
            })}
          </div>
        ))}

        <div style={{ background: "white", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", marginBottom: 8 }}>
          <div style={{ background: "linear-gradient(to right, #2d4a3e, #3d6b55)", padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "white", fontSize: 10, fontWeight: "bold", fontFamily: "sans-serif" }}>Upcoming Expenses</span>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 10, fontFamily: "sans-serif" }}>{formatCurrency(upcoming)}</span>
          </div>
          <div style={{ padding: "8px 8px" }}>
            {expenses.length === 0 && <p style={{ margin: 0, fontSize: 10, color: "#bbb", fontFamily: "sans-serif", textAlign: "center", padding: "4px 0" }}>None this fortnight</p>}
            {expenses.map(exp => (
              <div key={exp.id} style={{ display: "flex", gap: 4, marginBottom: 6, alignItems: "center", flexWrap: "wrap" }}>
                <input type="text" placeholder="Description" value={exp.description}
                  onChange={e => updateExpense(exp.id, "description", e.target.value)}
                  style={{ flex: 1, minWidth: "100%", padding: "5px 7px", border: "1px solid #e0d8d0", borderRadius: 6, fontSize: 10, fontFamily: "sans-serif", outline: "none", background: "#fdfaf7" }}
                />
                <input type="date" value={exp.date}
                  onChange={e => updateExpense(exp.id, "date", e.target.value)}
                  style={{ flex: 1, padding: "5px 5px", border: "1px solid #e0d8d0", borderRadius: 6, fontSize: 10, fontFamily: "sans-serif", outline: "none", background: "#fdfaf7" }}
                />
                <input type="number" placeholder="$0" value={exp.amount}
                  onChange={e => updateExpense(exp.id, "amount", e.target.value)}
                  style={{ width: 58, padding: "5px 5px", border: "1px solid #e0d8d0", borderRadius: 6, fontSize: 10, fontFamily: "sans-serif", textAlign: "right", outline: "none", background: "#fdfaf7" }}
                />
                <button onClick={() => removeExpense(exp.id)} style={{ background: "none", border: "none", color: "#c0392b", fontSize: 15, cursor: "pointer", padding: "0 1px", lineHeight: 1 }}>×</button>
              </div>
            ))}
            <button onClick={addExpense} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "1.5px dashed #b0a898", borderRadius: 6, padding: "5px 8px", fontSize: 10, fontFamily: "sans-serif", color: "#7a6a5a", cursor: "pointer", width: "100%", justifyContent: "center", marginTop: 2 }}>
              + Add expense
            </button>
          </div>
        </div>

        <div style={{ background: left >= 0 ? "linear-gradient(135deg, #2d5a3d, #4a7c59)" : "linear-gradient(135deg, #7c2d2d, #a04040)", borderRadius: 10, padding: "12px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.8)", fontFamily: "sans-serif" }}>Available</p>
          <p style={{ margin: 0, fontSize: compact ? 16 : 20, fontWeight: "bold", color: "white", fontFamily: "sans-serif" }}>{formatCurrency(left)}</p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f0eb 0%, #ede8e0 100%)", fontFamily: "'Georgia', serif" }}>

      {confirmDialog && confirmItem && confirmAccount && (
        <ConfirmDialog item={confirmItem} accountColor={confirmAccount.color} onConfirm={handleConfirmLock} onCancel={() => setConfirmDialog(null)} />
      )}

      {showDateEdit && (
        <DateEditModal
          fortnights={fortnights}
          onSave={(newStart) => { setFortnightStart(newStart); setShowDateEdit(false); }}
          onCancel={() => setShowDateEdit(false)}
        />
      )}

      <div style={{ background: "linear-gradient(to right, #2d4a3e, #3d6b55)", padding: "20px 18px 14px", color: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: 3, opacity: 0.7, textTransform: "uppercase", fontFamily: "sans-serif" }}>Fortnightly Budget</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 3 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: "normal", letterSpacing: 0.5 }}>Jacinda's Tracker</h1>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowDateEdit(true)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 12px", color: "white", fontSize: 12, fontFamily: "sans-serif", cursor: "pointer" }}>
                📅 Dates
              </button>
              <button onClick={() => setSplitView(!splitView)} style={{ background: splitView ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 12px", color: "white", fontSize: 12, fontFamily: "sans-serif", cursor: "pointer" }}>
                {splitView ? "⊟ Single" : "⊞ Split"}
              </button>
            </div>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: 12, opacity: 0.75, fontFamily: "sans-serif" }}>Income: {formatCurrency(FORTNIGHTLY_INCOME)} · {fortnights[0].label}</p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "14px 14px 40px" }}>
        {!splitView && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {fortnights.map((f, fn) => (
                <button key={fn} onClick={() => setActiveFortnight(fn)} style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: activeFortnight === fn ? "2px solid #3d6b55" : "2px solid #ddd", background: activeFortnight === fn ? "#3d6b55" : "white", color: activeFortnight === fn ? "white" : "#666", fontSize: 12, fontFamily: "sans-serif", cursor: "pointer", fontWeight: activeFortnight === fn ? "bold" : "normal" }}>
                  {f.label}
                </button>
              ))}
            </div>
            <FortnightColumn fn={activeFortnight} compact={false} />
          </>
        )}

        {splitView && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            {fortnights.map((f, fn) => (
              <div key={fn} style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 10px", fontSize: 10, fontFamily: "sans-serif", color: "#555", fontWeight: "bold", letterSpacing: 1.5, textTransform: "uppercase", textAlign: "center", background: "white", borderRadius: 8, padding: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                  FN {fn + 1} · {f.label}
                </p>
                <FortnightColumn fn={fn} compact={true} />
              </div>
            ))}
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 10, color: "#bbb", marginTop: 18, fontFamily: "sans-serif", letterSpacing: 0.8 }}>
          TAP AMOUNT TO EDIT · ↻ TO APPLY TO ALL FORTNIGHTS
        </p>
      </div>
    </div>
  );
}
