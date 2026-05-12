import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, 
  Home, 
  Refrigerator, 
  Settings, 
  Leaf, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  History,
  Timer,
  ShoppingBag,
  Info,
  Camera,
  X,
  UserPlus,
  Cloud,
  Trash2,
  MapPin,
  BarChart3,
  Barcode
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { db, auth } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

// --- Components ---

const LivelyTree = ({ healthScore }) => {
  // healthScore 0-100
  const isHealthy = healthScore > 70;
  const canopyColor = isHealthy ? '#5D6D3F' : healthScore > 40 ? '#8B8D4E' : '#A67B5B';
  const fruitColor = '#FFB7C5'; // Soft pink for fruits

  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Grass Shadow */}
        <ellipse cx="60" cy="105" rx="40" ry="8" fill="#E8EDE0" />
        
        {/* Trunk */}
        <rect x="56" y="75" width="8" height="30" rx="2" fill="#7D5A44" />
        
        {/* Lush Canopy (Overlapping Circles) */}
        <motion.g
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <circle cx="60" cy="55" r="28" fill={canopyColor} opacity="0.9" />
          <circle cx="45" cy="50" r="22" fill={canopyColor} opacity="0.8" />
          <circle cx="75" cy="50" r="22" fill={canopyColor} opacity="0.8" />
          <circle cx="60" cy="38" r="20" fill={canopyColor} opacity="0.8" />
          
          {/* Fruits (Pink Dots) - only if healthy */}
          {healthScore > 60 && (
            <>
              <circle cx="50" cy="45" r="3" fill={fruitColor} />
              <circle cx="70" cy="42" r="3" fill={fruitColor} />
              <circle cx="60" cy="32" r="3" fill={fruitColor} />
              <circle cx="45" cy="58" r="3" fill={fruitColor} />
              <circle cx="75" cy="55" r="3" fill={fruitColor} />
            </>
          )}
        </motion.g>
      </svg>
    </div>
  );
};

