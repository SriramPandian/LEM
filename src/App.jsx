import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutDashboard, ArrowLeftRight, Users2, BarChart3,
  Plus, X, ArrowUpCircle, ArrowDownCircle, Search, Edit2,
  ChevronRight, ChevronDown, Trash2, Check, Sparkles,
  TrendingUp, MoreVertical, Printer, Download,
  AlertCircle, CheckCircle2, Info, UserPlus,
  Building2, Banknote, Plane, Megaphone, Monitor, Zap, Coffee, Package,
  FileSpreadsheet, FileText
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
//  DESIGN TOKENS  (Refined Premium Dark Purple/Black & Grayscale)
// ─────────────────────────────────────────────────────────
const C = {
  snow:   '#f8f9fa',
  plat:   '#e9ecef',
  alab:   '#dee2e6',
  pale:   '#adb5bd',
  slate:  '#6c757d',
  iron:   '#495057',
  gun:    '#343a40',
  carbon: '#212529',
  white:  '#ffffff',
  
  lightBg: '#f4f5f7',
  
  priText: '#111827',
  secText: '#4b5563',
  mutText: '#9ca3af',
  
  bdr:  'rgba(0,0,0,0.06)',
  shd:  '0 4px 20px rgba(0,0,0,0.03)',
  shdM: '0 12px 32px rgba(0,0,0,0.06)',
};

// Rich Dark Purple / Black Gradients
const HERO_BG    = `linear-gradient(160deg, #09090b 0%, #130e24 50%, #1d1438 100%)`;
const BRAND_GRAD = `linear-gradient(135deg, #3b286d 0%, #171026 100%)`;
const BOND_BG    = `linear-gradient(135deg, #1d1438 0%, #09090b 100%)`;

// ─────────────────────────────────────────────────────────
//  CATEGORIES & DATA (Untouched Content)
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

const LS = 'lem_v6';
const load = () => { try { const d = localStorage.getItem(LS); return d ? JSON.parse(d) : null; } catch { return null; } };
const save = (d) => { try { localStorage.setItem(LS, JSON.stringify(d)); } catch {} };

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
const inr   = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const inrS  = (n) => { if (n>=10000000) return `₹${(n/10000000).toFixed(1)}Cr`; if (n>=100000) return `₹${(n/100000).toFixed(1)}L`; if (n>=1000) return `₹${(n/1000).toFixed(1)}k`; return inr(n); };
const dShrt = (iso) => new Date(iso).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' });
const cat   = (n)  => CATEGORIES.find(c => c.name===n) || CATEGORIES[7];
const initials = (n) => n.trim().split(' ').filter(Boolean).map(w=>w[0]).join('').toUpperCase().slice(0,2);

// ─────────────────────────────────────────────────────────
//  TOAST & CONFIRM & MODALS
// ─────────────────────────────────────────────────────────
function Toast({ msg, type='ok', done }) {
  useEffect(() => { const t = setTimeout(done, 2600); return () => clearTimeout(t); }, [done]);
  const bg = type==='ok' ? '#10b981' : type==='err' ? '#ef4444' : C.carbon;
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
      <div className="animate-fade-in" onClick={cancel} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)' }}/>
      <div className="animate-slide-up" style={{
        position:'relative', background:C.white, width:'100%', maxWidth:430,
        borderRadius:'32px 32px 0 0', padding:'32px 24px 44px',
        boxShadow:'0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{ width:48, height:48, borderRadius:16, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
          <AlertCircle size={24} color="#EF4444"/>
        </div>
        <p style={{ fontSize:18, fontWeight:800, color:C.priText, marginBottom:8 }}>{title}</p>
        <p style={{ fontSize:14, color:C.secText, lineHeight:1.6, marginBottom:32 }}>{body}</p>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={cancel} style={{ flex:1, height:52, borderRadius:16, border:`1px solid ${C.bdr}`, background:C.snow, color:C.secText, fontWeight:700, fontSize:14, cursor:'pointer' }}>Cancel</button>
          <button onClick={ok} style={{ flex:1, height:52, borderRadius:16, border:'none', background:'#EF4444', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', boxShadow:'0 6px 18px rgba(239,68,68,0.25)' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Sheet({ close, children }) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:90, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div className="animate-fade-in" onClick={close} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)' }}/>
      <div className="animate-slide-up" style={{
        position:'relative', background:C.white, width:'100%', borderRadius:'32px 32px 0 0',
        maxHeight:'93dvh', display:'flex', flexDirection:'column',
        boxShadow:'0 -8px 48px rgba(0,0,0,0.2)',
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
      <p style={{ fontSize:20, fontWeight:900, color:C.priText, letterSpacing:'-0.4px' }}>{title}</p>
      <button onClick={close} style={{
        width:36, height:36, borderRadius:12, border:`1px solid ${C.bdr}`, background:C.snow,
        display:'flex', alignItems:'center', justifyContent:'center', color:C.secText, cursor:'pointer',
      }}>
        <X size={16}/>
      </button>
    </div>
  );
}

function Fld({ label, children }) {
  return (
    <div style={{ marginBottom:24 }}>
      <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.mutText, marginBottom:10 }}>{label}</p>
      {children}
    </div>
  );
}

const inp = { width:'100%', padding:'16px 18px', borderRadius:16, fontSize:15, fontWeight:600, border:`1px solid ${C.bdr}`, background:C.snow, color:C.priText, outline:'none', boxSizing:'border-box', transition: 'border-color 0.2s' };

