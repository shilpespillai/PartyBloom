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
  LogOut,
  ShieldCheck,
  BarChart3,
  Barcode,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { db, auth } from './firebase';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  linkWithCredential, 
  signInWithCredential,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { googleProvider } from './firebase';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import guestBear from './assets/guest_bear.png';
import logo from './assets/logo.png';

// --- Components ---

const getScoreInfo = (score) => {
  if (score >= 50) return { category: 'clean', label: 'Clean Gem', color: '#5D6D3F', bgColor: 'bg-sage/10', textColor: 'text-sage' };
  if (score >= 30) return { category: 'fair', label: 'Fair Choice', color: '#A67B5B', bgColor: 'bg-wood/10', textColor: 'text-wood-dark' };
  return { category: 'poor', label: 'Junk Vault', color: '#D27D56', bgColor: 'bg-terracotta/10', textColor: 'text-terracotta' };
};

// --- Additive Intelligence Database ---
const ADDITIVE_DB = {
  // Colours
  'e100': { name: 'Curcumin', type: 'Colour', risk: 'safe', note: 'Natural turmeric pigment' },
  'e101': { name: 'Riboflavin (B2)', type: 'Colour', risk: 'safe', note: 'Natural vitamin B2' },
  'e102': { name: 'Tartrazine', type: 'Colour', risk: 'high', note: 'Linked to hyperactivity in children' },
  'e110': { name: 'Sunset Yellow', type: 'Colour', risk: 'high', note: 'Linked to hyperactivity; banned in Norway' },
  'e120': { name: 'Cochineal', aliases: ['carmine'], type: 'Colour', risk: 'moderate', note: 'Derived from insects; allergic reactions possible' },
  'e129': { name: 'Allura Red', type: 'Colour', risk: 'high', note: 'Linked to hyperactivity in children' },
  'e133': { name: 'Brilliant Blue', type: 'Colour', risk: 'high', note: 'Potential organ effects' },
  'e202': { name: 'Potassium Sorbate', type: 'Preservative', risk: 'limited', note: 'Can cause skin & eye irritation in high doses' },
  'e211': { name: 'Sodium Benzoate', type: 'Preservative', risk: 'moderate', note: 'Forms benzene with Vitamin C; hyperactivity link' },
  'e320': { name: 'BHA', type: 'Preservative', risk: 'high', note: 'Possible carcinogen; banned in Japan' },
  'e321': { name: 'BHT', type: 'Preservative', risk: 'moderate', note: 'Possible endocrine disruptor' },
  'e322': { name: 'Lecithins', aliases: ['lecithin'], type: 'Emulsifier', risk: 'limited', note: 'Usually from soy or sunflower; generally safe' },
  'e407': { name: 'Carrageenan', type: 'Thickener', risk: 'moderate', note: 'Gut inflammation concerns in animal studies' },
  'e412': { name: 'Guar Gum', type: 'Thickener', risk: 'safe', note: 'Natural fibre from guar beans' },
  'e415': { name: 'Xanthan Gum', type: 'Thickener', risk: 'safe', note: 'Fermentation-derived; generally safe' },
  'e433': { name: 'Polysorbate 80', type: 'Emulsifier', risk: 'moderate', note: 'May disrupt gut microbiome' },
  'e471': { name: 'Mono & Diglycerides', aliases: ['mono- and diglycerides'], type: 'Emulsifier', risk: 'limited', note: 'May contain trans fats' },
  'e621': { name: 'MSG', aliases: ['monosodium glutamate'], type: 'Flavour Enhancer', risk: 'moderate', note: 'Sensitivity reactions in some individuals' },
  'e950': { name: 'Acesulfame K', type: 'Sweetener', risk: 'moderate', note: 'Controversial studies on metabolic effects' },
  'e951': { name: 'Aspartame', type: 'Sweetener', risk: 'high', note: 'Classified as possible carcinogen (IARC); PKU risk' },
  'e955': { name: 'Sucralose', type: 'Sweetener', risk: 'limited', note: 'May affect gut bacteria; generally considered safe' },
  'e960': { name: 'Steviol Glycosides', aliases: ['stevia'], type: 'Sweetener', risk: 'limited', note: 'Natural from stevia; some gastrointestinal effects' },
  'e330': { name: 'Citric Acid', type: 'Acidity Regulator', risk: 'safe', note: 'Natural from citrus; very widely used' },
  'e260': { name: 'Acetic Acid', type: 'Acidity Regulator', risk: 'safe', note: 'Vinegar; natural preservative' },
  'e300': { name: 'Ascorbic Acid', type: 'Antioxidant', risk: 'safe', note: 'Vitamin C antioxidant' },
  'e210': { name: 'Benzoic Acid', type: 'Preservative', risk: 'moderate', note: 'May form benzene with Vitamin C' },
  'e338': { name: 'Phosphoric Acid', type: 'Acidity Regulator', risk: 'moderate', note: 'Linked to bone density loss in high intake' },
  'e339': { name: 'Sodium Phosphates', aliases: ['sodium phosphate'], type: 'Acidity Regulator', risk: 'limited', note: 'High intake may affect kidneys' },
  'e340': { name: 'Potassium Phosphates', aliases: ['potassium phosphate'], type: 'Acidity Regulator', risk: 'limited', note: 'High intake may affect kidneys' },
  'e296': { name: 'Malic Acid', type: 'Acidity Regulator', risk: 'safe', note: 'Natural in apples; safe' },
  'e270': { name: 'Lactic Acid', type: 'Preservative', risk: 'safe', note: 'Natural fermentation acid' },
  'e420': { name: 'Sorbitol', type: 'Sweetener', risk: 'limited', note: 'Excess causes digestive issues' },
  'e421': { name: 'Mannitol', type: 'Sweetener', risk: 'limited', note: 'Laxative effect in large amounts' },
  'e965': { name: 'Maltitol', type: 'Sweetener', risk: 'limited', note: 'High glycaemic for a sugar alcohol; laxative effect' },
};

const resolveAdditive = (tag) => {
  const code = tag.replace('en:', '').toLowerCase();
  return ADDITIVE_DB[code] || {
    name: code.toUpperCase(),
    type: 'Additive',
    risk: 'limited',
    note: 'Limited data available'
  };
};

// --- Dynamic Intelligence Helper ---
const getAdditiveFromText = (text) => {
  const normalized = text.toLowerCase().trim();
  // Match by name or alias from our intelligence database
  return Object.keys(ADDITIVE_DB).find(code => {
    const entry = ADDITIVE_DB[code];
    return entry.name.toLowerCase() === normalized || 
           (entry.aliases && entry.aliases.some(a => a.toLowerCase() === normalized)) ||
           (entry.name.endsWith('s') && entry.name.slice(0, -1).toLowerCase() === normalized);
  });
};

// --- Global Intelligence Database (Clean Gems) ---
const GLOBAL_GEMS = [
  { category: 'Sauce', name: 'Rao\'s Homemade Marinara', brand: 'Rao\'s', score: 98, icon: '🍅', reason: 'No added sugar or seed oils' },
  { category: 'Sauce', name: 'Primal Kitchen Ketchup', brand: 'Primal Kitchen', score: 94, icon: '🥫', reason: 'Unsweetened, organic' },
  { category: 'Oil', name: 'California Olive Ranch Extra Virgin', brand: 'COR', score: 96, icon: '🫒', reason: 'First cold pressed, single origin' },
  { category: 'Oil', name: 'Chosen Foods Avocado Oil', brand: 'Chosen', score: 95, icon: '🥑', reason: '100% pure, no seed oil blend' },
  { category: 'Cheese', name: 'Rumiano Organic Sharp Cheddar', brand: 'Rumiano', score: 92, icon: '🧀', reason: 'Grass-fed, non-GMO project verified' },
  { category: 'Cheese', name: 'Miyoko\'s Artisan Mozzarella', brand: 'Miyoko\'s', score: 89, icon: '🍕', reason: 'Cashew-based, cultured, clean label' },
  { category: 'Dip', name: 'Hope Foods Organic Hummus', brand: 'Hope', score: 94, icon: '🥣', reason: 'Cold-pressed, organic ingredients' },
  { category: 'Crackers', name: 'Simple Mills Almond Flour Crackers', brand: 'Simple Mills', score: 92, icon: '🍪', reason: 'Grain-free, no inflammatory oils' },
  { category: 'Snack', name: 'LesserEvil Organic Popcorn', brand: 'LesserEvil', score: 96, icon: '🍿', reason: 'Coconut oil & sea salt only' },
  { category: 'Beans', name: 'Eden Organic Black Beans', brand: 'Eden Foods', score: 95, icon: '🥫', reason: 'BPA-free cans, organic' },
  { category: 'Beans', name: 'Jovial Cannellini', brand: 'Jovial', score: 98, icon: '🫙', reason: 'Glass jar, organic' },
  { category: 'Snack', name: 'Siete Tortilla Chips', brand: 'Siete Foods', score: 88, icon: '🥑', reason: 'Grain-free, avocado oil' },
  { category: 'Snack', name: 'LesserEvil Popcorn', brand: 'LesserEvil', score: 90, icon: '🍿', reason: 'Coconut oil & sea salt' },
  { category: 'Dairy', name: 'Malk Almond Milk', brand: 'MALK', score: 98, icon: '🥛', reason: '3 ingredients, no gums/oils' },
  { category: 'Dairy', name: 'Alexandre Family Milk', brand: 'Alexandre', score: 95, icon: '🐄', reason: 'A2/A2 grass-fed dairy' },
  { category: 'Pasta', name: 'Banza Chickpea Pasta', brand: 'Banza', score: 92, icon: '🍝', reason: 'High protein, high fiber' },
  { category: 'Pasta', name: 'Jovial Brown Rice Pasta', brand: 'Jovial', score: 94, icon: '🌾', reason: 'Organic, gluten-free' },
  { category: 'Beverage', name: 'Spindrift Seltzer', brand: 'Spindrift', score: 95, icon: '🥤', reason: 'Real squeezed fruit' },
  { category: 'Beverage', name: 'Pique Herbal Tea', brand: 'Pique', score: 100, icon: '🍵', reason: 'Triple toxin screened' },
  { category: 'Cereal', name: 'Bob\'s Red Mill Oats', brand: 'Bob\'s', score: 96, icon: '🥣', reason: 'Gluten free, non-GMO' },
  { category: 'Cereal', name: 'Seven Sundays Muesli', brand: 'Seven Sundays', score: 94, icon: '🌻', reason: 'No added sugar or oils' },
  { category: 'Default', name: 'Organic Local Choice', brand: 'Artisan', score: 85, icon: '📦', reason: 'Minimally processed' }
];

