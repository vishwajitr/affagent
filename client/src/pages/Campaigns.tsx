import { useState } from 'react';
import { useCampaigns, useCreateCampaign, useStartCampaign, useDeleteCampaign, useTwilioConfig } from '../hooks/useCampaigns';
import { PageLoader } from '../components/Spinner';
import PageHeader from '../components/PageHeader';
import { Campaign } from '../types';

function CampaignCard({ campaign, onStart, onDelete, isStarting, isDeleting, twilioReady }: {
  campaign: Campaign;
  onStart: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  isStarting: boolean;
  isDeleting: boolean;
  twilioReady: boolean | null;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">{campaign.name}</h3>
            <span className="badge bg-blue-100 text-blue-700">
              {campaign._count?.calls ?? 0} calls made
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Created {new Date(campaign.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onStart(campaign.id)}
            disabled={isStarting || twilioReady === false}
            className={`btn-success text-xs ${twilioReady === false ? 'opacity-40 cursor-not-allowed' : ''}`}
            title={twilioReady === false ? 'Add your Twilio credentials in Profile → Twilio Integration first' : 'Start calling contacts'}
          >
            {isStarting ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Starting...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Campaign
              </>
            )}
          </button>
          <button
            onClick={() => onDelete(campaign.id, campaign.name)}
            disabled={isDeleting}
            className="btn-secondary text-xs text-red-600 border-red-200 hover:bg-red-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Script preview */}
      <div className="mt-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
        >
          {expanded ? 'Hide' : 'View'} Script
          <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expanded && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{campaign.script}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const DEFAULT_SCRIPT = `Hello! This is a call from [Company Name]. We have an exciting offer for you today.

Press 1 if you are interested in learning more about our offer.
Press 2 if you would like to be removed from our calling list.

Thank you for your time!`;

export default function Campaigns() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [script, setScript] = useState('');

  const { data, isLoading } = useCampaigns();
  const { data: configData } = useTwilioConfig();
  const createMutation = useCreateCampaign();
  const startMutation = useStartCampaign();
  const deleteMutation = useDeleteCampaign();

  const twilioReady = configData?.configured ?? null;

  const campaigns = data?.data ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !script.trim()) return;
    await createMutation.mutateAsync({ name: name.trim(), script: script.trim() });
    setName('');
    setScript('');
    setShowForm(false);
  };

  const handleStart = (id: string) => {
    if (!window.confirm('Start this campaign? It will call all contacts with "Not Called" status.')) return;
    startMutation.mutate(id);
  };

  const handleDelete = (id: string, campaignName: string) => {
    if (!window.confirm(`Delete campaign "${campaignName}"? This will also delete all associated call records.`)) return;
    deleteMutation.mutate(id);
  };

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Manage and launch voice calling campaigns"
        actions={
          <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
            {showForm ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Campaign
              </>
            )}
          </button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Twilio Config Warning */}
        {twilioReady === false && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-5 py-4">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Twilio Not Connected — Calls Will Fail</p>
              <p className="text-sm text-amber-700 mt-1">
                You need to connect your Twilio account before launching campaigns.
                Go to your Profile and add your Twilio credentials.
              </p>
              <a href="/profile" className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Go to Profile → Twilio Integration
              </a>
            </div>
          </div>
        )}
        {twilioReady === true && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-700">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Twilio is connected and ready. Campaigns will dial contacts immediately on launch.
          </div>
        )}

        {/* Create Campaign Form */}
        {showForm && (
          <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Create New Campaign</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label" htmlFor="campaign-name">Campaign Name</label>
                <input
                  id="campaign-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q2 Product Launch"
                  className="input"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label" htmlFor="campaign-script">Voice Script</label>
                  <button
                    type="button"
                    onClick={() => setScript(DEFAULT_SCRIPT)}
                    className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                  >
                    Use template
                  </button>
                </div>
                <textarea
                  id="campaign-script"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Enter the script that will be read to the contact. End with 'Press 1 if interested, Press 2 if not interested.'"
                  rows={7}
                  className="input resize-y font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  This script will be read aloud by Twilio's text-to-speech engine (Alice voice).
                </p>
              </div>

              {/* DTMF reminder */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                <strong>Reminder:</strong> Always end your script with keypad instructions such as:{' '}
                <em>"Press 1 if interested. Press 2 if not interested."</em>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Campaign List */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {campaigns.length} Campaign{campaigns.length !== 1 ? 's' : ''}
          </h2>

          {isLoading ? (
            <PageLoader />
          ) : campaigns.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No campaigns yet</h3>
              <p className="text-sm text-gray-500 mb-6">Create your first campaign to start making calls</p>
              <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Campaign
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  onStart={handleStart}
                  onDelete={handleDelete}
                  isStarting={startMutation.isPending}
                  isDeleting={deleteMutation.isPending}
                  twilioReady={twilioReady}
                />
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="card p-6 bg-gradient-to-br from-brand-50 to-indigo-50 border-brand-200">
          <h3 className="text-sm font-semibold text-brand-800 mb-3">How Voice Campaigns Work</h3>
          <ol className="space-y-2">
            {[
              'Create a campaign with a custom voice script.',
              'Import contacts via CSV (name + phone columns required).',
              'Click "Start Campaign" — calls all contacts with "Not Called" status.',
              'Twilio dials each contact and plays the script using text-to-speech.',
              'Contact presses 1 (Interested) or 2 (Not Interested) on their keypad.',
              'Status is saved to the CRM in real time.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-brand-700">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
