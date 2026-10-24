import { FormEvent, useEffect, useState } from 'react';
import { ArrowUpRight, Code2, Feather, FlaskConical, BriefcaseBusiness, Menu, X, Check, ShieldCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const services = [
  { icon: Code2, title: 'Software development', text: 'Websites, mobile apps, APIs and backend systems designed around real business needs.', tags: 'Web & mobile · APIs · Databases' },
  { icon: Feather, title: 'Writing & documentation', text: 'Clear, structured technical documents, professional content, reports and proposals.', tags: 'Documentation · Reports · Content' },
  { icon: FlaskConical, title: 'Research & analysis', text: 'Organized research support, information analysis and practical insights for decisions.', tags: 'Research · Analysis · Insights' },
  { icon: BriefcaseBusiness, title: 'Project management', text: 'From requirements and planning to milestones, coordination and delivery.', tags: 'Planning · Requirements · Delivery' },
];
type Project = { id: string; title: string; category: string; description: string };
type Inquiry = { id: number; name: string; email: string; service: string; message: string; status: string; created_at: string };

export default function App() {
  const [menu, setMenu] = useState(false);
  const [light, setLight] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', service: services[0].title, budget: '', message: '' });
  const [adminOpen, setAdminOpen] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [adminError, setAdminError] = useState('');
  const [adminReady, setAdminReady] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/projects`).then(r => {
      if (!r.ok) throw new Error(`Could not load projects (${r.status})`);
      return r.json();
    }).then(d => setProjects(d.projects || [])).catch(() => setProjects([
      { id: 'timiza', title: 'Timiza Digital Lending', category: 'Software development', description: 'A mobile-first lending experience with application workflows, decision support and administration.' },
      { id: 'research', title: 'Research & Documentation', category: 'Research and writing', description: 'Structured research support, technical documentation and clear project reports.' },
      { id: 'delivery', title: 'Project Delivery Toolkit', category: 'Project management', description: 'Planning, requirements and delivery workflows that keep complex work organized.' }
    ]));
  }, []);

  const go = (id: string) => { setMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  const update = (key: keyof typeof form, value: string) => setForm(v => ({ ...v, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault(); setSending(true); setNotice('');
    try {
      const response = await fetch(`${API}/api/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || 'Could not send inquiry. Please try again.');
      setNotice('success:' + (data.message || 'Thanks — your inquiry has been received.'));
      setForm({ name: '', email: '', service: services[0].title, budget: '', message: '' });
    } catch (err) { setNotice('error:' + (err instanceof Error ? err.message : 'Could not send inquiry.')); }
    finally { setSending(false); }
  }

  const adminFetch = async (path: string, init: RequestInit = {}) => {
    const auth = btoa(`${credentials.username}:${credentials.password}`);
    const response = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}`, ...(init.headers || {}) } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Admin request failed');
    return data;
  };
  async function signIn(e: FormEvent) {
    e.preventDefault(); setAdminError('');
    try { const data = await adminFetch('/api/admin/inquiries'); setInquiries(data.inquiries || []); setAdminReady(true); }
    catch (err) { setAdminError(err instanceof Error ? err.message : 'Sign-in failed'); }
  }
  async function setStatus(id: number, status: string) {
    try { await adminFetch(`/api/admin/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); setInquiries(old => old.map(i => i.id === id ? { ...i, status } : i)); }
    catch (err) { setAdminError(err instanceof Error ? err.message : 'Could not update status'); }
  }

  return <div className={light ? 'site light' : 'site'}>
    <div className="topline"><span className="pulse" /> INDEPENDENT IDEAS. THOUGHTFUL EXECUTION. DIGITAL IMPACT. <span className="location">BASED IN KENYA · WORKING EVERYWHERE</span></div>
    <header className="header">
      <a className="brand" href="#home" onClick={e => { e.preventDefault(); go('home'); }}><img className="brand-symbol" src="/holy-chalupa-logo.png" alt="" width={1254} height={1254} /><span><b>HOLY CHALUPA</b><small>THINK · CODE · CREATE · IMPACT</small></span></a>
      <button className="mobile" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X /> : <Menu />}</button>
      <nav className={menu ? 'nav open' : 'nav'}>{[['Services','services'],['Selected work','work'],['About','about'],['Contact','contact']].map(([label,id]) => <button key={id} onClick={() => go(id)}>{label}</button>)}<button className="theme" onClick={() => setLight(!light)}>{light ? 'Dark mode' : 'Light mode'}</button><button className="nav-cta" onClick={() => go('contact')}>Start a project ↗</button></nav>
    </header>

    <main>
      <section id="home" className="hero wrap">
        <div className="hero-art"><img className="hero-portrait" src="/profile-photo.jpeg" alt="Portrait of the Holy Chalupa founder" width={960} height={1280} /></div>
        <div className="hero-copy"><div className="eyebrow">CREATIVE THINKING. ENGINEERED OUTCOMES.</div><h1>Good ideas deserve <em>great execution.</em></h1><p className="lead">We turn complex ideas into useful digital products, clear communication and well-managed projects.</p><div className="actions"><button className="primary" onClick={() => go('services')}>Explore what we do ↗</button><button className="secondary" onClick={() => go('work')}>Discover our work ↓</button></div><div className="proof"><span>✦ Practical solutions</span><span>⌁ Thoughtful delivery</span><span>◎ Built for people</span></div></div>
        <div className="scroll">SCROLL TO EXPLORE <span /> 01 / 04</div>
      </section>

      <div className="trust"><b>From first thought to finished work.</b><span>TECHNOLOGY　·　RESEARCH　·　COMMUNICATION　·　DELIVERY</span></div>

      <section id="services" className="wrap section"><div className="section-head"><div><div className="eyebrow">WHAT WE DO</div><h2>Multiple disciplines.<br /><span>One thoughtful approach.</span></h2></div><p>Good work happens when technical skill meets curiosity, clarity and follow-through. Bring us the challenge — we'll help shape the path forward.</p></div><div className="services">{services.map((s,i) => { const Icon=s.icon; return <article className="service" key={s.title}><div className="service-top"><span>0{i+1}</span><Icon /></div><h3>{s.title}</h3><p>{s.text}</p><small>{s.tags}</small><button onClick={() => { update('service',s.title); go('contact'); }}>Discuss this service ↗</button></article>; })}</div></section>

      <section id="work" className="work"><div className="wrap section"><div className="section-head"><div><div className="eyebrow">SELECTED WORK</div><h2>Built with intent.<br /><span>Designed to matter.</span></h2></div><p>Examples of the kinds of challenges we can help solve. Replace these sample descriptions with verified client work before publishing.</p></div><div className="projects">{projects.map((p,i)=><article className="project" key={p.id}><div className={`project-art art${i%3}`}><div className="fake-window"><div className="windowbar">●　●　● <span>{p.category}</span></div>{i===0?<><div className="fake-title">Smarter digital journeys</div><div className="fake-stats"><i/><i/><i/></div><div className="fake-chart"><i/><i/><i/><i/><i/><i/><i/></div></>:i===1?<div className="doc"><Feather/><b>Research made clear.</b><i/><i/><i/></div>:<div className="kanban"><i/><i/><i/><i/><i/><i/></div>}</div></div><div className="project-meta">{p.category}<span>0{i+1}</span></div><h3>{p.title}</h3><p>{p.description}</p><button onClick={() => go('contact')}>Discuss a similar project ↗</button></article>)}</div><p className="sample-note">Portfolio cards are illustrative starter content, not a claim of completed client engagements.</p></div></section>

      <section id="about" className="wrap section about"><div className="about-emblem"><img className="emblem" src="/holy-chalupa-logo.png" alt="Holy Chalupa technology, writing, research, and project management emblem" width={1254} height={1254} loading="lazy" /></div><div><div className="eyebrow">ABOUT HOLY CHALUPA</div><h2>Curiosity is the start.<br /><em>Impact is the point.</em></h2><p>Holy Chalupa brings technology, writing, research and project delivery together under one roof. We believe the best solutions are not just clever — they're clear, useful and made with care.</p><p>Our approach is collaborative: understand the problem, make a plan, build thoughtfully, then refine the result around the people who use it.</p><div className="values"><b>01　Think clearly <small>Understand before building.</small></b><b>02　Create carefully <small>Make every detail count.</small></b><b>03　Build usefully <small>Design for real needs.</small></b><b>04　Deliver reliably <small>Finish with purpose.</small></b></div></div></section>

      <section className="process"><div className="wrap section"><div className="eyebrow">HOW WE WORK</div><h2>A clear path from <em>idea to impact.</em></h2><div className="steps">{[['01','Discover','Listen, ask questions and define the real challenge.'],['02','Shape','Agree on scope, priorities and a practical plan.'],['03','Create','Build, write or research with regular feedback.'],['04','Deliver','Refine the result and hand over clearly.']].map(s=><article key={s[0]}><span>{s[0]}</span><h3>{s[1]}</h3><p>{s[2]}</p></article>)}</div></div></section>

      <section id="contact" className="wrap section contact"><div><div className="eyebrow">HAVE A PROJECT IN MIND?</div><h2>Let's make something <em>meaningful.</em></h2><p>Tell us what you're working on, what you need help with, or the idea you can't stop thinking about.</p><div className="contact-points">✓ Clear communication<br/>✓ Thoughtful next steps<br/>✓ A practical plan</div><div className="kenya">◎　Based in Kenya. Open to the world.</div></div>
        <form className="contact-form" onSubmit={submit}><div className="form-title">PROJECT INQUIRY <span>● Usually takes 2 minutes</span></div><div className="fields"><label>Your name<input required minLength={2} maxLength={100} value={form.name} onChange={e=>update('name',e.target.value)} placeholder="How should we call you?"/></label><label>Email address<input required type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label></div><div className="fields"><label>What do you need?<select value={form.service} onChange={e=>update('service',e.target.value)}>{services.map(s=><option key={s.title}>{s.title}</option>)}<option>Other / not sure yet</option></select></label><label>Budget range<select value={form.budget} onChange={e=>update('budget',e.target.value)}><option value="">Prefer to discuss</option><option>Under KSh 10,000</option><option>KSh 10,000–50,000</option><option>KSh 50,000–150,000</option><option>KSh 150,000+</option></select></label></div><label>Tell us about the project<textarea required minLength={10} maxLength={4000} rows={4} value={form.message} onChange={e=>update('message',e.target.value)} placeholder="What would you like to create, improve or figure out?"/></label><button className="primary full" disabled={sending}>{sending?'Sending inquiry…':'Send project inquiry ↗'}</button>{notice&&<p className={notice.startsWith('success:')?'feedback ok':'feedback bad'} role="status">{notice.replace(/^(success|error):/,'')}</p>}<small className="privacy"><ShieldCheck size={14}/> Your details are used to respond to this inquiry.</small></form>
      </section>
    </main>

    <footer className="footer"><div className="footer-top"><a className="brand" href="#home"><img className="brand-symbol" src="/holy-chalupa-logo.png" alt="" width={1254} height={1254} /><span><b>HOLY CHALUPA</b><small>THINK · CODE · CREATE · IMPACT</small></span></a><p>Good ideas deserve great execution.</p><button onClick={()=>go('home')}>Back to top ↑</button></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Holy Chalupa. Built with purpose.</span><button onClick={()=>{setAdminOpen(true);setAdminReady(false);setAdminError('');}}>Admin sign in　<ShieldCheck size={13}/></button></div></footer>

    {adminOpen&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setAdminOpen(false);}}><section className="admin"><div className="admin-head"><div><div className="eyebrow">PRIVATE WORKSPACE</div><h2>Company dashboard</h2></div><button onClick={()=>setAdminOpen(false)} aria-label="Close admin"><X/></button></div>{!adminReady?<form onSubmit={signIn} className="admin-login"><p>Sign in with the admin credentials configured in your backend environment.</p><label>Username<input required value={credentials.username} onChange={e=>setCredentials({...credentials,username:e.target.value})}/></label><label>Password<input required type="password" value={credentials.password} onChange={e=>setCredentials({...credentials,password:e.target.value})}/></label><button className="primary full">Sign in securely</button>{adminError&&<p className="feedback bad">{adminError}</p>}</form>:<div className="inbox"><div className="inbox-title">Project inquiries <span>{inquiries.length} total</span></div>{adminError&&<p className="feedback bad">{adminError}</p>}{inquiries.length===0?<p>No inquiries yet. New project requests will appear here.</p>:inquiries.map(i=><article className="inquiry" key={i.id}><div><b>{i.name}</b><a href={`mailto:${i.email}`}>{i.email}</a><small>{i.service} · {new Date(i.created_at).toLocaleDateString()}</small><p>{i.message}</p></div><select value={i.status} onChange={e=>setStatus(i.id,e.target.value)}><option value="new">New</option><option value="in_review">In review</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></article>)}</div>}</section></div>}
  </div>;
}
