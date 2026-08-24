import { useState, useEffect } from "react";
import { getContactMessages, updateContactMessageStatus } from "../api/contact";
import AppShell from "../components/AppShell";
import SearchBar from "../components/SearchBar";

const STATUS_LABELS = { New: "New", Read: "Read", Replied: "Replied" };
const statusStyle = {
  New: "bg-brick/10 text-brick",
  Read: "bg-nude-100 text-muted",
  Replied: "bg-sage/15 text-sage",
};

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("New");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getContactMessages();
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateContactMessageStatus(id, newStatus);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = messages.filter((m) => {
    const q = query.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const counts = {
    New: filtered.filter((m) => m.status === "New").length,
    Read: filtered.filter((m) => m.status === "Read").length,
    Replied: filtered.filter((m) => m.status === "Replied").length,
  };

  const tabMessages = filtered.filter((m) => m.status === tab);

  const content = loading ? (
    <div className="p-10 text-muted">Loading…</div>
  ) : (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-1">Storefront</p>
        <h1 className="font-display text-3xl text-espresso">Messages</h1>
      </div>

      <div className="inline-flex bg-nude-100 rounded-md p-1 mb-6">
        {["New", "Read", "Replied"].map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition ${
              tab === s ? "bg-white text-espresso shadow-sm" : "text-muted hover:text-espresso"
            }`}
          >
            {STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {tabMessages.map((m) => (
          <div key={m.id} className="bg-white border border-nude-200 rounded-lg p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-espresso font-medium">{m.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {m.email}{m.phone && <> · {m.phone}</>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[m.status]}`}>
                  {STATUS_LABELS[m.status]}
                </span>
                <p className="text-xs text-muted">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <p className="text-sm text-espresso mt-3 whitespace-pre-wrap">{m.message}</p>

            <div className="flex items-center gap-4 mt-4">
              
              <a
                href={`mailto:${m.email}`}
                className="text-nude-500 hover:text-espresso text-sm font-medium transition"
              >
                Reply by email →
              </a>

              <select
                value={m.status}
                disabled={updatingId === m.id}
                onChange={(e) => handleStatusChange(m.id, e.target.value)}
                className="ml-auto border border-nude-200 rounded-md px-3 py-1.5 text-sm text-espresso bg-nude-50 focus:outline-none focus:ring-2 focus:ring-nude-400 disabled:opacity-50"
              >
                <option value="New">Mark as New</option>
                <option value="Read">Mark as Read</option>
                <option value="Replied">Mark as Replied</option>
              </select>
            </div>
          </div>
        ))}

        {tabMessages.length === 0 && (
          <div className="bg-white border border-nude-200 rounded-lg p-8 text-center text-muted">
            No {STATUS_LABELS[tab].toLowerCase()} messages.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppShell search={<SearchBar value={query} onChange={setQuery} placeholder="Search messages…" />}>
      {content}
    </AppShell>
  );
}

export default Messages;