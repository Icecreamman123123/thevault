import { useState, useEffect, useRef } from 'react';
import {
  Shield, Lock, Key, Database, Timer,
  CheckCircle, X, Server,
  ShieldCheck, Zap
} from 'lucide-react';

// ---- Animated counter ----
function AnimatedNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{current.toLocaleString()}</span>;
}

// ---- Animated visibility hook ----
function useAnimateIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ---- SVG Illustrations ----

function MasterPasswordIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background card */}
      <rect x="40" y="30" width="240" height="140" rx="16" className="fill-slate-800/80 stroke-slate-600" strokeWidth="1.5" />

      {/* Lock icon */}
      <g className="animate-float">
        <circle cx="160" cy="85" r="28" className="fill-emerald-500/20 stroke-emerald-400" strokeWidth="2" />
        <rect x="148" y="82" width="24" height="18" rx="3" className="fill-emerald-400" />
        <path d="M154 82V76C154 72.686 156.686 70 160 70C163.314 70 166 72.686 166 76V82" className="stroke-emerald-400" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="160" cy="91" r="2.5" className="fill-slate-800" />
        <line x1="160" y1="93" x2="160" y2="97" className="stroke-slate-800" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Password dots */}
      <g className="animate-fade-in-sequence">
        <circle cx="100" cy="135" r="5" className="fill-emerald-400 animate-dot-1" />
        <circle cx="120" cy="135" r="5" className="fill-emerald-400 animate-dot-2" />
        <circle cx="140" cy="135" r="5" className="fill-emerald-400 animate-dot-3" />
        <circle cx="160" cy="135" r="5" className="fill-emerald-400 animate-dot-4" />
        <circle cx="180" cy="135" r="5" className="fill-emerald-400 animate-dot-5" />
        <circle cx="200" cy="135" r="5" className="fill-emerald-400 animate-dot-6" />
        <circle cx="220" cy="135" r="5" className="fill-emerald-400 animate-dot-7" />
      </g>

      {/* Input field border */}
      <rect x="80" y="120" width="160" height="30" rx="8" className="stroke-slate-500 fill-slate-700/50" strokeWidth="1.5" />

      {/* Cursor */}
      <line x1="232" y1="127" x2="232" y2="143" className="stroke-emerald-400 animate-blink" strokeWidth="2" strokeLinecap="round" />

      {/* Label */}
      <text x="160" y="22" textAnchor="middle" className="fill-slate-400 text-[10px] font-medium">MASTER PASSWORD</text>
    </svg>
  );
}

function PBKDF2Illustration() {
  return (
    <svg viewBox="0 0 320 220" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Input password */}
      <rect x="90" y="10" width="140" height="32" rx="8" className="fill-slate-700 stroke-slate-500" strokeWidth="1.5" />
      <text x="160" y="30" textAnchor="middle" className="fill-emerald-400 text-[11px] font-mono">P@ssw0rd!</text>
      <text x="160" y="5" textAnchor="middle" className="fill-slate-500 text-[9px]">YOUR PASSWORD</text>

      {/* Arrow down */}
      <g className="animate-pulse-slow">
        <line x1="160" y1="48" x2="160" y2="68" className="stroke-cyan-400" strokeWidth="2" strokeDasharray="4 3" />
        <polygon points="154,65 160,75 166,65" className="fill-cyan-400" />
      </g>

      {/* Salt */}
      <rect x="210" y="55" width="90" height="24" rx="6" className="fill-amber-500/15 stroke-amber-500/50" strokeWidth="1.2" />
      <text x="255" y="71" textAnchor="middle" className="fill-amber-400 text-[9px] font-mono">+ Random Salt</text>
      <line x1="210" y1="67" x2="185" y2="85" className="stroke-amber-400/50" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* PBKDF2 Box */}
      <rect x="70" y="80" width="180" height="55" rx="12" className="fill-gradient stroke-cyan-500/60" strokeWidth="2" />
      <defs>
        <linearGradient id="pbkdf2grad" x1="70" y1="80" x2="250" y2="135">
          <stop offset="0%" stopColor="#0e7490" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect x="70" y="80" width="180" height="55" rx="12" fill="url(#pbkdf2grad)" />

      {/* Iteration rounds animation */}
      <g className="animate-spin-slow" style={{ transformOrigin: '120px 107px' }}>
        <circle cx="120" cy="107" r="12" className="stroke-cyan-400/50" strokeWidth="1.5" fill="none" />
        <circle cx="120" cy="95" r="3" className="fill-cyan-400" />
      </g>
      <text x="160" y="102" textAnchor="middle" className="fill-white text-[12px] font-bold" dx="15">PBKDF2</text>
      <text x="160" y="118" textAnchor="middle" className="fill-cyan-300 text-[9px]" dx="15">600,000 iterations</text>

      {/* Arrow down */}
      <g className="animate-pulse-slow" style={{ animationDelay: '0.5s' }}>
        <line x1="160" y1="140" x2="160" y2="160" className="stroke-emerald-400" strokeWidth="2" strokeDasharray="4 3" />
        <polygon points="154,157 160,167 166,157" className="fill-emerald-400" />
      </g>

      {/* Output key */}
      <rect x="80" y="172" width="160" height="36" rx="10" className="fill-emerald-500/15 stroke-emerald-500/50" strokeWidth="2" />
      <g className="animate-float" style={{ animationDelay: '1s' }}>
        <text x="160" y="193" textAnchor="middle" className="fill-emerald-400 text-[10px] font-mono">🔑 AES-256 Key</text>
      </g>
      <text x="160" y="220" textAnchor="middle" className="fill-slate-500 text-[8px]">DERIVED ENCRYPTION KEY</text>
    </svg>
  );
}

function AESEncryptionIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Plaintext */}
      <g>
        <rect x="10" y="30" width="90" height="80" rx="8" className="fill-slate-700 stroke-slate-500" strokeWidth="1.5" />
        <text x="55" y="22" textAnchor="middle" className="fill-slate-400 text-[9px]">PLAINTEXT</text>
        <text x="55" y="55" textAnchor="middle" className="fill-white text-[9px] font-mono">gmail.com</text>
        <text x="55" y="70" textAnchor="middle" className="fill-white text-[9px] font-mono">user@gm...</text>
        <text x="55" y="85" textAnchor="middle" className="fill-white text-[9px] font-mono">MyP@ss!</text>
        <text x="55" y="100" textAnchor="middle" className="fill-slate-500 text-[8px]">readable</text>
      </g>

      {/* Arrow */}
      <g className="animate-pulse-slow">
        <line x1="108" y1="70" x2="128" y2="70" className="stroke-cyan-400" strokeWidth="2" />
        <polygon points="126,64 136,70 126,76" className="fill-cyan-400" />
      </g>

      {/* AES-256-GCM Box */}
      <rect x="138" y="25" width="80" height="90" rx="10" className="stroke-emerald-500/60" strokeWidth="2" />
      <defs>
        <linearGradient id="aesgrad" x1="138" y1="25" x2="218" y2="115">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <rect x="138" y="25" width="80" height="90" rx="10" fill="url(#aesgrad)" />

      {/* Spinning lock inside */}
      <g className="animate-spin-slow" style={{ transformOrigin: '178px 62px' }}>
        <circle cx="178" cy="62" r="18" className="stroke-emerald-400/40" strokeWidth="1.5" fill="none" strokeDasharray="6 4" />
      </g>
      <rect x="168" y="58" width="20" height="16" rx="3" className="fill-emerald-400" />
      <path d="M172 58V54C172 51.24 174.24 49 177 49H179C181.76 49 184 51.24 184 54V58" className="stroke-emerald-400" strokeWidth="2" fill="none" strokeLinecap="round" />

      <text x="178" y="88" textAnchor="middle" className="fill-white text-[10px] font-bold">AES-256</text>
      <text x="178" y="100" textAnchor="middle" className="fill-cyan-300 text-[8px]">GCM Mode</text>

      {/* Key input */}
      <rect x="150" y="125" width="56" height="20" rx="5" className="fill-emerald-500/15 stroke-emerald-500/40" strokeWidth="1" />
      <text x="178" y="139" textAnchor="middle" className="fill-emerald-400 text-[8px]">🔑 Key</text>
      <line x1="178" y1="115" x2="178" y2="125" className="stroke-emerald-400/50" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* IV input */}
      <rect x="145" y="152" width="66" height="20" rx="5" className="fill-purple-500/15 stroke-purple-500/40" strokeWidth="1" />
      <text x="178" y="166" textAnchor="middle" className="fill-purple-400 text-[8px]">🎲 Random IV</text>

      {/* Arrow to output */}
      <g className="animate-pulse-slow" style={{ animationDelay: '0.3s' }}>
        <line x1="225" y1="70" x2="245" y2="70" className="stroke-cyan-400" strokeWidth="2" />
        <polygon points="243,64 253,70 243,76" className="fill-cyan-400" />
      </g>

      {/* Ciphertext */}
      <g>
        <rect x="255" y="30" width="60" height="80" rx="8" className="fill-slate-700 stroke-red-500/40" strokeWidth="1.5" />
        <text x="285" y="22" textAnchor="middle" className="fill-slate-400 text-[9px]">ENCRYPTED</text>
        <g className="animate-scramble">
          <text x="285" y="55" textAnchor="middle" className="fill-red-400 text-[8px] font-mono">x9#kL2p</text>
          <text x="285" y="68" textAnchor="middle" className="fill-red-400 text-[8px] font-mono">Qm!vB7</text>
          <text x="285" y="81" textAnchor="middle" className="fill-red-400 text-[8px] font-mono">w$zR4n</text>
          <text x="285" y="94" textAnchor="middle" className="fill-red-400 text-[8px] font-mono">Yf&amp;3Jd</text>
        </g>
        <text x="285" y="100" textAnchor="middle" className="fill-slate-600 text-[7px]" dy="8">unreadable</text>
      </g>
    </svg>
  );
}

function LocalStorageIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Browser window */}
      <rect x="40" y="15" width="240" height="170" rx="12" className="fill-slate-800 stroke-slate-600" strokeWidth="1.5" />
      <rect x="40" y="15" width="240" height="28" rx="12" className="fill-slate-700" />
      <rect x="40" y="35" width="240" height="8" className="fill-slate-700" />

      {/* Window dots */}
      <circle cx="56" cy="29" r="4" className="fill-red-400" />
      <circle cx="70" cy="29" r="4" className="fill-amber-400" />
      <circle cx="84" cy="29" r="4" className="fill-green-400" />

      {/* URL bar */}
      <rect x="100" y="22" width="140" height="14" rx="4" className="fill-slate-600" />
      <text x="170" y="33" textAnchor="middle" className="fill-slate-300 text-[8px]">🔒 localhost</text>

      {/* Storage visualization */}
      <rect x="60" y="55" width="200" height="30" rx="6" className="fill-slate-700/80 stroke-slate-600" strokeWidth="1" />
      <text x="70" y="74" className="fill-slate-400 text-[9px]">localStorage</text>
      <rect x="155" y="61" width="95" height="18" rx="4" className="fill-emerald-500/15 stroke-emerald-500/30" strokeWidth="1" />
      <text x="202" y="74" textAnchor="middle" className="fill-emerald-400 text-[8px]">encrypted vault</text>

      {/* Data blocks */}
      <g className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <rect x="65" y="95" width="88" height="24" rx="5" className="fill-red-500/10 stroke-red-500/30" strokeWidth="1" />
        <text x="109" y="111" textAnchor="middle" className="fill-red-400 text-[8px] font-mono">x9#kL2p$mBv7</text>
      </g>
      <g className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <rect x="160" y="95" width="88" height="24" rx="5" className="fill-red-500/10 stroke-red-500/30" strokeWidth="1" />
        <text x="204" y="111" textAnchor="middle" className="fill-red-400 text-[8px] font-mono">Qw$zR4nYf&amp;3</text>
      </g>
      <g className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <rect x="65" y="125" width="88" height="24" rx="5" className="fill-red-500/10 stroke-red-500/30" strokeWidth="1" />
        <text x="109" y="141" textAnchor="middle" className="fill-red-400 text-[8px] font-mono">Ht7!bNk@9Lx</text>
      </g>
      <g className="animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
        <rect x="160" y="125" width="88" height="24" rx="5" className="fill-red-500/10 stroke-red-500/30" strokeWidth="1" />
        <text x="204" y="141" textAnchor="middle" className="fill-red-400 text-[8px] font-mono">pM2#cVw!5Zq</text>
      </g>

      {/* Shield overlay */}
      <g className="animate-float">
        <circle cx="265" cy="165" r="16" className="fill-emerald-500/20" />
        <path d="M265 152 L275 157 V165 C275 171 265 176 265 176 C265 176 255 171 255 165 V157 Z" className="fill-emerald-500/30 stroke-emerald-400" strokeWidth="1.5" />
        <path d="M260 164 L263 167 L270 160" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* Label */}
      <text x="160" y="170" textAnchor="middle" className="fill-slate-500 text-[8px]">All data stays on YOUR device — never sent anywhere</text>
    </svg>
  );
}

function AutoLockIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Clock */}
      <g className="animate-float">
        <circle cx="160" cy="90" r="55" className="fill-slate-800 stroke-slate-600" strokeWidth="2" />
        <circle cx="160" cy="90" r="50" className="stroke-slate-500" strokeWidth="1" fill="none" />

        {/* Clock marks */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = 160 + 42 * Math.cos(angle);
          const y1 = 90 + 42 * Math.sin(angle);
          const x2 = 160 + 47 * Math.cos(angle);
          const y2 = 90 + 47 * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-slate-400" strokeWidth={i % 3 === 0 ? "2.5" : "1.5"} strokeLinecap="round" />;
        })}

        {/* Hour hand */}
        <line x1="160" y1="90" x2="160" y2="60" className="stroke-white" strokeWidth="3" strokeLinecap="round" />

        {/* Minute hand - animated */}
        <g className="animate-clock-hand" style={{ transformOrigin: '160px 90px' }}>
          <line x1="160" y1="90" x2="160" y2="50" className="stroke-emerald-400" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Center dot */}
        <circle cx="160" cy="90" r="4" className="fill-emerald-400" />

        {/* Countdown arc */}
        <circle
          cx="160" cy="90" r="50"
          className="stroke-amber-400 animate-countdown-arc"
          strokeWidth="3"
          fill="none"
          strokeDasharray="314"
          strokeDashoffset="78"
          strokeLinecap="round"
          transform="rotate(-90 160 90)"
        />
      </g>

      {/* Lock states */}
      <g className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        {/* Unlocked */}
        <rect x="30" y="155" width="80" height="32" rx="8" className="fill-emerald-500/15 stroke-emerald-500/40" strokeWidth="1.5" />
        <text x="70" y="175" textAnchor="middle" className="fill-emerald-400 text-[9px] font-medium">🔓 Active</text>
      </g>

      {/* Arrow */}
      <g className="animate-pulse-slow">
        <line x1="118" y1="171" x2="190" y2="171" className="stroke-amber-400" strokeWidth="1.5" strokeDasharray="4 3" />
        <polygon points="188,166 198,171 188,176" className="fill-amber-400" />
      </g>

      {/* Timeout label */}
      <text x="155" y="164" textAnchor="middle" className="fill-amber-400 text-[8px]">timeout</text>

      {/* Locked */}
      <g className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <rect x="205" y="155" width="80" height="32" rx="8" className="fill-red-500/15 stroke-red-500/40" strokeWidth="1.5" />
        <text x="245" y="175" textAnchor="middle" className="fill-red-400 text-[9px] font-medium">🔒 Locked</text>
      </g>

      {/* Key wiped label */}
      <text x="160" y="198" textAnchor="middle" className="fill-slate-500 text-[8px]">Encryption key wiped from memory</text>
    </svg>
  );
}

function PasswordGenIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Random source */}
      <rect x="20" y="25" width="80" height="55" rx="10" className="fill-purple-500/15 stroke-purple-500/40" strokeWidth="1.5" />
      <text x="60" y="20" textAnchor="middle" className="fill-purple-400 text-[9px] font-medium">CRYPTO RNG</text>

      {/* Random bytes visualization */}
      <g className="animate-scramble-fast">
        <text x="60" y="48" textAnchor="middle" className="fill-purple-300 text-[9px] font-mono">0x7F 0x3A</text>
        <text x="60" y="62" textAnchor="middle" className="fill-purple-300 text-[9px] font-mono">0xB2 0xE9</text>
        <text x="60" y="76" textAnchor="middle" className="fill-purple-300 text-[9px] font-mono">0x41 0xCC</text>
      </g>

      {/* Arrow */}
      <g className="animate-pulse-slow">
        <line x1="108" y1="52" x2="128" y2="52" className="stroke-cyan-400" strokeWidth="2" />
        <polygon points="126,46 136,52 126,58" className="fill-cyan-400" />
      </g>

      {/* Character sets */}
      <rect x="140" y="15" width="160" height="80" rx="10" className="fill-slate-800 stroke-slate-600" strokeWidth="1.5" />
      <text x="220" y="10" textAnchor="middle" className="fill-slate-400 text-[9px]">CHARACTER SETS</text>

      <g className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <rect x="150" y="23" width="65" height="16" rx="4" className="fill-blue-500/15 stroke-blue-500/30" strokeWidth="1" />
        <text x="182" y="35" textAnchor="middle" className="fill-blue-400 text-[8px] font-mono">A-Z (26)</text>
      </g>
      <g className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <rect x="222" y="23" width="65" height="16" rx="4" className="fill-green-500/15 stroke-green-500/30" strokeWidth="1" />
        <text x="254" y="35" textAnchor="middle" className="fill-green-400 text-[8px] font-mono">a-z (26)</text>
      </g>
      <g className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <rect x="150" y="45" width="65" height="16" rx="4" className="fill-amber-500/15 stroke-amber-500/30" strokeWidth="1" />
        <text x="182" y="57" textAnchor="middle" className="fill-amber-400 text-[8px] font-mono">0-9 (10)</text>
      </g>
      <g className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
        <rect x="222" y="45" width="65" height="16" rx="4" className="fill-pink-500/15 stroke-pink-500/30" strokeWidth="1" />
        <text x="254" y="57" textAnchor="middle" className="fill-pink-400 text-[8px] font-mono">!@# (27)</text>
      </g>

      {/* Strength meter */}
      <rect x="150" y="70" width="140" height="14" rx="4" className="fill-slate-700" />
      <rect x="150" y="70" width="120" height="14" rx="4" className="fill-gradient animate-strength-fill" />
      <defs>
        <linearGradient id="strengthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="33%" stopColor="#f59e0b" />
          <stop offset="66%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect x="150" y="70" width="120" height="14" rx="4" fill="url(#strengthGrad)" opacity="0.8" />
      <text x="280" y="81" className="fill-emerald-400 text-[8px] font-bold">Strong</text>

      {/* Arrow down to result */}
      <g className="animate-pulse-slow" style={{ animationDelay: '0.3s' }}>
        <line x1="180" y1="100" x2="180" y2="120" className="stroke-emerald-400" strokeWidth="2" />
        <polygon points="174,117 180,127 186,117" className="fill-emerald-400" />
      </g>

      {/* Generated password result */}
      <rect x="50" y="130" width="220" height="50" rx="12" className="fill-slate-800 stroke-emerald-500/40" strokeWidth="2" />

      <g className="animate-float">
        <text x="160" y="153" textAnchor="middle" className="fill-emerald-400 text-[13px] font-mono font-bold">x9#kL2p$mBv7Qw!</text>
      </g>
      <text x="160" y="172" textAnchor="middle" className="fill-slate-500 text-[8px]">Cryptographically secure • Unique every time</text>

      {/* Copy icon */}
      <g className="animate-fade-in-up" style={{ animationDelay: '1s' }}>
        <rect x="245" y="140" width="18" height="18" rx="4" className="fill-emerald-500/20 stroke-emerald-400/50" strokeWidth="1" />
        <rect x="249" y="144" width="8" height="8" rx="1.5" className="stroke-emerald-400" strokeWidth="1" fill="none" />
        <rect x="251" y="146" width="8" height="8" rx="1.5" className="stroke-emerald-400" strokeWidth="1" fill="none" />
      </g>
    </svg>
  );
}

