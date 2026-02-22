import { useState, FormEvent, useEffect } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';

function TwilioLogo() {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="60" height="60" rx="12" fill="#F22F46" />
      <circle cx="30" cy="30" r="14" stroke="white" strokeWidth="5" fill="none" />
      <circle cx="22.5" cy="22.5" r="3.5" fill="white" />
      <circle cx="37.5" cy="22.5" r="3.5" fill="white" />
      <circle cx="22.5" cy="37.5" r="3.5" fill="white" />
      <circle cx="37.5" cy="37.5" r="3.5" fill="white" />
    </svg>
  );
}

function TwilioCard() {
  const [sid, setSid] = useState('');
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [tokenSet, setTokenSet] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authApi.getTwilioSettings()
      .then((res) => {
        const d = res.data.data;
        setConfigured(d.configured);
        setTokenSet(d.twilioTokenSet);
        setSid(d.twilioSid ?? '');
        setPhone(d.twilioPhone ?? '');
        if (!d.configured) setOpen(true);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.saveTwilioSettings({
        twilioSid: sid.trim(),
        twilioToken: token.trim(),
        twilioPhone: phone.trim(),
      });
      toast.success('Twilio integration saved!');
      setConfigured(true);
      setTokenSet(true);
      setToken('');
      setOpen(false);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to save settings.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove your Twilio integration? You won't be able to make calls until you re-add it.")) return;
    try {
      await authApi.removeTwilioSettings();
      toast.success('Twilio integration removed.');
      setConfigured(false);
      setTokenSet(false);
      setSid(''); setToken(''); setPhone('');
      setOpen(true);
    } catch {
      toast.error('Failed to remove integration.');
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* Card header — always visible */}
      <div className="p-6 flex items-center gap-5">
        {/* Logo */}
        <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
          {fetching ? (
            <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" />
          ) : (
            <TwilioLogo />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">Twilio</h3>
            {!fetching && (
              configured ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Not Connected
                </span>
              )
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Programmable Voice API — auto-dial contacts, capture keypad responses.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            You connect your own Twilio account and pay Twilio directly.
            <a href="https://www.twilio.com/voice/pricing" target="_blank" rel="noreferrer"
              className="ml-1 text-brand-500 hover:underline">See pricing →</a>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {configured && (
            <button onClick={handleRemove}
              className="btn-secondary text-xs text-red-600 border-red-200 hover:bg-red-50">
              Disconnect
            </button>
          )}
          <button
            onClick={() => setOpen(v => !v)}
            className={configured ? 'btn-secondary text-xs' : 'btn-primary text-xs'}
          >
            {open ? 'Hide' : configured ? 'Edit' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Expandable form */}
      {open && (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-6 space-y-5">
          {/* Steps guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700 space-y-2">
            <p className="font-semibold text-blue-800 text-sm">How to get your credentials</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to{' '}
                <a href="https://console.twilio.com" target="_blank" rel="noreferrer"
                  className="underline font-semibold">console.twilio.com</a>{' '}
                and sign up (free trial available)
              </li>
              <li>
                Copy your <strong>Account SID</strong> and <strong>Auth Token</strong> from the home screen
              </li>
              <li>
                Get a <strong>Phone Number</strong> — use trial number or buy one under Phone Numbers menu
              </li>
              <li>Paste all three below and click <strong>Save & Connect</strong></li>
            </ol>
            <p className="text-blue-600 pt-1">
              💡 Trial accounts can only call <strong>verified</strong> numbers. Upgrade to call any number.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Account SID */}
            <div>
              <label className="label" htmlFor="t-sid">Account SID</label>
              <input
                id="t-sid"
                type="text"
                value={sid}
                onChange={(e) => setSid(e.target.value)}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="input font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Starts with "AC" · 34 characters</p>
            </div>

            {/* Auth Token */}
            <div>
              <label className="label" htmlFor="t-token">
                Auth Token
                {tokenSet && (
                  <span className="ml-2 text-xs text-green-600 font-normal">✓ saved — leave blank to keep current</span>
                )}
              </label>
              <div className="relative">
                <input
                  id="t-token"
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={tokenSet ? '••••••••••••••••••••••••••••••••' : 'Paste your Auth Token'}
                  className="input font-mono text-sm pr-10"
                  required={!tokenSet}
                />
                <button type="button" onClick={() => setShowToken(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showToken ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="label" htmlFor="t-phone">Twilio Phone Number</label>
              <input
                id="t-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+16505551234"
                className="input font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-400 mt-1">E.164 format — starts with + and country code (e.g. +91 for India)</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5">
                {loading ? 'Saving...' : configured ? 'Update Credentials' : 'Save & Connect'}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary px-4 py-2.5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Coming Soon placeholder card ─────────────────────────────
function ComingSoonCard({ name, description, icon }: { name: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="card p-6 flex items-center gap-5 opacity-60">
      <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-gray-700">{name}</h3>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">Coming Soon</span>
        </div>
        <p className="text-sm text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function Integrations() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Integrations"
        subtitle="Connect external services to power your voice campaigns"
      />

      <div className="space-y-8 mt-2">
        {/* Active integrations */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Voice & Calling</h2>
          <TwilioCard />
        </div>

        {/* Coming soon */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Coming Soon</h2>
          <div className="space-y-4">
            <ComingSoonCard
              name="Zapier"
              description="Trigger Zaps when a contact is marked Interested or Not Interested."
              icon={
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-15h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              }
            />
            <ComingSoonCard
              name="Google Sheets"
              description="Sync your contact list directly from a Google Sheet."
              icon={
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8zm0-4h8v2H8z" />
                </svg>
              }
            />
            <ComingSoonCard
              name="WhatsApp"
              description="Follow up with Interested contacts via WhatsApp message automatically."
              icon={
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