// ─────────────────────────────────────────────────────────
//  LOGIN PAGE
// ─────────────────────────────────────────────────────────
function Login({ onLogin }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', background: C.lightBg, padding: 24, color: C.carbon
    }}>
      <div style={{
        background: C.white, padding: '48px 32px', borderRadius: 32, width: '100%', maxWidth: 400,
        boxShadow: C.shdM, textAlign: 'center', border: `1px solid ${C.bdr}`
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, background: BRAND_GRAD,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.snow,
          fontSize: 26, fontWeight: 900, margin: '0 auto 28px',
          boxShadow: `0 16px 32px rgba(23, 16, 38, 0.25)`
        }}>LEM</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10, color: C.priText, letterSpacing: '-0.5px' }}>Welcome Back</h1>
        <p style={{ fontSize: 14, color: C.secText, marginBottom: 36, lineHeight: 1.6 }}>Manage your business expenses and investments seamlessly.</p>
        
        <input type="email" placeholder="Email address" style={{...inp, marginBottom: 16}} />
        <input type="password" placeholder="Password" style={{...inp, marginBottom: 28}} />
        
        <button style={{
          width: '100%', padding: '18px', borderRadius: 16, background: C.priText, color: C.snow,
          fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 16,
          boxShadow: '0 8px 24px rgba(17, 24, 39, 0.2)', transition: 'transform 0.1s'
        }}
        onMouseDown={e=>e.currentTarget.style.transform='scale(0.98)'}
        onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
          Sign In
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: C.bdr }} />
          <span style={{ fontSize: 11, color: C.mutText, fontWeight: 800, letterSpacing: '0.1em' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: C.bdr }} />
        </div>
        
        <button onClick={onLogin} style={{
          width: '100%', padding: '18px', borderRadius: 16, background: C.snow, color: C.priText, border: `1px solid ${C.bdr}`,
          fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s'
        }}>
          Continue without logging in
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  FLOATING GLASSMORPHISM NAV (Untouched Design)
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
      position:'absolute', bottom: 24, left:'50%', transform:'translateX(-50%)',
      width:'calc(100% - 48px)', maxWidth:380,
      background:'rgba(255, 255, 255, 0.85)',
      backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
      borderRadius:32, display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'8px 12px', zIndex:50,
      boxShadow:'0 20px 40px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.5)',
      border: `1px solid ${C.bdr}`
    }}>
      {items.map(it => {
        if (it.isFab) {
          return (
            <button key={it.id} onClick={onAdd} style={{
              width: 56, height: 56, borderRadius: 28,
              background: `linear-gradient(135deg, ${C.carbon}, ${C.gun})`, border: `3px solid ${C.white}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.white, cursor: 'pointer',
              boxShadow: `0 12px 28px rgba(33, 37, 41, 0.35)`,
              transform: 'translateY(-22px)',
              flexShrink: 0, transition: 'transform 0.2s',
            }}
            onMouseDown={e=>e.currentTarget.style.transform='translateY(-20px) scale(0.95)'}
            onMouseUp={e=>e.currentTarget.style.transform='translateY(-22px) scale(1)'}>
              {React.cloneElement(it.icon, { size: 26, strokeWidth: 3 })}
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
              size: 20,
              strokeWidth: on ? 2.5 : 1.5,
              color: on ? C.carbon : C.pale,
            })}
            <span style={{
              fontSize:9, fontWeight: on ? 800 : 600, letterSpacing:'0.02em',
              color: on ? C.carbon : C.pale,
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
      <p style={{ fontSize:12, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.secText }}>{label}</p>
      {action && (
        <button onClick={onAction} style={{ fontSize:11, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:C.priText, background:'none', border:'none', cursor:'pointer' }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  BOND-STYLE FEATURE CARD
// ─────────────────────────────────────────────────────────
function BondCard({ transactions, partners }) {
  const inv   = transactions.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
  const spent = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const bal   = inv - spent;
  const burn  = inv > 0 ? Math.round((spent/inv)*100) : 0;

  return (
    <div style={{ borderRadius:24, overflow:'hidden', background:C.carbon, boxShadow:C.shdM, border: `1px solid rgba(0,0,0,0.08)` }}>
      <div style={{ position:'relative', overflow:'hidden', height:170 }}>
        <div style={{ position:'absolute', inset:0, background:BOND_BG }}/>
        <div style={{ position:'absolute', right:-60, top:-60, width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.03)', filter:'blur(40px)' }}/>
        <div style={{ position:'absolute', left:-40, bottom:-40, width:200, height:200, borderRadius:'50%', background:'rgba(0,0,0,0.4)', filter:'blur(30px)' }}/>
        <div style={{ position:'absolute', inset:0, boxShadow:'inset 0 1px 1px rgba(255,255,255,0.1)' }}/>

        <div style={{ position:'absolute', inset:0, padding:'20px 22px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{
            display:'inline-flex', alignItems:'center',
            background:'rgba(255,255,255,0.1)', padding:'6px 14px', borderRadius:10, alignSelf:'flex-start',
            backdropFilter:'blur(12px)', border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.08em', color:'#fff' }}>
              {burn}% BURNED
            </span>
          </div>

          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <p style={{ fontSize:52, fontWeight:900, color:'#fff', letterSpacing:'-2.5px', lineHeight:1, textShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>
                {inrS(bal)}
              </p>
              {inv > 0 && (
                <div>
                  <p style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.8)', lineHeight:1.3 }}>{inrS(inv)}</p>
                  <p style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>invested</p>
                </div>
              )}
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:6, fontWeight:500 }}>
              Net Balance · {new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'})}
            </p>
          </div>
        </div>
      </div>

      <div style={{
        background:C.white, padding:'16px 22px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{
            width:38, height:38, borderRadius:12, background:BRAND_GRAD,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:11, fontWeight:900, letterSpacing:'0.04em',
            boxShadow:`0 6px 16px rgba(23, 16, 38, 0.2)`,
          }}>LEM</div>
          <div>
            <p style={{ fontSize:14, fontWeight:800, color:C.priText, letterSpacing:'-0.2px' }}>LEM Finance</p>
            <p style={{ fontSize:11, color:C.secText, fontWeight:500 }}>{transactions.length} transactions</p>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:11, color:C.secText, fontWeight:600, marginBottom:2 }}>Spent</p>
          <p style={{ fontSize:15, fontWeight:900, color:'#E96B3E', letterSpacing:'-0.5px' }}>{inrS(spent)}</p>
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
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', gap:10,
      padding:'20px 8px 16px', borderRadius:20, cursor:'pointer', border:`1px solid ${C.bdr}`,
      background:C.white,
      boxShadow:C.shd,
      transition: 'all 0.2s',
    }}
    onMouseDown={e=>e.currentTarget.style.transform='scale(0.96)'}
    onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
    onTouchStart={e=>e.currentTarget.style.transform='scale(0.96)'}
    onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: C.snow, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.priText }}>
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <span style={{ fontSize:11, fontWeight:600, color:C.priText, textAlign:'center', lineHeight:1.2 }}>{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────
//  PORTFOLIO TIMELINE ROW
// ─────────────────────────────────────────────────────────
function TxRow({ tx, partner, isLast, showMenu, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isExp = tx.type === 'expense';
  const meta  = cat(tx.cat);
  const Icon = meta.icon;

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', padding:'18px 0', gap:0 }}>
        <div style={{ width:48, flexShrink:0 }}>
          <p style={{ fontSize:11, fontWeight:700, color:C.mutText, lineHeight:1.3, textAlign:'left' }}>
            {dShrt(tx.date).split(' ').slice(0,2).join(' ')}
          </p>
        </div>

        <div style={{
          width:4, height:48, borderRadius:999,
          background: partner?.color || C.iron,
          marginRight:16, flexShrink:0,
        }}/>

        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:18, fontWeight:900, color:C.priText, letterSpacing:'-0.5px', lineHeight:1 }}>
            {inr(tx.amount)}
          </p>
          <p style={{ fontSize:12, color:C.secText, marginTop:6, fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>
            <Icon size={14} /> {tx.cat}{tx.note ? `  ·  ${tx.note.slice(0,24)}` : ''}
          </p>
        </div>

        <div style={{ flexShrink:0, textAlign:'right', marginLeft:10 }}>
          <p style={{
            fontSize:11, fontWeight:800, letterSpacing:'0.04em',
            color: isExp ? '#E96B3E' : '#10b981',
          }}>
            {isExp ? 'Expense' : 'Invest.'}
          </p>
          {partner && (
            <p style={{ fontSize:10, fontWeight:700, color:partner.color, marginTop:4 }}>{partner.name}</p>
          )}
        </div>

        {showMenu && (
          <div ref={ref} style={{ position:'relative', marginLeft:10, flexShrink:0 }}>
            <button onClick={() => setOpen(v=>!v)} style={{
              width:32, height:32, borderRadius:10, border:'none', background:C.snow,
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.secText,
            }}>
              <MoreVertical size={16}/>
            </button>
            {open && (
              <div className="animate-pop" style={{
                position:'absolute', right:0, top:38, background:C.white,
                borderRadius:16, boxShadow:C.shdM,
                border:`1px solid ${C.bdr}`, overflow:'hidden', width:130, zIndex:40,
              }}>
                <button onClick={() => { setOpen(false); onEdit(tx); }} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:12,
                  padding:'14px 18px', fontSize:13, fontWeight:700, color:C.priText,
                  background:'none', border:'none', cursor:'pointer',
                }}>
                  <Edit2 size={14}/> Edit
                </button>
                <div style={{ height:1, background:C.bdr, margin:'0 14px' }}/>
                <button onClick={() => { setOpen(false); onDelete(tx.id); }} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:12,
                  padding:'14px 18px', fontSize:13, fontWeight:700, color:'#EF4444',
                  background:'none', border:'none', cursor:'pointer',
                }}>
                  <Trash2 size={14}/> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {!isLast && (
        <div style={{ height:1, borderTop:`1px solid ${C.bdr}`, marginLeft:68 }}/>
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
      background:C.white, borderRadius:24, padding:'48px 20px',
      display:'flex', flexDirection:'column', alignItems:'center', gap:10, textAlign:'center',
      border:`2px dashed ${C.bdr}`,
    }}>
      <span style={{ fontSize:40 }}>📭</span>
      <p style={{ fontSize:15, fontWeight:800, color:C.priText }}>No transactions yet</p>
      <p style={{ fontSize:13, color:C.secText }}>Tap + to add your first entry</p>
    </div>
  );

  return (
    <div style={{
      background:C.white, borderRadius:24, overflow:'hidden',
      border:`1px solid ${C.bdr}`, boxShadow:C.shd,
    }}>
      <div style={{
        background:HERO_BG,
        padding:'18px 22px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <p style={{ fontSize:13, fontWeight:800, color:'rgba(255,255,255,0.9)', letterSpacing:'-0.1px' }}>
          Transaction Activity
        </p>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:700 }}>{txs.length} entries</span>
      </div>

      <div style={{ padding:'0 22px' }}>
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
  const [type, setType]     = useState('expense');
  const [amt,  setAmt]      = useState('');
  const [pid,  setPid]      = useState(partners[0]?.id||'');
  const [catN, setCatN]     = useState(CATEGORIES[0].name);
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote]     = useState('');

  useEffect(() => {
    if (edit) { setType(edit.type); setAmt(String(edit.amount)); setPid(edit.pid); setCatN(edit.cat); setDate(edit.date); setNote(edit.note||''); }
    else       { setType('expense'); setAmt(''); setPid(partners[0]?.id||''); setCatN(CATEGORIES[0].name); setDate(new Date().toISOString().split('T')[0]); setNote(''); }
  }, [edit, open]);

  if (!open) return null;
  const ok    = amt && !isNaN(+amt) && +amt>0;
  const isExp = type==='expense';
  const ac    = ok ? (isExp ? '#E03E3E' : '#10b981') : C.mutText;

  return (
    <Sheet close={close}>
      <SheetHeader title={edit ? 'Edit Entry' : 'New Entry'} close={close}/>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, background:C.snow, padding:6, borderRadius:20, marginBottom:28, border:`1px solid ${C.bdr}` }}>
        {[{v:'expense',l:'Expense',I:ArrowUpCircle},{v:'investment',l:'Investment',I:ArrowDownCircle}].map(({v,l,I})=>(
          <button key={v} onClick={()=>setType(v)} style={{
            height:48, borderRadius:14, border:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            fontWeight:700, fontSize:14, cursor:'pointer',
            background: type===v ? C.white : 'transparent',
            color: type===v ? (v==='expense'?'#E03E3E':'#10b981') : C.secText,
            boxShadow: type===v ? C.shd : 'none', transition:'all 0.2s',
          }}>
            <I size={16}/>{l}
          </button>
        ))}
      </div>

      <Fld label="Amount">
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:20, top:'50%', transform:'translateY(-50%)', fontSize:28, fontWeight:900, color:ac }}>₹</span>
          <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="0" autoFocus style={{ ...inp, paddingLeft:52, fontSize:36, fontWeight:900, color:ac }}/>
        </div>
      </Fld>

      {partners.length>0 && (
        <Fld label="Partner">
          <div className="scrollbar-hide" style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:6 }}>
            {partners.map(p=>(
              <button key={p.id} onClick={()=>setPid(p.id)} style={{
                whiteSpace:'nowrap', padding:'12px 20px', borderRadius:16, border:`1px solid ${pid===p.id?p.color:C.bdr}`,
                fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:10,
                background: pid===p.id ? p.color : C.white,
                color: pid===p.id ? '#fff' : C.priText,
                boxShadow: pid===p.id ? `0 8px 24px ${p.color}55` : C.shd,
                transition:'all 0.15s',
              }}>
                <span style={{ width:24, height:24, borderRadius:'50%', fontSize:9, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', background:pid===p.id?'rgba(255,255,255,0.25)':p.color, color:'#fff' }}>
                  {p.initials?.[0]}
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </Fld>
      )}

      <Fld label="Category">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {CATEGORIES.map(c=>{
            const sel = catN===c.name;
            const Icon = c.icon;
            return (
              <button key={c.name} onClick={()=>setCatN(c.name)} style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                padding:'14px 8px', borderRadius:16, cursor:'pointer', border:sel?`1px solid ${C.carbon}`:`1px solid ${C.bdr}`,
                background: sel ? HERO_BG : C.snow,
                boxShadow: sel ? `0 6px 16px rgba(0,0,0,0.2)` : 'none',
                transition:'all 0.15s',
              }}>
                <Icon size={22} color={sel ? '#fff' : C.priText} strokeWidth={1.5} />
                <span style={{ fontSize:10, fontWeight:700, color:sel ? '#fff' : C.priText }}>{c.name}</span>
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
        width:'100%', height:56, borderRadius:16, border:'none', cursor:ok?'pointer':'not-allowed',
        background: ok ? (isExp ? 'linear-gradient(135deg,#E03E3E,#B91C1C)' : 'linear-gradient(135deg,#10b981,#059669)') : C.plat,
        color: ok ? '#fff' : C.mutText, fontWeight:800, fontSize:16,
        boxShadow: ok ? (isExp?'0 12px 28px rgba(224,62,62,0.3)':'0 12px 28px rgba(16,185,129,0.3)') : 'none',
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
      <div style={{ display:'flex', justifyContent:'center', marginBottom:32 }}>
        <div style={{ width:88, height:88, borderRadius:28, background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:900, color:'#fff', boxShadow:`0 16px 40px ${color}55`, transition:'all 0.25s' }}>
          {name ? initials(name) : '?'}
        </div>
      </div>
      <Fld label="Color">
        <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
          {P_COLORS.map(c=>(
            <button key={c} onClick={()=>setColor(c)} style={{
              width:40, height:40, borderRadius:'50%', background:c, border:'none', cursor:'pointer',
              boxShadow:`0 4px 12px ${c}55`,
              outline:color===c?`3px solid ${c}`:'none', outlineOffset:4,
              transform:color===c?'scale(1.15)':'scale(1)', transition:'all 0.15s',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {color===c && <Check size={16} color="#fff" strokeWidth={3}/>}
            </button>
          ))}
        </div>
      </Fld>
      <Fld label="Full Name *"><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Partner name" style={inp}/></Fld>
      <Fld label="Email"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com" style={{ ...inp, fontWeight:500 }}/></Fld>
      <Fld label="Phone"><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 00000 00000" style={{ ...inp, fontWeight:500 }}/></Fld>
      <button onClick={()=>{ if(!ok) return; save({name:name.trim(),email:email.trim(),phone:phone.trim(),initials:initials(name.trim()),color}); close(); }} disabled={!ok} style={{
        width:'100%', height:56, borderRadius:16, border:'none', cursor:ok?'pointer':'not-allowed',
        background:ok?BRAND_GRAD:C.plat, color:ok?'#fff':C.mutText, fontWeight:800, fontSize:16, boxShadow:ok?C.shdM:'none', transition:'all 0.2s',
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
      padding:'10px 20px', borderRadius:999, fontSize:13, fontWeight:700,
      whiteSpace:'nowrap', cursor:'pointer', border:`1px solid ${on?'transparent':C.bdr}`,
      background: on ? (color||BRAND_GRAD) : C.white,
      color: on ? '#fff' : C.secText,
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
function Dashboard({ txs, partners, editTx, deleteTx, goTab }) {
  const [fp, setFp] = useState('all');
  const you  = partners.find(p=>p.isYou);
  const hr   = new Date().getHours();
  const gr   = hr<12?'morning':hr<17?'afternoon':'evening';
  const fTxs = fp==='all' ? txs : txs.filter(t=>t.pid===fp);
  const fInv = fTxs.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
  const fExp = fTxs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);

  return (
    <div>
      <div style={{ background:HERO_BG, paddingBottom:64 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'60px 24px 0' }}>
          <p style={{
            fontSize:22, fontWeight:900, letterSpacing:'0.04em',
            color: C.snow
          }}>LEM</p>
          <div style={{
            width:44, height:44, borderRadius:14, background:C.snow,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:C.priText, fontSize:14, fontWeight:900, boxShadow:`0 8px 24px rgba(0,0,0,0.3)`,
          }}>
            {you?.initials?.[0]||'S'}
          </div>
        </div>

        <div style={{ padding:'28px 24px 0' }}>
          <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', marginBottom:8 }}>
            Good {gr}, {you?.name||'partner'} 👋
          </p>
          <h1 style={{ fontSize:42, fontWeight:900, color:'#fff', letterSpacing:'-1.5px', lineHeight:1.1, marginBottom:0 }}>
            Company
          </h1>
          <h1 style={{
            fontSize:42, fontWeight:900, letterSpacing:'-1.5px', lineHeight:1.1, marginBottom:0,
            color: C.snow
          }}>
            {inr(fInv-fExp)}
          </h1>
          <h1 style={{ fontSize:42, fontWeight:900, color:'rgba(255,255,255,0.8)', letterSpacing:'-1.5px', lineHeight:1.1 }}>
            balance
          </h1>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:10, fontWeight:600 }}>
            {fInv>0 ? `${Math.round((fExp/fInv)*100)}% burn rate` : 'No investments yet'}
          </p>
        </div>
      </div>

      <div style={{ background:C.lightBg, minHeight:'100%' }}>
        <div style={{ padding:'0 20px', marginTop:-34, paddingBottom:0 }}>
          <BondCard transactions={fTxs} partners={partners}/>
        </div>

        <div style={{ padding:'32px 20px 0' }}>
          <SecHdr label="Filter by partner"/>
          <div className="scrollbar-hide" style={{ display:'flex', gap:12, overflowX:'auto', marginTop:16, paddingBottom:4 }}>
            <Chip on={fp==='all'} onClick={()=>setFp('all')}>All</Chip>
            {partners.map(p=><Chip key={p.id} on={fp===p.id} onClick={()=>setFp(p.id)} color={p.color}>{p.name}{p.isYou?' (you)':''}</Chip>)}
          </div>
        </div>

        <div style={{ padding:'32px 20px 0' }}>
          <SecHdr label="For You" action="VIEW ALL" onAction={()=>goTab('transactions')}/>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginTop:16 }}>
            {CATEGORIES.map(c=>(
              <ForYouTile key={c.name} icon={c.icon} label={c.name} onClick={()=>goTab('transactions')}/>
            ))}
          </div>
        </div>

        <div style={{ padding:'36px 20px 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:C.secText }}>A SMART CHOICE</p>
            <span style={{ fontSize:16, color: C.priText }}>✦</span>
          </div>
          <p style={{ fontSize:24, fontWeight:900, color:C.priText, lineHeight:1.2, letterSpacing:'-0.5px' }}>
            Track smarter,<br/>grow faster
          </p>
        </div>

        <div style={{ padding:'32px 20px 0' }}>
          <SecHdr label="Recent Activity" action={txs.length>4?"VIEW ALL":null} onAction={()=>goTab('transactions')}/>
          <div style={{ marginTop:16 }}>
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
      <div style={{ background:HERO_BG, paddingBottom:64 }}>
        <div style={{ padding:'60px 24px 0' }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Activity</p>
          <h1 style={{ fontSize:40, fontWeight:900, color:'#fff', letterSpacing:'-1.5px', lineHeight:1, marginBottom:24 }}>Transactions</h1>
          {list.length>0 && (
            <div style={{ display:'flex', gap:28 }}>
              <div>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Invested</p>
                <p style={{ fontSize:20, fontWeight:900, color:C.snow }}>{inrS(inv)}</p>
              </div>
              <div>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Spent</p>
                <p style={{ fontSize:20, fontWeight:900, color:'#FB7185' }}>{inrS(exp)}</p>
              </div>
              <div>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Count</p>
                <p style={{ fontSize:20, fontWeight:900, color:'rgba(255,255,255,0.7)' }}>{list.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ background:C.lightBg, marginTop:-34, borderRadius: '32px 32px 0 0' }}>
        <div style={{ padding:'24px 20px 0' }}>
          <div style={{ position:'relative', marginBottom:20 }}>
            <Search size={16} color={C.mutText} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
            <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…"
              style={{ ...inp, paddingLeft:44, background:C.white }}/>
            {q && <button onClick={()=>setQ('')} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', width:26, height:26, borderRadius:'50%', border:'none', background:C.bdr, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={14} color={C.secText}/></button>}
          </div>

          <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', marginBottom:16 }}>
            {[{v:'all',l:'All'},{v:'expense',l:'Expenses'},{v:'investment',l:'Investments'}].map(({v,l})=>(
              <Chip key={v} on={typ===v} onClick={()=>setTyp(v)}>{l}</Chip>
            ))}
          </div>

          <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', marginBottom:24 }}>
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
      <div style={{ background:HERO_BG, paddingBottom:64 }}>
        <div style={{ padding:'60px 24px 0' }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Team</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
            <h1 style={{ fontSize:40, fontWeight:900, color:'#fff', letterSpacing:'-1.5px', lineHeight:1 }}>Partners</h1>
            <button onClick={addP} style={{
              display:'flex', alignItems:'center', gap:8, padding:'12px 20px', borderRadius:16,
              background:C.snow, color:C.priText, fontWeight:800, fontSize:13, border:'none', cursor:'pointer',
              boxShadow:`0 8px 24px rgba(0,0,0,0.25)`,
            }}>
              <UserPlus size={15}/> Add
            </button>
          </div>
          <div style={{ display:'flex', gap:32, marginTop:24 }}>
            <div><p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Partners</p><p style={{ fontSize:20, fontWeight:900, color:'rgba(255,255,255,0.8)' }}>{partners.length}</p></div>
            <div><p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Invested</p><p style={{ fontSize:20, fontWeight:900, color:C.snow }}>{inrS(totInv)}</p></div>
            <div><p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Spent</p><p style={{ fontSize:20, fontWeight:900, color:'#FB7185' }}>{inrS(totExp)}</p></div>
          </div>
        </div>
      </div>

      <div style={{ background:C.lightBg, marginTop:-34, borderRadius: '32px 32px 0 0', padding:'24px 20px 0' }}>
        {!partners.length ? (
          <div style={{ background:C.white, borderRadius:24, padding:'56px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, textAlign:'center', border:`2px dashed ${C.bdr}` }}>
            <span style={{ fontSize:40 }}>👥</span>
            <p style={{ fontSize:15, fontWeight:800, color:C.priText }}>No partners yet</p>
          </div>
        ) : partners.map(p => {
          const ptx   = txs.filter(t=>t.pid===p.id);
          const pInv  = ptx.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
          const pExp  = ptx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
          const pBal  = pInv - pExp;
          const burn  = pInv>0 ? Math.round((pExp/pInv)*100) : 0;
          const isExp = exp===p.id;

          return (
            <div key={p.id} style={{ background:C.white, borderRadius:24, marginBottom:20, overflow:'hidden', border:`1px solid ${C.bdr}`, boxShadow:C.shd }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'22px 22px', borderBottom:`1px solid ${C.bdr}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:56, height:56, borderRadius:18, background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900, color:'#fff', boxShadow:`0 8px 24px ${p.color}45` }}>
                    {p.initials}
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                      <p style={{ fontSize:18, fontWeight:900, color:C.priText, letterSpacing:'-0.3px' }}>{p.name}</p>
                      {p.isYou && <span style={{ fontSize:9, fontWeight:900, padding:'3px 10px', borderRadius:8, background:`${p.color}15`, color:p.color, letterSpacing:'0.1em' }}>YOU</span>}
                    </div>
                    {p.email && <p style={{ fontSize:12, color:C.secText }}>{p.email}</p>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={()=>editP(p)} style={{ width:36, height:36, borderRadius:12, border:`1px solid ${C.bdr}`, background:C.snow, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.secText }}>
                    <Edit2 size={14}/>
                  </button>
                  {!p.isYou && <button onClick={()=>delP(p.id)} style={{ width:36, height:36, borderRadius:12, border:'1px solid rgba(239,68,68,0.2)', background:'#FFF5F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#EF4444' }}>
                    <Trash2 size={14}/>
                  </button>}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:`1px solid ${C.bdr}` }}>
                {[{l:'Invested',v:pInv,c:'#10b981'},{l:'Spent',v:pExp,c:'#E96B3E'}].map(({l,v,cv})=>(
                  <div key={l} style={{ padding:'20px 22px' }}>
                    <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.mutText, marginBottom:10 }}>{l}</p>
                    <p style={{ fontSize:28, fontWeight:900, color:l==='Invested'?'#10b981':'#E96B3E', letterSpacing:'-1px' }}>{inr(v)}</p>
                  </div>
                ))}
              </div>

              <div style={{ padding:'20px 22px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div>
                    <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.mutText, marginBottom:6 }}>Net Balance</p>
                    <p style={{ fontSize:24, fontWeight:900, color:pBal>=0?C.priText:'#EF4444', letterSpacing:'-0.5px' }}>{inr(pBal)}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.mutText, marginBottom:6 }}>Burn Rate</p>
                    <p style={{ fontSize:24, fontWeight:900, color:burn>80?'#EF4444':burn>50?'#F59E0B':C.priText }}>{burn}%</p>
                  </div>
                </div>
                {pInv>0 && (
                  <div>
                    <div style={{ width:'100%', height:6, borderRadius:999, background:C.bdr, overflow:'hidden' }}>
                      <div style={{ width:`${Math.min(burn,100)}%`, height:'100%', borderRadius:999, background:p.color, transition:'width 0.7s' }}/>
                    </div>
                    <p style={{ fontSize:11, color:C.secText, marginTop:8, fontWeight:600 }}>{burn}% used</p>
                  </div>
                )}
              </div>

              {ptx.length>0 && (
                <button onClick={()=>setExp(isExp?null:p.id)} style={{
                  width:'100%', padding:'16px 22px', border:'none', cursor:'pointer',
                  borderTop:`1px solid ${C.bdr}`, background:HERO_BG,
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  fontSize:13, fontWeight:800, color:'rgba(255,255,255,0.8)',
                }}>
                  <span>View transactions</span>
                  <ChevronDown size={16} style={{ transform:isExp?'rotate(180deg)':'rotate(0deg)', transition:'0.2s' }}/>
                </button>
              )}

              {isExp && (
                <div className="animate-fade-in" style={{ borderTop:`1px solid ${C.bdr}` }}>
                  <div style={{ padding:'0 22px 22px' }}>
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
    .map(([n,v])=>({n,v,...cat(n)})).sort((a,b)=>b.v-a.v)
  ,[sp,txs]);

  const trend = useMemo(()=>MONTHS.slice().reverse().map((m,i)=>({
    m:m.slice(0,3),
    inv: Math.round(inv*(i===5?1:0.2+i*0.16)),
    exp: Math.round(exp*(i===5?1:0.18+i*0.14)),
  })),[inv,exp]);

  // PDF Export
  const exportPDF = () => {
    if (!txs.length) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39);
    doc.text('LEM Financial Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(`Total Received: ${inr(inv)}`, 14, 42);
    doc.text(`Total Expenses: ${inr(exp)}`, 14, 48);
    doc.text(`Final Balance: ${inr(bal)}`, 14, 54);
    
    let y = 64;
    partners.forEach(p => {
      const ptx = txs.filter(t => t.pid === p.id);
      const pinv = ptx.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
      const pexp = ptx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
      doc.setFontSize(10);
      doc.text(`${p.name}: Invested ${inr(pinv)}  |  Spent ${inr(pexp)}`, 14, y);
      y += 6;
    });

    // Table Data
    const sorted = [...txs].sort((a,b) => new Date(a.date) - new Date(b.date));
    let runBal = 0;
    const tableData = sorted.map(t => {
      const isInv = t.type === 'investment';
      const rec = isInv ? t.amount : 0;
      const ex = !isInv ? t.amount : 0;
      runBal += (rec - ex);
      return [
        dShrt(t.date),
        `${t.cat}${t.note ? ' - ' + t.note : ''}`,
        partners.find(p=>p.id===t.pid)?.name || 'Unknown',
        rec > 0 ? inr(rec) : '-',
        ex > 0 ? inr(ex) : '-',
        inr(runBal)
      ];
    });

    doc.autoTable({
      startY: y + 8,
      head: [['Date', 'Field / Description', 'Partner', 'Received', 'Expense', 'Balance']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [17, 24, 39] },
      styles: { fontSize: 9 },
      margin: { top: 20 }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save('LEM_Financial_Report.pdf');
  };

  // Excel Export
  const exportExcel = () => {
    if (!txs.length) return;
    const sorted = [...txs].sort((a,b) => new Date(a.date) - new Date(b.date));
    let runBal = 0;
    const rows = sorted.map(t => {
      const isInv = t.type === 'investment';
      const rec = isInv ? t.amount : 0;
      const ex = !isInv ? t.amount : 0;
      runBal += (rec - ex);
      return {
        'Date': dShrt(t.date),
        'Field / Description': `${t.cat}${t.note ? ' - ' + t.note : ''}`,
        'Partner Name': partners.find(p=>p.id===t.pid)?.name || 'Unknown',
        'Amount Received': rec > 0 ? rec : 0,
        'Expense': ex > 0 ? ex : 0,
        'Balance': runBal
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    
    // Summary Sheet
    const summaryRows = [
      { Metric: 'Total Amount Received', Value: inv },
      { Metric: 'Total Expenses', Value: exp },
      { Metric: 'Final Balance', Value: bal },
      {}
    ];
    partners.forEach(p => {
      const ptx = txs.filter(t => t.pid === p.id);
      const pinv = ptx.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
      const pexp = ptx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
      summaryRows.push({ Metric: `${p.name} - Total Invested`, Value: pinv });
      summaryRows.push({ Metric: `${p.name} - Total Spent`, Value: pexp });
    });
    const wsSum = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSum, "Summary");

    XLSX.writeFile(wb, "LEM_Financial_Report.xlsx");
  };

  return (
    <div>
      <div style={{ background:HERO_BG, paddingBottom:64 }}>
        <div style={{ padding:'60px 24px 0' }}>
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Overview</p>
          <h1 style={{ fontSize:40, fontWeight:900, color:'#fff', letterSpacing:'-1.5px', lineHeight:1, marginBottom:22 }}>Reports</h1>
          <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto' }}>
            {[{id:'all',name:'All',color:C.iron},...partners].map(p=>(
              <button key={p.id} onClick={()=>setSp(p.id)} style={{
                padding:'10px 20px', borderRadius:999, fontSize:13, fontWeight:700, border:'none',
                background: sp===p.id?C.snow:'rgba(255,255,255,0.1)', color:sp===p.id?C.priText:'rgba(255,255,255,0.6)',
                cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s',
              }}>{p.name}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:C.lightBg, marginTop:-34, borderRadius: '32px 32px 0 0', padding:'24px 20px 0' }}>
        <div style={{ background:HERO_BG, borderRadius:24, padding:'26px 24px', marginBottom:20, boxShadow:'0 16px 40px rgba(0,0,0,0.15)' }}>
          <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:14 }}>Net Balance</p>
          <p style={{ fontSize:48, fontWeight:900, color:bal>=0?'#fff':'#EF4444', letterSpacing:'-2.5px', lineHeight:1, marginBottom:22 }}>{inr(bal)}</p>
          <div style={{ display:'flex', gap:32 }}>
            <div><p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Invested</p><p style={{ fontSize:16, fontWeight:900, color:'#10b981' }}>{inr(inv)}</p></div>
            <div><p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Spent</p><p style={{ fontSize:16, fontWeight:900, color:'#FB7185' }}>{inr(exp)}</p></div>
          </div>
        </div>

        {(inv>0||exp>0) && (
          <div style={{ background:C.white, borderRadius:24, padding:'22px', marginBottom:20, border:`1px solid ${C.bdr}`, boxShadow:C.shd }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.secText }}>6-Month Trend</p>
              <TrendingUp size={15} color={C.mutText}/>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.iron} stopOpacity={0.2}/><stop offset="100%" stopColor={C.iron} stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false}/>
                <XAxis dataKey="m" tick={{ fontSize:10, fill:C.mutText }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:C.priText, border:'none', borderRadius:12, color:'#fff', fontSize:12 }}/>
                <Area type="monotone" dataKey="inv" stroke="#10b981" fill="url(#gi)" strokeWidth={2.5} name="Invested" dot={false}/>
                <Area type="monotone" dataKey="exp" stroke={C.iron} fill="url(#gs)" strokeWidth={2.5} name="Spent" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {catD.length>0 && (
          <div style={{ background:C.white, borderRadius:24, padding:'22px', marginBottom:20, border:`1px solid ${C.bdr}`, boxShadow:C.shd }}>
            <p style={{ fontSize:11, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.secText, marginBottom:16 }}>Expense Breakdown</p>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <ResponsiveContainer width={96} height={96}>
                <PieChartComp>
                  <Pie data={catD} cx="50%" cy="50%" innerRadius={24} outerRadius={46} dataKey="v" strokeWidth={2} stroke={C.white}>
                    {catD.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                </PieChartComp>
              </ResponsiveContainer>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                {catD.slice(0,5).map(c=>{
                  const Icon = c.icon;
                  return (
                  <div key={c.n} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:c.color, flexShrink:0 }}/>
                    <span style={{ fontSize:13, fontWeight:700, color:C.priText, flex:1, display:'flex', alignItems:'center', gap:8 }}>
                      <Icon size={14} /> {c.n}
                    </span>
                    <span style={{ fontSize:13, fontWeight:900, color:C.priText }}>{inrS(c.v)}</span>
                  </div>
                )})}
              </div>
            </div>
          </div>
        )}

        <div style={{ background:C.white, borderRadius:24, padding:'22px', marginBottom:20, border:`1px solid ${C.bdr}`, boxShadow:C.shd }}>
          <p style={{ fontSize:11, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.secText, marginBottom:16 }}>Summary</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              {e:<BarChart3 size={26} color={C.iron}/>,l:'Transactions',v:String(txs.length),    c:C.iron},
              {e:<Users2 size={26} color="#3b82f6"/>,l:'Partners',    v:String(partners.length),c:'#3b82f6'},
              {e:<TrendingUp size={26} color={C.slate}/>,l:'Avg Entry',   c:C.slate, v:txs.length?inrS(txs.reduce((s,t)=>s+t.amount,0)/txs.length):'₹0'},
              {e:<Zap size={26} color="#E96B3E"/>,l:'Burn Rate',   c:'#E96B3E', v:inv>0?`${Math.round((exp/inv)*100)}%`:'0%'},
            ].map(s=>(
              <div key={s.l} style={{ background:C.snow, borderRadius:16, padding:'18px', border:`1px solid ${C.bdr}` }}>
                <span style={{ display:'block', marginBottom:10 }}>{s.e}</span>
                <p style={{ fontSize:24, fontWeight:900, color:s.c, letterSpacing:'-0.5px' }}>{s.v}</p>
                <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:C.mutText, marginTop:6 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <p style={{ fontSize:11, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.secText, marginBottom:14 }}>Export Detailed Report</p>
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={exportExcel} style={{
              flex:1, height:54, borderRadius:16, border:'none', cursor:'pointer',
              background:C.snow, color:C.priText, border:`1px solid ${C.bdr}`,
              fontWeight:800, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              boxShadow:C.shd, transition: 'all 0.2s'
            }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(0.96)'}
            onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
              <FileSpreadsheet size={18}/> Excel
            </button>
            <button onClick={exportPDF} style={{
              flex:1, height:54, borderRadius:16, border:'none', cursor:'pointer',
              background:BRAND_GRAD, color:C.white,
              fontWeight:800, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              boxShadow:`0 8px 24px rgba(23, 16, 38, 0.25)`, transition: 'all 0.2s'
            }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(0.96)'}
            onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
              <FileText size={18}/> PDF
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
  const [isLogged, setIsLogged] = useState(false);
  const [tab,   setTab]   = useState('dashboard');
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
    return <Login onLogin={() => setIsLogged(true)} />;
  }

  return (
    <div style={{
      display:'flex', justifyContent:'center', alignItems:'center',
      minHeight:'100dvh', background:C.lightBg,
      fontFamily:'Inter,system-ui,sans-serif',
    }}>
      {toast && <Toast msg={toast.msg} type={toast.type} done={()=>setToast(null)}/>}
      {confirm && <Confirm title={confirm.title} body={confirm.body} ok={confirm.ok} cancel={()=>setConf(null)}/>}

      <div style={{
        width:'100%', maxWidth:430, height:'100dvh',
        display:'flex', flexDirection:'column',
        position:'relative', overflow:'hidden',
        background:C.lightBg,
      }}>
        <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', paddingBottom: 110 }}>
          {tab==='dashboard'    && <Dashboard txs={txs} partners={parts} editTx={doEditTx} deleteTx={doDelTx} goTab={setTab}/>}
          {tab==='transactions' && <Transactions txs={txs} partners={parts} editTx={doEditTx} deleteTx={doDelTx}/>}
          {tab==='partners'     && <Partners partners={parts} txs={txs} addP={()=>{ setEditP(null); setAddP(true); }} editP={doEditP} delP={doDelP}/>}
          {tab==='reports'      && <Reports txs={txs} partners={parts}/>}
        </div>

        <FloatingNav active={tab} set={setTab} onAdd={()=>{ setEditTx(null); setAddTx(true); }} />

        <AddEntry open={addTx} close={closeAddTx} save={saveTx} partners={parts} edit={editTx}/>
        <AddPartner open={addP} close={closeAddP} save={saveP} edit={editP} taken={parts.filter(p=>p.id!==editP?.id).map(p=>p.color)}/>
      </div>
    </div>
  );
}