// ---- Data flow diagram ----
function DataFlowDiagram() {
  return (
    <svg viewBox="0 0 800 120" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Step 1: Master Password */}
      <g>
        <rect x="0" y="25" width="130" height="60" rx="12" className="fill-slate-800 stroke-emerald-500/40" strokeWidth="2" />
        <text x="65" y="52" textAnchor="middle" className="fill-emerald-400 text-[11px] font-bold">Master</text>
        <text x="65" y="68" textAnchor="middle" className="fill-emerald-400 text-[11px] font-bold">Password</text>
        <text x="65" y="18" textAnchor="middle" className="fill-slate-500 text-[9px]">Step 1</text>
      </g>

      {/* Arrow */}
      <g className="animate-pulse-slow">
        <line x1="138" y1="55" x2="168" y2="55" className="stroke-cyan-400" strokeWidth="2" strokeDasharray="4 3" />
        <polygon points="166,49 176,55 166,61" className="fill-cyan-400" />
      </g>

      {/* Step 2: PBKDF2 */}
      <g>
        <rect x="180" y="25" width="130" height="60" rx="12" className="fill-slate-800 stroke-cyan-500/40" strokeWidth="2" />
        <text x="245" y="52" textAnchor="middle" className="fill-cyan-400 text-[11px] font-bold">PBKDF2</text>
        <text x="245" y="68" textAnchor="middle" className="fill-cyan-300 text-[9px]">600K rounds</text>
        <text x="245" y="18" textAnchor="middle" className="fill-slate-500 text-[9px]">Step 2</text>
      </g>

      {/* Arrow */}
      <g className="animate-pulse-slow" style={{ animationDelay: '0.2s' }}>
        <line x1="318" y1="55" x2="348" y2="55" className="stroke-cyan-400" strokeWidth="2" strokeDasharray="4 3" />
        <polygon points="346,49 356,55 346,61" className="fill-cyan-400" />
      </g>

      {/* Step 3: AES Key */}
      <g>
        <rect x="360" y="25" width="130" height="60" rx="12" className="fill-slate-800 stroke-amber-500/40" strokeWidth="2" />
        <text x="425" y="52" textAnchor="middle" className="fill-amber-400 text-[11px] font-bold">AES-256</text>
        <text x="425" y="68" textAnchor="middle" className="fill-amber-300 text-[9px]">Encrypt</text>
        <text x="425" y="18" textAnchor="middle" className="fill-slate-500 text-[9px]">Step 3</text>
      </g>

      {/* Arrow */}
      <g className="animate-pulse-slow" style={{ animationDelay: '0.4s' }}>
        <line x1="498" y1="55" x2="528" y2="55" className="stroke-cyan-400" strokeWidth="2" strokeDasharray="4 3" />
        <polygon points="526,49 536,55 526,61" className="fill-cyan-400" />
      </g>

      {/* Step 4: Local Storage */}
      <g>
        <rect x="540" y="25" width="130" height="60" rx="12" className="fill-slate-800 stroke-purple-500/40" strokeWidth="2" />
        <text x="605" y="52" textAnchor="middle" className="fill-purple-400 text-[11px] font-bold">localStorage</text>
        <text x="605" y="68" textAnchor="middle" className="fill-purple-300 text-[9px]">Encrypted</text>
        <text x="605" y="18" textAnchor="middle" className="fill-slate-500 text-[9px]">Step 4</text>
      </g>

      {/* Arrow */}
      <g className="animate-pulse-slow" style={{ animationDelay: '0.6s' }}>
        <line x1="678" y1="55" x2="708" y2="55" className="stroke-cyan-400" strokeWidth="2" strokeDasharray="4 3" />
        <polygon points="706,49 716,55 706,61" className="fill-cyan-400" />
      </g>

      {/* Step 5: Auto Lock */}
      <g>
        <rect x="720" y="25" width="80" height="60" rx="12" className="fill-slate-800 stroke-red-500/40" strokeWidth="2" />
        <text x="760" y="52" textAnchor="middle" className="fill-red-400 text-[11px] font-bold">Auto</text>
        <text x="760" y="68" textAnchor="middle" className="fill-red-400 text-[11px] font-bold">Lock</text>
        <text x="760" y="18" textAnchor="middle" className="fill-slate-500 text-[9px]">Step 5</text>
      </g>

      {/* Bottom labels */}
      <text x="400" y="110" textAnchor="middle" className="fill-slate-600 text-[9px]">Your password never leaves your device • Zero-knowledge architecture</text>
    </svg>
  );
}