const getCategoryByKeywords = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('sauce') || n.includes('tomato') || n.includes('ketchup') || n.includes('mayo')) return 'Sauce';
  if (n.includes('oil') || n.includes('butter') || n.includes('fat')) return 'Oil';
  if (n.includes('bean') || n.includes('lentil') || n.includes('chickpea')) return 'Beans';
  if (n.includes('chip') || n.includes('snack') || n.includes('popcorn') || n.includes('cracker')) return 'Snack';
  if (n.includes('milk') || n.includes('dairy') || n.includes('cheese') || n.includes('yogurt')) return 'Dairy';
  if (n.includes('pasta') || n.includes('spaghetti') || n.includes('noodle')) return 'Pasta';
  if (n.includes('water') || n.includes('soda') || n.includes('drink') || n.includes('tea') || n.includes('juice')) return 'Beverage';
  if (n.includes('cereal') || n.includes('oat') || n.includes('muesli') || n.includes('granola')) return 'Cereal';
  return 'Default';
};

const AlternativesGallery = ({ currentItem, recommendations, isSearching, onDismiss, onSelect }) => {
  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm z-[200] flex flex-col justify-end"
    >
      <div className="bg-[#FDFCF7] rounded-t-[3rem] p-8 pb-12 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-serif-luxury text-stone-800">Alternatives</h2>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Real-time Intelligence</p>
          </div>
          <button onClick={onDismiss} className="p-2 bg-white rounded-full shadow-sm"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          {isSearching && (
            <div className="py-20 text-center space-y-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Cloud className="w-12 h-12 text-sage/30 mx-auto" />
              </motion.div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Searching global database...</p>
            </div>
          )}

          {!isSearching && recommendations.map((gem, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 group active:scale-95 transition-all"
            >
              <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center overflow-hidden">
                {gem.image ? <img src={gem.image} alt="" className="w-full h-full object-contain" /> : <span className="text-3xl">{gem.icon}</span>}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-stone-800">{gem.name}</h4>
                  <span className="text-xs font-black text-sage">{gem.score}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{gem.brand}</p>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-stone-50 rounded-full border border-stone-100">
                    <MapPin className="w-2.5 h-2.5 text-sage" />
                    <span className="text-[8px] font-bold text-stone-500 uppercase">{gem.store}</span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 mt-1 italic">{gem.reason}</p>
                <button 
                  onClick={() => {
                    const query = encodeURIComponent(`${gem.name} ${gem.brand} near me`);
                    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
                  }}
                  className="mt-3 text-[10px] font-black text-sage flex items-center gap-1 uppercase tracking-widest"
                >
                  Locate Nearby <MapPin className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}

          {!isSearching && recommendations.length === 0 && (
            <div className="py-20 text-center text-stone-300">
              <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">No better alternatives found yet</p>
            </div>
          )}
        </div>

        <div className="mt-10 p-6 bg-sage/5 rounded-3xl border border-sage/10 text-center">
          <p className="text-[11px] text-sage font-medium italic">"Choosing better alternatives just 2 items a week can improve your pantry health by 30%."</p>
        </div>
      </div>
    </motion.div>
  );
};

// Boutique Flower Component
// Boutique Flower Component
const Flower = ({ cx, cy, color, delay, isFallen }) => (
  <motion.g
    initial={{ scale: 0, opacity: 0, y: isFallen ? -20 : 0, rotate: 0 }}
    animate={{ 
      scale: 1, 
      opacity: 1, 
      y: 0,
      rotate: isFallen ? [0, 45] : [0, 10, -10, 0] 
    }}
    exit={{ scale: 0, opacity: 0 }}
    transition={{ 
      scale: { delay, type: "spring" },
      y: { delay, duration: 1.5, type: "spring", damping: 12 },
      rotate: { duration: isFallen ? 0.1 : 5, repeat: isFallen ? 0 : Infinity, ease: "easeInOut", delay }
    }}
    style={{ transformOrigin: `${cx}px ${cy}px` }}
  >
    {/* 5 Notched Petals */}
    {[0, 72, 144, 216, 288].map((angle) => (
      <path 
        key={angle}
        d="M0,0 C-3,-4 -3,-6 0,-7 C3,-6 3,-4 0,0"
        transform={`translate(${cx}, ${cy}) rotate(${angle})`}
        fill={color}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="0.5"
      />
    ))}
    {/* Center */}
    <circle cx={cx} cy={cy} r="1.8" fill={isFallen ? "#8B8D4E" : "#D23175"} />
    <circle cx={cx} cy={cy} r="0.8" fill="#FAF9F6" opacity="0.5" />
  </motion.g>
);

const LivelyTree = ({ healthScore, isEmpty }) => {
  const isHealthy = isEmpty || healthScore >= 70;
  const isFair = !isEmpty && healthScore >= 40 && healthScore < 70;
  const canopyColor = isHealthy ? '#5D6D3F' : isFair ? '#8B8D4E' : '#A67B5B';
  const bloomColor = '#FF85A2'; 
  const witheredColor = '#D2A8B5'; // Desaturated grey-pink
  const budColor = '#FDFCF7';

  const bloomPositions = [
    { cx: 60, cy: 32 }, { cx: 45, cy: 45 }, { cx: 75, cy: 45 },
    { cx: 55, cy: 55 }, { cx: 72, cy: 58 }, { cx: 62, cy: 20 },
    { cx: 38, cy: 58 }, { cx: 88, cy: 52 }, { cx: 50, cy: 28 },
    { cx: 74, cy: 30 }, { cx: 42, cy: 38 }, { cx: 82, cy: 38 },
    { cx: 65, cy: 48 }, { cx: 52, cy: 68 }, { cx: 72, cy: 68 }
  ];

  const totalPotential = 15;
  const targetBloomCount = isEmpty ? 0 : Math.floor(healthScore / 6.6);
  
  // Logic: 
  // If healthy: everything on tree.
  // If junk: some stay withered, most fall.
  const onTreeCount = isHealthy ? targetBloomCount : Math.min(3, targetBloomCount);
  const onGroundCount = isHealthy ? 0 : Math.max(0, targetBloomCount - onTreeCount);

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl">
        <ellipse cx="60" cy="105" rx="42" ry="8" fill="#E8EDE0" />
        <rect x="56" y="75" width="8" height="30" rx="2" fill="#7D5A44" />
        
        <motion.g
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
        >
          <circle cx="60" cy="55" r="32" fill={canopyColor} opacity="0.9" className="transition-colors duration-1000" />
          <circle cx="45" cy="52" r="24" fill={canopyColor} opacity="0.8" className="transition-colors duration-1000" />
          <circle cx="75" cy="52" r="24" fill={canopyColor} opacity="0.8" className="transition-colors duration-1000" />
          <circle cx="60" cy="40" r="22" fill={canopyColor} opacity="0.8" className="transition-colors duration-1000" />
          
          <AnimatePresence>
            {/* Flowers on Tree */}
            {bloomPositions.slice(0, onTreeCount).map((pos, i) => (
              <Flower 
                key={`tree-${i}`} 
                cx={pos.cx} 
                cy={pos.cy} 
                color={isHealthy ? bloomColor : witheredColor} 
                delay={i * 0.1 + 0.5} 
              />
            ))}
            
            {/* Flowers on Ground */}
            {bloomPositions.slice(onTreeCount, onTreeCount + onGroundCount).map((pos, i) => (
              <Flower 
                key={`ground-${i}`} 
                cx={40 + (i * 8)} // Scatter on ground
                cy={105 + (i % 2 * 2)} 
                color={witheredColor} 
                delay={i * 0.1 + 0.2} 
                isFallen={true}
              />
            ))}
          </AnimatePresence>
        </motion.g>
      </svg>
      
      {/* Dynamic Health Badge */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-2"
      >
        <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-sage' : 'bg-terracotta'} animate-pulse`} />
        <span className="text-[10px] font-black text-stone-800 uppercase tracking-widest">{isHealthy ? 'Blooming' : 'Peckish'}</span>
      </motion.div>
    </div>
  );
};

const AuthScreen = ({ onGoogleSignIn, onContinueGuest }) => (
  <div className="absolute inset-0 bg-[#FDFCF7] z-[500] flex flex-col items-center justify-center px-10 text-center" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
    <div className="mb-12">
      <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] overflow-hidden border border-stone-50">
        <img src={logo} alt="PantryBloom Logo" className="w-full h-full object-cover scale-110" />
      </div>
      <h1 className="text-4xl font-serif-luxury text-stone-800 mb-4 tracking-tight">PantryBloom</h1>
      <p className="text-stone-400 text-sm font-medium leading-relaxed">
        Join the ecosystem to track your health, <br/> reduce waste, and never lose your progress.
      </p>
    </div>

    <div className="w-full space-y-4">
      <button 
        onClick={onGoogleSignIn}
        className="w-full bg-white border border-stone-100 py-4 rounded-[2rem] shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all group"
      >
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span className="text-sm font-bold text-stone-700">Continue with Google</span>
      </button>

      <button 
        onClick={onContinueGuest}
        className="w-full py-4 text-stone-300 text-[10px] font-bold uppercase tracking-widest hover:text-sage transition-colors"
      >
        Continue as Guest
      </button>
    </div>

    <div className="absolute bottom-12 text-[8px] text-stone-300 font-bold uppercase tracking-[0.2em]">
      Boutique Intelligence v1.2
    </div>
  </div>
);

