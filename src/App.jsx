import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutDashboard, ArrowLeftRight, Users2, BarChart3,
  Plus, X, ArrowUpCircle, ArrowDownCircle, Search, Edit2,
  ChevronDown, Trash2, Check, TrendingUp, MoreVertical,
  AlertCircle, CheckCircle2, UserPlus,
  Building2, Banknote, Plane, Megaphone, Monitor, Zap, Coffee, Package,
  FileSpreadsheet, FileText, LogOut, User, Shield, Bell
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  PieChart as PieChartComp, Pie, Cell,
  XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────
//  DESIGN TOKENS  — User Specified Palette
// ─────────────────────────────────────────────────────────
const C = {
  bg:      '#E9ECEF',
  card:    '#F8F9FA',
  primary: '#495057',
  text:    '#212529',
  accent:  '#6C757D',
  white:   '#ffffff',
  bdr:     'rgba(0,0,0,0.07)',
  shd:     '0 2px 12px rgba(0,0,0,0.05)',
  shdM:    '0 8px 28px rgba(0,0,0,0.1)',
  muted:   '#ADB5BD',
  danger:  '#EF4444',
  success: '#10b981',
};

const HERO_BG    = `linear-gradient(150deg, #343a40 0%, #495057 60%, #6C757D 100%)`;
const BRAND_GRAD = `linear-gradient(135deg, #495057 0%, #212529 100%)`;

// ─────────────────────────────────────────────────────────
//  CATEGORIES & DATA
// ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { name:'Office',    icon: Building2, color:'#6c757d' },
  { name:'Salary',   icon: Banknote,  color:'#495057' },
  { name:'Travel',   icon: Plane,     color:'#343a40' },
  { name:'Marketing',icon: Megaphone, color:'#212529' },
  { name:'Software', icon: Monitor,   color:'#6c757d' },
  { name:'Utilities',icon: Zap,       color:'#495057' },
  { name:'Food',     icon: Coffee,    color:'#343a40' },
  { name:'Other',    icon: Package,   color:'#212529' },
];

const MONTHS = ['Apr 2026','Mar 2026','Feb 2026','Jan 2026','Dec 2025','Nov 2025'];
const P_COLORS = ['#212529','#343a40','#495057','#6c757d','#adb5bd','#dee2e6'];

const PARTNERS_INIT = [
  { id:'p1', name:'Sriram',  email:'sriram@lem.in',  phone:'+91 98765 00001', isYou:true,  initials:'SR', color:'#212529' },
  { id:'p2', name:'Tharsan', email:'tharsan@lem.in', phone:'+91 98765 00002', isYou:false, initials:'TH', color:'#495057' },
];

const TX_INIT = [
  { id:'t1',  type:'expense',    amount:  18000, pid:'p1', cat:'Travel',    date:'2026-04-10', note:'Client site — Chennai'   },
  { id:'t2',  type:'expense',    amount:  25000, pid:'p2', cat:'Marketing', date:'2026-04-08', note:'Digital ad Q2'            },
  { id:'t3',  type:'expense',    amount:   6500, pid:'p1', cat:'Office',    date:'2026-04-05', note:'Stationery & supplies'    },
  { id:'t4',  type:'investment', amount: 100000, pid:'p1', cat:'Salary',    date:'2026-04-01', note:'April capital injection'  },
  { id:'t5',  type:'expense',    amount:  45000, pid:'p1', cat:'Office',    date:'2026-03-28', note:'Monthly office rent'      },
  { id:'t6',  type:'expense',    amount: 120000, pid:'p1', cat:'Salary',    date:'2026-03-25', note:'March team salaries'      },
  { id:'t7',  type:'expense',    amount:  38000, pid:'p2', cat:'Marketing', date:'2026-03-20', note:'Brand shoot & design'     },
  { id:'t8',  type:'expense',    amount:   9800, pid:'p2', cat:'Software',  date:'2026-03-15', note:'Annual subscriptions'     },
  { id:'t9',  type:'investment', amount:  75000, pid:'p2', cat:'Salary',    date:'2026-03-01', note:'March contribution'       },
];

const LS = 'lem_v7';
const load = () => { try { const d = localStorage.getItem(LS); return d ? JSON.parse(d) : null; } catch { return null; } };
const save = (d) => { try { localStorage.setItem(LS, JSON.stringify(d)); } catch {} };

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
const inr   = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const inrS  = (n) => { if (n>=10000000) return `₹${(n/10000000).toFixed(1)}Cr`; if (n>=100000) return `₹${(n/100000).toFixed(1)}L`; if (n>=1000) return `₹${(n/1000).toFixed(1)}k`; return inr(n); };
const dShrt = (iso) => new Date(iso).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' });
const catFn = (n)  => CATEGORIES.find(c => c.name===n) || CATEGORIES[7];
const initials = (n) => n.trim().split(' ').filter(Boolean).map(w=>w[0]).join('').toUpperCase().slice(0,2);

// ─────────────────────────────────────────────────────────
//  TOAST & CONFIRM & MODALS
// ─────────────────────────────────────────────────────────
function Toast({ msg, type='ok', done }) {
  useEffect(() => { const t = setTimeout(done, 2600); return () => clearTimeout(t); }, [done]);
  const bg = type==='ok' ? C.success : type==='err' ? C.danger : C.primary;
  return (
    <div className="animate-pop" style={{
      position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', zIndex:500,
      display:'flex', alignItems:'center', gap:10, padding:'12px 22px', borderRadius:20,
      background:bg, color:'#fff', fontSize:12, fontWeight:700,
      boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
    }}>
      {type==='ok' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
      {msg}
    </div>
  );
}

function Confirm({ title, body, ok, cancel }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:400, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div className="animate-fade-in" onClick={cancel} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)' }}/>
      <div className="animate-slide-up" style={{
        position:'relative', background:C.white, width:'100%', maxWidth:430,
        borderRadius:'32px 32px 0 0', padding:'32px 24px 44px',
        boxShadow:'0 -8px 40px rgba(0,0,0,0.15)',
      }}>
        <div style={{ width:48, height:48, borderRadius:16, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
          <AlertCircle size={24} color={C.danger}/>
        </div>
        <p style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:8 }}>{title}</p>
        <p style={{ fontSize:14, color:C.accent, lineHeight:1.6, marginBottom:32 }}>{body}</p>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={cancel} style={{ flex:1, height:52, borderRadius:16, border:`1px solid ${C.bdr}`, background:C.card, color:C.accent, fontWeight:700, fontSize:14, cursor:'pointer' }}>Cancel</button>
          <button onClick={ok} style={{ flex:1, height:52, borderRadius:16, border:'none', background:C.danger, color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Sheet({ close, children }) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:90, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div className="animate-fade-in" onClick={close} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)' }}/>
      <div className="animate-slide-up" style={{
        position:'relative', background:C.white, width:'100%', borderRadius:'32px 32px 0 0',
        maxHeight:'93dvh', display:'flex', flexDirection:'column',
        boxShadow:'0 -8px 48px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'14px 0 2px' }}>
          <div style={{ width:40, height:5, borderRadius:999, background:C.bdr }}/>
        </div>
        <div className="scrollbar-hide" style={{ overflowY:'auto', flex:1, padding:'2px 24px 48px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SheetHeader({ title, close }) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'18px 0 20px', borderBottom:`1px solid ${C.bdr}`, marginBottom:24,
      position:'sticky', top:0, background:C.white, zIndex:1,
    }}>
      <p style={{ fontSize:20, fontWeight:900, color:C.text, letterSpacing:'-0.4px' }}>{title}</p>
      <button onClick={close} style={{
        width:36, height:36, borderRadius:12, border:`1px solid ${C.bdr}`, background:C.card,
        display:'flex', alignItems:'center', justifyContent:'center', color:C.accent, cursor:'pointer',
      }}>
        <X size={16}/>
      </button>
    </div>
  );
}

function Fld({ label, children }) {
  return (
    <div style={{ marginBottom:24 }}>
      <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.muted, marginBottom:10 }}>{label}</p>
      {children}
    </div>
  );
}