const AuditCard = ({ item, onDismiss, onAdd, onDelete }) => {
  const [manualDate, setManualDate] = useState(item.expiryDate || '');
  const [activeTab, setActiveTab] = useState('impact');
  const [isSaving, setIsSaving] = useState(false);

  const getAlternative = (item) => {
    if (item.score > 80) return { name: 'Top Tier Choice!', reason: 'This product already meets our highest clean-label standards.' };
    const name = (item.name || '').toLowerCase();
    const brand = (item.brand || '').toLowerCase();
    if (name.includes('sauce') || name.includes('tomato')) {
      if (brand.includes('rao')) return { name: 'Cucina Antica', reason: 'Another premium, no-sugar alternative' };
      return { name: 'Rao\'s Homemade', reason: 'No added sugar or seed oils' };
    }
    if (name.includes('mayo')) {
      if (brand.includes('chosen') || brand.includes('primal')) return { name: 'Homemade Mayo', reason: 'The ultimate clean-label hack' };
      return { name: 'Chosen Foods Mayo', reason: '100% Pure Avocado Oil' };
    }
    return { name: 'Organic Local Choice', reason: 'Minimally processed alternative' };
  };

  const handleDateChange = (newDate) => {
    setManualDate(newDate);
    if (item.id && !item.isNew) onAdd({ ...item, expiryDate: newDate });
  };

  const handleAdd = () => {
    setIsSaving(true);
    if ('vibrate' in navigator) navigator.vibrate([30, 30, 30]);
    onAdd({ ...item, expiryDate: manualDate });
    setTimeout(() => setIsSaving(false), 1500);
  };

  const alt = getAlternative(item);

  return (
    <motion.div 
      initial={{ y: 300 }}
      animate={{ y: 0 }}
      exit={{ y: 600 }}
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 shadow-2xl z-[60] max-h-[90vh] overflow-y-auto custom-scrollbar"
    >
      <div className="w-12 h-1.5 bg-stone-100 rounded-full mx-auto mb-6" />
      
      <div className="flex gap-4 items-start mb-6">
        {item.image && (
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 flex-shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              {item.isNew ? (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Product Name" 
                    className="text-2xl font-bold mb-1 w-full border-b border-stone-200 outline-none focus:border-sage"
                    defaultValue={item.name !== 'Unknown Product' ? item.name : ''}
                    onChange={(e) => item.name = e.target.value}
                  />
                  <input 
                    type="text" 
                    placeholder="Brand (optional)" 
                    className="text-xs font-bold text-stone-400 uppercase tracking-widest w-full border-b border-stone-100 outline-none focus:border-sage"
                    defaultValue={item.brand?.startsWith('Scan Result') ? '' : item.brand}
                    onChange={(e) => item.brand = e.target.value}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-1">{item.name}</h2>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{item.brand}</p>
                </>
              )}
            </div>
            <button onClick={onDismiss} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:bg-stone-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Premium Tab Navigation */}
      <div className="flex gap-2 mb-6 p-1 bg-stone-100 rounded-2xl">
        {['impact', 'ingredients', 'nutrition'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'impact' && (
          <motion.div 
            key="impact"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4 mb-8"
          >
            {/* Good Things */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-sage uppercase tracking-widest">Clean Points</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-2 bg-sage/10 text-sage rounded-xl text-[10px] font-bold flex items-center gap-1.5 border border-sage/10">
                  <Leaf className="w-3 h-3" /> No Added Sugar
                </span>
                <span className="px-3 py-2 bg-sage/10 text-sage rounded-xl text-[10px] font-bold flex items-center gap-1.5 border border-sage/10">
                  <CheckCircle2 className="w-3 h-3" /> Organic Base
                </span>
              </div>
            </div>

            {/* Bad Things */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-terracotta uppercase tracking-widest">Watch Out</p>
              <div className="flex flex-wrap gap-2">
                {item.oils !== 'Clean' && (
                  <span className="px-3 py-2 bg-terracotta/10 text-terracotta rounded-xl text-[10px] font-bold flex items-center gap-1.5 border border-terracotta/10">
                    <AlertCircle className="w-3 h-3" /> Seed Oils Found
                  </span>
                )}
                {item.nova >= 3 && (
                  <span className="px-3 py-2 bg-terracotta/10 text-terracotta rounded-xl text-[10px] font-bold flex items-center gap-1.5 border border-terracotta/10">
                    <AlertCircle className="w-3 h-3" /> Ultra Processed
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ingredients' && (
          <motion.div 
            key="ingredients"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="p-5 bg-cream/30 rounded-3xl border border-stone-100 mb-8"
          >
            <p className="text-xs leading-relaxed text-stone-600 italic font-serif">
              "{item.ingredients || 'Ingredients list being processed...'}"
            </p>
          </motion.div>
        )}

        {activeTab === 'nutrition' && (
          <motion.div 
            key="nutrition"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-1 mb-8"
          >
            <div className="flex justify-between items-center px-2 mb-4">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Nutritional Audit</p>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Per 100g</p>
            </div>
            
            {[
              { label: 'Additives', value: `${item.additives || 0}`, icon: <Settings className="w-4 h-4" />, status: item.additives > 5 ? 'bad' : 'good', sub: item.additives > 5 ? 'Contains risky additives' : 'Low risk' },
              { label: 'Fiber', value: `${item.nutrition?.fiber || 0}g`, icon: <Leaf className="w-4 h-4" />, status: item.nutrition?.fiber > 3 ? 'good' : 'neutral', sub: item.nutrition?.fiber > 3 ? 'High fiber' : 'Some fiber' },
              { label: 'Energy', value: `${item.nutrition?.energy || 0} kcal`, icon: <Timer className="w-4 h-4" />, status: item.nutrition?.energy < 200 ? 'good' : 'bad', sub: item.nutrition?.energy < 200 ? 'Low energy' : 'High energy' },
              { label: 'Saturated fat', value: `${item.nutrition?.saturatedFat || 0}g`, icon: <AlertCircle className="w-4 h-4" />, status: item.nutrition?.saturatedFat < 1 ? 'good' : 'bad', sub: item.nutrition?.saturatedFat < 1 ? 'No saturated fat' : 'High fat' },
              { label: 'Sugar', value: `${item.nutrition?.sugar || 0}g`, icon: <ShoppingBag className="w-4 h-4" />, status: item.nutrition?.sugar < 5 ? 'good' : 'bad', sub: item.nutrition?.sugar < 5 ? 'Low sugar' : 'High sugar' },
              { label: 'Sodium', value: `${item.nutrition?.sodium || 0}mg`, icon: <Info className="w-4 h-4" />, status: item.nutrition?.sodium < 400 ? 'good' : 'bad', sub: item.nutrition?.sodium < 400 ? 'Low impact' : 'High sodium' },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 border-b border-stone-50 group">
                <div className="p-2 bg-stone-50 rounded-xl text-stone-400 group-hover:bg-sage/10 group-hover:text-sage transition-colors">
                  {row.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-stone-800">{row.label}</p>
                  <p className="text-[10px] text-stone-400 font-medium">{row.sub}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-600">{row.value}</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${row.status === 'good' ? 'bg-sage shadow-[0_0_8px_rgba(93,109,63,0.4)]' : row.status === 'bad' ? 'bg-terracotta shadow-[0_0_8px_rgba(210,125,86,0.4)]' : 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]'}`} />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alternative & Save Controls (Always Visible) */}
      <div className="bg-sage/5 border border-sage/10 rounded-3xl p-5 mb-8">
        <p className="text-xs font-bold text-sage uppercase mb-3 tracking-widest">Better Alternative</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-stone-800 text-sm">{alt.name}</p>
            <p className="text-[10px] text-stone-400 font-bold uppercase">{alt.reason}</p>
          </div>
          <button className="text-sage font-bold text-xs flex items-center gap-1">Shop <ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="space-y-3">
        <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${!manualDate ? 'bg-red-50/50 border-red-200' : 'bg-stone-50 border-stone-100'}`}>
          <Timer className={`w-4 h-4 ${!manualDate ? 'text-red-400' : 'text-stone-400'}`} />
          <input 
            type="date" 
            value={manualDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-transparent text-sm font-bold text-stone-800 outline-none w-full"
          />
        </div>
        {!manualDate && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-[9px] font-bold text-red-400 ml-4 uppercase tracking-widest"
          >
            * Mandatory Field
          </motion.p>
        )}
        
        <div className="grid grid-cols-4 gap-3">
          <button 
            onClick={() => {
              if (!item.expiryDate) {
                // Shake or alert could be added here
                return;
              }
              handleAdd();
            }} 
            disabled={isSaving || !item.expiryDate}
            className={`col-span-3 py-4 rounded-3xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all flex flex-col items-center justify-center gap-1 ${
              !item.expiryDate ? 'bg-stone-100 text-stone-400 opacity-50 cursor-not-allowed' :
              isSaving ? 'bg-sage text-white scale-95' : 'wooden-btn text-white'
            }`}
          >
            {isSaving ? '✅ Saved' : (
              <>
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4" /> 
                  {item.inPantry ? 'Update Item' : 'Add to Pantry'}
                </div>
                {!item.expiryDate && <span className="text-[8px] opacity-70">Expiry Required</span>}
              </>
            )}
          </button>
          
          <button 
            onClick={() => {
              if (window.confirm('Remove this item from your pantry?')) {
                onDelete(item.id);
                onDismiss();
              }
            }}
            className="col-span-1 bg-red-50 text-red-400 rounded-3xl flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Screens ---

const FilteredListView = ({ title, filter, items, onBack }) => {
  const filteredItems = items.filter(item => {
    // Helper to get days remaining
    const getDays = (dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 999;
      return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
    };
    const days = getDays(item.expiryDate);

    if (filter === 'clean') return item.score >= 70;
    if (filter === 'junky') return item.score < 40;
    if (filter === 'expiring') return days <= 7;
    if (filter === 'week') return days <= 7;
    if (filter === 'month') return days <= 30;
    if (filter === 'year') return true;
    return true;
  });

  return (
    <motion.div 
      initial={{ x: 400 }} 
      animate={{ x: 0 }} 
      exit={{ x: 400 }}
      className="absolute inset-0 bg-cream z-[80] px-6 py-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm transition-transform active:scale-90"><ChevronRight className="w-5 h-5 rotate-180" /></button>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      
      <div className="space-y-4 overflow-y-auto h-[calc(100%-100px)] custom-scrollbar">
        {filteredItems.length > 0 ? filteredItems.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-2xl">
              {item.icon || '📦'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-stone-800 text-sm">{item.name}</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">{item.brand}</p>
              <div className="flex justify-between items-center mt-2">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${item.score > 70 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  Score: {item.score}
                </span>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-terracotta">{item.expiry || 'Safe'}</p>
                  <p className="text-[8px] text-stone-300 font-bold uppercase">{item.expiryDate}</p>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center h-full text-stone-300">
             <CheckCircle2 className="w-12 h-12 mb-4" />
             <p className="font-bold">All clear!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Dashboard = ({ stats, onSelectCategory, onShowMarket }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('Just now');
  const { healthScore, cleanPercent, junkyPercent, expiringCount } = stats;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync('12:46 PM');
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className=""
    >
      <div className="px-6 pt-10 pb-4 border-b border-stone-100 bg-white/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
            <img src="/logo.png" alt="Pantry Bloom" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-serif-luxury text-stone-800 leading-none">Pantry Bloom</h1>
            <p className="text-stone-400 text-sm mt-1 font-medium italic">Your clean kitchen companion</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onShowMarket}
            className="p-2.5 bg-wood/10 text-wood-dark rounded-xl hover:bg-wood/20 transition-all shadow-sm"
            title="Local Farmers Market"
          >
            <MapPin className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSync}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`p-2 rounded-xl transition-all ${isSyncing ? 'bg-sage text-white animate-spin' : 'bg-stone-50 text-stone-300 group-hover:text-sage'}`}>
              <Cloud className="w-4 h-4" />
            </div>
            <span className="text-[8px] font-bold text-stone-300 uppercase tracking-tighter">
              {isSyncing ? 'Syncing...' : `Saved`}
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center py-4 bg-cream">
        <LivelyTree healthScore={healthScore} />
        <div className="text-center mt-6">
          <motion.h3 
            key={healthScore}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-serif-luxury text-[#1a3a1a] tracking-tighter"
          >
            {healthScore}
          </motion.h3>
          <p className="text-sm text-stone-500 mt-2 font-medium">Pantry Health Score</p>
          <div className={`mt-4 px-6 py-2 rounded-full font-bold text-sm inline-block shadow-sm ${
            healthScore >= 80 ? 'bg-[#E8EDE0] text-[#5D6D3F]' :
            healthScore >= 60 ? 'bg-blue-50 text-blue-600' :
            healthScore >= 40 ? 'bg-orange-50 text-orange-600' :
            'bg-red-50 text-terracotta'
          }`}>
            {healthScore >= 80 ? 'Excellent' :
             healthScore >= 60 ? 'Good' :
             healthScore >= 40 ? 'Fair' :
             'Poor'}
          </div>
        </div>
      </div>

      <div className="px-6 grid grid-cols-3 gap-3 mt-6 mb-8">
      <button onClick={() => onSelectCategory('clean', 'Clean Food')} className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all">
        <div className="w-12 h-12 mb-2">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={[{value: cleanPercent}, {value: 100 - cleanPercent}]} innerRadius={15} outerRadius={22} dataKey="value">
                 <Cell fill="#5D6D3F" /><Cell fill="#f5f5f4" />
               </Pie>
             </PieChart>
           </ResponsiveContainer>
        </div>
        <p className="text-lg font-bold text-stone-800">{cleanPercent}%</p>
        <p className="text-[8px] text-stone-400 uppercase font-bold tracking-widest mt-1">Clean Food</p>
      </button>
      
      <button onClick={() => onSelectCategory('junky', 'Junky Food')} className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all">
        <div className="w-12 h-12 mb-2">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={[{value: junkyPercent}, {value: 100 - junkyPercent}]} innerRadius={15} outerRadius={22} dataKey="value">
                 <Cell fill="#D27D56" /><Cell fill="#f5f5f4" />
               </Pie>
             </PieChart>
           </ResponsiveContainer>
        </div>
        <p className="text-lg font-bold text-stone-800">{junkyPercent}%</p>
        <p className="text-[8px] text-stone-400 uppercase font-bold tracking-widest mt-1 text-terracotta">Junky</p>
      </button>
 
      <button onClick={() => onSelectCategory('expiring', 'Expiring Soon')} className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all">
        <div className={expiringCount > 0 ? 'animate-bounce' : ''}>
          <Timer className={`w-8 h-8 mb-4 ${expiringCount > 0 ? 'text-red-500' : 'text-terracotta'}`} />
        </div>
        <p className="text-lg font-bold text-stone-800">{expiringCount}</p>
        <p className="text-[8px] text-stone-400 uppercase font-bold tracking-widest mt-1">Expiring</p>
      </button>
    </div>

  </motion.div>
  );
};

const HistoryScreen = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="px-6 py-8 pb-24"
  >
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl">Bloom History</h1>
      <button className="text-xs text-sage font-bold flex items-center gap-1">SMS Alerts On <CheckCircle2 className="w-3 h-3" /></button>
    </div>

    <div className="space-y-4">
      {[
        { name: 'Organic Black Beans', brand: 'Eden Foods', score: 95, status: 'Excellent', icon: '🥫', color: 'bg-green-50 text-green-700' },
        { name: 'Chocolate Chip Cookies', brand: 'Chips Ahoy', score: 32, status: 'Poor', icon: '🍪', color: 'bg-red-50 text-red-700' },
        { name: 'Almond Butter', brand: 'Barney Butter', score: 92, status: 'Excellent', icon: '🥜', color: 'bg-green-50 text-green-700' },
        { name: 'Pasta Sauce', brand: 'Prego Traditional', score: 58, status: 'Fair', icon: '🍝', color: 'bg-yellow-50 text-yellow-700' },
      ].map((item, idx) => (
        <div key={idx} className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-4 group">
          <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
            {item.icon}
          </div>
          <div className="flex-1">
            <p className="font-bold text-stone-800 text-sm">{item.name}</p>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter mt-0.5">{item.brand}</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.color}`}>
                {item.score} • {item.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const Stats = ({ stats, onSelectCategory }) => {
  const { distData } = stats;
  return (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="px-6 py-8 pb-24"
  >
    <h1 className="text-2xl mb-8">Pantry Health Stats</h1>
    
    <div className="cozy-card mb-8 p-8 flex flex-col items-center">
      <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6 text-center">Health Distribution</h4>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={8}
              dataKey="value"
            >
              {distData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-6 mt-4">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sage" /><span className="text-[10px] font-bold">Good</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-wood" /><span className="text-[10px] font-bold">Fair</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-terracotta" /><span className="text-[10px] font-bold">Poor</span></div>
      </div>
    </div>

    <h3 className="text-lg mb-4">Expiry Forecast</h3>
    <div className="space-y-4">
      {[
        { id: 'week', label: 'This Week', count: stats.weekCount, color: 'bg-terracotta' },
        { id: 'month', label: 'This Month', count: stats.monthCount, color: 'bg-wood' },
        { id: 'year', label: 'Yearly Stock', count: stats.yearCount, color: 'bg-sage' },
      ].map((period) => {
        const total = (stats.weekCount + stats.monthCount + stats.yearCount) || 1;
        const percentage = Math.round((period.count / total) * 100);
        return (
          <button 
            key={period.label} 
            onClick={() => onSelectCategory(period.id, period.label)}
            className="w-full bg-white p-5 rounded-[2rem] border border-stone-100 text-left active:scale-95 transition-all"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm">{period.label}</span>
              <span className="text-xs font-bold text-stone-400">{period.count} items</span>
            </div>
            <div className="w-full h-2 bg-stone-50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className={`h-full ${period.color}`} 
              />
            </div>
          </button>
        );
      })}
    </div>
  </motion.div>
  );
};

const Scanner = ({ onScan }) => {
  const videoRef = React.useRef(null);
  const [hasCamera, setHasCamera] = React.useState(false);
  const [showManual, setShowManual] = React.useState(false);
  const [manualCode, setManualCode] = React.useState('');
  const [isDetected, setIsDetected] = React.useState(false);

  useEffect(() => {
    let stream = null;
    let isScanning = true;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            aspectRatio: { ideal: 1.7777777778 },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 60 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);

          // Deep Hardware Focus Lock
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities?.() || {};
          
          if (capabilities.focusMode) {
            try {
              const constraints = {
                advanced: [{ 
                  focusMode: capabilities.focusMode.includes('continuous') ? 'continuous' : 'manual',
                  pointsOfInterest: { x: 0.5, y: 0.5 }
                }]
              };
              // Add Digital Zoom if supported (allows user to stay back and stay sharp)
              if (capabilities.zoom) {
                constraints.advanced[0].zoom = Math.min(2.0, capabilities.zoom.max);
              }
              await track.applyConstraints(constraints);
            } catch (e) { console.warn("Lens adjustment failed:", e); }
          }
          
          // --- Hardware Focus Heartbeat (Force lens to seek every 2s) ---
          const forceFocus = async () => {
            if (!track || track.readyState !== 'live') return;
            try {
              const caps = track.getCapabilities();
              if (caps.focusMode) {
                await track.applyConstraints({
                  advanced: [{ 
                    focusMode: caps.focusMode.includes('continuous') ? 'continuous' : 'manual',
                    pointsOfInterest: { x: 0.5, y: 0.5 }
                  }]
                });
              }
            } catch (e) { /* ignore */ }
          };
          const fInt = setInterval(forceFocus, 2000);
          forceFocus();
        }

        if ('BarcodeDetector' in window) {
          const detector = new BarcodeDetector({ formats: ['ean_13', 'upc_a', 'code_128', 'code_39'] });
          
          const scanLoop = async () => {
            if (!isScanning) return;
            const video = videoRef.current;
            
            if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
              try {
                const scanWidth = video.videoWidth * 0.8;
                const scanHeight = video.videoHeight * 0.3;
                const startX = (video.videoWidth - scanWidth) / 2;
                const startY = (video.videoHeight - scanHeight) / 2;

                canvas.width = scanWidth;
                canvas.height = scanHeight;
                ctx.filter = 'contrast(2.0) grayscale(1) brightness(1.2)';
                ctx.drawImage(video, startX, startY, scanWidth, scanHeight, 0, 0, scanWidth, scanHeight);

                const barcodes = await detector.detect(canvas);
                if (barcodes.length > 0) {
                  isScanning = false;
                  if ('vibrate' in navigator) navigator.vibrate(40);
                  onScan(barcodes[0].rawValue); // Instant trigger
                  return;
                }
              } catch (e) { /* ignore */ }
            }
            requestAnimationFrame(scanLoop);
          };
          
          requestAnimationFrame(scanLoop);
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    startCamera();
    return () => {
      isScanning = false;
      if (fInt) clearInterval(fInt);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Real Camera Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover contrast-[1.1]"
      />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Clean Rectangular Frame */}
        <div className={`w-[85%] h-44 border-4 rounded-[2rem] relative overflow-hidden transition-all duration-300 ${isDetected ? 'border-sage' : 'border-white/20'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          {/* Corner Brackets */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
        </div>
      </div>

      <div className="absolute top-10 left-6 right-6 flex justify-between items-center text-white">
        <h3 className="text-xl font-bold drop-shadow-md">Auditor Scan</h3>
        <button className="p-3 bg-white/10 rounded-full backdrop-blur-md"><Settings className="w-5 h-5" /></button>
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-6 px-8">
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] drop-shadow-md">
            Align Barcode to Scan
          </p>
          <button 
            onClick={() => setShowManual(true)}
            className="text-white/40 text-[9px] font-bold uppercase tracking-widest underline decoration-white/20"
          >
            Enter Manually
          </button>
        </div>
        
        {/* Shutter Button (Manual Override) */}
        <button 
          onClick={() => onScan('048001213501')}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white/20 active:scale-95 transition-all shadow-2xl"
        >
          <div className="w-10 h-10 bg-stone-800 rounded-full" />
        </button>
      </div>

      {/* Manual Entry Overlay */}
      <AnimatePresence>
        {showManual && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-8"
          >
            <div className="w-full space-y-6">
              <div className="text-center">
                <h3 className="text-2xl text-white font-serif mb-2">Manual Entry</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Type the Barcode Number</p>
              </div>
              <input 
                type="text"
                autoFocus
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. 048001213501"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-center text-xl outline-none focus:border-sage transition-colors"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowManual(false)} className="flex-1 py-4 bg-white/5 text-white/60 rounded-2xl font-bold text-xs uppercase tracking-widest">Cancel</button>
                <button 
                  onClick={() => { if(manualCode) onScan(manualCode); }} 
                  className="flex-1 py-4 bg-sage text-white rounded-2xl font-bold text-xs uppercase tracking-widest"
                >
                  Audit Product
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MarketMapScreen = ({ onBack }) => {
  const markets = [
    { name: 'Wyndham Vale Farmers Market', location: 'Werribee Park', day: 'Saturdays', time: '8:00 AM - 1:00 PM', distance: '1.2 km' },
    { name: 'Point Cook Seasonal Market', location: 'Murnong St', day: 'Sundays', time: '9:00 AM - 2:00 PM', distance: '4.5 km' },
    { name: 'Hoppers Crossing Fresh', location: 'Old Geelong Rd', day: 'Daily', time: '7:00 AM - 6:00 PM', distance: '3.1 km' },
  ];

  return (
    <motion.div 
      initial={{ y: 800 }} 
      animate={{ y: 0 }} 
      exit={{ y: 800 }}
      className="absolute inset-0 bg-cream z-[90] flex flex-col"
    >
      <div className="p-8 flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm"><ChevronRight className="w-5 h-5 rotate-180" /></button>
        <h2 className="text-2xl">Market Finder</h2>
      </div>

      <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-32">
        <div className="w-full h-56 bg-[#f4f1ea] rounded-[3rem] relative overflow-hidden shadow-inner border-4 border-white">
           {/* Boutique SVG Map Illustration */}
           <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 200">
             <path d="M0,50 Q100,20 200,50 T400,50" fill="none" stroke="#5D6D3F" strokeWidth="1" strokeDasharray="4 4" />
             <path d="M50,0 Q80,100 50,200" fill="none" stroke="#5D6D3F" strokeWidth="1" strokeDasharray="4 4" />
             <rect x="120" y="80" width="60" height="40" rx="10" fill="#E8EDE0" />
             <rect x="250" y="40" width="80" height="50" rx="10" fill="#E8EDE0" />
             <circle cx="200" cy="100" r="80" fill="none" stroke="#A67B5B" strokeWidth="0.5" strokeDasharray="2 2" />
           </svg>
           
           {/* Current Location Pulsar */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
             <motion.div 
               animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }} 
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="absolute w-12 h-12 bg-sage rounded-full" 
             />
             <div className="relative w-4 h-4 bg-sage rounded-full border-2 border-white shadow-lg" />
           </div>

           {/* Market Pins */}
           {markets.map((m, i) => (
             <motion.div 
               key={i}
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ delay: i * 0.2 }}
               className="absolute"
               style={{ 
                 top: `${20 + (i * 30)}%`, 
                 left: `${15 + (i * 35)}%` 
               }}
             >
               <div className="w-3 h-3 bg-terracotta rounded-full border-2 border-white shadow-sm" />
             </motion.div>
           ))}
           
           <div className="absolute bottom-4 left-6 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[8px] font-bold text-stone-400 uppercase tracking-widest shadow-sm">
             Wyndham Vale, VIC
           </div>
        </div>

        {markets.map((market, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[2rem] border border-stone-100 shadow-sm flex justify-between items-center group">
            <div>
              <p className="font-bold text-stone-800">{market.name}</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter mb-2">{market.location}</p>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-sage/10 text-sage text-[8px] font-bold rounded-full">{market.day}</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-400 text-[8px] font-bold rounded-full">{market.time}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-stone-800">{market.distance}</p>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(market.name + ' ' + market.location)}`, '_blank')}
                className="text-[10px] font-bold text-sage underline mt-1"
              >
                Get Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const Pantry = ({ items, onItemClick }) => {
  const [search, setSearch] = useState('');
  
  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.brand.toLowerCase().includes(search.toLowerCase())
  );

  const goodItems = filtered.filter(i => i.score >= 50);
  const badItems = filtered.filter(i => i.score < 50);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="px-6 py-8 pb-32 bg-[#FDFCF7]"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif-luxury text-stone-800">My Pantry</h1>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Managed Inventory</p>
        </div>
        <button 
          onClick={onItemClick ? () => onItemClick({ isNew: true, name: '', brand: '', score: 75, icon: '📦' }) : null}
          className="w-12 h-12 bg-sage text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-10">
        <input 
          type="text"
          placeholder="Search your pantry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-stone-100 rounded-2xl py-4 px-6 text-sm shadow-sm outline-none focus:border-sage transition-all pl-12"
        />
        <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
      </div>

      {/* Optimal Selection */}
      {goodItems.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6 px-1">
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Optimal Selection</h2>
            <div className="h-px flex-1 bg-stone-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {goodItems.map((item, idx) => (
              <PantryCard key={idx} item={item} onClick={() => onItemClick({ ...item, inPantry: true })} />
            ))}
          </div>
        </div>
      )}

      {/* Audit Required */}
      {badItems.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6 px-1">
            <h2 className="text-sm font-bold text-terracotta uppercase tracking-widest">Audit Required</h2>
            <div className="h-px flex-1 bg-stone-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {badItems.map((item, idx) => (
              <PantryCard key={idx} item={item} onClick={() => onItemClick({ ...item, inPantry: true })} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-stone-300">
          <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-bold">No items found</p>
        </div>
      )}
    </motion.div>
  );
};

const PantryCard = ({ item, onClick }) => {
  const d = new Date(item.expiryDate);
  const days = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  const isExpiring = days <= 7;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white p-3 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center text-center cursor-pointer active:scale-95 transition-all relative group"
    >
      {isExpiring && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
      )}
      
      <div className="w-full aspect-square mb-3 rounded-2xl bg-stone-50 overflow-hidden flex items-center justify-center relative group-hover:bg-cream transition-colors">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
        ) : (
          <span className="text-4xl">{item.icon}</span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-stone-100">
           <div className={`h-full ${item.score > 70 ? 'bg-sage' : item.score > 40 ? 'bg-wood' : 'bg-terracotta'}`} style={{ width: `${item.score}%` }} />
        </div>
      </div>
      
      <p className="text-[11px] font-bold text-stone-800 truncate w-full px-1">{item.name}</p>
      <p className="text-[8px] text-stone-400 font-bold uppercase tracking-tighter mt-1">{item.brand}</p>
      
      <div className="mt-3 flex items-center gap-1.5">
         <span className={`text-[9px] font-bold ${item.score > 70 ? 'text-sage' : 'text-stone-500'}`}>Score: {item.score}</span>
         <div className="w-1 h-1 rounded-full bg-stone-200" />
         <span className={`text-[8px] font-bold ${isExpiring ? 'text-red-500' : 'text-stone-300'}`}>
           {isExpiring ? 'Expiring' : 'Safe'}
         </span>
      </div>
    </motion.div>
  );
};

// --- App ---

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [scannedItem, setScannedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showMarket, setShowMarket] = useState(false);
  const [user, setUser] = useState(null);
  const mainScrollRef = React.useRef(null);

  // --- Scroll to Top on Screen Change or Category Drill-down ---
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo(0, 0);
    }
  }, [currentScreen, activeCategory]);

  // 1. Initialize from LocalStorage or default
  const [pantryItems, setPantryItems] = useState(() => {
    const saved = localStorage.getItem('pantry_bloom_items');
    if (saved) return JSON.parse(saved);
    return [
      { 
        name: 'Organic Black Beans', 
        brand: 'Eden Foods', 
        score: 95, 
        status: 'Excellent', 
        icon: '🥫', 
        expiryDate: 'Oct 12, 2026',
        ingredients: 'Organic Black Beans, Water, Sea Salt.',
        oils: 'None',
        sugar: '0g',
        additives: []
      },
      { 
        name: 'Chocolate Chip Cookies', 
        brand: 'Chips Ahoy', 
        score: 32, 
        status: 'Poor', 
        icon: '🍪', 
        expiry: '2 days', 
        expiryDate: 'May 14, 2026',
        ingredients: 'Unbleached Enriched Flour, High Fructose Corn Syrup, Palm Oil, Sugar, Semisweet Chocolate Chips, Artificial Flavor.',
        oils: 'Palm Oil',
        sugar: '11g',
        additives: ['High Fructose Corn Syrup', 'Artificial Flavor']
      }
    ];
  });

  // --- Dynamic Stats Engine ---
  const stats = React.useMemo(() => {
    const total = pantryItems.length || 1;
    const clean = pantryItems.filter(i => i.score >= 70);
    const junky = pantryItems.filter(i => i.score < 40);
    const fair = pantryItems.filter(i => i.score >= 40 && i.score < 70);
    
    // Calculate Days
    const getDays = (dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 999;
      return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
    };
    
    const expiringWeek = pantryItems.filter(i => getDays(i.expiryDate) <= 7);
    const expiringMonth = pantryItems.filter(i => getDays(i.expiryDate) <= 30);
    const longTerm = pantryItems.filter(i => getDays(i.expiryDate) > 30);
    const scoreSum = pantryItems.reduce((acc, i) => acc + (i.score || 0), 0);
    
    return {
      healthScore: Math.round(scoreSum / (pantryItems.length || 1)),
      cleanPercent: Math.round((clean.length / total) * 100),
      junkyPercent: Math.round((junky.length / total) * 100),
      expiringCount: expiringWeek.length,
      weekCount: expiringWeek.length,
      monthCount: expiringMonth.length,
      yearCount: longTerm.length,
      distData: [
        { name: 'Good', value: clean.length, color: '#5D6D3F' },
        { name: 'Fair', value: fair.length, color: '#A67B5B' },
        { name: 'Poor', value: junky.length, color: '#D27D56' }
      ]
    };
  }, [pantryItems]);

  // 1. User Authentication & Real-time Sync
  useEffect(() => {
    // A. Handle Authentication
    const authUnsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        signInAnonymously(auth).catch(e => console.error("Auth failed:", e));
      }
    });

    return () => authUnsubscribe();
  }, []);

  // 1.5 System Notification Engine (Expiry Alerts)
  useEffect(() => {
    if (!("Notification" in window)) return;
    
    const checkUrgentExpiry = async () => {
      // Request Permission
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }
      
      if (Notification.permission === 'granted') {
        const urgentItems = pantryItems.filter(i => {
          const d = new Date(i.expiryDate);
          const days = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
          return days >= 0 && days <= 2;
        });
        
        if (urgentItems.length > 0) {
          new Notification("Pantry Bloom Alert", {
            body: `You have ${urgentItems.length} items expiring very soon! Use them today to avoid waste. 🍎`,
            icon: "/logo192.png" // Standard PWA logo path
          });
        }
      }
    };

    // Check on load after short delay
    const timer = setTimeout(checkUrgentExpiry, 3000);
    return () => clearTimeout(timer);
  }, [pantryItems.length]);

  // 2. Scoped Firestore Sync (Only runs when user is logged in)
  useEffect(() => {
    if (!user) return;

    try {
      const q = query(collection(db, "users", user.uid, "pantry"), orderBy("id", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const itemsFromCloud = [];
        snapshot.forEach((doc) => {
          itemsFromCloud.push(doc.data());
        });
        if (itemsFromCloud.length > 0) setPantryItems(itemsFromCloud);
      }, (err) => {
        console.warn("Firestore sync error:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore initialization failed.");
    }
  }, [user]);

  // 3. Persist to LocalStorage (Local Backup)
  useEffect(() => {
    localStorage.setItem('pantry_bloom_items', JSON.stringify(pantryItems));
  }, [pantryItems]);

  // --- Native Hardware Back Button Handling ---
  useEffect(() => {
    // Push an initial state so there's something to "go back" to
    window.history.pushState({ screen: currentScreen }, "");

    const handleBackButton = (event) => {
      if (currentScreen !== 'dashboard') {
        // Prevent actual browser back, just change our internal screen
        event.preventDefault();
        setCurrentScreen('dashboard');
        // Push the dashboard state back so the next back button can exit if needed
        window.history.pushState({ screen: 'dashboard' }, "");
      } else {
        // On dashboard: allow default (exit app)
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [currentScreen]);

  const handleScan = async (scannedData) => {
    const barcode = scannedData.code || scannedData; // Handle both direct string or object
    
    try {
      // 2. Real API Lookup (Open Food Facts - No API Key required for simple GET)
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1) {
        // 1. Extract Raw Data
        const p = data.product;
        const n = p.nutriments || {};
        
        // Check if exists in pantry
        const existingItem = pantryItems.find(i => i.barcode === barcode);
        
        // 2. Yuka-Style Scoring Engine
        let baseScore = p.nutriscore_score !== undefined ? (100 - (p.nutriscore_score * 2)) : 60;
        
        // Additive & Processing Penalties
        const additivesCount = p.additives_n || 0;
        const novaGroup = p.nova_group || 2;
        
        if (novaGroup >= 4) baseScore -= 25; // Massive penalty for ultra-processed
        if (additivesCount > 3) baseScore -= 15;
        if (additivesCount > 7) baseScore -= 20;
        
        // Organic Bonus
        const isOrganic = p.labels_tags?.some(tag => tag.toLowerCase().includes('organic'));
        if (isOrganic) baseScore += 10;
        
        // Clamp score 0-100
        const finalScore = Math.max(0, Math.min(100, baseScore));

        const resolvedName = p.product_name || p.product_name_en || p.generic_name || p.brands || 'New Product';
        
        const realItem = {
          id: existingItem ? existingItem.id : Date.now(),
          barcode: barcode,
          inPantry: !!existingItem,
          name: resolvedName,
          brand: p.brands || 'Artisan Brand',
          score: finalScore,
          nova: novaGroup,
          additives: additivesCount,
          icon: '🥫',
          image: p.image_front_url || p.image_url || null,
          ingredients: p.ingredients_text || 'Ingredients list being processed...',
          oils: (p.ingredients_text?.toLowerCase().includes('oil')) ? 'Oils Found' : 'Clean',
          sugar: n.sugars_serving ? `${n.sugars_serving}g` : '0g',
          nutrition: {
            energy: Math.round(n['energy-kcal_100g'] || 0),
            fat: n.fat_100g || 0,
            saturatedFat: n['saturated-fat_100g'] || 0,
            sugar: n.sugars_100g || 0,
            sodium: Math.round((n.salt_100g || 0) * 400), // mg sodium
            fiber: n.fiber_100g || 0
          },
          expiryDate: existingItem ? existingItem.expiryDate : ''
        };
        setScannedItem(realItem);
      } else {
        // Fallback: Product not found in the global registry
        setScannedItem({
          id: Date.now(),
          name: 'Unknown Product',
          brand: 'Scan Result: ' + barcode,
          score: 50,
          nova: 0,
          ingredients: 'This item was not found in the global database. You can manually name it below.',
          isNew: true, // Flag for manual naming
          expiryDate: new Date().toLocaleDateString()
        });
      }
    } catch (err) {
      console.error("API Lookup Error:", err);
      // Network/Fetch error fallback
      setScannedItem({
        name: 'Connection Error',
        brand: 'Could not reach database',
        score: 0,
        nova: 0,
        ingredients: 'Check your internet connection and try again.'
      });
    }
  };

  const addToPantry = async (item) => {
    if (!user) return;
    
    // Instant UI feedback
    setPantryItems(prev => {
      const exists = prev.find(p => p.id === item.id);
      if (exists) return prev.map(p => p.id === item.id ? item : p);
      return [item, ...prev];
    });

    // Cloud Save (Scoped to User)
    try {
      await setDoc(doc(db, "users", user.uid, "pantry", item.id.toString()), item);
    } catch (e) {
      console.warn("Cloud save failed.");
    }

    setScannedItem(null);
    setCurrentScreen('pantry');
  };

  const removeFromPantry = async (id) => {
    if (!user) return;

    // Instant UI removal
    setPantryItems(prev => prev.filter(p => p.id !== id));
    
    // Cloud Removal (Scoped to User)
    try {
      await deleteDoc(doc(db, "users", user.uid, "pantry", id.toString()));
    } catch (e) {
      console.warn("Cloud delete failed.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-200 sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="phone-container">
        
        {/* Screen Content */}
        <div ref={mainScrollRef} className="w-full h-full pb-24 overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {currentScreen === 'dashboard' && (
              <Dashboard 
                stats={stats} 
                onSelectCategory={(id, title) => setActiveCategory({ id, title })}
                onShowMarket={() => setShowMarket(true)}
                key="dashboard" 
              />
            )}
            {currentScreen === 'history' && <HistoryScreen key="history" />}
            {currentScreen === 'stats' && <Stats stats={stats} onSelectCategory={(id, title) => setActiveCategory({ id, title })} key="stats" />}
            {currentScreen === 'scanner' && <Scanner onScan={handleScan} key="scanner" />}
            {currentScreen === 'pantry' && <Pantry items={pantryItems} onItemClick={(item) => setScannedItem(item)} key="pantry" />}
          </AnimatePresence>

          {/* Category Drill-down */}
          <AnimatePresence>
            {activeCategory && (
              <FilteredListView 
                title={activeCategory.title}
                filter={activeCategory.id}
                items={pantryItems}
                onBack={() => setActiveCategory(null)}
              />
            )}
          </AnimatePresence>

          {/* Market Finder Overlay */}
          <AnimatePresence>
            {showMarket && (
              <MarketMapScreen 
                key="market-finder-overlay"
                onBack={() => setShowMarket(false)} 
              />
            )}
          </AnimatePresence>

          {/* Audit Overlay */}
          <AnimatePresence>
            {scannedItem && (
              <AuditCard 
                item={scannedItem} 
                onDismiss={() => setScannedItem(null)}
                onAdd={addToPantry}
                onDelete={removeFromPantry}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Tab Bar */}
        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-stone-100 flex items-center justify-around z-50 px-4">
          {[
            { id: 'dashboard', icon: <Home className="w-5 h-5" />, label: 'Home' },
            { id: 'history', icon: <History className="w-5 h-5" />, label: 'History' },
            { id: 'scanner', icon: <Barcode className="w-6 h-6" />, label: 'Scan' },
            { id: 'pantry', icon: <Refrigerator className="w-5 h-5" />, label: 'Pantry' },
            { id: 'stats', icon: <BarChart3 className="w-5 h-5" />, label: 'Stats' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentScreen(tab.id)}
              className="flex flex-col items-center gap-1 p-2 flex-1"
            >
              <div className={`transition-all duration-300 ${currentScreen === tab.id ? 'text-sage scale-110' : 'text-stone-300'}`}>
                {tab.icon}
              </div>
              <span className={`text-[9px] font-bold mt-0.5 uppercase tracking-widest ${currentScreen === tab.id ? 'text-sage' : 'text-stone-300'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Status Bar (Simulated) */}
        <div className="absolute top-0 left-0 right-0 h-10 flex justify-between items-center px-10 pointer-events-none z-[70]">
           <span className="text-xs font-bold text-stone-800">9:41</span>
           <div className="flex gap-1.5 items-center">
             <div className="w-4 h-4 bg-sage/20 rounded-full flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-sage rounded-full" />
             </div>
             <span className="text-[10px] font-bold text-stone-400">Syncing</span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;