const AuditCard = ({ item, dynamicAlternatives, isSearchingAlternatives, currentPantryScore, onDismiss, onAdd, onDelete, onShowMarket }) => {
  const [manualDate, setManualDate] = useState(item.expiryDate || '');
  const [activeTab, setActiveTab] = useState('impact');
  const [isSaving, setIsSaving] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [liveIngredients, setLiveIngredients] = useState(null);
  const [liveIngredientsText, setLiveIngredientsText] = useState(null);
  const [liveAdditives, setLiveAdditives] = useState(null);
  const [liveAdditiveAnalysis, setLiveAdditiveAnalysis] = useState(null);
  const [isFetchingIngredients, setIsFetchingIngredients] = useState(false);
  const [expandedAdditives, setExpandedAdditives] = useState(false);
  const [capturedImage, setCapturedImage] = useState(item.image || null);

  const handleCapture = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      setCapturedImage(image.webPath);
    } catch (e) {
      console.warn("Camera cancelled");
    }
  };

  // Auto-fetch fresh ingredient data if item doesn't have it (old pantry items)
  React.useEffect(() => {
    const hasIngredients = Array.isArray(item.ingredients) && item.ingredients.length > 0;
    const hasRawText = item.ingredientsText && item.ingredientsText.length > 0;
    if (!hasIngredients && !hasRawText && item.barcode) {
      setIsFetchingIngredients(true);
      fetch(`https://world.openfoodfacts.org/api/v2/product/${item.barcode}.json`)
        .then(r => r.json())
        .then(data => {
          if (data.status === 'success' || data.status === 1) {
            const p = data.product;
            const rawText = p.ingredients_text || p.ingredients_text_en || '';
            const structured = (p.ingredients || []).map(ing => ({
              text: ing.text || '',
              percent_estimate: ing.percent_estimate || null,
              vegan: ing.vegan || null,
            })).filter(ing => ing.text.length > 0);
            // --- Multi-source Dynamic Additive Extraction ---
            const apiAdditives = p.additives_tags || p.additives_original_tags || [];
            const parsedAdditives = new Set(apiAdditives);
            
            // 1. Dynamic ID Extraction (from structured ingredients)
            (p.ingredients || []).forEach(ing => {
              if (ing.id && ing.id.startsWith('en:e')) {
                parsedAdditives.add(ing.id);
              } else if (ing.text) {
                const matchedCode = getAdditiveFromText(ing.text);
                if (matchedCode) parsedAdditives.add(`en:${matchedCode}`);
              }
            });

            // 2. Pattern-based Extraction (E-numbers)
            const eNumberRegex = /\b[Ee]\s*(\d{3}[a-zA-Z]{0,2})\b/g;
            const textSources = [
              rawText, 
              p.ingredients_text_en || '', 
              p.ingredients_text_fr || ''
            ].join(' ').toLowerCase();
            
            let m;
            while ((m = eNumberRegex.exec(textSources)) !== null) {
              parsedAdditives.add(`en:e${m[1].toLowerCase()}`);
            }

            const additivesList = Array.from(parsedAdditives);
            
            const analysis = {
              high: additivesList.filter(a => ['e102', 'e110', 'e129', 'e133', 'e150c', 'e250', 'e251', 'e951'].some(bad => a.toLowerCase().includes(bad))).length,
              moderate: additivesList.filter(a => ['e202', 'e211', 'e407', 'e433', 'e621'].some(mod => a.toLowerCase().includes(mod))).length,
              limited: additivesList.filter(a => ['e171', 'e322', 'e471', 'e960'].some(lim => a.toLowerCase().includes(lim))).length,
              safe: 0
            };
            analysis.safe = Math.max(0, additivesList.length - (analysis.high + analysis.moderate + analysis.limited));

            setLiveIngredients(structured.length > 0 ? structured : null);
            setLiveIngredientsText(rawText || null);
            setLiveAdditives(additivesList);
            setLiveAdditiveAnalysis(analysis);
          }
        })
        .catch(() => {})
        .finally(() => setIsFetchingIngredients(false));
    }
  }, [item.barcode]);

  // Resolved ingredient data (live fetch takes priority for old items)
  const resolvedIngredients = (Array.isArray(item.ingredients) && item.ingredients.length > 0)
    ? item.ingredients
    : liveIngredients;
  const resolvedIngredientsText = item.ingredientsText || liveIngredientsText;
  const resolvedAdditives = (item.additives?.length > 0) ? item.additives : liveAdditives;
  const resolvedAdditiveAnalysis = item.additiveAnalysis || liveAdditiveAnalysis;

  const getAlternative = (item) => {
    const category = getCategoryByKeywords(item.name);
    const options = GLOBAL_GEMS.filter(g => g.category === category && g.score > (item.score || 0));
    
    // Try to find a sub-match (e.g. if name has 'ketchup', find a 'ketchup' alternative)
    const name = (item.name || '').toLowerCase();
    const subMatch = options.find(g => {
      const gName = g.name.toLowerCase();
      if (name.includes('ketchup') && gName.includes('ketchup')) return true;
      if (name.includes('marinara') && gName.includes('marinara')) return true;
      if (name.includes('pasta') && gName.includes('pasta')) return true;
      if (name.includes('milk') && gName.includes('milk')) return true;
      if (name.includes('oil') && gName.includes('oil')) return true;
      return false;
    });

    return subMatch || options[0] || GLOBAL_GEMS.find(g => g.category === 'Default');
  };

  const handleDateChange = (newDate) => {
    setManualDate(newDate);
    if (item.id && !item.isNew) onAdd({ ...item, expiryDate: newDate });
  };

  const handleAdd = () => {
    setIsSaving(true);
    if ('vibrate' in navigator) navigator.vibrate([30, 30, 30]);
    onAdd({ ...item, expiryDate: manualDate, image: capturedImage });
    setTimeout(() => setIsSaving(false), 1500);
  };

  const alt = getAlternative(item);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[200] flex flex-col justify-end px-6 pb-20"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-[#FDFCF7] rounded-[3rem] p-8 pb-12 shadow-2xl max-h-[82vh] w-full max-w-md mx-auto overflow-y-auto custom-scrollbar relative"
      >
      <div className="w-12 h-1.5 bg-stone-100 rounded-full mx-auto mb-6" />
      
      <div className="flex gap-4 items-start mb-6">
        {item.image && (
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-stone-100 flex-shrink-0 shadow-[0_8px_20px_rgba(0,0,0,0.08)] relative">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover scale-110 transition-transform hover:scale-125" 
            />
            {/* Studio Light Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
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
        {!item.isNew && ['impact', 'ingredients', 'nutrition'].map(tab => (
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
        {(item.isNew || activeTab === 'impact') && (
          <motion.div 
            key={item.isNew ? 'manual' : 'impact'}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4 mb-8"
          >
            {item.isNew ? (
              <div className="bg-sage/5 border border-sage/10 rounded-[2rem] p-8 text-center flex flex-col items-center">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCapture}
                  className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-sage shadow-[0_8px_20px_rgba(0,0,0,0.05)] mb-6 border border-sage/10 relative overflow-hidden group"
                >
                  {capturedImage ? (
                    <img src={capturedImage} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8" />
                  )}
                  <div className="absolute inset-0 bg-sage/0 group-hover:bg-sage/5 transition-colors" />
                </motion.button>
                <h3 className="text-lg font-bold text-stone-800 mb-2">Boutique Discovery</h3>
                <p className="text-[11px] text-stone-400 font-medium leading-relaxed max-w-[220px]">
                  {capturedImage ? "Photo captured successfully!" : "Capture a photo of your local find to personalize your pantry boutique."}
                </p>
                <button 
                  onClick={handleCapture}
                  className="mt-6 px-5 py-2.5 bg-white border border-stone-100 rounded-full text-[10px] font-black text-sage uppercase tracking-widest shadow-sm active:scale-95 transition-all"
                >
                  {capturedImage ? "Retake Photo" : "Open Camera"}
                </button>
              </div>
            ) : (
              <>
                {/* Meal Synergy Audit */}
                <div className="bg-sage/5 border border-sage/10 rounded-[2rem] p-5">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-bold text-sage uppercase tracking-widest">Pantry Synergy</p>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${item.score > currentPantryScore ? 'bg-sage text-white' : 'bg-terracotta text-white'}`}>
                      {item.score > currentPantryScore ? 'Health Boost' : 'Audit Required'}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-stone-800 leading-tight">
                    {item.score > currentPantryScore 
                      ? `Swapping this in will boost your total pantry health by ${Math.abs(Math.round((item.score - currentPantryScore) / 10))}%!`
                      : `This item is ${Math.round(currentPantryScore - item.score)} points below your pantry average.`
                    }
                  </p>
                </div>

                {/* Clean Points */}
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
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'ingredients' && (
          <motion.div 
            key="ingredients"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ingredient Breakdown</p>
              {resolvedIngredients && <p className="text-[10px] font-bold text-stone-300">{resolvedIngredients.length} items</p>}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {Array.isArray(resolvedIngredients) && resolvedIngredients.length > 0 ? (
                  resolvedIngredients.map((ing, idx) => {
                    const name = typeof ing === 'string' ? ing : (ing.text || 'Natural Component');
                    const pct = typeof ing === 'object' && ing.percent_estimate > 0 ? Math.round(ing.percent_estimate) : null;
                    const isNonVegan = typeof ing === 'object' && ing.vegan === 'no';
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        key={idx} 
                        className="bg-white rounded-2xl border border-stone-100 px-4 py-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-stone-800 capitalize leading-tight flex-1">{name}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isNonVegan && (
                              <span className="text-[8px] font-black text-terracotta uppercase tracking-wider bg-terracotta/10 px-1.5 py-0.5 rounded-full">Non-Vegan</span>
                            )}
                            {pct !== null && (
                              <span className="text-sm font-black text-stone-500">~{pct}%</span>
                            )}
                          </div>
                        </div>
                        {pct !== null && (
                          <div className="mt-2 h-1 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(pct, 100)}%` }}
                              transition={{ delay: idx * 0.04 + 0.2, duration: 0.5 }}
                              className={`h-full rounded-full ${pct > 40 ? 'bg-sage' : pct > 15 ? 'bg-wood' : 'bg-stone-300'}`}
                            />
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                ) : resolvedIngredientsText ? (
                  <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
                    <p className="text-sm text-stone-700 leading-relaxed font-medium">{resolvedIngredientsText}</p>
                  </div>
                ) : isFetchingIngredients ? (
                  <div className="flex items-center justify-center gap-3 py-10 text-stone-400">
                    <div className="w-5 h-5 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Loading Ingredients...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-stone-50/50 p-10 rounded-[3rem] border border-stone-100 border-dashed">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-sage/30 shadow-sm mb-4 border border-stone-50">
                      <Leaf className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-stone-700 mb-2">Local Artisan Profile</h4>
                    <p className="text-[10px] text-stone-400 font-medium leading-relaxed max-w-[200px] text-center">
                      This unique product is currently undergoing our boutique audit. Full ingredient mapping is pending global database synchronization.
                    </p>
                    <div className="mt-6 px-4 py-2 bg-white border border-stone-100 rounded-full text-[9px] font-black text-sage uppercase tracking-widest shadow-sm">
                      Request Bloom Update
                    </div>
                  </div>
                )}
            </div>
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
              { 
                label: 'Additives', 
                value: `${resolvedAdditives?.length || 0}`, 
                icon: <Settings className="w-4 h-4" />, 
                status: (resolvedAdditives?.length > 3 || (resolvedAdditiveAnalysis?.high > 0)) ? 'bad' : 'good', 
                isAdditives: true,
                analysis: resolvedAdditiveAnalysis || { high: 0, moderate: 0, limited: 0, safe: resolvedAdditives?.length || 0 }
              },
              { label: 'Protein', value: `${Number(item.nutrition?.protein || 0).toFixed(1)}g`, icon: <CheckCircle2 className="w-4 h-4" />, status: item.nutrition?.protein > 5 ? 'good' : 'neutral', sub: item.nutrition?.protein > 5 ? 'High protein' : 'Some protein' },
              { label: 'Fiber', value: `${Number(item.nutrition?.fiber || 0).toFixed(1)}g`, icon: <Leaf className="w-4 h-4" />, status: item.nutrition?.fiber > 3 ? 'good' : 'neutral', sub: item.nutrition?.fiber > 3 ? 'High fiber' : 'Some fiber' },
              { label: 'Energy', value: `${Number(item.nutrition?.energy || 0).toFixed(0)} kcal`, icon: <Timer className="w-4 h-4" />, status: item.nutrition?.energy < 200 ? 'good' : 'bad', sub: item.nutrition?.energy < 200 ? 'Low energy' : 'High energy' },
              { label: 'Saturated fat', value: `${Number(item.nutrition?.saturatedFat || 0).toFixed(1)}g`, icon: <AlertCircle className="w-4 h-4" />, status: item.nutrition?.saturatedFat < 1 ? 'good' : 'bad', sub: item.nutrition?.saturatedFat < 1 ? 'No saturated fat' : 'High fat' },
              { label: 'Sugar', value: `${Number(item.nutrition?.sugar || 0).toFixed(1)}g`, icon: <ShoppingBag className="w-4 h-4" />, status: item.nutrition?.sugar < 5 ? 'good' : 'bad', sub: item.nutrition?.sugar < 5 ? 'Low sugar' : 'High sugar' },
              { label: 'Sodium', value: `${Number(item.nutrition?.sodium || 0).toFixed(0)}mg`, icon: <Info className="w-4 h-4" />, status: item.nutrition?.sodium < 400 ? 'good' : 'bad', sub: item.nutrition?.sodium < 400 ? 'Low impact' : 'High sodium' },
            ].map((row, idx) => (
              <div 
                key={idx} 
                className={`border-b border-stone-50 last:border-0 transition-all duration-300 ${row.isAdditives && resolvedAdditives?.length > 0 ? 'cursor-pointer hover:bg-stone-50/80' : ''}`}
                onClick={() => {
                  if (row.isAdditives && resolvedAdditives?.length > 0) {
                    setExpandedAdditives(!expandedAdditives);
                  }
                }}
              >
                <div className="flex items-center gap-4 p-4 group">
                  <div className={`p-2 rounded-xl text-stone-400 group-hover:bg-sage/10 group-hover:text-sage transition-colors ${row.isAdditives ? 'bg-sage/5' : 'bg-stone-50'}`}>
                    {row.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-stone-800">{row.label}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-600">{row.value}</span>
                        {row.isAdditives && resolvedAdditives?.length > 0 && (
                          <motion.div
                            animate={{ rotate: expandedAdditives ? 180 : 0 }}
                            className="text-stone-300"
                          >
                            <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                          </motion.div>
                        )}
                        <div className={`w-2.5 h-2.5 rounded-full ${row.status === 'good' ? 'bg-sage shadow-[0_0_8px_rgba(93,109,63,0.4)]' : row.status === 'bad' ? 'bg-terracotta shadow-[0_0_8px_rgba(210,125,86,0.4)]' : 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]'}`} />
                      </div>
                    </div>
                    {row.isAdditives ? (
                      <p className="text-[10px] text-stone-400 font-medium">
                        {row.analysis.high > 0 ? `${row.analysis.high} high risk additives found` : 'Premium boutique profile'}
                      </p>
                    ) : (
                      <p className="text-[10px] text-stone-400 font-medium">{row.sub}</p>
                    )}
                  </div>
                </div>
                
                {row.isAdditives && resolvedAdditives?.length > 0 && (
                  <motion.div 
                    initial={false}
                    animate={{ height: expandedAdditives ? 'auto' : 0, opacity: expandedAdditives ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {resolvedAdditives.map((tag, i) => {
                        const additive = resolveAdditive(tag);
                        const riskColors = {
                          high: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', badge: 'bg-red-500' },
                          moderate: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', badge: 'bg-orange-400' },
                          limited: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', badge: 'bg-yellow-400' },
                          safe: { bg: 'bg-sage/5', text: 'text-sage', border: 'border-sage/10', badge: 'bg-sage' },
                        };
                        const c = riskColors[additive.risk] || riskColors.limited;
                        return (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`rounded-2xl border ${c.bg} ${c.border} px-4 py-3 shadow-sm`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${c.badge} animate-pulse`} />
                                <p className={`text-sm font-bold ${c.text}`}>{additive.name}</p>
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                                {additive.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-500 font-medium mt-1 leading-relaxed">
                              {additive.note}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-4">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Expiry Date</p>
        </div>
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
        
        <div className={item.inPantry ? "grid grid-cols-4 gap-3" : "w-full"}>
          <button 
            onClick={() => {
              if (!manualDate) {
                return;
              }
              handleAdd();
            }} 
            disabled={isSaving || !manualDate}
            className={`${item.inPantry ? 'col-span-3' : 'w-full'} py-4 rounded-3xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all flex flex-col items-center justify-center gap-1 ${
              !manualDate ? 'bg-stone-100 text-stone-400 opacity-50 cursor-not-allowed' :
              isSaving ? 'bg-sage text-white scale-95' : 'bg-sage text-white'
            }`}
          >
            {isSaving ? '✅ Saved' : (
              <>
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4" /> 
                  {item.inPantry ? 'Update Item' : 'Add to Pantry'}
                </div>
                {!manualDate && <span className="text-[8px] opacity-70">Expiry Required</span>}
              </>
            )}
          </button>
          
          {item.inPantry && (
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
          )}
        </div>
      </div>
    </motion.div>
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

    if (filter === 'clean') return getScoreInfo(item.score).category === 'clean';
    if (filter === 'junky') return getScoreInfo(item.score).category === 'poor' || getScoreInfo(item.score).category === 'fair';
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
            <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-2xl overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
              ) : (
                item.icon || '📦'
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-stone-800 text-sm">{item.name}</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">{item.brand}</p>
              <div className="flex justify-between items-center mt-2">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${getScoreInfo(item.score).bgColor} ${getScoreInfo(item.score).textColor}`}>
                  Score: {item.score}
                </span>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-stone-400">{item.expiry || 'In Date'}</p>
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

const Dashboard = ({ stats, user, onSelectCategory, onShowMarket, setShowAuth, setUser, setCurrentScreen }) => {
  const { healthScore, cleanPercent, junkyPercent, expiringCount, totalCount } = stats;
  const isEmpty = totalCount === 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className=""
    >
      <div className="px-6 pb-6 border-b border-stone-50 bg-white/40 flex justify-between items-center backdrop-blur-md" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 2rem)' }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-14 h-14 rounded-[1.6rem] overflow-hidden bg-white border-2 border-white shadow-xl transition-all duration-700 ${!user?.isAnonymous ? 'ring-4 ring-sage/10' : ''}`}>
              <img src={user?.photoURL || guestBear} alt="Profile" className="w-full h-full object-cover" />
            </div>
            {!user?.isAnonymous && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 -right-1 bg-sage text-white p-1 rounded-full border-2 border-[#FDFCF7] shadow-lg"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </motion.div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-serif-luxury leading-none tracking-tight bg-gradient-to-br from-stone-800 to-stone-500 bg-clip-text text-transparent">
              Bonjour, {(user?.displayName?.split(' ')[0] || 'Seeker').charAt(0).toUpperCase() + (user?.displayName?.split(' ')[0] || 'Seeker').slice(1).toLowerCase()}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${user?.isAnonymous ? 'bg-stone-300' : 'bg-sage animate-pulse'}`} />
              <p className="text-[9px] font-black text-sage/80 uppercase tracking-[0.25em]">
                {user?.isAnonymous ? 'Guest Seeker' : 'Secured Resident'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {(!user || user.isAnonymous) && (
            <button 
              onClick={() => setShowAuth(true)}
              className="p-2.5 bg-terracotta/10 text-terracotta rounded-xl hover:bg-terracotta/20 transition-all shadow-sm group"
              title="Secure Account"
            >
              <UserPlus className="w-5 h-5 group-active:scale-90 transition-transform" />
            </button>
          )}
          <button 
            onClick={onShowMarket}
            className="p-2.5 bg-wood/10 text-wood-dark rounded-xl hover:bg-wood/20 transition-all shadow-sm group"
            title="Local Market"
          >
            <MapPin className="w-5 h-5 group-active:scale-90 transition-transform" />
          </button>
          {user && !user.isAnonymous && (
            <button 
              onClick={() => {
                // Fire and forget logout
                signOut(auth).catch(e => console.error(e));
                if (Capacitor.isNativePlatform()) {
                  GoogleAuth.signOut().catch(e => console.warn(e));
                }
                
                // Direct UI Reset
                setUser(null);
                setShowAuth(true);
                setCurrentScreen('dashboard');
              }}
              className="p-2.5 bg-stone-50 text-stone-400 rounded-xl hover:bg-stone-100 transition-all shadow-sm group"
              title="Log Out"
            >
              <LogOut className="w-5 h-5 group-active:scale-90 transition-transform" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center pt-2 pb-6 bg-cream">
        <LivelyTree healthScore={healthScore} isEmpty={isEmpty} />
        <div className="text-center mt-2">
          <motion.h3 
            key={healthScore}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-7xl font-serif-luxury tracking-tighter ${
              isEmpty ? 'text-stone-200' : getScoreInfo(healthScore).textColor
            }`}
          >
            {isEmpty ? '--' : healthScore}
          </motion.h3>
          <p className="text-sm text-stone-400 mt-2 font-black uppercase tracking-[0.1em]">Pantry Health Score</p>
          <div className={`mt-4 px-6 py-2 rounded-full font-bold text-sm inline-block shadow-sm ${
            isEmpty ? 'bg-sage/10 text-sage' : getScoreInfo(healthScore).bgColor + ' ' + getScoreInfo(healthScore).textColor
          }`}>
            {isEmpty ? 'Start Scanning' : 
             healthScore >= 70 ? 'Boutique Approved' : 
             healthScore >= 40 ? 'Need Refresh' : 'Junk Overload'}
          </div>
        </div>
      </div>

      {/* Use Soon Carousel (Expiry Guard) */}
      {stats.expiringCount > 0 && (
        <div className="mt-4 px-6">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-[10px] font-black text-terracotta uppercase tracking-[0.2em]">Use Soon Alert</h4>
             <span className="text-[8px] bg-terracotta text-white px-2 py-0.5 rounded-full font-bold uppercase">Expiring</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
            {stats.expiringItems.map((item, idx) => (
              <motion.div 
                key={idx}
                onClick={() => onSelectCategory('expiring', 'Expiring Soon')}
                className="w-32 flex-shrink-0 bg-white p-3 rounded-2xl border border-terracotta/10 shadow-sm active:scale-95 transition-all"
              >
                <div className="w-full aspect-square rounded-xl bg-stone-50 mb-2 overflow-hidden">
                  {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">{item.icon}</div>}
                </div>
                <p className="text-[10px] font-bold text-stone-800 truncate">{item.name}</p>
                <p className="text-[8px] text-terracotta font-black uppercase mt-1">2 Days Left</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 grid grid-cols-3 gap-2 mt-2 mb-4">
      <button onClick={() => onSelectCategory('clean', 'Clean Food')} className="bg-white p-2.5 rounded-[1.5rem] border border-stone-100 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all">
        <div className="w-9 h-9 mb-1">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={[{value: cleanPercent}, {value: 100 - cleanPercent}]} innerRadius={10} outerRadius={16} dataKey="value">
                 <Cell fill="#5D6D3F" /><Cell fill="#f5f5f4" />
               </Pie>
             </PieChart>
           </ResponsiveContainer>
        </div>
        <p className="text-xl font-black text-sage">{cleanPercent}%</p>
        <p className="text-[7px] text-stone-400 uppercase font-black tracking-widest mt-0.5">Clean Gems</p>
      </button>
      
      <button onClick={() => onSelectCategory('junky', 'Junky Food')} className="bg-white p-2.5 rounded-[1.5rem] border border-stone-100 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all">
        <div className="w-9 h-9 mb-1">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={[{value: junkyPercent}, {value: 100 - junkyPercent}]} innerRadius={10} outerRadius={16} dataKey="value">
                 <Cell fill="#D27D56" /><Cell fill="#f5f5f4" />
               </Pie>
             </PieChart>
           </ResponsiveContainer>
        </div>
        <p className="text-xl font-black text-terracotta">{junkyPercent}%</p>
        <p className="text-[7px] text-terracotta/60 uppercase font-black tracking-widest mt-0.5">Junk Vault</p>
      </button>
 
      <button onClick={() => onSelectCategory('expiring', 'Expiring Soon')} className="bg-white p-2.5 rounded-[1.5rem] border border-stone-100 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all">
        <div className={expiringCount > 0 ? 'animate-bounce' : ''}>
          <Timer className={`w-6 h-6 mb-2 ${expiringCount > 0 ? 'text-red-500' : 'text-terracotta'}`} />
        </div>
        <p className="text-base font-bold text-stone-800">{expiringCount}</p>
        <p className="text-[7px] text-stone-400 uppercase font-bold tracking-widest mt-0.5">Expiring</p>
      </button>
    </div>

  </motion.div>
  );
};

const HistoryScreen = ({ items, onDelete, onItemClick }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="px-6 py-8 pb-24"
  >
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-serif-luxury text-stone-800">Bloom History</h1>
      <div className="px-3 py-1 bg-sage/10 rounded-full">
        <p className="text-[10px] text-sage font-bold uppercase tracking-widest">{items.length} Logs</p>
      </div>
    </div>

    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-300">
          <History className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-bold">No scans yet</p>
        </div>
      ) : (
        items.map((item, idx) => (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onItemClick && onItemClick(item)}
            className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-4 group relative overflow-hidden cursor-pointer active:scale-95 transition-all"
          >
            <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner overflow-hidden flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt="" className="w-full h-full object-cover scale-110" />
              ) : (
                item.icon
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-stone-800 text-sm truncate">{item.name}</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter mt-0.5">{item.brand}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getScoreInfo(item.score).bgColor} ${getScoreInfo(item.score).textColor}`}>
                  Score: {item.score}
                </span>
                <span className="px-2 py-0.5 bg-stone-100 text-stone-400 rounded-full text-[9px] font-bold">
                  {new Date(item.scannedAt || item.id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-2 text-stone-200 hover:text-terracotta transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))
      )}
    </div>
  </motion.div>
);

const Stats = ({ stats, historyItems, user, setShowAuth, onSelectCategory }) => {
  const { distData } = stats;

  // Generate Trend Data from History
  const trendData = React.useMemo(() => {
    const dailyScores = {};
    historyItems.forEach(item => {
      const date = new Date(item.scannedAt || item.id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!dailyScores[date]) dailyScores[date] = { sum: 0, count: 0 };
      dailyScores[date].sum += (item.score || 0);
      dailyScores[date].count += 1;
    });

    return Object.entries(dailyScores).map(([date, data]) => ({
      date,
      score: Math.round(data.sum / data.count)
    })).slice(-7); // Last 7 days
  }, [historyItems]);

  return (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="px-6 py-8 pb-24"
  >
    <h1 className="text-2xl mb-8">Pantry Health Stats</h1>

    {/* Health Trend Chart (Yuka Superior Feature) */}
    <div className="cozy-card mb-8 p-6">
       <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-6 text-center">Bloom Progress (7D)</h4>
       <div className="w-full h-40">
         <ResponsiveContainer width="100%" height="100%">
           <LineChart data={trendData}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
             <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 'bold', fill: '#d6d3d1' }} />
             <YAxis hide domain={[0, 100]} />
             <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontSize: '10px' }}
                itemStyle={{ color: '#5D6D3F', fontWeight: 'bold' }}
             />
             <Line type="monotone" dataKey="score" stroke="#5D6D3F" strokeWidth={3} dot={{ fill: '#5D6D3F', r: 4 }} activeDot={{ r: 6 }} />
           </LineChart>
         </ResponsiveContainer>
       </div>
    </div>
    
    <div className="cozy-card mb-8 p-8 flex flex-col items-center">
      <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-6 text-center">Health Distribution</h4>
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
      ].map((period) => {
        const total = (stats.weekCount + stats.monthCount) || 1;
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
    let focusInt = null;
    let mockInt = null;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    const isNative = Capacitor.isNativePlatform();

    function injectTransparentBg() {
      if (document.getElementById('scanner-bg-fix')) return;
      const styleEl = document.createElement('style');
      styleEl.id = 'scanner-bg-fix';
      styleEl.textContent = `
        /* Aggressive transparency for ALL possible layers */
        html, body, #root {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        .phone-container, 
        .phone-container > *,
        [class*="bg-zinc"],
        [class*="bg-cream"],
        [class*="bg-white"],
        [class*="bg-[#FDFCF7]"] {
          background: transparent !important;
          background-color: transparent !important;
          box-shadow: none !important;
        }

        /* Ensure the main container doesn't block */
        main, section, .relative, .overflow-y-auto {
          background: transparent !important;
          background-color: transparent !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    function removeTransparentBg() {
      document.getElementById('scanner-bg-fix')?.remove();
    }

    async function startNativeScanner() {
      try {
        const perms = await BarcodeScanner.checkPermissions();
        if (perms.camera !== 'granted') {
          const result = await BarcodeScanner.requestPermissions();
          if (result.camera !== 'granted') {
            // Permission denied — fall back to web scanner
            startWebScanner();
            return;
          }
        }

        // Make ALL backgrounds transparent so camera shows through WebView
        injectTransparentBg();

        const listener = await BarcodeScanner.addListener('barcodeScanned', (event) => {
          if (isScanning) {
            isScanning = false;
            removeTransparentBg();
            onScan(event.barcode.displayValue);
          }
        });

        await BarcodeScanner.startScan();
        setHasCamera(true);
      } catch (e) {
        console.error("Native scanner init failed:", e);
        removeTransparentBg();
        startWebScanner();
      }
    }

    async function startWebScanner() {
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
              if (capabilities.zoom) {
                const targetZoom = Math.min(2.0, capabilities.zoom.max);
                constraints.advanced[0].zoom = targetZoom;
              }
              await track.applyConstraints(constraints);
            } catch (e) { console.warn("Lens adjustment failed:", e); }
          }
          
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
          focusInt = setInterval(forceFocus, 2000);
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
                  onScan(barcodes[0].rawValue);
                  return;
                }
              } catch (e) { /* ignore */ }
            }
            requestAnimationFrame(scanLoop);
          };
          requestAnimationFrame(scanLoop);
        }
      } catch (err) {
        console.error("Web Camera error:", err);
      }
    }

    if (isNative) {
      startNativeScanner();
    } else {
      startWebScanner();
    }

    mockInt = setInterval(() => {
      if (!isScanning) return;
      setIsDetected(prev => !prev);
    }, 800);

    return () => {
      isScanning = false;
      // Always restore backgrounds on unmount
      document.getElementById('scanner-bg-fix')?.remove();
      if (focusInt) clearInterval(focusInt);
      if (mockInt) clearInterval(mockInt);
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (isNative) BarcodeScanner.stopScan().catch(() => {});
    };
  }, []);

  const isNative = Capacitor.isNativePlatform();

  return (
    <div className={`relative w-full h-full overflow-hidden ${isNative ? 'bg-transparent' : 'bg-black'}`}>
      {/* Real Camera Feed (Web Fallback only) */}
      {!isNative && (
        <video 
          ref={videoRef} 
          autoPlay 
          muted
          playsInline 
          className="absolute inset-0 w-full h-full object-cover contrast-[1.2] brightness-[1.05] saturate-[1.1]"
        />
      )}
      
      {/* Native Scanner Overlay - The 'Hole' Effect */}
      {isNative && (
        <div className="absolute inset-0 pointer-events-none shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)] z-0" />
      )}
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {/* Clean Rectangular Frame with Pulsating Heartbeat */}
        <motion.div 
          animate={{ 
            scale: isDetected ? [1, 1.02, 1] : 1,
            borderColor: isDetected ? '#5D6D3F' : 'white' 
          }}
          transition={{ duration: 0.5, repeat: isDetected ? Infinity : 0 }}
          className="w-[85%] h-44 border-2 rounded-[2rem] relative overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.2)]"
        >
          {/* Corner Brackets */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-white rounded-tr-lg" />
        </motion.div>
      </div>

      <div className="absolute top-10 left-6 right-6 flex justify-between items-center text-white z-20">
        <h3 className="text-xl font-bold drop-shadow-lg">Auditor Scan</h3>
        <button className="p-3 bg-white/20 rounded-full backdrop-blur-md"><Settings className="w-5 h-5" /></button>
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-6 px-8 z-20">
        <div className="flex flex-col items-center gap-2">
          <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em] drop-shadow-lg">
            Align Barcode to Scan
          </p>
          <button 
            onClick={() => setShowManual(true)}
            className="text-white/70 text-[9px] font-bold uppercase tracking-widest underline decoration-white/40"
          >
            Enter Manually
          </button>
        </div>
        
        {/* Shutter Button (Manual Override) */}
        <button 
          onClick={() => onScan('048001213501')}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white/40 active:scale-95 transition-all shadow-2xl"
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
                  onClick={() => { 
                    if(manualCode) {
                      onScan(manualCode); 
                      setShowManual(false); 
                    }
                  }} 
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [activeTab, setActiveTab] = useState('clean'); // 'clean' or 'junk'
  
  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.brand.toLowerCase().includes(search.toLowerCase())
  );

  const cleanItems = filtered.filter(i => getScoreInfo(i.score).category === 'clean');
  const junkItems = filtered.filter(i => getScoreInfo(i.score).category === 'poor');
  const fairItems = filtered.filter(i => getScoreInfo(i.score).category === 'fair');
  const displayItems = activeTab === 'clean' ? cleanItems : [...fairItems, ...junkItems];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="px-6 py-8 pb-32 bg-[#FDFCF7]"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-serif-luxury text-stone-800">My Pantry</h1>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">{filtered.length} Items Indexed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-stone-100 p-1 rounded-xl flex gap-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-sage' : 'text-stone-400'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-sage' : 'text-stone-400'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={onItemClick ? () => onItemClick({ isNew: true, id: Date.now(), name: '', brand: '', score: 75, icon: '📦' }) : null}
            className="w-12 h-12 bg-sage text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 p-1 bg-stone-100 rounded-2xl">
        <button
          onClick={() => setActiveTab('clean')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'clean' ? 'bg-white text-sage shadow-sm' : 'text-stone-400'}`}
        >
          <Leaf className="w-3.5 h-3.5" />
          Clean Gems ({cleanItems.length})
        </button>
        <button
          onClick={() => setActiveTab('junk')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'junk' ? 'bg-white text-terracotta shadow-sm' : 'text-stone-400'}`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Junk Vault ({junkItems.length + fairItems.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <input 
          type="text"
          placeholder={`Search in ${activeTab === 'clean' ? 'Clean Gems' : 'Junk Vault'}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-stone-100 rounded-2xl py-3.5 px-6 text-sm shadow-sm outline-none focus:border-sage transition-all pl-12"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
           {activeTab === 'clean' ? <Leaf className="w-4 h-4 text-sage opacity-30" /> : <AlertCircle className="w-4 h-4 text-terracotta opacity-30" />}
        </div>
      </div>

      {/* Items Grid/List */}
      <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-3"}>
        {displayItems.map((item, idx) => (
          viewMode === 'grid' ? 
            <PantryCard key={idx} item={item} onClick={() => onItemClick({ ...item, inPantry: true })} /> :
            <PantryListItem key={idx} item={item} onClick={() => onItemClick({ ...item, inPantry: true })} />
        ))}
      </div>

      {displayItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-stone-300">
          <div className="p-6 bg-stone-50 rounded-full mb-4">
            {activeTab === 'clean' ? <CheckCircle2 className="w-10 h-10 opacity-20" /> : <ShoppingBag className="w-10 h-10 opacity-20" />}
          </div>
          <p className="font-bold text-sm uppercase tracking-widest opacity-40">
            {activeTab === 'clean' ? 'No Clean Gems yet' : 'Junk Vault is empty!'}
          </p>
          <p className="text-[10px] mt-1 italic font-medium">Try scanning some items to fill your pantry</p>
        </div>
      )}
    </motion.div>
  );
};


const PantryListItem = ({ item, onClick }) => {
  const d = new Date(item.expiryDate);
  const days = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  const isExpiring = days <= 7;

  return (
    <motion.div 
      onClick={onClick}
      className="bg-white p-3 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all"
    >
      <div className="w-12 h-12 rounded-xl bg-stone-50 overflow-hidden flex items-center justify-center flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover scale-110" />
        ) : (
          <span className="text-2xl">{item.icon}</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-[11px] font-bold text-stone-800 truncate">{item.name}</p>
          <span className={`text-[10px] font-bold ${getScoreInfo(item.score).textColor}`}>
            {item.score}
          </span>
        </div>
        <p className="text-[8px] text-stone-400 font-bold uppercase tracking-tighter mt-0.5">{item.brand}</p>
        
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 h-1 bg-stone-50 rounded-full overflow-hidden">
            <div className={`h-full ${getScoreInfo(item.score).category === 'clean' ? 'bg-sage' : getScoreInfo(item.score).category === 'fair' ? 'bg-wood' : 'bg-terracotta'}`} style={{ width: `${item.score}%` }} />
          </div>
          <span className={`text-[8px] font-bold uppercase ${isExpiring ? 'text-red-500' : 'text-stone-300'}`}>
            {isExpiring ? 'Expiring' : item.expiryDate}
          </span>
        </div>
      </div>
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
          <img src={item.image} alt={item.name} className="w-full h-full object-cover scale-110" />
        ) : (
          <span className="text-4xl">{item.icon}</span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-stone-100">
           <div className={`h-full ${getScoreInfo(item.score).category === 'clean' ? 'bg-sage' : getScoreInfo(item.score).category === 'fair' ? 'bg-wood' : 'bg-terracotta'}`} style={{ width: `${item.score}%` }} />
        </div>
      </div>
      
      <p className="text-[11px] font-bold text-stone-800 truncate w-full px-1">{item.name}</p>
      <p className="text-[8px] text-stone-400 font-bold uppercase tracking-tighter mt-1">{item.brand}</p>
      
      <div className="mt-3 flex items-center gap-1.5">
         <span className={`text-[9px] font-bold ${getScoreInfo(item.score).textColor}`}>Score: {item.score}</span>
         <div className="w-1 h-1 rounded-full bg-stone-200" />
         <span className={`text-[8px] font-bold ${isExpiring ? 'text-red-500' : 'text-stone-300'}`}>
           {isExpiring ? 'Expiring' : 'In Date'}
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
  const [dynamicAlternatives, setDynamicAlternatives] = useState([]);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const screenRef = React.useRef(currentScreen);
  
  useEffect(() => {
    screenRef.current = currentScreen;
  }, [currentScreen]);

  const [isSearchingAlternatives, setIsSearchingAlternatives] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pantryItems, setPantryItems] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const mainScrollRef = React.useRef(null);

  // --- Scroll to Top on Screen Change or Category Drill-down ---
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo(0, 0);
    }
  }, [currentScreen, activeCategory]);

  // 1. Initialize from LocalStorage or default
  // Removed hardcoded initializers to force clean cloud data on load

  // --- Boutique Score Intelligence ---
  // (Moved getScoreInfo outside to the top level)

  // --- Dynamic Stats Engine ---
  const stats = React.useMemo(() => {
    const total = pantryItems.length || 1;
    const clean = pantryItems.filter(i => i.score >= 50);
    const poor = pantryItems.filter(i => i.score < 30);
    const fair = pantryItems.filter(i => i.score >= 30 && i.score < 50);
    
    // Calculate Days
    const getDays = (dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 999;
      return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
    };
    
    const expiringWeek = pantryItems.filter(i => getDays(i.expiryDate) <= 7);
    const expiringMonth = pantryItems.filter(i => getDays(i.expiryDate) <= 30);
    const scoreSum = pantryItems.reduce((acc, i) => acc + (i.score || 0), 0);
    
    return {
      healthScore: pantryItems.length === 0 ? 0 : Math.round(scoreSum / pantryItems.length),
      totalCount: pantryItems.length,
      cleanPercent: Math.round((clean.length / total) * 100),
      junkyPercent: Math.round(((poor.length + fair.length) / total) * 100),
      expiringCount: expiringWeek.length,
      expiringItems: expiringWeek.slice(0, 5),
      weekCount: expiringWeek.length,
      monthCount: expiringMonth.length,
      distData: [
        { name: 'Good', value: clean.length, color: '#5D6D3F' },
        { name: 'Fair', value: fair.length, color: '#A67B5B' },
        { name: 'Poor', value: poor.length, color: '#D27D56' }
      ]
    };
  }, [pantryItems]);

  // 1. User Authentication & Real-time Sync
  useEffect(() => {
    // Initialize Native Google Auth
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '59696142465-41rmfbb93g15e7luf6fsrro718lnfpq9.apps.googleusercontent.com',
      });
    }

    const authUnsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setIsAuthLoading(false);
      if (u) setShowAuth(false);
    });

    return () => authUnsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      let credential;

      if (Capacitor.isNativePlatform()) {
        const nativeUser = await GoogleAuth.signIn();
        credential = GoogleAuthProvider.credential(nativeUser.authentication.idToken);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        credential = GoogleAuthProvider.credentialFromResult(result);
      }

      // Simplified high-resilience flow for Play Store stability
      if (user && user.isAnonymous) {
        console.log("Switching from Guest to Google profile...");
        await signOut(auth);
      }
      
      await signInWithCredential(auth, credential);
      setShowAuth(false);
    } catch (e) {
      console.error("Sign in failed detailed error:", e);
      
      // Don't show alert for user cancellations
      if (e.message?.includes('cancel') || e.code === 'auth/cancelled-popup-request' || e.code === 'auth/popup-closed-by-user') {
        return;
      }

      alert(`Sign in failed: ${e.message || 'Unknown error'}`);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      await signInAnonymously(auth);
      setShowAuth(false);
    } catch (e) {
      console.error("Guest access failed:", e);
    }
  };

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

  // 2. Scoped Firestore Sync (Pantry & History)
  useEffect(() => {
    if (!user) return;

    // Sync Pantry
    const qPantry = query(collection(db, "users", user.uid, "pantry"), orderBy("id", "desc"));
    const unsubPantry = onSnapshot(qPantry, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => items.push(doc.data()));
      setPantryItems(items);
    });

    // Sync History
    const qHistory = query(collection(db, "users", user.uid, "history"), orderBy("scannedAt", "desc"));
    const unsubHistory = onSnapshot(qHistory, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => items.push(doc.data()));
      setHistoryItems(items);
    });

    return () => {
      unsubPantry();
      unsubHistory();
    };
  }, [user]);

  // 3. Persist to LocalStorage (Local Backup)
  useEffect(() => {
    localStorage.setItem('pantry_bloom_items', JSON.stringify(pantryItems));
  }, [pantryItems]);

  // --- Native Hardware Back Button Handling ---
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let backHandler = null;
    const setupBackButton = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        
        backHandler = await CapApp.addListener('backButton', (data) => {
          // Use ref to get the absolute latest screen state
          if (screenRef.current !== 'dashboard') {
            setCurrentScreen('dashboard');
          } else {
            // Only on dashboard: show the boutique exit dialog
            setShowExitDialog(true);
          }
        });
      } catch (e) {
        console.warn("Native App plugin not available:", e);
      }
    };

    setupBackButton();
    
    return () => {
      if (backHandler) backHandler.remove();
    };
  }, []); // Only run once on mount

  const scoreProduct = (p, additivesOverride = null) => {
    const n = p.nutriments || {};
    let baseScore = p.nutriscore_score !== undefined ? (100 - (p.nutriscore_score * 2)) : 60;
    const additivesCount = additivesOverride ? additivesOverride.length : (p.additives_n || 0);
    const novaGroup = p.nova_group || 2;
    if (novaGroup >= 4) baseScore -= 25;
    if (additivesCount > 3) baseScore -= 15;
    if (additivesCount > 7) baseScore -= 20;
    const isOrganic = p.labels_tags?.some(tag => tag.toLowerCase().includes('organic'));
    if (isOrganic) baseScore += 10;
    return Math.max(0, Math.min(100, baseScore));
  };

  const extractNutrition = (n) => {
    const getVal = (keys) => {
      for (const key of keys) {
        if (n[key] !== undefined && n[key] !== null) return parseFloat(n[key]);
      }
      return 0;
    };

    // Sodium calculation logic (Salt = Sodium * 2.5)
    let sodiumMg = getVal(['sodium_100g']) * 1000; // if in grams
    if (sodiumMg === 0) sodiumMg = getVal(['salt_100g']) * 400; // salt grams to sodium mg

    return {
      energy: Math.round(getVal(['energy-kcal_100g', 'energy_kcal_100g']) || (getVal(['energy_100g']) / 4.184)),
      fat: getVal(['fat_100g']),
      saturatedFat: getVal(['saturated-fat_100g', 'saturated_fat_100g']),
      sugar: getVal(['sugars_100g']),
      fiber: getVal(['fiber_100g']),
      protein: getVal(['proteins_100g']),
      sodium: Math.round(sodiumMg)
    };
  };

  const fetchDynamicAlternatives = async (product, currentScore) => {
    setIsSearchingAlternatives(true);
    const localStores = ['Whole Foods', 'Sprouts', 'Trader Joes', 'Local Farmers Market', 'Erewhon', 'Co-op'];
    
    try {
      const tags = product?.categories_tags?.filter(t => t.includes('en:')) || [];
      // Try up to 3 different depths if needed
      const searchCategories = [
        tags.length > 0 ? tags[0] : null, // Most specific
        tags.length > 1 ? tags[Math.floor(tags.length / 2)] : null, // Middle
        tags.length > 0 ? tags[tags.length - 1] : null // Most broad
      ].filter((v, i, a) => v && a.indexOf(v) === i); // Unique only

      let allFound = [];
      
      for (const cat of searchCategories) {
        if (allFound.length >= 8) break;
        
        try {
          const res = await fetch(`https://world.openfoodfacts.org/api/v2/search?categories_tags_en=${cat.replace('en:', '')}&sort_by=nutriscore_score&page_size=20`);
          const data = await res.json();
          const candidates = data.products || [];
          
          const rated = candidates
            .map(p => ({
              name: p.product_name || 'Healthy Option',
              brand: p.brands || 'Natural Brand',
              score: scoreProduct(p),
              icon: '✨',
              image: p.image_front_url || p.image_small_url,
              store: localStores[Math.floor(Math.random() * localStores.length)],
              reason: p.nova_group <= 2 ? 'Clean processing & ingredients' : 'Higher nutritional profile'
            }))
            .filter(p => p.score > currentScore && p.name !== product.product_name);
            
          allFound = [...allFound, ...rated];
          // Remove duplicates by name
          allFound = allFound.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
        } catch (e) {
          console.warn(`Search failed for ${cat}`);
        }
      }

      // If still empty, try keyword fallback
      if (allFound.length === 0) {
        const productName = typeof product === 'string' ? product : (product?.name || product?.product_name || '');
        const term = productName.replace(/heinz|nestle|kraft|general mills|kellogg|campbell/gi, '').trim();
        const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&json=1&page_size=12`);
        const data = await res.json();
        if (data.products) {
          const rated = data.products.map(p => ({
            name: p.product_name || 'Healthy Option',
            brand: p.brands || 'Natural Brand',
            score: scoreProduct(p),
            icon: '✨',
            image: p.image_front_url || p.image_small_url,
            store: localStores[Math.floor(Math.random() * localStores.length)],
            reason: 'Superior nutritional profile'
          })).filter(p => p.score > currentScore);
          allFound = [...allFound, ...rated];
        }
      }
          
      setDynamicAlternatives(allFound.sort((a, b) => b.score - a.score).slice(0, 10));
    } catch (e) {
      console.warn("Dynamic alternative discovery engine encountered an error:", e);
    } finally {
      setIsSearchingAlternatives(false);
    }
  };

  const handleScan = async (scannedData) => {
    const barcode = scannedData.code || scannedData;
    setDynamicAlternatives([]); // Reset
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();

      if (data.status === 'success' || data.status === 1) {
        const p = data.product;
        const n = p.nutriments || {};
        const existingItem = pantryItems.find(i => i.barcode === barcode);
        const resolvedName = p.product_name || p.product_name_en || p.generic_name || p.brands || 'New Product';

        const rawIngredients = p.ingredients_text || p.ingredients_text_en || '';
        const structuredIngredients = (p.ingredients || []).map(ing => ({
          text: ing.text || '',
          percent_estimate: ing.percent_estimate || null,
          vegan: ing.vegan || null,
          vegetarian: ing.vegetarian || null,
        })).filter(ing => ing.text.length > 0);
        
        const ingredientsArray = structuredIngredients.length > 0
          ? structuredIngredients
          : rawIngredients
            ? rawIngredients.split(/,(?![^(]*\))/).map(i => ({ text: i.trim() })).filter(i => i.text.length > 0)
            : [];

        // --- Multi-source Dynamic Additive Extraction ---
        const apiAdditives = p.additives_tags || p.additives_original_tags || [];
        const parsedAdditives = new Set(apiAdditives);
        
        // 1. Dynamic ID Extraction (from structured ingredients)
        (p.ingredients || []).forEach(ing => {
          if (ing.id && ing.id.startsWith('en:e')) {
            parsedAdditives.add(ing.id);
          } else if (ing.text) {
            const matchedCode = getAdditiveFromText(ing.text);
            if (matchedCode) parsedAdditives.add(`en:${matchedCode}`);
          }
        });

        // 2. Pattern-based Extraction (E-numbers)
        const eNumberRegex = /\b[Ee]\s*(\d{3}[a-zA-Z]{0,2})\b/g;
        const textSources = [
          rawIngredients, 
          p.ingredients_text_en || '', 
          p.ingredients_text_fr || ''
        ].join(' ').toLowerCase();
        
        let match;
        while ((match = eNumberRegex.exec(textSources)) !== null) {
          parsedAdditives.add(`en:e${match[1].toLowerCase()}`);
        }

        const additivesList = Array.from(parsedAdditives);
        
        const additiveAnalysis = {
          high: additivesList.filter(a => ['e102', 'e110', 'e129', 'e133', 'e150c', 'e250', 'e251', 'e951'].some(bad => a.toLowerCase().includes(bad))).length,
          moderate: additivesList.filter(a => ['e202', 'e211', 'e407', 'e433', 'e621'].some(mod => a.toLowerCase().includes(mod))).length,
          limited: additivesList.filter(a => ['e171', 'e322', 'e471', 'e960'].some(lim => a.toLowerCase().includes(lim))).length,
          safe: 0
        };
        additiveAnalysis.safe = Math.max(0, additivesList.length - (additiveAnalysis.high + additiveAnalysis.moderate + additiveAnalysis.limited));
        
        const finalScore = scoreProduct(p, additivesList);
        
        const realItem = {
          id: Date.now(),
          scannedAt: Date.now(),
          barcode: barcode,
          inPantry: false,
          name: resolvedName,
          brand: p.brands || 'Artisan Brand',
          score: finalScore,
          nova: p.nova_group || 2,
          additives: additivesList,
          additiveAnalysis: additiveAnalysis,
          icon: '🥫',
          image: p.image_front_url || p.image_url || p.image_small_url || null,
          ingredients: ingredientsArray,
          ingredientsText: rawIngredients,
          oils: (p.ingredients_text?.toLowerCase().includes('oil')) ? 'Oils Found' : 'Clean',
          sugar: n.sugars_serving ? `${Number(n.sugars_serving).toFixed(1)}g` : '0g',
          nutrition: extractNutrition(n),
          expiryDate: existingItem ? existingItem.expiryDate : ''
        };

        // Fetch Better Alternatives Dynamically using the whole product object for category context
        fetchDynamicAlternatives(p, finalScore);

        if (user) {
          setDoc(doc(db, "users", user.uid, "history", realItem.id.toString()), realItem)
            .catch(e => console.warn("History log failed:", e));
        }

        setScannedItem(realItem);
      } else {
        // ... (fallback logic remains)
        const fallbackItem = {
          id: Date.now(),
          scannedAt: Date.now(),
          barcode: barcode,
          name: 'New Discovery',
          brand: 'Local / Unlisted',
          score: 60,
          nova: 2,
          additives: 0,
          icon: '✨',
          image: null,
          ingredients: 'This item is not yet in our global database.',
          nutrition: { energy: 0, fat: 0, saturatedFat: 0, sugar: 0, sodium: 0, fiber: 0 },
          expiryDate: ''
        };

        setScannedItem(fallbackItem);
      }
    } catch (err) {
      console.error("API Lookup Error:", err);
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
      
      // Also update History to reflect the "Finalized" name/brand if edited manually
      await setDoc(doc(db, "users", user.uid, "history", item.id.toString()), {
        ...item,
        scannedAt: item.scannedAt || Date.now()
      });
    } catch (e) {
      console.warn("Cloud save failed.");
    }

    setScannedItem(null);
    setCurrentScreen('pantry');
  };

  const removeFromPantry = async (id) => {
    if (!user) return;

    // Instant UI removal
    setPantryItems(prev => prev.filter(p => p.id?.toString() !== id?.toString()));
    
    // Cloud Removal (Scoped to User)
    try {
      await deleteDoc(doc(db, "users", user.uid, "pantry", id.toString()));
    } catch (e) {
      console.warn("Cloud delete failed.");
    }
  };

  const removeFromHistory = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "history", id.toString()));
    } catch (e) {
      console.warn("History delete failed.");
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-zinc-200 sm:flex sm:items-center sm:justify-center sm:p-4 overflow-hidden">
      <div className="phone-container">
        
        {/* Auth Barrier */}
        <AnimatePresence>
          {isAuthLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[600] bg-[#FDFCF7] flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-sage/20 border-t-sage rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black text-sage uppercase tracking-[0.3em]">Boutique Loading...</p>
            </motion.div>
          ) : (!user || showAuth) ? (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[500]">
               <AuthScreen onGoogleSignIn={handleGoogleSignIn} onContinueGuest={handleGuestSignIn} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Screen Content */}
        <div ref={mainScrollRef} className="w-full h-full pb-24 overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {currentScreen === 'dashboard' && (
              <Dashboard 
                stats={stats} 
                user={user}
                setShowAuth={setShowAuth}
                setUser={setUser}
                setCurrentScreen={setCurrentScreen}
                onSelectCategory={(id, title) => setActiveCategory({ id, title })}
                onShowMarket={() => setShowMarket(true)}
                key="dashboard" 
              />
            )}
            {currentScreen === 'history' && (
              <HistoryScreen 
                items={historyItems} 
                onDelete={removeFromHistory}
                onItemClick={(item) => {
                  setScannedItem(item);
                  setDynamicAlternatives([]); 
                }}
                key="history" 
              />
            )}
            {currentScreen === 'stats' && <Stats stats={stats} historyItems={historyItems} setShowAuth={setShowAuth} user={user} onSelectCategory={(id, title) => setActiveCategory({ id, title })} key="stats" />}
            {currentScreen === 'scanner' && <Scanner onScan={handleScan} key="scanner" />}
            {currentScreen === 'pantry' && <Pantry items={pantryItems} onItemClick={(item) => { setScannedItem(item); setDynamicAlternatives([]); }} key="pantry" />}
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
                dynamicAlternatives={dynamicAlternatives}
                isSearchingAlternatives={isSearchingAlternatives}
                currentPantryScore={stats.healthScore}
                onDismiss={() => setScannedItem(null)}
                onAdd={addToPantry}
                onDelete={removeFromPantry}
                onShowMarket={() => {
                  setScannedItem(null);
                  setShowMarket(true);
                }}
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





      </div>
    </div>
  );
};

export default App;
