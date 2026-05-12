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
  Cloud
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// --- Components ---

const LivelyTree = ({ healthScore }) => {
  // healthScore 0-100
  const isHealthy = healthScore > 70;
  const canopyColor = isHealthy ? '#5D6D3F' : healthScore > 40 ? '#8B8D4E' : '#A67B5B';
  const fruitColor = '#FFB7C5'; // Soft pink for fruits

  return (
    <div className="relative w-56 h-56 flex items-center justify-center">
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
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{item.name}</h2>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{item.brand}</p>
        </div>
        <button onClick={onDismiss} className="p-2 bg-stone-50 rounded-full"><X className="w-5 h-5 text-stone-400" /></button>
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
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {[
              { l: 'Calories', v: item.nutrition?.cal || '0', c: 'stone' },
              { l: 'Fats', v: item.nutrition?.fat || '0g', c: 'stone' },
              { l: 'Sugars', v: item.nutrition?.sugar || '0g', c: 'terracotta' }
            ].map(n => (
              <div key={n.l} className="p-4 bg-stone-50 rounded-2xl text-center border border-stone-100">
                <p className={`text-[8px] font-bold uppercase tracking-widest mb-1 ${n.c === 'terracotta' ? 'text-terracotta' : 'text-stone-300'}`}>{n.l}</p>
                <p className="text-sm font-black text-stone-800">{n.v}</p>
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
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-3">
          <Timer className="w-4 h-4 text-stone-400" />
          <input 
            type="date" 
            value={manualDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-transparent text-sm font-bold text-stone-800 outline-none w-full"
          />
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <button 
            onClick={handleAdd} 
            disabled={isSaving}
            className={`col-span-3 py-4 rounded-3xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all ${isSaving ? 'bg-sage text-white scale-95' : 'wooden-btn text-white'}`}
          >
            {isSaving ? '✅ Saved' : (item.id && !item.isNew ? 'Update Item' : 'Add to Pantry')}
          </button>
          
          <button 
            onClick={() => {
              if (window.confirm('Remove this item from your pantry?')) {
                onDelete(item.id);
                onDismiss();
              }
            }}
            className="col-span-1 bg-stone-100 text-stone-400 rounded-3xl flex items-center justify-center hover:bg-terracotta/10 hover:text-terracotta transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Screens ---

const FilteredListView = ({ title, filter, items, onBack }) => {
  const filteredItems = items.filter(item => {
    if (filter === 'clean') return item.score >= 70;
    if (filter === 'junky') return item.score < 40;
    if (filter === 'expiring') return item.expiry && (item.expiry.includes('day') || item.expiry.includes('Week'));
    if (filter === 'week') return item.expiry && item.expiry.includes('day');
    if (filter === 'month') return item.expiry && (item.expiry.includes('day') || item.expiry.includes('month'));
    if (filter === 'year') return true; // Show all for year
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

const Dashboard = ({ healthScore, onSelectCategory, onShowMarket }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('Just now');

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
      className="pb-24"
    >
      <div className="px-6 py-8 border-b border-stone-100 bg-white/50 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 leading-none">Pantry Bloom</h1>
          <p className="text-stone-400 text-sm mt-2">Your clean kitchen companion</p>
        </div>
        <button 
          onClick={handleSync}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`p-2 rounded-xl transition-all ${isSyncing ? 'bg-sage text-white animate-spin' : 'bg-stone-50 text-stone-300 group-hover:text-sage'}`}>
            <Cloud className="w-4 h-4" />
          </div>
          <span className="text-[8px] font-bold text-stone-300 uppercase tracking-tighter">
            {isSyncing ? 'Syncing...' : `Saved ${lastSync}`}
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center py-10 bg-cream">
        <LivelyTree healthScore={healthScore} />
        <div className="text-center mt-6">
          <h3 className="text-6xl font-bold text-[#1a3a1a] tracking-tighter">{healthScore}</h3>
          <p className="text-sm text-stone-500 mt-2 font-medium">Pantry Health Score</p>
          <div className="mt-4 px-6 py-2 bg-[#E8EDE0] text-[#5D6D3F] rounded-full font-bold text-sm inline-block shadow-sm">
            Excellent
          </div>
        </div>
      </div>

    <div className="px-6 grid grid-cols-3 gap-3 mt-6">
      <button onClick={() => onSelectCategory('clean', 'Clean Food')} className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all">
        <div className="w-12 h-12 mb-2">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={[{value: 84}, {value: 16}]} innerRadius={15} outerRadius={22} dataKey="value">
                 <Cell fill="#5D6D3F" /><Cell fill="#D27D56" />
               </Pie>
             </PieChart>
           </ResponsiveContainer>
        </div>
        <p className="text-lg font-bold text-stone-800">84%</p>
        <p className="text-[8px] text-stone-400 uppercase font-bold tracking-widest mt-1">Clean Food</p>
      </button>
      
      <button onClick={() => onSelectCategory('junky', 'Junky Food')} className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all">
        <div className="w-12 h-12 mb-2 flex items-center justify-center bg-red-50 rounded-full">
           <AlertCircle className="w-6 h-6 text-terracotta" />
        </div>
        <p className="text-lg font-bold text-stone-800">16%</p>
        <p className="text-[8px] text-stone-400 uppercase font-bold tracking-widest mt-1 text-terracotta">Junky</p>
      </button>

      <button onClick={() => onSelectCategory('expiring', 'Expiring Soon')} className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all">
        <Timer className="w-8 h-8 text-terracotta mb-4" />
        <p className="text-lg font-bold text-stone-800">3</p>
        <p className="text-[8px] text-stone-400 uppercase font-bold tracking-widest mt-1">Expiring</p>
      </button>
    </div>

    <div className="px-6 mt-10 p-6 rounded-[2rem] bg-wood/10 border border-wood/10 relative overflow-hidden">
      <ShoppingBag className="absolute -right-4 -bottom-4 w-24 h-24 text-wood/5 rotate-12" />
      <h4 className="text-wood-dark mb-1">Local Farmers Market</h4>
      <p className="text-xs text-wood/60 mb-2 leading-relaxed">Wyndham Vale: Fresh organic avocados available this Saturday in Werribee.</p>
      <button 
        onClick={onShowMarket}
        className="text-xs font-bold text-wood-dark underline"
      >
        View Market Map
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
      <h1 className="text-3xl">Bloom History</h1>
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

const Stats = ({ onSelectCategory }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="px-6 py-8 pb-24"
  >
    <h1 className="text-3xl mb-8">Pantry Health Stats</h1>
    
    <div className="cozy-card mb-8 p-8 flex flex-col items-center">
      <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6 text-center">Health Distribution</h4>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: 'Good', value: 65, color: '#5D6D3F' },
                { name: 'Fair', value: 20, color: '#A67B5B' },
                { name: 'Poor', value: 15, color: '#D27D56' }
              ]}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={8}
              dataKey="value"
            >
              <Cell fill="#5D6D3F" />
              <Cell fill="#A67B5B" />
              <Cell fill="#D27D56" />
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
        { id: 'week', label: 'This Week', count: 3, color: 'bg-terracotta', percentage: 10 },
        { id: 'month', label: 'This Month', count: 14, color: 'bg-wood', percentage: 45 },
        { id: 'year', label: 'Yearly Stock', count: 22, color: 'bg-sage', percentage: 35 },
      ].map((period) => (
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
              animate={{ width: `${period.percentage}%` }}
              className={`h-full ${period.color}`} 
            />
          </div>
        </button>
      ))}
    </div>
  </motion.div>
);

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
                ctx.filter = 'contrast(1.4) grayscale(1) brightness(1.1) sharpness(1.2)';
                ctx.drawImage(video, startX, startY, scanWidth, scanHeight, 0, 0, scanWidth, scanHeight);

                const barcodes = await detector.detect(canvas);
                if (barcodes.length > 0) {
                  isScanning = false;
                  setIsDetected(true);
                  if ('vibrate' in navigator) navigator.vibrate(50);
                  setTimeout(() => {
                    onScan(barcodes[0].rawValue);
                  }, 400);
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
        className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
      />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Rectangular Scanner Frame (better for barcodes) */}
        <div className={`w-[85%] h-44 border-4 rounded-[2rem] relative overflow-hidden transition-all duration-300 ${isDetected ? 'border-sage shadow-[0_0_40px_rgba(93,109,63,0.6)]' : 'border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(93,109,63,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          {/* Animated Scanning Beam */}
          <motion.div 
            animate={{ y: isDetected ? 88 : [0, 176, 0] }}
            transition={{ duration: isDetected ? 0.2 : 2.5, repeat: isDetected ? 0 : Infinity, ease: "easeInOut" }}
            className={`w-full h-1 absolute z-10 ${isDetected ? 'bg-sage shadow-[0_0_20px_#5D6D3F]' : 'bg-white/60 shadow-[0_0:15px_rgba(255,255,255,0.5)]'}`} 
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity duration-500 ${isDetected ? 'opacity-0' : 'opacity-40 text-white flex flex-col items-center gap-2'}`}>
              <span className="bg-black/20 px-3 py-1 rounded-full">Optical Focus Engaged</span>
              <span className="text-[8px] opacity-60 italic">Move back slightly for a sharper lock</span>
            </div>
          </div>
          
          {/* Corner Brackets */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
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
        <h2 className="text-3xl">Market Finder</h2>
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
  const goodItems = items.filter(i => i.score >= 50);
  const badItems = items.filter(i => i.score < 50);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="px-4 py-8 pb-32"
    >
      <div className="flex justify-between items-center mb-12 px-2">
        <h1 className="text-4xl text-stone-800 font-serif">My Pantry</h1>
        <button className="p-3 bg-sage text-white rounded-2xl shadow-lg"><Plus className="w-5 h-5" /></button>
      </div>

      {/* Top Shelf: Good Food */}
      <div className="wooden-shelf">
        <div className="shelf-label">The Good Stuff</div>
        <div className="grid grid-cols-2 gap-4">
          {goodItems.map((item, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -5 }}
              onClick={() => onItemClick(item)}
              className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center text-center cursor-pointer active:scale-95 transition-all"
            >
              <span className="text-3xl mb-2">{item.icon}</span>
              <p className="text-[10px] font-bold text-stone-800 truncate w-full">{item.name}</p>
              <p className="text-[8px] text-stone-400 font-bold uppercase">{item.expiryDate}</p>
              <div className="mt-2 w-full h-1 bg-stone-50 rounded-full overflow-hidden">
                <div className="h-full bg-sage" style={{ width: `${item.score}%` }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Shelf: Junky Food */}
      <div className="wooden-shelf mt-20">
        <div className="shelf-label bg-terracotta">The Vices</div>
        <div className="grid grid-cols-2 gap-4 opacity-80">
          {badItems.map((item, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -5 }}
              onClick={() => onItemClick(item)}
              className="bg-white/60 p-3 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center text-center cursor-pointer active:scale-95 transition-all"
            >
              <span className="text-3xl mb-2 grayscale">{item.icon}</span>
              <p className="text-[10px] font-bold text-stone-800 truncate w-full">{item.name}</p>
              <p className="text-[8px] text-terracotta font-bold uppercase">{item.expiryDate}</p>
              <div className="mt-2 w-full h-1 bg-stone-50 rounded-full overflow-hidden">
                <div className="h-full bg-terracotta" style={{ width: `${item.score}%` }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- App ---

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [scannedItem, setScannedItem] = useState(null);
  const [healthScore, setHealthScore] = useState(74);
  const [activeCategory, setActiveCategory] = useState(null); // { id, title }
  const [showMarket, setShowMarket] = useState(false);

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

  // 2. Persist to LocalStorage whenever items change
  useEffect(() => {
    localStorage.setItem('pantry_bloom_items', JSON.stringify(pantryItems));
  }, [pantryItems]);

  const handleScan = async (scannedData) => {
    const barcode = scannedData.code || scannedData; // Handle both direct string or object
    
    // 1. Show loading state if needed (optional)
    console.log("Looking up barcode:", barcode);

    try {
      // 2. Real API Lookup (Open Food Facts - No API Key required for simple GET)
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1) {
        const p = data.product;
        // Smart Name Resolution: Check multiple fields to avoid "Unknown"
        const resolvedName = p.product_name || p.product_name_en || p.generic_name || p.brands || 'New Product';
        
        const realItem = {
          id: Date.now(),
          name: resolvedName,
          brand: p.brands || 'Artisan Brand',
          score: p.nutriscore_score !== undefined ? (100 - (p.nutriscore_score * 2)) : 75,
          nova: p.nova_group || 2,
          icon: '🥫',
          ingredients: p.ingredients_text || 'Ingredients list being processed...',
          oils: (p.ingredients_text?.toLowerCase().includes('oil')) ? 'Oils Found' : 'Clean',
          sugar: p.nutriments?.sugars_serving ? `${p.nutriments.sugars_serving}g` : '0g',
          nutrition: {
            cal: Math.round(p.nutriments?.['energy-kcal_serving'] || p.nutriments?.['energy-kcal'] || 0),
            fat: p.nutriments?.fat_serving || p.nutriments?.fat || 0,
            sugar: p.nutriments?.sugars_serving || p.nutriments?.sugars || 0
          },
          expiryDate: new Date(Date.now() + 1000*60*60*24*30).toLocaleDateString()
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

  const addToPantry = (item) => {
    setPantryItems(prev => {
      const exists = prev.find(p => p.id === item.id);
      if (exists) {
        // Update existing item
        return prev.map(p => p.id === item.id ? item : p);
      }
      // Add new item
      return [item, ...prev];
    });
    setScannedItem(null);
    setCurrentScreen('pantry');
  };

  const removeFromPantry = (id) => {
    setPantryItems(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-200 sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="phone-container">
        
        {/* Screen Content */}
        <div className="w-full h-full pb-24 overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {currentScreen === 'dashboard' && (
              <Dashboard 
                healthScore={healthScore} 
                onSelectCategory={(id, title) => setActiveCategory({ id, title })}
                onShowMarket={() => setShowMarket(true)}
                key="dashboard" 
              />
            )}
            {currentScreen === 'history' && <HistoryScreen key="history" />}
            {currentScreen === 'stats' && <Stats onSelectCategory={(id, title) => setActiveCategory({ id, title })} key="stats" />}
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
        <nav className="absolute bottom-0 left-0 right-0 h-24 bg-white border-t border-stone-100 flex items-center justify-around z-50">
          {[
            { id: 'dashboard', icon: '🏠', label: 'Home' },
            { id: 'history', icon: '🕒', label: 'History' },
            { id: 'stats', icon: '📊', label: 'Stats' },
            { id: 'scanner', icon: '📷', label: 'Scan' },
            { id: 'pantry', icon: '🧺', label: 'Pantry' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentScreen(tab.id)}
              className="flex flex-col items-center gap-1 p-2 transition-all duration-300"
            >
              <div className={`text-2xl transition-transform duration-300 ${currentScreen === tab.id ? 'scale-125' : 'grayscale opacity-50'}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] font-bold ${currentScreen === tab.id ? 'text-sage' : 'text-stone-300'}`}>
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