// ---- Step card ----
function StepCard({
  stepNumber,
  title,
  subtitle,
  description,
  bullets,
  icon: _Icon,
  iconColor,
  illustration,
  delay,
}: {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  illustration: React.ReactNode;
  delay: number;
}) {
  const { ref, visible } = useAnimateIn();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/70 transition-all duration-300 group">
        {/* Step number badge */}
        <div className="px-6 pt-6 pb-2 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${iconColor} shadow-lg`}>
            {stepNumber}
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{subtitle}</div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
        </div>

        {/* Illustration */}
        <div className="px-4 py-2">
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-4 overflow-hidden">
            {illustration}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-slate-400 text-sm mb-3 leading-relaxed">{description}</p>
          <ul className="space-y-2">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-slate-300">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---- Brute-force comparison card ----
function BruteForceCard({ title, time, subtitle, color, textColor, delay }: {
  title: string; time: string; subtitle: string; color: string; textColor: string; delay: number;
}) {
  const { ref, visible } = useAnimateIn();
  return (
    <div
      ref={ref}
      className={`bg-slate-800/60 border ${color} rounded-xl p-5 text-center transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-sm text-slate-400 mb-2">{title}</div>
      <div className={`text-3xl font-bold ${textColor} mb-1`}>{time}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========
export default function HowItWorks({ onClose }: { onClose: () => void }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setScrollProgress(scrollTop / (scrollHeight - clientHeight));
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col">
      {/* Top bar with progress */}
      <div className="bg-slate-900/95 border-b border-slate-700/50 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">How VaultGuard Works</h2>
            <p className="text-slate-400 text-xs">Understanding your security</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-slate-800 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-150"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Scrollable content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              Military-Grade Encryption
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Your Passwords,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Fully Encrypted
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              VaultGuard uses industry-standard cryptographic algorithms to ensure your passwords
              are <strong className="text-white">never stored in plain text</strong>. Here's exactly how it works.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">
                <AnimatedNumber target={256} />
              </div>
              <div className="text-xs text-slate-400 mt-1">Bit Encryption</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">
                <AnimatedNumber target={600000} />
              </div>
              <div className="text-xs text-slate-400 mt-1">PBKDF2 Iterations</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                <AnimatedNumber target={96} />
              </div>
              <div className="text-xs text-slate-400 mt-1">Bit Random IV</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">0</div>
              <div className="text-xs text-slate-400 mt-1">External Servers</div>
            </div>
          </div>

          {/* Data flow overview */}
          <div className="mb-12">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 overflow-x-auto">
              <h3 className="text-white font-bold mb-4 text-center">End-to-End Encryption Pipeline</h3>
              <DataFlowDiagram />
            </div>
          </div>

          {/* Step-by-step cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <StepCard
              stepNumber={1}
              title="Master Password"
              subtitle="Authentication"
              description="Your master password is the only key to your vault. It is never stored anywhere — not even encrypted. We only keep a cryptographic verification hash."
              bullets={[
                'Never stored in plain text or encrypted form',
                'Verification via separate PBKDF2 hash',
                'Only exists in memory while vault is unlocked',
                'Minimum 8 characters enforced with strength meter',
              ]}
              icon={Lock}
              iconColor="bg-emerald-500"
              illustration={<MasterPasswordIllustration />}
              delay={0}
            />

            <StepCard
              stepNumber={2}
              title="PBKDF2 Key Derivation"
              subtitle="Key Stretching"
              description="Your password is combined with a random 256-bit salt and run through 600,000 rounds of PBKDF2-SHA256 to create the encryption key. This makes brute-force attacks computationally infeasible."
              bullets={[
                '600,000 iterations (OWASP recommended)',
                'Random 256-bit salt unique per vault',
                'SHA-256 hash function',
                'Makes each password guess take ~0.5 seconds',
              ]}
              icon={Key}
              iconColor="bg-cyan-500"
              illustration={<PBKDF2Illustration />}
              delay={100}
            />

            <StepCard
              stepNumber={3}
              title="AES-256-GCM Encryption"
              subtitle="Data Protection"
              description="All vault data is encrypted using AES-256 in Galois/Counter Mode. Each save generates a fresh random 96-bit Initialization Vector, ensuring identical data encrypts differently every time."
              bullets={[
                'AES-256: used by governments worldwide',
                'GCM mode provides authenticated encryption',
                'Fresh random IV prevents pattern analysis',
                'Tamper detection built into ciphertext',
              ]}
              icon={Shield}
              iconColor="bg-amber-500"
              illustration={<AESEncryptionIllustration />}
              delay={200}
            />

            <StepCard
              stepNumber={4}
              title="Local-Only Storage"
              subtitle="Zero Cloud"
              description="Your encrypted vault lives exclusively in your browser's localStorage. No data is ever transmitted to any server. You have complete ownership of your passwords."
              bullets={[
                'Data never leaves your device',
                'No accounts, no cloud, no servers',
                'Even if someone copies the storage, data is useless without your password',
                'You can delete everything instantly',
              ]}
              icon={Database}
              iconColor="bg-purple-500"
              illustration={<LocalStorageIllustration />}
              delay={300}
            />

            <StepCard
              stepNumber={5}
              title="Auto-Lock Timer"
              subtitle="Session Security"
              description="When you step away, VaultGuard automatically locks and wipes the encryption key from memory. This ensures no one can access your passwords if you leave your computer unattended."
              bullets={[
                'Configurable timeout (1-30 minutes)',
                'Tracks mouse, keyboard, click & scroll activity',
                'Key completely removed from memory on lock',
                'Must re-enter master password to unlock',
              ]}
              icon={Timer}
              iconColor="bg-red-500"
              illustration={<AutoLockIllustration />}
              delay={400}
            />

            <StepCard
              stepNumber={6}
              title="Password Generator"
              subtitle="Secure Generation"
              description="Generate cryptographically secure passwords using the Web Crypto API's getRandomValues() — the same random number generator used for TLS encryption in your browser."
              bullets={[
                'Uses crypto.getRandomValues() (CSPRNG)',
                'Configurable length (4-64 characters)',
                'Mix uppercase, lowercase, numbers, symbols',
                'Real-time strength analysis',
              ]}
              icon={Zap}
              iconColor="bg-pink-500"
              illustration={<PasswordGenIllustration />}
              delay={500}
            />
          </div>

          {/* Security comparison */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Why This Matters</h2>
              <p className="text-slate-400">How long it takes to brute-force AES-256 encryption</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BruteForceCard
                title="Regular Computer"
                time="10⁵⁰ years"
                subtitle="Billions of times the age of the universe"
                color="border-emerald-500/40"
                textColor="text-emerald-400"
                delay={0}
              />
              <BruteForceCard
                title="Supercomputer"
                time="10⁴⁰ years"
                subtitle="Still essentially impossible"
                color="border-cyan-500/40"
                textColor="text-cyan-400"
                delay={150}
              />
              <BruteForceCard
                title="Quantum Computer"
                time="10²⁰ years"
                subtitle="Still trillions of years (Grover's algorithm)"
                color="border-purple-500/40"
                textColor="text-purple-400"
                delay={300}
              />
            </div>
          </div>

          {/* Tech stack */}
          <div className="mb-12">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 text-center">Built with Web Standards</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Web Crypto API', desc: 'Native browser encryption', icon: Lock },
                  { name: 'PBKDF2', desc: 'Key derivation function', icon: Key },
                  { name: 'AES-256-GCM', desc: 'Authenticated encryption', icon: Shield },
                  { name: 'localStorage', desc: 'Client-side storage', icon: Server },
                ].map((tech, i) => (
                  <div key={i} className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 text-center">
                    <tech.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <div className="text-white text-sm font-medium">{tech.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{tech.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pb-8">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              Got It — Back to Vault
            </button>
            <p className="text-slate-600 text-xs mt-4">
              Your passwords are safe with VaultGuard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
