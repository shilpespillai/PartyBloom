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

const AuditCard = ({ item, onDismiss, onAdd }) => {
  const [manualDate, setManualDate] = useState('');
  const [viewDetails, setViewDetails] = useState(false);

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
          <span className={`audit-tag ${item.score > 70 ? 'tag-clean' : 'tag-processed'}`}>
            NOVA {item.nova} • {item.score > 70 ? 'Minimally Processed' : 'Ultra Processed'}
          </span>
        </div>
        <button onClick={onDismiss} className="p-2 bg-stone-50 rounded-full"><X className="w-5 h-5 text-stone-400" /></button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-stone-50 rounded-2xl flex items-center gap-3">
          <Leaf className="w-5 h-5 text-sage" />
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase">Fats</p>
            <p className="font-bold text-xs">{item.oils}</p>
          </div>
        </div>
        <div className="p-4 bg-stone-50 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-terracotta" />
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase">Sugar</p>
            <p className="font-bold text-xs">{item.sugar} Added</p>
          </div>
        </div>
      </div>

      {/* Technical Data Toggle */}
      <div className="border-t border-stone-100 pt-6 mb-8">
        <button 
          onClick={() => setViewDetails(!viewDetails)}
          className="w-full flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-4"
        >
          Full Barcode Information <ChevronRight className={`w-4 h-4 transition-transform ${viewDetails ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {viewDetails && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="p-4 bg-cream/50 rounded-2xl">
                <p className="text-[10px] font-bold text-stone-400 mb-2">INGREDIENTS</p>
                <p className="text-xs leading-relaxed text-stone-600">
                  {item.ingredients || 'Filtered Water, Soybean Oil, Sugar, Distilled Vinegar, Modified Corn Starch, Egg Yolks, Salt, Natural Flavors, Calcium Disodium EDTA.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: 'Calories', v: '90' },
                  { l: 'Protein', v: '0.2g' },
                  { l: 'Carbs', v: '3.1g' }
                ].map(d => (
                  <div key={d.l} className="p-3 border border-stone-100 rounded-xl text-center">
                    <p className="text-[8px] font-bold text-stone-300 uppercase">{d.l}</p>
                    <p className="text-xs font-bold">{d.v}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-terracotta/5 rounded-2xl border border-terracotta/10">
                <p className="text-[10px] font-bold text-terracotta mb-2">ADDITIVES FOUND</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-white rounded-lg text-[9px] font-bold text-stone-600 shadow-sm border border-stone-100">E385 (EDTA)</span>
                  <span className="px-2 py-1 bg-white rounded-lg text-[9px] font-bold text-stone-600 shadow-sm border border-stone-100">Modified Starch</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-sage/5 border border-sage/10 rounded-3xl p-5 mb-8">
        <p className="text-xs font-bold text-sage uppercase mb-3 tracking-widest">Better Alternative</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-stone-800 text-sm">Chosen Foods Mayo</p>
            <p className="text-[10px] text-stone-400 font-bold uppercase">100% Pure Avocado Oil</p>
          </div>
          <button className="text-sage font-bold text-xs flex items-center gap-1">
            Shop <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-3">
          <Timer className="w-4 h-4 text-stone-400" />
          <input 
            type="date" 
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
            className="bg-transparent text-sm font-bold text-stone-800 outline-none w-full"
          />
        </div>
        <button 
          onClick={() => onAdd({ ...item, expiryDate: manualDate || item.expiryDate })} 
          className="wooden-btn w-full py-4 shadow-xl"
        >
          Add to Pantry
        </button>
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

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            advanced: [{ focusMode: 'continuous' }]
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }

        // Real-time Barcode Detection (if supported)
        if ('BarcodeDetector' in window) {
          const detector = new BarcodeDetector({ formats: ['ean_13', 'upc_a'] });
          const interval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  clearInterval(interval);
                  // Pass the actual scanned barcode ID to the lookup engine
                  onScan(barcodes[0].rawValue);
                }
              } catch (e) { /* ignore */ }
            }
          }, 500);
          return () => clearInterval(interval);
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
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
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 border-2 border-white/50 rounded-[3rem] relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 256, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-full h-1 bg-sage shadow-[0_0_15px_#5D6D3F] absolute z-10" 
          />
          {/* Scanning Overlay Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(93,109,63,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>
      </div>

      <div className="absolute top-10 left-6 right-6 flex justify-between items-center text-white">
        <h3 className="text-xl font-bold drop-shadow-md">Auditor Scan</h3>
        <button className="p-2 bg-white/10 rounded-full backdrop-blur-md"><Settings className="w-5 h-5" /></button>
      </div>

      <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-6">
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest drop-shadow-md">
          {hasCamera ? 'Point at a barcode to audit' : 'Requesting camera...'}
        </p>
        
        {/* Shutter Button (Manual Override for testing) */}
        <button 
          onClick={() => onScan('048001213501')}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-8 border-white/20 active:scale-95 transition-all shadow-2xl"
        >
          <div className="w-12 h-12 bg-stone-800 rounded-full" />
        </button>
      </div>
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

const Pantry = ({ items }) => {
  const goodItems = items.filter(i => i.score >= 50);
  const badItems = items.filter(i => i.score < 50);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="px-4 py-8 pb-32"
    >
      <div className="flex justify-between items-center mb-12 px-2">
        <h1 className="text-4xl text-stone-800">My Pantry</h1>
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
              className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center text-center"
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
              className="bg-white/60 p-3 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center text-center"
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

  const [pantryItems, setPantryItems] = useState([
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
    },
    { 
      name: 'Almond Butter', 
      brand: 'Barney Butter', 
      score: 92, 
      status: 'Excellent', 
      icon: '🥜', 
      expiryDate: 'Jun 22, 2026',
      ingredients: 'Blanched Roasted Almonds, Cane Sugar, Palm Fruit Oil, Sea Salt.',
      oils: 'Palm Fruit Oil',
      sugar: '3g',
      additives: []
    }
  ]);

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
        // 3. Map real data to our "Boutique" format
        const realItem = {
          id: Date.now(),
          name: p.product_name || 'Unknown Product',
          brand: p.brands || 'Generic Brand',
          score: p.nutriscore_score !== undefined ? (100 - (p.nutriscore_score * 2)) : 70, // Simple conversion
          nova: p.nova_group || 3,
          icon: '📦',
          ingredients: p.ingredients_text || 'Ingredients not found in database.',
          oils: (p.ingredients_text?.toLowerCase().includes('oil')) ? 'Oils Found' : 'Clean',
          sugar: p.nutriments?.sugars_serving ? `${p.nutriments.sugars_serving}g` : 'Unknown',
          nutrition: {
            cal: Math.round(p.nutriments?.['energy-kcal_serving'] || 0),
            fat: p.nutriments?.fat_serving || 0,
            sugar: p.nutriments?.sugars_serving || 0
          },
          expiryDate: new Date(Date.now() + 1000*60*60*24*30).toLocaleDateString()
        };
        setScannedItem(realItem);
      } else {
        // Fallback for demo products or unrecognized items
        setScannedItem({
          name: 'Boutique Product',
          brand: 'New Discovery',
          score: 85,
          nova: 1,
          ingredients: 'Fresh organic ingredients...',
          expiryDate: new Date().toLocaleDateString()
        });
      }
    } catch (err) {
      console.error("API Lookup Error:", err);
    }
  };

  const addToPantry = (item) => {
    setPantryItems([item, ...pantryItems]);
    setScannedItem(null);
    setCurrentScreen('pantry');
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
            {currentScreen === 'pantry' && <Pantry items={pantryItems} key="pantry" />}
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
