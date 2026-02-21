import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    title: 'Bulk CSV Upload',
    desc: 'Import thousands of contacts instantly. Just upload a CSV with name and phone — we handle the rest.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    title: 'Auto Voice Campaigns',
    desc: 'Create a custom script and launch a campaign. Voxly calls every contact automatically — no manual dialing.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'DTMF Keypad Input',
    desc: 'No AI needed. Contacts press 1 for Interested or 2 for Not Interested — simple, reliable, and instant.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Live CRM Dashboard',
    desc: 'Track every call in real time. See interested leads, success rates, and campaign performance at a glance.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Auto Retry Logic',
    desc: 'Failed calls are automatically retried up to 2 times with smart backoff — maximising your reach.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: 'Indian Accent Voice',
    desc: 'Powered by Amazon Polly\'s Aditi voice — natural Indian English accent that your contacts recognise and trust.',
  },
];

const steps = [
  { step: '01', title: 'Upload Contacts', desc: 'Import your contact list via CSV. Name and phone number — that\'s all you need.' },
  { step: '02', title: 'Create Campaign', desc: 'Write your voice script. Tell us what message to play when someone picks up.' },
  { step: '03', title: 'Launch & Auto-Dial', desc: 'Hit Start. Voxly calls every contact automatically, one by one.' },
  { step: '04', title: 'Capture Intent', desc: 'Contact presses 1 (Interested) or 2 (Not Interested). Status updates instantly.' },
  { step: '05', title: 'Review in CRM', desc: 'Open the dashboard to see who\'s interested and follow up with hot leads.' },
];

const plans = [
  {
    name: 'Starter',
    price: '₹999',
    period: '/month',
    desc: 'Perfect for small teams and individual agents',
    features: ['500 calls/month', '2 campaigns', 'CSV import', 'CRM dashboard', 'Email support'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '₹2,999',
    period: '/month',
    desc: 'For growing teams that need more reach',
    features: ['5,000 calls/month', 'Unlimited campaigns', 'CSV import', 'CRM dashboard', 'Priority support', 'Auto retry logic', 'Custom voice script'],
    cta: 'Start Free Trial',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large-scale operations and agencies',
    features: ['Unlimited calls', 'Unlimited campaigns', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'White-label option'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const stats = [
  { value: '10x', label: 'Faster than manual calling' },
  { value: '85%', label: 'Average call connect rate' },
  { value: '3x', label: 'More leads qualified per day' },
  { value: '< 1min', label: 'To launch a campaign' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ─── Navbar ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Voxly</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary text-sm"
          >
            Demo →
          </button>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
            Powered by Twilio · No AI Required
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Auto-Call Your Leads.<br />
            <span className="text-brand-600">Close More. Work Less.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Voxly dials your entire contact list automatically, plays your custom voice script, and captures buyer intent with a single keypress — no agents, no AI, no hassle.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-base px-8 py-3 shadow-lg shadow-brand-200"
            >
              Start for Free →
            </button>
            <a
              href="#how-it-works"
              className="btn-secondary text-base px-8 py-3"
            >
              See How It Works
            </a>
          </div>

          {/* Hero visual */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-3xl mx-auto">
              {/* Mock browser bar */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-4 flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 text-left">
                  voxly.up.railway.app
                </div>
              </div>
              {/* Mock dashboard */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Total Contacts', value: '2,847', color: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600' },
                    { label: 'Calls Made', value: '1,923', color: 'bg-blue-50 border-blue-100', text: 'text-blue-600' },
                    { label: 'Interested', value: '634', color: 'bg-green-50 border-green-100', text: 'text-green-600' },
                    { label: 'Success Rate', value: '78%', color: 'bg-purple-50 border-purple-100', text: 'text-purple-600' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.color} border rounded-xl p-3`}>
                      <div className={`text-2xl font-bold ${s.text}`}>{s.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Live Campaign — Q1 Product Launch</span>
                    <span className="badge bg-green-100 text-green-700 animate-pulse">● Running</span>
                  </div>
                  {[
                    { name: 'Rahul Sharma', phone: '+91 98765 43210', status: 'Interested', color: 'bg-green-100 text-green-700' },
                    { name: 'Priya Patel', phone: '+91 87654 32109', status: 'Not Interested', color: 'bg-red-100 text-red-700' },
                    { name: 'Amit Kumar', phone: '+91 76543 21098', status: 'Calling...', color: 'bg-blue-100 text-blue-700' },
                    { name: 'Sneha Joshi', phone: '+91 65432 10987', status: 'Not Called', color: 'bg-gray-100 text-gray-600' },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{row.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{row.phone}</div>
                      </div>
                      <span className={`badge ${row.color} text-xs`}>{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────── */}
      <section className="py-16 bg-brand-600">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold text-white">{s.value}</div>
              <div className="text-brand-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Everything you need to scale outreach</h2>
            <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">No expensive call centres. No complex AI setup. Just upload, launch, and collect leads.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Up and running in 5 minutes</h2>
            <p className="text-gray-500 mt-4 text-lg">No technical knowledge required.</p>
          </div>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={s.step} className="flex items-start gap-6 bg-white rounded-2xl border border-gray-200 p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {s.step}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base">{s.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex items-center">
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="text-gray-500 mt-4 text-lg">No hidden fees. No per-call charges beyond your plan.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-8 border-2 relative flex flex-col ${
                  p.highlight
                    ? 'border-brand-500 bg-brand-600 text-white shadow-2xl shadow-brand-200 scale-105'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full">
                    {p.badge}
                  </div>
                )}
                <div>
                  <h3 className={`text-lg font-bold ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                  <p className={`text-sm mt-1 ${p.highlight ? 'text-brand-200' : 'text-gray-500'}`}>{p.desc}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className={`text-4xl font-extrabold ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.price}</span>
                    <span className={`text-sm pb-1 ${p.highlight ? 'text-brand-200' : 'text-gray-400'}`}>{p.period}</span>
                  </div>
                </div>
                <ul className="mt-8 space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.highlight ? 'text-brand-200' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={p.highlight ? 'text-brand-100' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/login')}
                  className={`mt-8 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    p.highlight
                      ? 'bg-white text-brand-700 hover:bg-brand-50'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-r from-brand-600 to-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white">Ready to automate your outreach?</h2>
          <p className="text-brand-200 mt-4 text-lg">Join hundreds of teams calling smarter with Voxly.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-10 bg-white text-brand-700 hover:bg-brand-50 font-bold text-base px-10 py-4 rounded-xl shadow-xl transition-all hover:scale-105"
          >
            Get Started for Free →
          </button>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Voxly</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Voxly. Built with Twilio · React · PostgreSQL.</p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-gray-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-600 transition-colors">Pricing</a>
            <button onClick={() => navigate('/login')} className="hover:text-brand-600 font-medium transition-colors">Demo</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
