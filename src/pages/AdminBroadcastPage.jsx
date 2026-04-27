import React, { useState } from 'react';
import { Send, Users, CheckCircle, AlertCircle } from 'lucide-react';
import client from '../api/client';

const AdminBroadcastPage = () => {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      setError('Subject and message are required');
      return;
    }
    if (!window.confirm(`Send this email to ALL approved CEOs? This cannot be undone.`)) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await client.post('/admin/broadcast', form);
      setResult(res.data);
      setForm({ subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'block w-full px-4 py-3 border border-gray-100 rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 focus:ring-[#2a0b38] transition-all';

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Communications</p>
        <h1 className="text-5xl font-serif text-[#2a0b38]">Broadcast Email</h1>
        <p className="text-gray-400 text-sm mt-2">Send an email to all approved CEO members at once.</p>
      </section>

      {/* Info banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
        <Users className="w-4 h-4 text-amber-500 shrink-0" />
        <p className="text-[12px] text-amber-700">
          This email will be sent to <strong>all approved CEO members</strong>. Use this for important announcements only.
        </p>
      </div>

      <div className="max-w-2xl bg-white border border-gray-100 rounded-xl p-10 shadow-sm space-y-6">

        {result && (
          <div className="flex items-start gap-3 px-4 py-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-bold text-emerald-700">{result.message}</p>
              <p className="text-[11px] text-emerald-600 mt-1">
                Sent to {result.sent} members{result.failed > 0 ? ` · ${result.failed} failed` : ''}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[12px] text-red-600">{error}</p>
          </div>
        )}

        {/* Subject */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
            Subject *
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
            placeholder="e.g. ILC Annual Summit — Save the Date"
            className={inputBase}
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
            Message *
          </label>
          <textarea
            value={form.message}
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            rows={10}
            placeholder="Write your message here...

Each CEO will receive this email personally addressed to them (Dear [Name],)."
            className={`${inputBase} resize-none`}
          />
          <p className="text-[10px] text-gray-400">
            Each email will be personally addressed — "Dear [CEO Name],"
          </p>
        </div>

        {/* Preview box */}
        {(form.subject || form.message) && (
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="bg-[#1a0525] px-4 py-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preview</p>
            </div>
            <div className="p-6 space-y-3">
              {form.subject && (
                <p className="text-sm font-bold text-[#2a0b38]">Subject: {form.subject}</p>
              )}
              <div className="border-t border-gray-50 pt-3">
                <p className="text-sm text-gray-500 italic">Dear [CEO Name],</p>
                {form.message && (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">
                    {form.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={loading || !form.subject.trim() || !form.message.trim()}
          className="w-full flex items-center justify-center gap-3 bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white py-4 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all"
        >
          {loading ? (
            'Sending...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send to All CEOs
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminBroadcastPage;