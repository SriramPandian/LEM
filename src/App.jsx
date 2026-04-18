import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutDashboard, ArrowLeftRight, Users2, BarChart3,
  Plus, X, ArrowUpCircle, ArrowDownCircle, Search, Edit2,
  ChevronRight, ChevronDown, Trash2, Check, Sparkles,
  TrendingUp, MoreVertical, Printer, Download,
  AlertCircle, CheckCircle2, Info, UserPlus,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  PieChart as PieChartComp, Pie, Cell,
  XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─────────────────────────────────────────────────────────
//  DESIGN TOKENS  (Warm — matching user's palette)
// ─────────────────────────────────────────────────────────
const C = {
  // Hero dark zone (top of each view — like Wint's dark purple top)
  heroTop: '#120906',
  heroBtm: '#2C1A0E',
  // Light section (below hero — like Wint's #f5f5f5 section)
  lightBg: '#F0E8DA',   // warm off-white
  white:   '#FFFFFF',
  // Brand
  from: '#5A3E2B',
  mid:  '#8B6245',
  to:   '#C08A5A',
  gold: '#D4973A',
  // Text
  priText: '#2C2C2C',
  secText: '#6E6257',
  mutText: '#B8A898',
  // Util
  bdr:  'rgba(90,62,43,0.10)',
  shd:  '0 2px 8px rgba(90,62,43,0.06)',
  shdM: '0 8px 24px rgba(90,62,43,0.14)',
};

// Gradients
const HERO_BG    = `linear-gradient(170deg,${C.heroTop} 0%,${C.heroBtm} 100%)`;
const BRAND_GRAD = `linear-gradient(135deg,${C.from} 0%,${C.mid} 50%,${C.to} 100%)`;
// The "amber bond card" visual (Wint's golden 11% card top)
const BOND_BG    = `linear-gradient(135deg,${C.from} 0%,${C.mid} 35%,${C.to} 65%,${C.gold} 100%)`;

// ─────────────────────────────────────────────────────────
//  CATEGORIES  (FOR YOU grid)
// ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { name:'Office',    icon:'🏢', color:'#6366f1' },
  { name:'Salary',   icon:'💰', color:'#10b981' },
  { name:'Travel',   icon:'✈️', color:'#3b82f6' },
  { name:'Marketing',icon:'📣', color:'#f59e0b' },
  { name:'Software', icon:'💻', color:'#8b5cf6' },
  { name:'Utilities',icon:'⚡', color:'#ef4444' },
  { name:'Food',     icon:'🍱', color:'#fb923c' },
  { name:'Other',    icon:'📦', color:'#64748b' },
];

const MONTHS = ['Apr 2026','Mar 2026','Feb 2026','Jan 2026','Dec 2025','Nov 2025'];
const P_COLORS = ['#5A3E2B','#C08A5A','#10b981','#3b82f6','#f59e0b','#ec4899','#8b5cf6','#06b6d4'];

const PARTNERS_INIT = [
  { id:'p1', name:'Sriram',  email:'sriram@lem.in',  phone:'+91 98765 00001', isYou:true,  initials:'SR', color:'#5A3E2B' },
  { id:'p2', name:'Tharsan', email:'tharsan@lem.in', phone:'+91 98765 00002', isYou:false, initials:'TH', color:'#C08A5A' },
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
  { id:'t10', type:'expense',    amount:  12500, pid:'p1', cat:'Software',  date:'2026-02-22', note:'Cloud & SaaS'             },
  { id:'t11', type:'expense',    amount:  22000, pid:'p2', cat:'Travel',    date:'2026-02-18', note:'Bangalore investor meet'  },
  { id:'t12', type:'expense',    amount:   8200, pid:'p1', cat:'Utilities', date:'2026-02-10', note:'Electricity & internet'   },
  { id:'t13', type:'investment', amount: 250000, pid:'p2', cat:'Salary',    date:'2026-02-01', note:'Tharsan Q1 investment'    },
  { id:'t14', type:'expense',    amount:  15000, pid:'p2', cat:'Office',    date:'2026-01-28', note:'Furniture & setup'        },
  { id:'t15', type:'expense',    amount:   4500, pid:'p1', cat:'Food',      date:'2026-01-20', note:'Team offsite lunch'       },
  { id:'t16', type:'investment', amount: 300000, pid:'p1', cat:'Salary',    date:'2026-01-01', note:'Sriram Q1 capital'        },
];

const LS = 'lem_v5';
const load = () => { try { const d = localStorage.getItem(LS); return d ? JSON.parse(d) : null; } catch { return null; } };
const save = (d) => { try { localStorage.setItem(LS, JSON.stringify(d)); } catch {} };

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
const inr   = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const inrS  = (n) => { if (n>=10000000) return `₹${(n/10000000).toFixed(1)}Cr`; if (n>=100000) return `₹${(n/100000).toFixed(1)}L`; if (n>=1000) return `₹${(n/1000).toFixed(1)}k`; return inr(n); };
const dShrt = (iso) => new Date(iso).toLocaleDateString('en-IN',{ day:'numeric', month:'short' });
const cat   = (n)  => CATEGORIES.find(c => c.name===n) || CATEGORIES[7];
const initials = (n) => n.trim().split(' ').filter(Boolean).map(w=>w[0]).join('').toUpperCase().slice(0,2);

// ─────────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────────
function Toast({ msg, type='ok', done }) {
  useEffect(() => { const t = setTimeout(done, 2600); return () => clearTimeout(t); }, [done]);
  const bg = type==='ok' ? '#10b981' : type==='err' ? '#ef4444' : C.mid;
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

// ─────────────────────────────────────────────────────────
//  CONFIRM
// ─────────────────────────────────────────────────────────
function Confirm({ title, body, ok, cancel }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:400, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div className="animate-fade-in" onClick={cancel} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)' }}/>
      <div className="animate-slide-up" style={{
        position:'relative', background:C.white, width:'100%', maxWidth:430,
        borderRadius:'28px 28px 0 0', padding:'32px 24px 44px',
        boxShadow:'0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{ width:44, height:44, borderRadius:14, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
          <AlertCircle size={20} color="#EF4444"/>
        </div>
        <p style={{ fontSize:17, fontWeight:800, color:C.priText, marginBottom:6 }}>{title}</p>
        <p style={{ fontSize:13, color:C.secText, lineHeight:1.7, marginBottom:28 }}>{body}</p>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={cancel} style={{ flex:1, height:50, borderRadius:14, border:`1.5px solid ${C.bdr}`, background:'transparent', color:C.secText, fontWeight:700, fontSize:14, cursor:'pointer' }}>Cancel</button>
          <button onClick={ok} style={{ flex:1, height:50, borderRadius:14, border:'none', background:'#EF4444', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', boxShadow:'0 6px 18px rgba(239,68,68,0.3)' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  MODAL SHELL
// ─────────────────────────────────────────────────────────
function Sheet({ close, children }) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:90, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div className="animate-fade-in" onClick={close} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)' }}/>
      <div className="animate-slide-up" style={{
        position:'relative', background:C.white, width:'100%', borderRadius:'28px 28px 0 0',
        maxHeight:'93dvh', display:'flex', flexDirection:'column',
        boxShadow:'0 -8px 48px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'14px 0 2px' }}>
          <div style={{ width:36, height:4, borderRadius:999, background:C.bdr }}/>
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
      <p style={{ fontSize:19, fontWeight:900, color:C.priText, letterSpacing:'-0.3px' }}>{title}</p>
      <button onClick={close} style={{
        width:34, height:34, borderRadius:12, border:`1.5px solid ${C.bdr}`,
        background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:C.secText, cursor:'pointer',
      }}>
        <X size={14}/>
      </button>
    </div>
  );
}

function Fld({ label, children }) {
  return (
    <div style={{ marginBottom:22 }}>
      <p style={{ fontSize:9, fontWeight:900, letterSpacing:'0.15em', textTransform:'uppercase', color:C.mutText, marginBottom:10 }}>{label}</p>
      {children}
    </div>
  );
}

const inp = { width:'100%', padding:'15px 16px', borderRadius:16, fontSize:14, fontWeight:600, border:`1.5px solid ${C.bdr}`, background:'#FAF5EE', color:C.priText, outline:'none', boxSizing:'border-box' };

// ─────────────────────────────────────────────────────────
//  WINT BOTTOM NAV (exact style)
// ─────────────────────────────────────────────────────────
function BottomNav({ active, set }) {
  const items = [
    { id:'dashboard',    icon:<LayoutDashboard/>, label:'Home'    },
    { id:'transactions', icon:<ArrowLeftRight/>,  label:'Activity'},
    { id:'partners',     icon:<Users2/>,          label:'Team'    },
    { id:'reports',      icon:<BarChart3/>,        label:'Reports' },
  ];
  return (
    // White strip at bottom — exactly like Wint
    <div style={{
      position:'absolute', bottom:0, left:0, right:0,
      background:C.white, borderTop:`1px solid ${C.bdr}`,
      display:'flex', paddingBottom:'env(safe-area-inset-bottom,0px)',
      zIndex:30,
    }}>
      {items.map(it => {
        const on = active === it.id;
        return (
          <button key={it.id} onClick={() => set(it.id)} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center',
            padding:'10px 4px 8px', border:'none', background:'none', cursor:'pointer', gap:4,
          }}>
            {React.cloneElement(it.icon, {
              size: 22,
              strokeWidth: on ? 2.2 : 1.5,
              color: on ? C.from : C.mutText,
            })}
            <span style={{
              fontSize:9, fontWeight: on ? 900 : 600, letterSpacing:'0.04em',
              color: on ? C.from : C.mutText,
            }}>{it.label}</span>
            {/* Active underline dot — like Wint's active indicator */}
            {on && (
              <div style={{ width:20, height:2, borderRadius:999, background:BRAND_GRAD, marginTop:1 }}/>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  SECTION HEADER (Wint "FOR YOU / VIEW ALL" style)
// ─────────────────────────────────────────────────────────
function SecHdr({ label, action, onAction }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <p style={{ fontSize:11, fontWeight:900, letterSpacing:'0.16em', textTransform:'uppercase', color:C.secText }}>{label}</p>
      {action && (
        <button onClick={onAction} style={{ fontSize:10, fontWeight:900, letterSpacing:'0.1em', textTransform:'uppercase', color:C.from, background:'none', border:'none', cursor:'pointer' }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  BOND-STYLE FEATURE CARD  (Wint's "11%" amber card)
// ─────────────────────────────────────────────────────────
function BondCard({ transactions, partners }) {
  const inv   = transactions.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
  const spent = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const bal   = inv - spent;
  const burn  = inv > 0 ? Math.round((spent/inv)*100) : 0;

  return (
    <div style={{ borderRadius:20, overflow:'hidden', background:'#1a1a1a', boxShadow:C.shdM }}>
      {/* Golden image-like zone (the amber flow from Wint) */}
      <div style={{ position:'relative', overflow:'hidden', height:160 }}>
        <div style={{ position:'absolute', inset:0, background:BOND_BG }}/>
        {/* Organic blob shapes mimicking Wint's golden swirl */}
        <div style={{ position:'absolute', right:-60, top:-60, width:300, height:300, borderRadius:'50%', background:'rgba(212,151,58,0.35)', filter:'blur(40px)' }}/>
        <div style={{ position:'absolute', left:-40, bottom:-40, width:200, height:200, borderRadius:'50%', background:'rgba(90,62,43,0.5)', filter:'blur(30px)' }}/>
        <div style={{ position:'absolute', right:40, bottom:20, width:120, height:120, borderRadius:'50%', background:'rgba(255,200,100,0.15)', filter:'blur(20px)' }}/>

        {/* Content on the image */}
        <div style={{ position:'absolute', inset:0, padding:'16px 18px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          {/* "17% SOLD" badge */}
          <div style={{
            display:'inline-flex', alignItems:'center',
            background:'rgba(0,0,0,0.35)', padding:'5px 12px', borderRadius:8, alignSelf:'flex-start',
            backdropFilter:'blur(8px)',
          }}>
            <span style={{ fontSize:10, fontWeight:900, letterSpacing:'0.06em', color:'#fff' }}>
              {burn}% BURNED
            </span>
          </div>

          {/* Big % number like "11%" in Wint */}
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
              <p style={{ fontSize:56, fontWeight:900, color:'#fff', letterSpacing:'-3px', lineHeight:1, textShadow:'0 2px 20px rgba(0,0,0,0.3)' }}>
                {inrS(bal)}
              </p>
              {inv > 0 && (
                <div>
                  <p style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.7)', lineHeight:1.3 }}>{inrS(inv)}</p>
                  <p style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>invested</p>
                </div>
              )}
            </div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:4, fontWeight:600 }}>
              Net Balance · {new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'})}
            </p>
          </div>
        </div>
      </div>

      {/* White info strip — "U GRO Capital / ₹10k min" equivalent */}
      <div style={{
        background:C.white, padding:'13px 18px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        borderTop:'1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:34, height:34, borderRadius:10, background:BRAND_GRAD,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:10, fontWeight:900, letterSpacing:'0.04em',
            boxShadow:`0 4px 12px ${C.from}55`,
          }}>LEM</div>
          <div>
            <p style={{ fontSize:13, fontWeight:800, color:C.priText }}>LEM Finance</p>
            <p style={{ fontSize:10, color:C.secText }}>{transactions.length} transactions</p>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:10, color:C.secText, fontWeight:600 }}>Spent</p>
          <p style={{ fontSize:14, fontWeight:900, color:'#E96B3E' }}>{inrS(spent)}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  FOR YOU TILE  (Wint's category grid tile — dark card)
// ─────────────────────────────────────────────────────────
function ForYouTile({ emoji, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
      padding:'14px 6px 12px', borderRadius:16, cursor:'pointer', border:'none',
      background:'#1e1e1e',           // dark tile — exactly like Wint
      boxShadow:'0 2px 8px rgba(0,0,0,0.12)',
    }}
    onMouseDown={e=>e.currentTarget.style.opacity='0.7'}
    onMouseUp={e=>e.currentTarget.style.opacity='1'}
    onTouchStart={e=>e.currentTarget.style.opacity='0.7'}
    onTouchEnd={e=>e.currentTarget.style.opacity='1'}>
      <span style={{ fontSize:28 }}>{emoji}</span>
      <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.65)', textAlign:'center', lineHeight:1.3 }}>{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────
//  PORTFOLIO TIMELINE ROW  (Wint's "25 Mar | ₹13,500 | Interest")
// ─────────────────────────────────────────────────────────
function TxRow({ tx, partner, isLast, showMenu, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isExp = tx.type === 'expense';
  const meta  = cat(tx.cat);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', padding:'17px 0', gap:0 }}>
        {/* Date (left) */}
        <div style={{ width:46, flexShrink:0 }}>
          <p style={{ fontSize:10, fontWeight:700, color:C.mutText, lineHeight:1.4, textAlign:'left' }}>
            {dShrt(tx.date)}
          </p>
        </div>

        {/* Partner-colored left border accent — the green bar from Wint portfolio */}
        <div style={{
          width:3, height:48, borderRadius:999,
          background: partner?.color || C.from,
          marginRight:14, flexShrink:0,
        }}/>

        {/* Main content */}
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:18, fontWeight:900, color:C.priText, letterSpacing:'-0.5px', lineHeight:1 }}>
            {inr(tx.amount)}
          </p>
          <p style={{ fontSize:11, color:C.secText, marginTop:4, fontWeight:500 }}>
            {meta.icon} {tx.cat}{tx.note ? `  ·  ${tx.note.slice(0,24)}` : ''}
          </p>
        </div>

        {/* Right: type (like "Interest", "Pri + Int.") + partner */}
        <div style={{ flexShrink:0, textAlign:'right', marginLeft:8 }}>
          <p style={{
            fontSize:10, fontWeight:800, letterSpacing:'0.04em',
            color: isExp ? '#E96B3E' : '#10b981',
          }}>
            {isExp ? 'Expense' : 'Invest.'}
          </p>
          {partner && (
            <p style={{ fontSize:9, fontWeight:700, color:partner.color, marginTop:3 }}>{partner.name}</p>
          )}
        </div>

        {/* Context menu */}
        {showMenu && (
          <div ref={ref} style={{ position:'relative', marginLeft:8, flexShrink:0 }}>
            <button onClick={() => setOpen(v=>!v)} style={{
              width:28, height:28, borderRadius:8, border:'none', background:'transparent',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.mutText,
            }}>
              <MoreVertical size={13}/>
            </button>
            {open && (
              <div className="animate-pop" style={{
                position:'absolute', right:0, top:32, background:C.white,
                borderRadius:14, boxShadow:'0 8px 30px rgba(0,0,0,0.16)',
                border:`1px solid ${C.bdr}`, overflow:'hidden', width:120, zIndex:40,
              }}>
                <button onClick={() => { setOpen(false); onEdit(tx); }} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:10,
                  padding:'12px 16px', fontSize:12, fontWeight:700, color:C.priText,
                  background:'none', border:'none', cursor:'pointer',
                }}>
                  <Edit2 size={12}/> Edit
                </button>
                <div style={{ height:1, background:C.bdr, margin:'0 12px' }}/>
                <button onClick={() => { setOpen(false); onDelete(tx.id); }} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:10,
                  padding:'12px 16px', fontSize:12, fontWeight:700, color:'#EF4444',
                  background:'none', border:'none', cursor:'pointer',
                }}>
                  <Trash2 size={12}/> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Dashed separator — exact Wint portfolio style */}
      {!isLast && (
        <div style={{ height:1, borderTop:'1px dashed rgba(90,62,43,0.12)', marginLeft:63 }}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  TIMELINE CONTAINER  (Wint portfolio dark section)
// ─────────────────────────────────────────────────────────
function Timeline({ txs, partners, showMenu=false, onEdit, onDelete }) {
  if (!txs.length) return (
    <div style={{
      background:C.white, borderRadius:16, padding:'40px 20px',
      display:'flex', flexDirection:'column', alignItems:'center', gap:8, textAlign:'center',
      border:`2px dashed ${C.bdr}`,
    }}>
      <span style={{ fontSize:36 }}>📭</span>
      <p style={{ fontSize:13, fontWeight:800, color:C.priText }}>No transactions yet</p>
      <p style={{ fontSize:12, color:C.secText }}>Tap + to add your first entry</p>
    </div>
  );

  return (
    <div style={{
      background:C.white, borderRadius:16, overflow:'hidden',
      border:`1px solid ${C.bdr}`, boxShadow:C.shd,
    }}>
      {/* Dark top label strip — Wint's "Track all your repayments" */}
      <div style={{
        background:`linear-gradient(135deg,${C.heroTop},${C.heroBtm})`,
        padding:'14px 18px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <p style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.8)', letterSpacing:'-0.1px' }}>
          Transaction Activity
        </p>
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:700 }}>{txs.length} entries</span>
      </div>

      {/* Rows */}
      <div style={{ padding:'0 18px' }}>
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

      {/* Type toggle */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, background:'#F5EDE0', padding:4, borderRadius:16, marginBottom:24 }}>
        {[{v:'expense',l:'Expense',I:ArrowUpCircle},{v:'investment',l:'Investment',I:ArrowDownCircle}].map(({v,l,I})=>(
          <button key={v} onClick={()=>setType(v)} style={{
            height:44, borderRadius:12, border:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            fontWeight:700, fontSize:13, cursor:'pointer',
            background: type===v ? C.white : 'transparent',
            color: type===v ? (v==='expense'?'#E03E3E':'#10b981') : C.secText,
            boxShadow: type===v ? C.shd : 'none', transition:'all 0.2s',
          }}>
            <I size={14}/>{l}
          </button>
        ))}
      </div>

      <Fld label="Amount">
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:26, fontWeight:900, color:ac }}>₹</span>
          <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="0" autoFocus style={{ ...inp, paddingLeft:46, fontSize:34, fontWeight:900, color:ac }}/>
        </div>
      </Fld>

      {partners.length>0 && (
        <Fld label="Partner">
          <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4 }}>
            {partners.map(p=>(
              <button key={p.id} onClick={()=>setPid(p.id)} style={{
                whiteSpace:'nowrap', padding:'10px 18px', borderRadius:14, border:'none',
                fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:8,
                background: pid===p.id ? p.color : C.white,
                color: pid===p.id ? '#fff' : C.priText,
                boxShadow: pid===p.id ? `0 6px 20px ${p.color}55` : C.shd,
                transition:'all 0.15s',
              }}>
                <span style={{ width:22, height:22, borderRadius:'50%', fontSize:8, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', background:pid===p.id?'rgba(255,255,255,0.25)':p.color, color:'#fff' }}>
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
            return (
              <button key={c.name} onClick={()=>setCatN(c.name)} style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                padding:'12px 6px', borderRadius:14, cursor:'pointer', border:'none',
                background: sel ? `linear-gradient(135deg,${c.color},${c.color}cc)` : '#1e293b',
                boxShadow: sel ? `0 4px 12px ${c.color}55` : '0 2px 6px rgba(0,0,0,0.15)',
                transition:'all 0.15s',
              }}>
                <span style={{ fontSize:20 }}>{c.icon}</span>
                <span style={{ fontSize:9, fontWeight:700, color:'#fff' }}>{c.name}</span>
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
        width:'100%', height:54, borderRadius:16, border:'none', cursor:ok?'pointer':'not-allowed',
        background: ok ? (isExp ? 'linear-gradient(135deg,#E03E3E,#B91C1C)' : 'linear-gradient(135deg,#10b981,#059669)') : '#EEE8E0',
        color: ok ? '#fff' : C.mutText, fontWeight:800, fontSize:15,
        boxShadow: ok ? (isExp?'0 8px 24px rgba(224,62,62,0.3)':'0 8px 24px rgba(16,185,129,0.3)') : 'none',
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
        <div style={{ width:80, height:80, borderRadius:24, background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:900, color:'#fff', boxShadow:`0 16px 40px ${color}55`, transition:'all 0.25s' }}>
          {name ? initials(name) : '?'}
        </div>
      </div>
      <Fld label="Color">
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {P_COLORS.map(c=>(
            <button key={c} onClick={()=>setColor(c)} style={{
              width:36, height:36, borderRadius:'50%', background:c, border:'none', cursor:'pointer',
              boxShadow:`0 3px 10px ${c}55`,
              outline:color===c?`3px solid ${c}`:'none', outlineOffset:3,
              transform:color===c?'scale(1.18)':'scale(1)', transition:'all 0.15s',
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
        width:'100%', height:54, borderRadius:16, border:'none', cursor:ok?'pointer':'not-allowed',
        background:ok?BRAND_GRAD:'#EEE8E0', color:ok?'#fff':C.mutText, fontWeight:800, fontSize:15, boxShadow:ok?C.shdM:'none', transition:'all 0.2s',
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
      padding:'8px 16px', borderRadius:999, fontSize:12, fontWeight:700,
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
//  DASHBOARD VIEW  (Wint home page clone)
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
      {/* ── DARK HERO (Wint's dark purple top section) ── */}
      <div style={{ background:HERO_BG, paddingBottom:52 }}>

        {/* Top bar: brand + avatar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'52px 20px 0' }}>
          <p style={{
            fontSize:20, fontWeight:900, letterSpacing:'0.04em',
            background:`linear-gradient(135deg,${C.to},${C.gold})`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>LEM</p>
          <div style={{
            width:40, height:40, borderRadius:12, background:BRAND_GRAD,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:13, fontWeight:900, boxShadow:`0 4px 16px ${C.from}66`,
          }}>
            {you?.initials?.[0]||'S'}
          </div>
        </div>

        {/* Hero text — like "Exclusive / Additional 0.25% / on all bonds" */}
        <div style={{ padding:'22px 20px 0' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em', marginBottom:6 }}>
            Good {gr}, {you?.name||'partner'} 👋
          </p>
          <h1 style={{ fontSize:38, fontWeight:900, color:'#fff', letterSpacing:'-1.5px', lineHeight:1.1, marginBottom:0 }}>
            Company
          </h1>
          <h1 style={{
            fontSize:38, fontWeight:900, letterSpacing:'-1.5px', lineHeight:1.1, marginBottom:0,
            background:`linear-gradient(135deg,${C.to},${C.gold})`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>
            {inr(fInv-fExp)}
          </h1>
          <h1 style={{ fontSize:38, fontWeight:900, color:'#fff', letterSpacing:'-1.5px', lineHeight:1.1 }}>
            balance
          </h1>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:8, fontWeight:600 }}>
            {fInv>0 ? `${Math.round((fExp/fInv)*100)}% burn rate` : 'No investments yet'}
          </p>
        </div>
      </div>

      {/* ── LIGHT SECTION (Wint's gray light section) ── */}
      <div style={{ background:C.lightBg, minHeight:'100%' }}>

        {/* Bond card — starts inside light section */}
        <div style={{ padding:'0 16px', marginTop:-28, paddingBottom:0 }}>
          <BondCard transactions={fTxs} partners={partners}/>
        </div>

        {/* Partner filter chips */}
        <div style={{ padding:'24px 16px 0' }}>
          <SecHdr label="Filter by partner"/>
          <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', marginTop:12, paddingBottom:2 }}>
            <Chip on={fp==='all'} onClick={()=>setFp('all')}>All</Chip>
            {partners.map(p=><Chip key={p.id} on={fp===p.id} onClick={()=>setFp(p.id)} color={p.color}>{p.name}{p.isYou?' (you)':''}</Chip>)}
          </div>
        </div>

        {/* FOR YOU grid — exactly like Wint */}
        <div style={{ padding:'28px 16px 0' }}>
          <SecHdr label="For You" action="VIEW ALL" onAction={()=>goTab('transactions')}/>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:14 }}>
            {CATEGORIES.map(c=>(
              <ForYouTile key={c.name} emoji={c.icon} label={c.name} onClick={()=>goTab('transactions')}/>
            ))}
          </div>
        </div>

        {/* "A BALANCED CHOICE" promo text (Wint style) */}
        <div style={{ padding:'28px 16px 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:C.secText }}>A SMART CHOICE</p>
            <span style={{ fontSize:14 }}>✦</span>
          </div>
          <p style={{ fontSize:20, fontWeight:900, color:C.priText, lineHeight:1.3, letterSpacing:'-0.5px' }}>
            Track smarter,<br/>grow faster
          </p>
        </div>

        {/* Recent transactions */}
        <div style={{ padding:'24px 16px 0' }}>
          <SecHdr label="Recent Activity" action={txs.length>4?"VIEW ALL":null} onAction={()=>goTab('transactions')}/>
          <div style={{ marginTop:14 }}>
            <Timeline txs={fTxs.slice(0,5)} partners={partners} showMenu={false}/>
          </div>
        </div>

        <div style={{ height:20 }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  TRANSACTIONS VIEW  (Wint Portfolio style)
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
      {/* Dark hero */}
      <div style={{ background:HERO_BG, paddingBottom:52 }}>
        <div style={{ padding:'52px 20px 0' }}>
          <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:10 }}>Activity</p>
          <h1 style={{ fontSize:36, fontWeight:900, color:'#fff', letterSpacing:'-1px', lineHeight:1, marginBottom:20 }}>Transactions</h1>
          {list.length>0 && (
            <div style={{ display:'flex', gap:24 }}>
              <div>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Invested</p>
                <p style={{ fontSize:18, fontWeight:900, color:C.to }}>{inrS(inv)}</p>
              </div>
              <div>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Spent</p>
                <p style={{ fontSize:18, fontWeight:900, color:'#FB7185' }}>{inrS(exp)}</p>
              </div>
              <div>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Count</p>
                <p style={{ fontSize:18, fontWeight:900, color:'rgba(255,255,255,0.6)' }}>{list.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ background:C.lightBg, marginTop:-28 }}>
        <div style={{ padding:'16px 16px 0' }}>
          {/* Search */}
          <div style={{ position:'relative', marginBottom:16 }}>
            <Search size={14} color={C.mutText} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
            <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…"
              style={{ ...inp, paddingLeft:40, background:C.white }}/>
            {q && <button onClick={()=>setQ('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', width:22, height:22, borderRadius:'50%', border:'none', background:C.bdr, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={11} color={C.secText}/></button>}
          </div>

          {/* Type chips */}
          <div className="scrollbar-hide" style={{ display:'flex', gap:8, overflowX:'auto', marginBottom:12 }}>
            {[{v:'all',l:'All'},{v:'expense',l:'Expenses'},{v:'investment',l:'Investments'}].map(({v,l})=>(
              <Chip key={v} on={typ===v} onClick={()=>setTyp(v)}>{l}</Chip>
            ))}
          </div>

          {/* Partner chips */}
          <div className="scrollbar-hide" style={{ display:'flex', gap:8, overflowX:'auto', marginBottom:20 }}>
            <Chip on={pp==='all'} onClick={()=>setPp('all')}>All Partners</Chip>
            {partners.map(p=><Chip key={p.id} on={pp===p.id} onClick={()=>setPp(p.id)} color={p.color}>{p.name}</Chip>)}
          </div>

          <Timeline txs={list} partners={partners} showMenu onEdit={editTx} onDelete={deleteTx}/>
          <div style={{ height:20 }}/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  PARTNERS VIEW  (Wint Portfolio "My Portfolio" style)
// ─────────────────────────────────────────────────────────
function Partners({ partners, txs, addP, editP, delP }) {
  const [exp, setExp] = useState(null);
  const totInv = txs.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
  const totExp = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);

  return (
    <div>
      <div style={{ background:HERO_BG, paddingBottom:52 }}>
        <div style={{ padding:'52px 20px 0' }}>
          <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:10 }}>Team</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
            <h1 style={{ fontSize:36, fontWeight:900, color:'#fff', letterSpacing:'-1px', lineHeight:1 }}>Partners</h1>
            <button onClick={addP} style={{
              display:'flex', alignItems:'center', gap:7, padding:'10px 16px', borderRadius:14,
              background:BRAND_GRAD, color:'#fff', fontWeight:800, fontSize:12, border:'none', cursor:'pointer',
              boxShadow:`0 6px 20px ${C.from}55`,
            }}>
              <UserPlus size={13}/> Add
            </button>
          </div>
          <div style={{ display:'flex', gap:28, marginTop:18 }}>
            <div><p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Partners</p><p style={{ fontSize:18, fontWeight:900, color:'rgba(255,255,255,0.7)' }}>{partners.length}</p></div>
            <div><p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Invested</p><p style={{ fontSize:18, fontWeight:900, color:C.to }}>{inrS(totInv)}</p></div>
            <div><p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Spent</p><p style={{ fontSize:18, fontWeight:900, color:'#FB7185' }}>{inrS(totExp)}</p></div>
          </div>
        </div>
      </div>

      <div style={{ background:C.lightBg, marginTop:-28, padding:'16px 16px 0' }}>

        {/* Tabs — like Wint REPAYMENTS / INVESTMENTS */}
        {/* (here we show partner cards) */}
        {!partners.length ? (
          <div style={{ background:C.white, borderRadius:16, padding:'48px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:8, textAlign:'center', border:`2px dashed ${C.bdr}` }}>
            <span style={{ fontSize:36 }}>👥</span>
            <p style={{ fontSize:13, fontWeight:800, color:C.priText }}>No partners yet</p>
          </div>
        ) : partners.map(p => {
          const ptx   = txs.filter(t=>t.pid===p.id);
          const pInv  = ptx.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
          const pExp  = ptx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
          const pBal  = pInv - pExp;
          const burn  = pInv>0 ? Math.round((pExp/pInv)*100) : 0;
          const isExp = exp===p.id;

          return (
            <div key={p.id} style={{ background:C.white, borderRadius:16, marginBottom:16, overflow:'hidden', border:`1px solid ${C.bdr}`, boxShadow:C.shd }}>
              {/* Partner header — like Wint's fund title */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 18px', borderBottom:`1px solid ${C.bdr}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:16, background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:900, color:'#fff', boxShadow:`0 6px 20px ${p.color}45` }}>
                    {p.initials}
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                      <p style={{ fontSize:16, fontWeight:900, color:C.priText, letterSpacing:'-0.2px' }}>{p.name}</p>
                      {p.isYou && <span style={{ fontSize:8, fontWeight:900, padding:'2px 8px', borderRadius:6, background:`${p.color}18`, color:p.color, letterSpacing:'0.1em' }}>YOU</span>}
                    </div>
                    {p.email && <p style={{ fontSize:10, color:C.secText }}>{p.email}</p>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>editP(p)} style={{ width:32, height:32, borderRadius:9, border:`1.5px solid ${C.bdr}`, background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.secText }}>
                    <Edit2 size={12}/>
                  </button>
                  {!p.isYou && <button onClick={()=>delP(p.id)} style={{ width:32, height:32, borderRadius:9, border:'1.5px solid rgba(239,68,68,0.2)', background:'#FFF5F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#EF4444' }}>
                    <Trash2 size={12}/>
                  </button>}
                </div>
              </div>

              {/* Upcoming / balance section (like Wint "Upcoming ₹0") */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:`1px solid ${C.bdr}` }}>
                {[{l:'Invested',v:pInv,c:'#10b981'},{l:'Spent',v:pExp,c:'#E96B3E'}].map(({l,v,cv})=>(
                  <div key={l} style={{ padding:'16px 18px' }}>
                    <p style={{ fontSize:9, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.mutText, marginBottom:8 }}>{l}</p>
                    <p style={{ fontSize:26, fontWeight:900, color:l==='Invested'?'#10b981':'#E96B3E', letterSpacing:'-1px' }}>{inr(v)}</p>
                  </div>
                ))}
              </div>

              {/* Balance + burn bar */}
              <div style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div>
                    <p style={{ fontSize:9, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.mutText, marginBottom:5 }}>Net Balance</p>
                    <p style={{ fontSize:22, fontWeight:900, color:pBal>=0?C.priText:'#EF4444', letterSpacing:'-0.5px' }}>{inr(pBal)}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:9, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.mutText, marginBottom:5 }}>Burn Rate</p>
                    <p style={{ fontSize:22, fontWeight:900, color:burn>80?'#EF4444':burn>50?'#F59E0B':C.from }}>{burn}%</p>
                  </div>
                </div>
                {pInv>0 && (
                  <div>
                    <div style={{ width:'100%', height:4, borderRadius:999, background:'rgba(90,62,43,0.08)', overflow:'hidden' }}>
                      <div style={{ width:`${Math.min(burn,100)}%`, height:'100%', borderRadius:999, background:p.color, transition:'width 0.7s' }}/>
                    </div>
                    <p style={{ fontSize:10, color:C.secText, marginTop:6, fontWeight:600 }}>{burn}% used</p>
                  </div>
                )}
              </div>

              {/* Expand toggle — like "Explore Bonds" at bottom of portfolio */}
              {ptx.length>0 && (
                <button onClick={()=>setExp(isExp?null:p.id)} style={{
                  width:'100%', padding:'14px 0', border:'none', cursor:'pointer',
                  borderTop:`1px solid ${C.bdr}`, background:`linear-gradient(135deg,${C.heroTop},${C.heroBtm})`,
                  display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px',
                  fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.7)',
                }}>
                  <span>View transactions</span>
                  <ChevronDown size={14} style={{ transform:isExp?'rotate(180deg)':'rotate(0deg)', transition:'0.2s' }}/>
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
        <div style={{ height:20 }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  REPORTS VIEW
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

  const csv = () => {
    if (!txs.length) return;
    const r = txs.map(t=>[t.date,t.type,t.cat,t.amount,partners.find(p=>p.id===t.pid)?.name||'',t.note||''].join(','));
    const b = new Blob([['Date,Type,Category,Amount,Partner,Note',...r].join('\n')],{type:'text/csv'});
    const a = Object.assign(document.createElement('a'),{href:URL.createObjectURL(b),download:'lem.csv'});
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <div style={{ background:HERO_BG, paddingBottom:52 }}>
        <div style={{ padding:'52px 20px 0' }}>
          <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:10 }}>Overview</p>
          <h1 style={{ fontSize:36, fontWeight:900, color:'#fff', letterSpacing:'-1px', lineHeight:1, marginBottom:18 }}>Reports</h1>
          <div className="scrollbar-hide" style={{ display:'flex', gap:8, overflowX:'auto' }}>
            {[{id:'all',name:'All',color:C.from},...partners].map(p=>(
              <button key={p.id} onClick={()=>setSp(p.id)} style={{
                padding:'8px 16px', borderRadius:999, fontSize:11, fontWeight:700, border:'none',
                background: sp===p.id?BRAND_GRAD:'rgba(255,255,255,0.1)', color:sp===p.id?'#fff':'rgba(255,255,255,0.5)',
                cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s',
              }}>{p.name}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:C.lightBg, marginTop:-28, padding:'16px 16px 0' }}>

        {/* Dark net balance block (Wint portfolio dark section) */}
        <div style={{ background:`linear-gradient(135deg,${C.heroTop},${C.heroBtm})`, borderRadius:16, padding:'22px 20px', marginBottom:16, boxShadow:'0 16px 40px rgba(0,0,0,0.25)' }}>
          <p style={{ fontSize:9, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:12 }}>Net Balance</p>
          <p style={{ fontSize:44, fontWeight:900, color:bal>=0?'#fff':'#EF4444', letterSpacing:'-2px', lineHeight:1, marginBottom:18 }}>{inr(bal)}</p>
          <div style={{ display:'flex', gap:28 }}>
            <div><p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Invested</p><p style={{ fontSize:15, fontWeight:900, color:'#10b981' }}>{inr(inv)}</p></div>
            <div><p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Spent</p><p style={{ fontSize:15, fontWeight:900, color:'#FB7185' }}>{inr(exp)}</p></div>
          </div>
        </div>

        {/* Trend */}
        {(inv>0||exp>0) && (
          <div style={{ background:C.white, borderRadius:16, padding:'18px', marginBottom:16, border:`1px solid ${C.bdr}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <p style={{ fontSize:10, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.secText }}>6-Month Trend</p>
              <TrendingUp size={13} color={C.mutText}/>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.from} stopOpacity={0.2}/><stop offset="100%" stopColor={C.from} stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,62,43,0.06)" vertical={false}/>
                <XAxis dataKey="m" tick={{ fontSize:9, fill:C.mutText }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:C.heroTop, border:'none', borderRadius:12, color:'#fff', fontSize:11 }}/>
                <Area type="monotone" dataKey="inv" stroke="#10b981" fill="url(#gi)" strokeWidth={2.5} name="Invested" dot={false}/>
                <Area type="monotone" dataKey="exp" stroke={C.from} fill="url(#gs)" strokeWidth={2.5} name="Spent" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category breakdown */}
        {catD.length>0 && (
          <div style={{ background:C.white, borderRadius:16, padding:'18px', marginBottom:16, border:`1px solid ${C.bdr}` }}>
            <p style={{ fontSize:10, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.secText, marginBottom:14 }}>Expense Breakdown</p>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <ResponsiveContainer width={86} height={86}>
                <PieChartComp>
                  <Pie data={catD} cx="50%" cy="50%" innerRadius={20} outerRadius={40} dataKey="v" strokeWidth={2} stroke={C.white}>
                    {catD.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                </PieChartComp>
              </ResponsiveContainer>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:9 }}>
                {catD.slice(0,5).map(c=>(
                  <div key={c.n} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:c.color, flexShrink:0 }}/>
                    <span style={{ fontSize:12, fontWeight:700, color:C.priText, flex:1 }}>{c.icon} {c.n}</span>
                    <span style={{ fontSize:12, fontWeight:900, color:C.priText }}>{inrS(c.v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary grid */}
        <div style={{ background:C.white, borderRadius:16, padding:'18px', marginBottom:16, border:`1px solid ${C.bdr}` }}>
          <p style={{ fontSize:10, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.secText, marginBottom:14 }}>Summary</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              {e:'📊',l:'Transactions',v:String(txs.length),    c:C.from},
              {e:'👥',l:'Partners',    v:String(partners.length),c:'#3b82f6'},
              {e:'📈',l:'Avg Entry',   c:C.mid, v:txs.length?inrS(txs.reduce((s,t)=>s+t.amount,0)/txs.length):'₹0'},
              {e:'🔥',l:'Burn Rate',   c:'#E96B3E', v:inv>0?`${Math.round((exp/inv)*100)}%`:'0%'},
            ].map(s=>(
              <div key={s.l} style={{ background:'#FAF5EE', borderRadius:14, padding:'16px', border:`1px solid ${C.bdr}` }}>
                <span style={{ fontSize:24 }}>{s.e}</span>
                <p style={{ fontSize:22, fontWeight:900, color:s.c, marginTop:8, letterSpacing:'-0.5px' }}>{s.v}</p>
                <p style={{ fontSize:9, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:C.mutText, marginTop:4 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export — "Explore Bonds" style button */}
        <div style={{ marginBottom:8 }}>
          <p style={{ fontSize:10, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:C.secText, marginBottom:12 }}>Export</p>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={csv} style={{
              flex:1, height:50, borderRadius:14, border:'none', cursor:'pointer',
              background:`linear-gradient(135deg,${C.heroTop},${C.heroBtm})`, color:'#fff',
              fontWeight:800, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              boxShadow:'0 6px 18px rgba(0,0,0,0.25)',
            }}>
              <Download size={14}/> CSV Export
            </button>
            <button onClick={()=>window.print()} style={{
              flex:1, height:50, borderRadius:14, border:'none', cursor:'pointer',
              background:BRAND_GRAD, color:'#fff',
              fontWeight:800, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              boxShadow:`0 6px 18px ${C.from}44`,
            }}>
              <Printer size={14}/> Print
            </button>
          </div>
        </div>
        <div style={{ height:20 }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  APP ROOT
// ─────────────────────────────────────────────────────────
export default function App() {
  const saved = load();
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
  const totInv = txs.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0);
  const totExp = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);

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

  const NAV = 62; // bottom nav height

  return (
    <div style={{
      display:'flex', justifyContent:'center', alignItems:'center',
      minHeight:'100dvh', background:'#E6D3B3',
      fontFamily:'Inter,system-ui,sans-serif',
    }}>
      {toast && <Toast msg={toast.msg} type={toast.type} done={()=>setToast(null)}/>}
      {confirm && <Confirm title={confirm.title} body={confirm.body} ok={confirm.ok} cancel={()=>setConf(null)}/>}

      {/* Phone shell */}
      <div style={{
        width:'100%', maxWidth:430, height:'100dvh',
        display:'flex', flexDirection:'column',
        position:'relative', overflow:'hidden',
        background:C.heroTop,
      }}>
        {/* Scrollable content */}
        <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', paddingBottom:NAV }}>
          {tab==='dashboard'    && <Dashboard txs={txs} partners={parts} editTx={doEditTx} deleteTx={doDelTx} goTab={setTab}/>}
          {tab==='transactions' && <Transactions txs={txs} partners={parts} editTx={doEditTx} deleteTx={doDelTx}/>}
          {tab==='partners'     && <Partners partners={parts} txs={txs} addP={()=>{ setEditP(null); setAddP(true); }} editP={doEditP} delP={doDelP}/>}
          {tab==='reports'      && <Reports txs={txs} partners={parts}/>}
        </div>

        {/* FAB — above bottom nav */}
        {tab !== 'reports' && (
          <button onClick={()=>{ setEditTx(null); setAddTx(true); }} style={{
            position:'absolute', bottom: NAV + 14, right:18,
            width:50, height:50, borderRadius:'50%', border:'none',
            background:BOND_BG, boxShadow:`0 8px 24px ${C.from}66`,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:25,
          }}>
            <Plus size={20} color="#fff" strokeWidth={2.5}/>
          </button>
        )}

        {/* Bottom nav */}
        <BottomNav active={tab} set={setTab}/>

        {/* Modals */}
        <AddEntry open={addTx} close={closeAddTx} save={saveTx} partners={parts} edit={editTx}/>
        <AddPartner open={addP} close={closeAddP} save={saveP} edit={editP} taken={parts.filter(p=>p.id!==editP?.id).map(p=>p.color)}/>
      </div>
    </div>
  );
}