const inp = { width:'100%', padding:'16px 18px', borderRadius:16, fontSize:15, fontWeight:600, border:`1px solid ${C.bdr}`, background:C.card, color:C.text, outline:'none', boxSizing:'border-box', transition: 'border-color 0.2s' };

// ─────────────────────────────────────────────────────────
//  LOGIN PAGE — Wave Style
// ─────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');

  const handleLogin = () => {
    if (email && pass) onLogin();
    else onLogin(); // demo: allow bypass
  };

  return (
    <div style={{
      display:'flex', flexDirection:'column', minHeight:'100dvh',
      background:C.bg, fontFamily:'Inter,system-ui,sans-serif',
      position:'relative', overflow:'hidden', maxWidth:430, margin:'0 auto',
    }}>
      {/* Wave top section */}
      <div style={{ position:'relative', height:'52%', background: HERO_BG, flexShrink:0 }}>
        {/* decorative lines */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.1 }} viewBox="0 0 430 360" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="320" cy="80"  rx="160" ry="160" fill="none" stroke="#fff" strokeWidth="1.5"/>
          <ellipse cx="320" cy="80"  rx="200" ry="200" fill="none" stroke="#fff" strokeWidth="1"/>
          <ellipse cx="100" cy="280" rx="140" ry="140" fill="none" stroke="#fff" strokeWidth="1.5"/>
          <path d="M-20,200 Q100,120 200,200 Q300,280 430,180" fill="none" stroke="#fff" strokeWidth="1"/>
        </svg>

        {/* LEM brand */}
        <div style={{ position:'absolute', top:48, left:28, display:'flex', flexDirection:'column' }}>
          <span style={{ fontSize:13, fontWeight:900, letterSpacing:'0.25em', color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>LEM</span>
          <span style={{ fontSize:28, fontWeight:900, color:'#fff', letterSpacing:'-0.5px', lineHeight:1.2, marginTop:8 }}>Welcome back,</span>
          <span style={{ fontSize:15, color:'rgba(255,255,255,0.6)', marginTop:6, fontWeight:500 }}>Sign in to your workspace</span>
        </div>

        {/* bottom wave SVG */}
        <svg style={{ position:'absolute', bottom:-2, left:0, width:'100%' }} viewBox="0 0 430 72" preserveAspectRatio="none">
          <path d="M0,72 L0,28 Q100,0 215,28 Q330,56 430,20 L430,72 Z" fill={C.bg}/>
        </svg>
      </div>

      {/* Form section */}
      <div style={{ flex:1, padding:'8px 28px 40px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <p style={{ fontSize:26, fontWeight:900, color:C.text, letterSpacing:'-0.5px', marginBottom:6 }}>Sign in</p>
        <p style={{ fontSize:13, color:C.accent, marginBottom:28 }}>Manage your business finances</p>

        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:11, fontWeight:700, color:C.accent, marginBottom:8, letterSpacing:'0.04em' }}>Email</p>
          <input
            id="login-email"
            type="email"
            placeholder="demo@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ ...inp, background:C.white }}
          />
        </div>

        <div style={{ marginBottom:12 }}>
          <p style={{ fontSize:11, fontWeight:700, color:C.accent, marginBottom:8, letterSpacing:'0.04em' }}>Password</p>
          <input
            id="login-pass"
            type="password"
            placeholder="Enter your password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            style={{ ...inp, background:C.white }}
          />
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:28 }}>
          <button style={{ fontSize:12, fontWeight:700, color:C.primary, background:'none', border:'none', cursor:'pointer' }}>Forgot Password?</button>
        </div>

        <button
          id="login-btn"
          onClick={handleLogin}
          style={{
            width:'100%', padding:'17px', borderRadius:16, background:BRAND_GRAD, color:'#fff',
            fontWeight:800, fontSize:15, border:'none', cursor:'pointer',
            boxShadow:'0 8px 24px rgba(73,80,87,0.35)', transition:'transform 0.1s',
          }}
          onMouseDown={e => e.currentTarget.style.transform='scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform='scale(1)'}
        >
          Login
        </button>

        <p style={{ textAlign:'center', fontSize:13, color:C.muted, marginTop:24 }}>
          Don't have an account?{' '}
          <button onClick={onLogin} style={{ background:'none', border:'none', color:C.primary, fontWeight:700, cursor:'pointer', fontSize:13 }}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  PROFILE PAGE
// ─────────────────────────────────────────────────────────
function ProfilePage({ partner, onLogout, onBack }) {
  const items = [
    { icon: User,    label: 'Edit Profile',        sub: 'Update name, email, phone' },
    { icon: Shield,  label: 'Security',             sub: 'Password & 2FA' },
    { icon: Bell,    label: 'Notifications',        sub: 'Alerts & reminders' },
    { icon: FileText,label: 'Export My Data',       sub: 'Download all records' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ background: HERO_BG, paddingBottom: 56 }}>
        <div style={{ display:'flex', alignItems:'center', padding:'20px 24px 0', gap:12 }}>
          <button onClick={onBack} style={{
            width:36, height:36, borderRadius:12, border:'none', background:'rgba(255,255,255,0.15)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff',
          }}>
            <X size={18}/>
          </button>
          <p style={{ fontSize:16, fontWeight:800, color:'#fff' }}>Profile</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 24px 0', gap:12 }}>
          <div style={{
            width:80, height:80, borderRadius:24, background:'rgba(255,255,255,0.15)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28, fontWeight:900, color:'#fff',
            border:'3px solid rgba(255,255,255,0.25)',
          }}>
            {partner?.initials || 'S'}
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:22, fontWeight:900, color:'#fff', letterSpacing:'-0.5px' }}>{partner?.name || 'Sriram'}</p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:4 }}>{partner?.email || 'sriram@lem.in'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ background:C.bg, marginTop:-32, borderRadius:'32px 32px 0 0', padding:'24px 20px' }}>
        <div style={{ background:C.card, borderRadius:20, overflow:'hidden', border:`1px solid ${C.bdr}`, boxShadow:C.shd, marginBottom:20 }}>
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.label}>
                <button style={{
                  width:'100%', display:'flex', alignItems:'center', gap:16,
                  padding:'18px 20px', background:'none', border:'none', cursor:'pointer',
                  textAlign:'left',
                }}>
                  <div style={{
                    width:40, height:40, borderRadius:12, background:C.bg,
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>
                    <Icon size={18} color={C.primary}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:C.text }}>{item.label}</p>
                    <p style={{ fontSize:12, color:C.accent, marginTop:2 }}>{item.sub}</p>
                  </div>
                  <ChevronDown size={16} color={C.muted} style={{ transform:'rotate(-90deg)' }}/>
                </button>
                {i < items.length - 1 && <div style={{ height:1, background:C.bdr, marginLeft:76 }}/>}
              </div>
            );
          })}
        </div>

        <div style={{ background:C.card, borderRadius:20, overflow:'hidden', border:`1px solid rgba(239,68,68,0.15)`, boxShadow:C.shd }}>
          <button onClick={onLogout} style={{
            width:'100%', display:'flex', alignItems:'center', gap:16,
            padding:'18px 20px', background:'none', border:'none', cursor:'pointer',
          }}>
            <div style={{
              width:40, height:40, borderRadius:12, background:'#FEF2F2',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <LogOut size={18} color={C.danger}/>
            </div>
            <p style={{ fontSize:14, fontWeight:700, color:C.danger }}>Log Out</p>
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:C.muted, marginTop:24 }}>LEM Finance v1.0.0</p>
        <div style={{ height:48 }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  FLOATING NAV
// ─────────────────────────────────────────────────────────
function FloatingNav({ active, set, onAdd }) {
  const items = [
    { id:'dashboard',    icon:<LayoutDashboard/>, label:'Home'    },
    { id:'transactions', icon:<ArrowLeftRight/>,  label:'Activity'},
    { id:'add',          icon:<Plus/>,            label:'Add', isFab: true },
    { id:'partners',     icon:<Users2/>,          label:'Team'    },
    { id:'reports',      icon:<BarChart3/>,       label:'Reports' },
  ];
  return (
    <div style={{
      position:'absolute', bottom: 20, left:'50%', transform:'translateX(-50%)',
      width:'calc(100% - 40px)', maxWidth:380,
      background:'rgba(248,249,250,0.92)',
      backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
      borderRadius:28, display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'8px 12px', zIndex:50,
      boxShadow:'0 16px 40px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.6)',
      border: `1px solid ${C.bdr}`
    }}>
      {items.map(it => {
        if (it.isFab) {
          return (
            <button key={it.id} onClick={onAdd} style={{
              width: 52, height: 52, borderRadius: 26,
              background: BRAND_GRAD, border: `3px solid ${C.white}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.white, cursor: 'pointer',
              boxShadow: `0 10px 24px rgba(73,80,87,0.35)`,
              transform: 'translateY(-18px)',
              flexShrink: 0, transition: 'transform 0.2s',
            }}
            onMouseDown={e=>e.currentTarget.style.transform='translateY(-16px) scale(0.95)'}
            onMouseUp={e=>e.currentTarget.style.transform='translateY(-18px) scale(1)'}>
              {React.cloneElement(it.icon, { size: 24, strokeWidth: 3 })}
            </button>
          );
        }
        const on = active === it.id;
        return (
          <button key={it.id} onClick={() => set(it.id)} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center',
            padding:'8px 0', border:'none', background:'none', cursor:'pointer', gap:4,
          }}>
            {React.cloneElement(it.icon, {
              size: 19,
              strokeWidth: on ? 2.5 : 1.5,
              color: on ? C.primary : C.muted,
            })}
            <span style={{
              fontSize:9, fontWeight: on ? 800 : 600,
              color: on ? C.primary : C.muted,
            }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  SECTION HEADER
// ─────────────────────────────────────────────────────────
function SecHdr({ label, action, onAction }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <p style={{ fontSize:12, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.accent }}>{label}</p>
      {action && (
        <button onClick={onAction} style={{ fontSize:11, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:C.primary, background:'none', border:'none', cursor:'pointer' }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  BOND-STYLE BALANCE CARD (Merged with Header)
// ─────────────────────────────────────────────────────────
function BondCard({ transactions, partners, you, onProfile }) {
  const inv   = transactions.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
  const spent = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const bal   = inv - spent;
  const burn  = inv > 0 ? Math.round((spent/inv)*100) : 0;
  const hr   = new Date().getHours();
  const gr   = hr<12?'morning':hr<17?'afternoon':'evening';

  return (
    <div style={{ borderRadius: '0 0 32px 32px', overflow:'hidden', background:C.text, boxShadow:C.shdM }}>
      <div style={{ position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:HERO_BG }}/>
        
        {/* Top bar with Profile & Greeting */}
        <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 20px 0' }}>
            <div>
              <p style={{ fontSize:18, fontWeight:900, letterSpacing:'0.08em', color:'rgba(255,255,255,0.9)' }}>LEM</p>
              <p style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.5)', marginTop:2 }}>
                Good {gr}, {you?.name||'partner'} 👋
              </p>
            </div>
          <button
            id="profile-btn"
            onClick={onProfile}
            style={{
              width:38, height:38, borderRadius:12, background:'rgba(255,255,255,0.15)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#fff', fontSize:13, fontWeight:900, border:'none', cursor:'pointer',
              backdropFilter:'blur(8px)',
            }}>
            {you?.initials?.[0]||'S'}
          </button>
        </div>

        {/* Main Stats Area */}
        <div style={{ position:'relative', padding:'24px 20px 32px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', marginBottom:16,
            background:'rgba(255,255,255,0.12)', padding:'5px 12px', borderRadius:8, alignSelf:'flex-start',
          }}>
            <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.08em', color:'#fff' }}>
              {burn}% BURN RATE
            </span>
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.6)', marginBottom:2 }}>Company Balance</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <p style={{ fontSize:48, fontWeight:900, color:'#fff', letterSpacing:'-2px', lineHeight:1 }}>
                {inrS(bal)}
              </p>
              {inv > 0 && (
                <div>
                  <p style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.7)', lineHeight:1.3 }}>{inrS(inv)}</p>
                  <p style={{ fontSize:10, color:'rgba(255,255,255,0.45)', fontWeight:600 }}>invested</p>
                </div>
              )}
            </div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:6, fontWeight:500 }}>
              Net Balance · {new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'})}
            </p>
          </div>
        </div>
      </div>

      <div style={{
        background:C.card, padding:'14px 20px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:34, height:34, borderRadius:10, background:BRAND_GRAD,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:10, fontWeight:900,
          }}>LEM</div>
          <div>
            <p style={{ fontSize:13, fontWeight:800, color:C.text }}>LEM Finance</p>
            <p style={{ fontSize:11, color:C.accent, fontWeight:500 }}>{transactions.length} transactions</p>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:11, color:C.accent, fontWeight:600, marginBottom:2 }}>Total Spent</p>
          <p style={{ fontSize:15, fontWeight:900, color:'#E96B3E' }}>{inrS(spent)}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  FOR YOU TILE
// ─────────────────────────────────────────────────────────
function ForYouTile({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', gap:8,
      padding:'16px 8px 14px', borderRadius:18, cursor:'pointer', border:`1px solid ${C.bdr}`,
      background:C.card, boxShadow:C.shd, transition:'all 0.2s',
    }}
    onMouseDown={e=>e.currentTarget.style.transform='scale(0.96)'}
    onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
      <div style={{ width:38, height:38, borderRadius:11, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', color:C.primary }}>
        <Icon size={20} strokeWidth={1.5}/>
      </div>
      <span style={{ fontSize:10, fontWeight:600, color:C.text, textAlign:'center', lineHeight:1.2 }}>{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────
//  TRANSACTION ROW
// ─────────────────────────────────────────────────────────
function TxRow({ tx, partner, isLast, showMenu, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isExp = tx.type === 'expense';
  const meta  = catFn(tx.cat);
  const Icon = meta.icon;

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', padding:'16px 0', gap:0 }}>
        <div style={{ width:44, flexShrink:0 }}>
          <p style={{ fontSize:10, fontWeight:700, color:C.muted, lineHeight:1.3, textAlign:'left' }}>
            {dShrt(tx.date).split(' ').slice(0,2).join(' ')}
          </p>
        </div>

        <div style={{
          width:4, height:44, borderRadius:999,
          background: partner?.color || C.primary,
          marginRight:14, flexShrink:0,
        }}/>

        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:16, fontWeight:900, color:C.text, letterSpacing:'-0.4px', lineHeight:1 }}>
            {inr(tx.amount)}
          </p>
          <p style={{ fontSize:11, color:C.accent, marginTop:4, fontWeight:500, display:'flex', alignItems:'center', gap:5 }}>
            <Icon size={12}/> {tx.cat}{tx.note ? `  ·  ${tx.note.slice(0,24)}` : ''}
          </p>
        </div>

        <div style={{ flexShrink:0, textAlign:'right', marginLeft:8 }}>
          <p style={{ fontSize:10, fontWeight:800, color: isExp ? '#E96B3E' : C.success }}>
            {isExp ? 'Expense' : 'Invest.'}
          </p>
          {partner && (
            <p style={{ fontSize:9, fontWeight:700, color:partner.color, marginTop:3 }}>{partner.name}</p>
          )}
        </div>

        {showMenu && (
          <div ref={ref} style={{ position:'relative', marginLeft:8, flexShrink:0 }}>
            <button onClick={() => setOpen(v=>!v)} style={{
              width:30, height:30, borderRadius:9, border:'none', background:C.bg,
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.accent,
            }}>
              <MoreVertical size={14}/>
            </button>
            {open && (
              <div className="animate-pop" style={{
                position:'absolute', right:0, top:36, background:C.white,
                borderRadius:14, boxShadow:C.shdM,
                border:`1px solid ${C.bdr}`, overflow:'hidden', width:120, zIndex:40,
              }}>
                <button onClick={() => { setOpen(false); onEdit(tx); }} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:10,
                  padding:'12px 16px', fontSize:12, fontWeight:700, color:C.text,
                  background:'none', border:'none', cursor:'pointer',
                }}>
                  <Edit2 size={13}/> Edit
                </button>
                <div style={{ height:1, background:C.bdr, margin:'0 12px' }}/>
                <button onClick={() => { setOpen(false); onDelete(tx.id); }} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:10,
                  padding:'12px 16px', fontSize:12, fontWeight:700, color:C.danger,
                  background:'none', border:'none', cursor:'pointer',
                }}>
                  <Trash2 size={13}/> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {!isLast && (
        <div style={{ height:1, borderTop:`1px solid ${C.bdr}`, marginLeft:62 }}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  TIMELINE CONTAINER
// ─────────────────────────────────────────────────────────
function Timeline({ txs, partners, showMenu=false, onEdit, onDelete }) {
  if (!txs.length) return (
    <div style={{
      background:C.card, borderRadius:20, padding:'40px 20px',
      display:'flex', flexDirection:'column', alignItems:'center', gap:10, textAlign:'center',
      border:`2px dashed ${C.bdr}`,
    }}>
      <span style={{ fontSize:36 }}>📭</span>
      <p style={{ fontSize:14, fontWeight:800, color:C.text }}>No transactions yet</p>
      <p style={{ fontSize:12, color:C.accent }}>Tap + to add your first entry</p>
    </div>
  );

  return (
    <div style={{
      background:C.card, borderRadius:20, overflow:'hidden',
      border:`1px solid ${C.bdr}`, boxShadow:C.shd,
    }}>
      <div style={{
        background: HERO_BG,
        padding:'14px 20px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <p style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.85)' }}>
          Transaction Activity
        </p>
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:700 }}>{txs.length} entries</span>
      </div>

      <div style={{ padding:'0 20px' }}>
        {txs.map((tx, i) => (
          <TxRow
            key={tx.id}
            tx={tx}
            partner={partners.find(p=>p.id===tx.pid)}
            isLast={i===txs.length-1}
            showMenu={showMenu}
            onEdit={onEdit}
            onDelete={onDelete}/>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  ADD ENTRY MODAL
// ─────────────────────────────────────────────────────────
function AddEntry({ open, close, save, partners, edit }) {
  const [type, setType] = useState('expense');
  const [amt,  setAmt]  = useState('');
  const [pid,  setPid]  = useState(partners[0]?.id||'');
  const [catN, setCatN] = useState(CATEGORIES[0].name);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (edit) { setType(edit.type); setAmt(String(edit.amount)); setPid(edit.pid); setCatN(edit.cat); setDate(edit.date); setNote(edit.note||''); }
    else       { setType('expense'); setAmt(''); setPid(partners[0]?.id||''); setCatN(CATEGORIES[0].name); setDate(new Date().toISOString().split('T')[0]); setNote(''); }
  }, [edit, open]);

  if (!open) return null;
  const ok    = amt && !isNaN(+amt) && +amt>0;
  const isExp = type==='expense';
  const ac    = ok ? (isExp ? '#E03E3E' : C.success) : C.muted;

  return (
    <Sheet close={close}>
      <SheetHeader title={edit ? 'Edit Entry' : 'New Entry'} close={close}/>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, background:C.bg, padding:6, borderRadius:18, marginBottom:24, border:`1px solid ${C.bdr}` }}>
        {[{v:'expense',l:'Expense',I:ArrowUpCircle},{v:'investment',l:'Investment',I:ArrowDownCircle}].map(({v,l,I})=>(
          <button key={v} onClick={()=>setType(v)} style={{
            height:44, borderRadius:12, border:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            fontWeight:700, fontSize:13, cursor:'pointer',
            background: type===v ? C.white : 'transparent',
            color: type===v ? (v==='expense'?'#E03E3E':C.success) : C.accent,
            boxShadow: type===v ? C.shd : 'none', transition:'all 0.2s',
          }}>
            <I size={15}/>{l}
          </button>
        ))}
      </div>

      <Fld label="Amount">
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)', fontSize:24, fontWeight:900, color:ac }}>₹</span>
          <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="0" autoFocus style={{ ...inp, paddingLeft:48, fontSize:32, fontWeight:900, color:ac }}/>
        </div>
      </Fld>

      {partners.length>0 && (
        <Fld label="Partner">
          <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4 }}>
            {partners.map(p=>(
              <button key={p.id} onClick={()=>setPid(p.id)} style={{
                whiteSpace:'nowrap', padding:'10px 18px', borderRadius:14, border:`1px solid ${pid===p.id?p.color:C.bdr}`,
                fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:8,
                background: pid===p.id ? p.color : C.card,
                color: pid===p.id ? '#fff' : C.text,
                boxShadow: pid===p.id ? `0 6px 20px ${p.color}55` : C.shd,
                transition:'all 0.15s',
              }}>
                <span style={{ width:22, height:22, borderRadius:'50%', fontSize:9, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', background:pid===p.id?'rgba(255,255,255,0.25)':p.color, color:'#fff' }}>
                  {p.initials?.[0]}
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </Fld>
      )}

      <Fld label="Category">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {CATEGORIES.map(c=>{
            const sel = catN===c.name;
            const Icon = c.icon;
            return (
              <button key={c.name} onClick={()=>setCatN(c.name)} style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                padding:'12px 6px', borderRadius:14, cursor:'pointer',
                border:sel?`1px solid ${C.primary}`:`1px solid ${C.bdr}`,
                background: sel ? BRAND_GRAD : C.bg,
                boxShadow: sel ? `0 6px 14px rgba(73,80,87,0.25)` : 'none',
                transition:'all 0.15s',
              }}>
                <Icon size={20} color={sel ? '#fff' : C.primary} strokeWidth={1.5}/>
                <span style={{ fontSize:9, fontWeight:700, color:sel ? '#fff' : C.text }}>{c.name}</span>
              </button>
            );
          })}
        </div>
      </Fld>

      <Fld label="Date">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp}/>
      </Fld>
      <Fld label="Note">
        <input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder="Short description…" style={{ ...inp, fontWeight:500 }}/>
      </Fld>

      <button onClick={()=>{ if(!ok) return; save({type,amount:+amt,pid,cat:catN,date,note}); close(); }} disabled={!ok} style={{
        width:'100%', height:52, borderRadius:14, border:'none', cursor:ok?'pointer':'not-allowed',
        background: ok ? (isExp ? 'linear-gradient(135deg,#E03E3E,#B91C1C)' : 'linear-gradient(135deg,#10b981,#059669)') : C.bg,
        color: ok ? '#fff' : C.muted, fontWeight:800, fontSize:15,
        boxShadow: ok ? (isExp?'0 10px 24px rgba(224,62,62,0.3)':'0 10px 24px rgba(16,185,129,0.3)') : 'none',
        transition:'all 0.2s',
      }}>
        {edit ? 'Update' : `Save ${isExp?'Expense':'Investment'}`}
      </button>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────
//  ADD PARTNER MODAL
// ─────────────────────────────────────────────────────────
function AddPartner({ open, close, save, edit, taken }) {
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [color, setColor] = useState(P_COLORS[0]);

  useEffect(() => {
    if (edit) { setName(edit.name); setEmail(edit.email||''); setPhone(edit.phone||''); setColor(edit.color); }
    else { setName(''); setEmail(''); setPhone(''); setColor(P_COLORS.find(c=>!taken.includes(c))||P_COLORS[0]); }
  }, [edit, open]);

  if (!open) return null;
  const ok = !!name.trim();

  return (
    <Sheet close={close}>
      <SheetHeader title={edit?'Edit Partner':'New Partner'} close={close}/>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
        <div style={{ width:80, height:80, borderRadius:24, background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:900, color:'#fff', boxShadow:`0 12px 32px ${color}55`, transition:'all 0.25s' }}>
          {name ? initials(name) : '?'}
        </div>
      </div>
      <Fld label="Color">
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {P_COLORS.map(c=>(
            <button key={c} onClick={()=>setColor(c)} style={{
              width:38, height:38, borderRadius:'50%', background:c, border:'none', cursor:'pointer',
              boxShadow:`0 4px 12px ${c}55`,
              outline:color===c?`3px solid ${c}`:'none', outlineOffset:3,
              transform:color===c?'scale(1.15)':'scale(1)', transition:'all 0.15s',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {color===c && <Check size={14} color="#fff" strokeWidth={3}/>}
            </button>
          ))}
        </div>
      </Fld>
      <Fld label="Full Name *"><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Partner name" style={inp}/></Fld>
      <Fld label="Email"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com" style={{ ...inp, fontWeight:500 }}/></Fld>
      <Fld label="Phone"><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 00000 00000" style={{ ...inp, fontWeight:500 }}/></Fld>
      <button onClick={()=>{ if(!ok) return; save({name:name.trim(),email:email.trim(),phone:phone.trim(),initials:initials(name.trim()),color}); close(); }} disabled={!ok} style={{
        width:'100%', height:52, borderRadius:14, border:'none', cursor:ok?'pointer':'not-allowed',
        background:ok?BRAND_GRAD:C.bg, color:ok?'#fff':C.muted, fontWeight:800, fontSize:15, boxShadow:ok?C.shdM:'none', transition:'all 0.2s',
      }}>
        {edit?'Update Partner':'Add Partner'}
      </button>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────
//  CHIP
// ─────────────────────────────────────────────────────────
function Chip({ on, onClick, children, color }) {
  return (
    <button onClick={onClick} style={{
      padding:'9px 18px', borderRadius:999, fontSize:12, fontWeight:700,
      whiteSpace:'nowrap', cursor:'pointer', border:`1px solid ${on?'transparent':C.bdr}`,
      background: on ? (color||BRAND_GRAD) : C.card,
      color: on ? '#fff' : C.accent,
      boxShadow: on ? C.shdM : C.shd,
      transition:'all 0.15s',
    }}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
//  DASHBOARD VIEW
// ─────────────────────────────────────────────────────────
function Dashboard({ txs, partners, editTx, deleteTx, goTab, onProfile }) {
  const [fp, setFp] = useState('all');
  const you  = partners.find(p=>p.isYou);
  const fTxs = fp==='all' ? txs : txs.filter(t=>t.pid===fp);

  return (
    <div>
      {/* Unified Hero / Bond Card */}
      <BondCard transactions={fTxs} partners={partners} you={you} onProfile={onProfile} />

      <div style={{ background:C.bg, minHeight:'100%' }}>
        <div style={{ padding:'24px 16px 0' }}>
          <SecHdr label="Filter by partner"/>
          <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', marginTop:12, paddingBottom:4 }}>
            <Chip on={fp==='all'} onClick={()=>setFp('all')}>All</Chip>
            {partners.map(p=><Chip key={p.id} on={fp===p.id} onClick={()=>setFp(p.id)} color={p.color}>{p.name}{p.isYou?' (you)':''}</Chip>)}
          </div>
        </div>

        <div style={{ padding:'24px 16px 0' }}>
          <SecHdr label="For You" action="VIEW ALL" onAction={()=>goTab('transactions')}/>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:12 }}>
            {CATEGORIES.map(c=>(
              <ForYouTile key={c.name} icon={c.icon} label={c.name} onClick={()=>goTab('transactions')}/>
            ))}
          </div>
        </div>

        <div style={{ padding:'24px 16px 0' }}>
          <SecHdr label="Recent Activity" action={txs.length>4?"VIEW ALL":null} onAction={()=>goTab('transactions')}/>
          <div style={{ marginTop:12 }}>
            <Timeline txs={fTxs.slice(0,5)} partners={partners} showMenu={false}/>
          </div>
        </div>

        <div style={{ height:48 }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  TRANSACTIONS VIEW
// ─────────────────────────────────────────────────────────
function Transactions({ txs, partners, editTx, deleteTx }) {
  const [q,   setQ]   = useState('');
  const [typ, setTyp] = useState('all');
  const [pp,  setPp]  = useState('all');

  const list = useMemo(()=>txs.filter(t=>{
    const str = q.toLowerCase();
    return (
      (!str || t.cat.toLowerCase().includes(str)||(t.note||'').toLowerCase().includes(str)||(partners.find(p=>p.id===t.pid)?.name||'').toLowerCase().includes(str)) &&
      (typ==='all'||t.type===typ) && (pp==='all'||t.pid===pp)
    );
  }),[txs,q,typ,pp,partners]);

  const inv = list.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
  const exp = list.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);

  return (
    <div>
      <div style={{ background:HERO_BG, paddingBottom:52 }}>
        <div style={{ padding:'20px 20px 0' }}>
          <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>Activity</p>
          <h1 style={{ fontSize:32, fontWeight:900, color:'#fff', letterSpacing:'-1px', lineHeight:1, marginBottom:16 }}>Transactions</h1>
          {list.length>0 && (
            <div style={{ display:'flex', gap:24 }}>
              <div>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Invested</p>
                <p style={{ fontSize:17, fontWeight:900, color:'rgba(255,255,255,0.9)' }}>{inrS(inv)}</p>
              </div>
              <div>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Spent</p>
                <p style={{ fontSize:17, fontWeight:900, color:'#FB7185' }}>{inrS(exp)}</p>
              </div>
              <div>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Count</p>
                <p style={{ fontSize:17, fontWeight:900, color:'rgba(255,255,255,0.6)' }}>{list.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ background:C.bg, marginTop:-28, borderRadius: '28px 28px 0 0' }}>
        <div style={{ padding:'20px 16px 0' }}>
          <div style={{ position:'relative', marginBottom:16 }}>
            <Search size={15} color={C.muted} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
            <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…"
              style={{ ...inp, paddingLeft:40, background:C.card }}/>
            {q && <button onClick={()=>setQ('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', width:24, height:24, borderRadius:'50%', border:'none', background:C.bdr, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={12} color={C.accent}/></button>}
          </div>

          <div className="scrollbar-hide" style={{ display:'flex', gap:8, overflowX:'auto', marginBottom:12 }}>
            {[{v:'all',l:'All'},{v:'expense',l:'Expenses'},{v:'investment',l:'Investments'}].map(({v,l})=>(
              <Chip key={v} on={typ===v} onClick={()=>setTyp(v)}>{l}</Chip>
            ))}
          </div>

          <div className="scrollbar-hide" style={{ display:'flex', gap:8, overflowX:'auto', marginBottom:20 }}>
            <Chip on={pp==='all'} onClick={()=>setPp('all')}>All Partners</Chip>
            {partners.map(p=><Chip key={p.id} on={pp===p.id} onClick={()=>setPp(p.id)} color={p.color}>{p.name}</Chip>)}
          </div>

          <Timeline txs={list} partners={partners} showMenu onEdit={editTx} onDelete={deleteTx}/>
          <div style={{ height:48 }}/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  PARTNERS VIEW
// ─────────────────────────────────────────────────────────
function Partners({ partners, txs, addP, editP, delP }) {
  const [exp, setExp] = useState(null);
  const totInv = txs.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
  const totExp = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);

  return (
    <div>
      <div style={{ background:HERO_BG, paddingBottom:52 }}>
        <div style={{ padding:'20px 20px 0' }}>
          <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>Team</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
            <h1 style={{ fontSize:32, fontWeight:900, color:'#fff', letterSpacing:'-1px', lineHeight:1 }}>Partners</h1>
            <button onClick={addP} style={{
              display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:14,
              background:'rgba(255,255,255,0.15)', color:'#fff', fontWeight:800, fontSize:12, border:'none', cursor:'pointer',
            }}>
              <UserPlus size={14}/> Add
            </button>
          </div>
          <div style={{ display:'flex', gap:28, marginTop:16 }}>
            <div><p style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Partners</p><p style={{ fontSize:17, fontWeight:900, color:'rgba(255,255,255,0.8)' }}>{partners.length}</p></div>
            <div><p style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Invested</p><p style={{ fontSize:17, fontWeight:900, color:'rgba(255,255,255,0.9)' }}>{inrS(totInv)}</p></div>
            <div><p style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Spent</p><p style={{ fontSize:17, fontWeight:900, color:'#FB7185' }}>{inrS(totExp)}</p></div>
          </div>
        </div>
      </div>

      <div style={{ background:C.bg, marginTop:-28, borderRadius: '28px 28px 0 0', padding:'20px 16px 0' }}>
        {!partners.length ? (
          <div style={{ background:C.card, borderRadius:20, padding:'48px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, textAlign:'center', border:`2px dashed ${C.bdr}` }}>
            <span style={{ fontSize:36 }}>👥</span>
            <p style={{ fontSize:14, fontWeight:800, color:C.text }}>No partners yet</p>
          </div>
        ) : partners.map(p => {
          const ptx   = txs.filter(t=>t.pid===p.id);
          const pInv  = ptx.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
          const pExp  = ptx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
          const pBal  = pInv - pExp;
          const burn  = pInv>0 ? Math.round((pExp/pInv)*100) : 0;
          const isExp = exp===p.id;

          return (
            <div key={p.id} style={{ background:C.card, borderRadius:20, marginBottom:16, overflow:'hidden', border:`1px solid ${C.bdr}`, boxShadow:C.shd }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 18px', borderBottom:`1px solid ${C.bdr}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:50, height:50, borderRadius:16, background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:'#fff', boxShadow:`0 6px 18px ${p.color}45` }}>
                    {p.initials}
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <p style={{ fontSize:16, fontWeight:900, color:C.text }}>{p.name}</p>
                      {p.isYou && <span style={{ fontSize:9, fontWeight:900, padding:'2px 8px', borderRadius:6, background:`${p.color}18`, color:p.color, letterSpacing:'0.1em' }}>YOU</span>}
                    </div>
                    {p.email && <p style={{ fontSize:11, color:C.accent }}>{p.email}</p>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>editP(p)} style={{ width:34, height:34, borderRadius:10, border:`1px solid ${C.bdr}`, background:C.bg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.accent }}>
                    <Edit2 size={13}/>
                  </button>
                  {!p.isYou && <button onClick={()=>delP(p.id)} style={{ width:34, height:34, borderRadius:10, border:'1px solid rgba(239,68,68,0.2)', background:'#FFF5F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.danger }}>
                    <Trash2 size={13}/>
                  </button>}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:`1px solid ${C.bdr}` }}>
                {[{l:'Invested',v:pInv,c:C.success},{l:'Spent',v:pExp,c:'#E96B3E'}].map(({l,v,c})=>(
                  <div key={l} style={{ padding:'16px 18px' }}>
                    <p style={{ fontSize:9, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.muted, marginBottom:8 }}>{l}</p>
                    <p style={{ fontSize:24, fontWeight:900, color:c, letterSpacing:'-0.5px' }}>{inr(v)}</p>
                  </div>
                ))}
              </div>

              <div style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div>
                    <p style={{ fontSize:9, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.muted, marginBottom:4 }}>Net Balance</p>
                    <p style={{ fontSize:20, fontWeight:900, color:pBal>=0?C.text:C.danger }}>{inr(pBal)}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:9, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.muted, marginBottom:4 }}>Burn Rate</p>
                    <p style={{ fontSize:20, fontWeight:900, color:burn>80?C.danger:burn>50?'#F59E0B':C.text }}>{burn}%</p>
                  </div>
                </div>
                {pInv>0 && (
                  <div>
                    <div style={{ width:'100%', height:5, borderRadius:999, background:C.bg, overflow:'hidden' }}>
                      <div style={{ width:`${Math.min(burn,100)}%`, height:'100%', borderRadius:999, background:p.color, transition:'width 0.7s' }}/>
                    </div>
                    <p style={{ fontSize:10, color:C.accent, marginTop:6, fontWeight:600 }}>{burn}% used</p>
                  </div>
                )}
              </div>

              {ptx.length>0 && (
                <button onClick={()=>setExp(isExp?null:p.id)} style={{
                  width:'100%', padding:'14px 18px', border:'none', cursor:'pointer',
                  borderTop:`1px solid ${C.bdr}`, background:HERO_BG,
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.8)',
                }}>
                  <span>View transactions</span>
                  <ChevronDown size={15} style={{ transform:isExp?'rotate(180deg)':'rotate(0deg)', transition:'0.2s' }}/>
                </button>
              )}

              {isExp && (
                <div className="animate-fade-in" style={{ borderTop:`1px solid ${C.bdr}` }}>
                  <div style={{ padding:'0 18px 18px' }}>
                    {ptx.slice(0,4).map((t,i,arr)=>(
                      <TxRow key={t.id} tx={t} partner={p} isLast={i===arr.length-1||i===3} showMenu={false}/>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ height:48 }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  REPORTS VIEW & EXPORT LOGIC
// ─────────────────────────────────────────────────────────
function Reports({ txs, partners }) {
  const [sp, setSp] = useState('all');
  const ft   = sp==='all' ? txs : txs.filter(t=>t.pid===sp);
  const inv  = ft.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
  const exp  = ft.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const bal  = inv - exp;

  const catD = useMemo(()=>
    Object.entries(ft.filter(t=>t.type==='expense').reduce((m,t)=>{ m[t.cat]=(m[t.cat]||0)+t.amount; return m; },{}))
    .map(([n,v])=>({n,v,...catFn(n)})).sort((a,b)=>b.v-a.v)
  ,[sp,txs]);

  const trend = useMemo(()=>MONTHS.slice().reverse().map((m,i)=>({
    m:m.slice(0,3),
    inv: Math.round(inv*(i===5?1:0.2+i*0.16)),
    exp: Math.round(exp*(i===5?1:0.18+i*0.14)),
  })),[inv,exp]);

  const exportPDF = () => {
    if (!txs.length) return;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setTextColor(33,37,41);
    doc.text('LEM Financial Report', 14, 22);
    doc.setFontSize(10); doc.setTextColor(107,114,128);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);
    doc.setFontSize(12); doc.setTextColor(33,37,41);
    doc.text(`Total Received: ${inr(inv)}`, 14, 42);
    doc.text(`Total Expenses: ${inr(exp)}`, 14, 48);
    doc.text(`Final Balance: ${inr(bal)}`, 14, 54);
    let y = 64;
    partners.forEach(p => {
      const ptx = txs.filter(t=>t.pid===p.id);
      const pinv = ptx.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
      const pexp = ptx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
      doc.setFontSize(10);
      doc.text(`${p.name}: Invested ${inr(pinv)}  |  Spent ${inr(pexp)}`, 14, y);
      y += 6;
    });
    const sorted = [...txs].sort((a,b) => new Date(a.date) - new Date(b.date));
    let runBal = 0;
    const tableData = sorted.map(t => {
      const isInv = t.type === 'investment';
      const rec = isInv ? t.amount : 0;
      const ex = !isInv ? t.amount : 0;
      runBal += (rec - ex);
      return [dShrt(t.date), `${t.cat}${t.note ? ' - ' + t.note : ''}`, partners.find(p=>p.id===t.pid)?.name||'Unknown', rec>0?inr(rec):'-', ex>0?inr(ex):'-', inr(runBal)];
    });
    doc.autoTable({ startY: y+8, head:[['Date','Field / Description','Partner','Received','Expense','Balance']], body:tableData, theme:'striped', headStyles:{fillColor:[73,80,87]}, styles:{fontSize:9}, margin:{top:20} });
    const pageCount = doc.internal.getNumberOfPages();
    for(let i=1;i<=pageCount;i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150); doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width/2, doc.internal.pageSize.height-10, {align:'center'}); }
    doc.save('LEM_Financial_Report.pdf');
  };

  const exportExcel = () => {
    if (!txs.length) return;
    const sorted = [...txs].sort((a,b) => new Date(a.date) - new Date(b.date));
    let runBal = 0;
    const rows = sorted.map(t => {
      const isInv = t.type === 'investment';
      const rec = isInv ? t.amount : 0;
      const ex = !isInv ? t.amount : 0;
      runBal += (rec - ex);
      return { 'Date':dShrt(t.date), 'Field / Description':`${t.cat}${t.note?' - '+t.note:''}`, 'Partner Name':partners.find(p=>p.id===t.pid)?.name||'Unknown', 'Amount Received':rec>0?rec:0, 'Expense':ex>0?ex:0, 'Balance':runBal };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const summaryRows = [{ Metric:'Total Amount Received', Value:inv },{ Metric:'Total Expenses', Value:exp },{ Metric:'Final Balance', Value:bal },{}];
    partners.forEach(p => {
      const ptx = txs.filter(t=>t.pid===p.id);
      const pinv = ptx.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
      const pexp = ptx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
      summaryRows.push({Metric:`${p.name} - Total Invested`,Value:pinv});
      summaryRows.push({Metric:`${p.name} - Total Spent`,Value:pexp});
    });
    const wsSum = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSum, "Summary");
    XLSX.writeFile(wb, "LEM_Financial_Report.xlsx");
  };

  return (
    <div>
      <div style={{ background:HERO_BG, paddingBottom:52 }}>
        <div style={{ padding:'20px 20px 0' }}>
          <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>Overview</p>
          <h1 style={{ fontSize:32, fontWeight:900, color:'#fff', letterSpacing:'-1px', lineHeight:1, marginBottom:16 }}>Reports</h1>
          <div className="scrollbar-hide" style={{ display:'flex', gap:8, overflowX:'auto' }}>
            {[{id:'all',name:'All',color:C.primary},...partners].map(p=>(
              <button key={p.id} onClick={()=>setSp(p.id)} style={{
                padding:'8px 18px', borderRadius:999, fontSize:12, fontWeight:700, border:'none',
                background: sp===p.id?C.card:'rgba(255,255,255,0.12)', color:sp===p.id?C.text:'rgba(255,255,255,0.6)',
                cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s',
              }}>{p.name}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:C.bg, marginTop:-28, borderRadius: '28px 28px 0 0', padding:'20px 16px 0' }}>
        <div style={{ background:HERO_BG, borderRadius:20, padding:'22px 20px', marginBottom:16, boxShadow:'0 12px 32px rgba(0,0,0,0.12)' }}>
          <p style={{ fontSize:9, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:10 }}>Net Balance</p>
          <p style={{ fontSize:40, fontWeight:900, color:bal>=0?'#fff':C.danger, letterSpacing:'-2px', lineHeight:1, marginBottom:16 }}>{inr(bal)}</p>
          <div style={{ display:'flex', gap:28 }}>
            <div><p style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Invested</p><p style={{ fontSize:15, fontWeight:900, color:C.success }}>{inr(inv)}</p></div>
            <div><p style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Spent</p><p style={{ fontSize:15, fontWeight:900, color:'#FB7185' }}>{inr(exp)}</p></div>
          </div>
        </div>

        {(inv>0||exp>0) && (
          <div style={{ background:C.card, borderRadius:20, padding:'20px', marginBottom:16, border:`1px solid ${C.bdr}`, boxShadow:C.shd }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <p style={{ fontSize:11, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.accent }}>6-Month Trend</p>
              <TrendingUp size={14} color={C.muted}/>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.success} stopOpacity={0.2}/><stop offset="100%" stopColor={C.success} stopOpacity={0}/></linearGradient>
                  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.primary} stopOpacity={0.2}/><stop offset="100%" stopColor={C.primary} stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false}/>
                <XAxis dataKey="m" tick={{ fontSize:9, fill:C.muted }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:C.text, border:'none', borderRadius:10, color:'#fff', fontSize:11 }}/>
                <Area type="monotone" dataKey="inv" stroke={C.success} fill="url(#gi)" strokeWidth={2} name="Invested" dot={false}/>
                <Area type="monotone" dataKey="exp" stroke={C.primary} fill="url(#gs)" strokeWidth={2} name="Spent" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {catD.length>0 && (
          <div style={{ background:C.card, borderRadius:20, padding:'20px', marginBottom:16, border:`1px solid ${C.bdr}`, boxShadow:C.shd }}>
            <p style={{ fontSize:11, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.accent, marginBottom:14 }}>Expense Breakdown</p>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <ResponsiveContainer width={88} height={88}>
                <PieChartComp>
                  <Pie data={catD} cx="50%" cy="50%" innerRadius={22} outerRadius={42} dataKey="v" strokeWidth={2} stroke={C.white}>
                    {catD.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                </PieChartComp>
              </ResponsiveContainer>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                {catD.slice(0,5).map(c=>{
                  const Icon = c.icon;
                  return (
                  <div key={c.n} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:c.color, flexShrink:0 }}/>
                    <span style={{ fontSize:12, fontWeight:700, color:C.text, flex:1, display:'flex', alignItems:'center', gap:6 }}>
                      <Icon size={12}/> {c.n}
                    </span>
                    <span style={{ fontSize:12, fontWeight:900, color:C.text }}>{inrS(c.v)}</span>
                  </div>
                )})}
              </div>
            </div>
          </div>
        )}

        <div style={{ background:C.card, borderRadius:20, padding:'20px', marginBottom:16, border:`1px solid ${C.bdr}`, boxShadow:C.shd }}>
          <p style={{ fontSize:11, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.accent, marginBottom:14 }}>Summary</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              {e:<BarChart3 size={22} color={C.primary}/>,l:'Transactions',v:String(txs.length),c:C.primary},
              {e:<Users2 size={22} color="#3b82f6"/>,l:'Partners',v:String(partners.length),c:'#3b82f6'},
              {e:<TrendingUp size={22} color={C.accent}/>,l:'Avg Entry',c:C.accent,v:txs.length?inrS(txs.reduce((s,t)=>s+t.amount,0)/txs.length):'₹0'},
              {e:<Zap size={22} color="#E96B3E"/>,l:'Burn Rate',c:'#E96B3E',v:inv>0?`${Math.round((exp/inv)*100)}%`:'0%'},
            ].map(s=>(
              <div key={s.l} style={{ background:C.bg, borderRadius:14, padding:'16px', border:`1px solid ${C.bdr}` }}>
                <span style={{ display:'block', marginBottom:8 }}>{s.e}</span>
                <p style={{ fontSize:20, fontWeight:900, color:s.c, letterSpacing:'-0.5px' }}>{s.v}</p>
                <p style={{ fontSize:9, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:C.muted, marginTop:4 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <p style={{ fontSize:11, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.accent, marginBottom:12 }}>Export Detailed Report</p>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={exportExcel} style={{
              flex:1, height:50, borderRadius:14, border:`1px solid ${C.bdr}`, cursor:'pointer',
              background:C.card, color:C.text, fontWeight:800, fontSize:13,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              boxShadow:C.shd, transition:'all 0.2s'
            }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(0.96)'}
            onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
              <FileSpreadsheet size={16}/> Excel
            </button>
            <button onClick={exportPDF} style={{
              flex:1, height:50, borderRadius:14, border:'none', cursor:'pointer',
              background:BRAND_GRAD, color:'#fff',
              fontWeight:800, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              boxShadow:`0 6px 20px rgba(73,80,87,0.3)`, transition:'all 0.2s'
            }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(0.96)'}
            onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
              <FileText size={16}/> PDF
            </button>
          </div>
        </div>
        <div style={{ height:48 }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  APP ROOT
// ─────────────────────────────────────────────────────────
export default function App() {
  const saved = load();
  const [isLogged,  setIsLogged]  = useState(false);
  const [tab,       setTab]       = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [txs,   setTxs]   = useState(saved?.txs   || TX_INIT);
  const [parts, setParts] = useState(saved?.parts  || PARTNERS_INIT);
  const [addTx,  setAddTx]  = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [addP,   setAddP]   = useState(false);
  const [editP,  setEditP]  = useState(null);
  const [confirm, setConf]  = useState(null);
  const [toast,   setToast] = useState(null);

  useEffect(() => { save({ txs, parts }); }, [txs, parts]);

  const toast$ = (msg,type='ok') => setToast({msg,type});

  const saveTx = (d) => {
    if (editTx) { setTxs(p=>p.map(t=>t.id===editTx.id?{...t,...d}:t)); toast$('Updated!'); }
    else        { setTxs(p=>[{id:Date.now().toString(),...d},...p]); toast$(d.type==='expense'?'Expense added!':'Investment saved!'); }
    setEditTx(null);
  };
  const doEditTx  = (tx) => { setEditTx(tx); setAddTx(true); };
  const doDelTx   = (id) => setConf({ title:'Delete Entry', body:'This transaction will be permanently removed.', ok:()=>{ setTxs(p=>p.filter(t=>t.id!==id)); toast$('Deleted','err'); setConf(null); } });

  const saveP = (d) => {
    if (editP) { setParts(p=>p.map(x=>x.id===editP.id?{...x,...d}:x)); toast$('Partner updated!'); }
    else       { setParts(p=>[...p,{id:Date.now().toString(),isYou:false,...d}]); toast$('Partner added!'); }
    setEditP(null);
  };
  const doEditP = (p) => { setEditP(p); setAddP(true); };
  const doDelP  = (id) => setConf({ title:'Remove Partner', body:'This partner will be removed from the list.', ok:()=>{ setParts(p=>p.filter(x=>x.id!==id)); toast$('Removed','err'); setConf(null); } });

  const closeAddTx = () => { setAddTx(false); setEditTx(null); };
  const closeAddP  = () => { setAddP(false); setEditP(null); };

  if (!isLogged) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100dvh', background:C.bg, fontFamily:'Inter,system-ui,sans-serif' }}>
        <div style={{ width:'100%', maxWidth:430, height:'100dvh', overflow:'hidden' }}>
          <Login onLogin={() => setIsLogged(true)}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display:'flex', justifyContent:'center', alignItems:'center',
      minHeight:'100dvh', background:C.bg,
      fontFamily:'Inter,system-ui,sans-serif',
    }}>
      {toast && <Toast msg={toast.msg} type={toast.type} done={()=>setToast(null)}/>}
      {confirm && <Confirm title={confirm.title} body={confirm.body} ok={confirm.ok} cancel={()=>setConf(null)}/>}

      <div style={{
        width:'100%', maxWidth:430, height:'100dvh',
        display:'flex', flexDirection:'column',
        position:'relative', overflow:'hidden',
        background:C.bg,
      }}>
        <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', paddingBottom: 100 }}>
          {showProfile ? (
            <ProfilePage
              partner={parts.find(p=>p.isYou)}
              onLogout={() => { setIsLogged(false); setShowProfile(false); setTab('dashboard'); }}
              onBack={() => setShowProfile(false)}
            />
          ) : (
            <>
              {tab==='dashboard'    && <Dashboard txs={txs} partners={parts} editTx={doEditTx} deleteTx={doDelTx} goTab={setTab} onProfile={() => setShowProfile(true)}/>}
              {tab==='transactions' && <Transactions txs={txs} partners={parts} editTx={doEditTx} deleteTx={doDelTx}/>}
              {tab==='partners'     && <Partners partners={parts} txs={txs} addP={()=>{ setEditP(null); setAddP(true); }} editP={doEditP} delP={doDelP}/>}
              {tab==='reports'      && <Reports txs={txs} partners={parts}/>}
            </>
          )}
        </div>

        {!showProfile && (
          <FloatingNav active={tab} set={setTab} onAdd={()=>{ setEditTx(null); setAddTx(true); }}/>
        )}

        <AddEntry open={addTx} close={closeAddTx} save={saveTx} partners={parts} edit={editTx}/>
        <AddPartner open={addP} close={closeAddP} save={saveP} edit={editP} taken={parts.filter(p=>p.id!==editP?.id).map(p=>p.color)}/>
      </div>
    </div>
  );
}
