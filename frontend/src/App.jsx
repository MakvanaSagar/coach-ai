import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import * as pdfjs from 'pdfjs-dist';
import nlp from 'compromise';
import { extractInsights, answerQuestion, getVisualData, generateCitations, semanticSearch } from './nlpEngine.js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, RadialLinearScale, Filler } from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, RadialLinearScale, Filler);

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const CustomCursor = () => {
   const [position, setPosition] = useState({ x: 0, y: 0 });
   const [isPointer, setIsPointer] = useState(false);
   const cursorRef = useRef(null);
   const followerRef = useRef(null);

   useEffect(() => {
      const handleMouseMove = (e) => {
         const { clientX, clientY } = e;
         setPosition({ x: clientX, y: clientY });
         const target = e.target;
         setIsPointer(
            window.getComputedStyle(target).cursor === 'pointer' ||
            target.tagName === 'BUTTON' ||
            target.tagName === 'A' ||
            target.closest('button') ||
            target.closest('a')
         );
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
   }, []);

   return (
      <>
         <div ref={cursorRef} className={`custom-cursor ${isPointer ? 'pointer' : ''}`} style={{ left: `${position.x}px`, top: `${position.y}px` }} />
         <div ref={followerRef} className={`cursor-follower ${isPointer ? 'pointer' : ''}`} style={{ left: `${position.x}px`, top: `${position.y}px` }} />
      </>
   );
};

const FloatingParticles = () => {
   const [particles, setParticles] = useState([]);
   useEffect(() => {
      const p = Array.from({ length: 45 }).map(() => ({
         x: `${Math.random() * 100}vw`,
         y: `${Math.random() * 100}vh`,
         size: `${Math.random() * 15 + 10}px`,
         duration: `${Math.random() * 20 + 20}s`,
         delay: `${Math.random() * -10}s`,
         z: Math.random() > 0.5 ? 1 : -1,
         bg: ['#6366f1', '#ec4899', '#f97316', '#3b82f6', '#f59e0b'][Math.floor(Math.random() * 5)]
      }));
      setParticles(p);
   }, []);
   return (
      <div className="particles-container">
         {particles.map((p, i) => (
            <div key={i} className="particle" style={{ '--x': p.x, '--y': p.y, '--size': p.size, '--duration': p.duration, '--delay': p.delay, '--z': p.z, '--bg': p.bg }}></div>
         ))}
      </div>
   );
};

const HeroTypewriter = () => {
   const line1 = "Stay Organized & Study Smarter.";
   const line2 = "Accelerate your Academics with AI.";
   const line3 = "Your Multi-Dimensional AI Research Workspace built on smooth antigravity UX principles. Overcome information overload today.";
   const [t1, setT1] = useState('');
   const [t2, setT2] = useState('');
   const [t3, setT3] = useState('');
   const [phase, setPhase] = useState(1);
   useEffect(() => {
      if (phase === 1) {
         if (t1.length < line1.length) { const t = setTimeout(() => setT1(line1.slice(0, t1.length + 1)), 35); return () => clearTimeout(t); }
         else { setTimeout(() => setPhase(2), 200); }
      } else if (phase === 2) {
         if (t2.length < line2.length) { const t = setTimeout(() => setT2(line2.slice(0, t2.length + 1)), 45); return () => clearTimeout(t); }
         else { setTimeout(() => setPhase(3), 200); }
      } else if (phase === 3) {
         if (t3.length < line3.length) { const t = setTimeout(() => setT3(line3.slice(0, t3.length + 1)), 25); return () => clearTimeout(t); }
      }
   }, [phase, t1, t2, t3]);
   return (
      <>
         <h1 className="hero-title fade-up delay-2">{t1}<br /><span className="gradient-text">{t2}</span></h1>
         <p className="hero-desc fade-up delay-3">{t3}</p>
      </>
   );
};

const FeatureWave = () => {
   const baseIcons = ['fa-pen-nib', 'fa-folder-open', 'fa-magnifying-glass-chart', 'fa-chart-pie', 'fa-microchip', 'fa-graduation-cap', 'fa-file-pdf', 'fa-brain', 'fa-rocket', 'fa-bolt-lightning', 'fa-layer-group', 'fa-fingerprint'];
   const marqueeIcons = [...baseIcons, ...baseIcons, ...baseIcons];
   return (
      <div className="wave-marquee-container fade-up delay-3">
         <div className="wave-marquee-track">{marqueeIcons.map((icon, i) => (
            <div key={i} className="wave-icon-wrapper" style={{ marginTop: `${Math.sin(i * 0.8) * 45}px` }}>
               <div className="wave-icon-circle"><i className={`fa-solid ${icon}`}></i></div>
            </div>
         ))}</div>
      </div>
   );
};

const StudentProfileModal = ({ isOpen, onClose, userName, formData, handleLogout, profilePic, setProfilePic }) => {
   const [activeTab, setActiveTab] = useState('Identity Center');
   const fileInputRef = useRef(null);

   if (!isOpen) return null;

   const handlePicUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            setProfilePic(reader.result);
            try {
               const activeSession = JSON.parse(localStorage.getItem('coachai_active_session'));
               if (activeSession) {
                  activeSession.profilePic = reader.result;
                  localStorage.setItem('coachai_active_session', JSON.stringify(activeSession));
               }
            } catch(e) {}
         };
         reader.readAsDataURL(file);
      }
   };

   return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
         <div onClick={() => window.location.reload()} style={{ position: 'fixed', top: '30px', left: '30px', opacity: 0.15, cursor: 'pointer', transition: '0.3s', zIndex: 5000 }} onMouseEnter={e => e.currentTarget.style.opacity = 0.7} onMouseLeave={e => e.currentTarget.style.opacity = 0.15} title="Administrative Return"><i className="fa-solid fa-house" style={{ fontSize: '1rem', color: '#fff' }}></i></div>
         <div className="glass-card fade-in student-profile-modal-content" style={{ width: '90%', maxWidth: '1000px', height: '85vh', display: 'flex', padding: 0, borderRadius: '40px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            <div className="student-profile-modal-sidebar" style={{ width: '280px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid var(--glass-border)', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePicUpload} />
               <div onClick={() => fileInputRef.current.click()} style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: '900', fontSize: '2.8rem', border: '4px solid white', marginBottom: '25px', boxShadow: '0 15px 30px rgba(99,102,241,0.3)', cursor: 'pointer', overflow: 'hidden', position: 'relative' }} title="Upload Profile Picture" className="profile-pic-container">
                  {profilePic ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (userName || 'S').charAt(0)}
                  <div className="overlay-pic" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: '0.3s' }}><i className="fa-solid fa-camera" style={{ fontSize: '1.5rem', color: '#fff' }}></i></div>
               </div>
               <h2 style={{ margin: 0, fontSize: '1.6rem' }}>{userName}</h2>
               <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '50px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '700' }}>Elite Scholar Identity</p>
               <div style={{ flex: 1, width: '100%', padding: '0 25px' }}>{['Identity Center', 'Focus Milestones', 'Elastic Preferences', 'System Security'].map((t, i) => (
                  <div key={i} onClick={() => setActiveTab(t)} style={{ padding: '14px 20px', borderRadius: '15px', background: activeTab === t ? 'rgba(99,102,241,0.12)' : 'transparent', color: activeTab === t ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem', transition: '0.3s' }}>{t}</div>
               ))}</div>
               <div style={{ padding: '0 25px', width: '100%' }}><button onClick={handleLogout} style={{ width: '100%', padding: '16px', background: 'rgba(255,75,92,0.1)', color: '#ff4b5c', border: '1px solid rgba(255,75,92,0.2)', borderRadius: '16px', cursor: 'pointer', fontWeight: '900', transition: '0.3s' }}>Terminate Session</button></div>
            </div>
            <div className="student-profile-modal-main" style={{ flex: 1, padding: '70px', overflowY: 'auto' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}><h1 className="gradient-text hero-greet-mobile" style={{ fontSize: '3.2rem', fontWeight: '900', margin: 0, letterSpacing: '-2px' }}>Scholar Hub</h1><button onClick={onClose} className="icon-btn" style={{ width: '50px', height: '50px' }}><i className="fa-solid fa-times"></i></button></div>
               
               {activeTab === 'Identity Center' && (
                  <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                     <div className="glass-card" style={{ padding: '35px', border: '1px solid var(--glass-border)', borderRadius: '28px' }}><label style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Academic Stratum</label><p style={{ fontSize: '1.5rem', margin: '12px 0 0', fontWeight: '800' }}>{formData?.eduLevel || 'Scholar'} • {formData?.course || 'Neural Path'}</p></div>
                     <div className="glass-card" style={{ padding: '35px', border: '1px solid var(--glass-border)', borderRadius: '28px' }}><label style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Cognitive Load</label><p style={{ fontSize: '1.5rem', margin: '12px 0 0', fontWeight: '800' }}>{formData?.studyHours || '0'} Daily Retention</p></div>
                     <div className="glass-card" style={{ gridColumn: '1/-1', padding: '40px', border: '1px solid var(--glass-border)', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), transparent)' }}><h3 style={{ marginTop: 0, fontSize: '1.4rem' }}>Synthesis Style: <span className="gradient-text">{formData?.learnStyle || 'Universal'}</span></h3><p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.05rem', marginTop: '15px' }}>Your multidimensional AI agents are currently trained against the {(formData?.learnStyle || 'Universal').toLowerCase()} paradigm.</p></div>
                  </div>
               )}

               {activeTab === 'Focus Milestones' && (
                  <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     <div className="glass-card" style={{ padding: '25px', borderRadius: '20px', borderLeft: '4px solid var(--primary)', background: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', color: 'var(--text-main)' }}><i className="fa-solid fa-fire" style={{ color: '#f97316', marginRight: '10px' }}></i> 7-Day Consistency Streak</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>You've synced with the Neural Hub perfectly this week.</p>
                     </div>
                     <div className="glass-card" style={{ padding: '25px', borderRadius: '20px', borderLeft: '4px solid #10b981', background: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', color: 'var(--text-main)' }}><i className="fa-solid fa-brain" style={{ color: '#10b981', marginRight: '10px' }}></i> Insight Assimilation</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>45 Documents successfully parsed and summarized.</p>
                     </div>
                  </div>
               )}

               {activeTab === 'Elastic Preferences' && (
                  <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     {['Global Auto-Sync Uploads', 'Advanced NLP Querying', 'Acoustic Notifications', 'Strict Focus Mode'].map((pref, i) => (
                        <div key={i} className="glass-card" style={{ padding: '20px 25px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                           <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{pref}</span>
                           <div style={{ width: '45px', height: '24px', background: i < 2 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', borderRadius: '15px', position: 'relative', cursor: 'pointer' }}>
                              <div style={{ position: 'absolute', top: '2px', left: i < 2 ? '23px' : '2px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.3s' }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {activeTab === 'System Security' && (
                  <div className="fade-in glass-card" style={{ padding: '40px', borderRadius: '30px' }}>
                     <h3 style={{ margin: '0 0 25px', color: 'var(--text-main)' }}>Authentication Protocols</h3>
                     <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Update Password</label>
                        <input className="form-input" type="password" placeholder="New Account Password" />
                     </div>
                     <button className="btn-primary" style={{ padding: '12px 30px', borderRadius: '12px', fontSize: '1rem' }}>Update Security</button>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

const ChatBubble = ({ type, text, isFile, userName, profilePic }) => (
   <div className={`chat-message ${type}`} style={{ alignSelf: type === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', gap: '20px', flexDirection: type === 'user' ? 'row-reverse' : 'row', marginBottom: '35px', alignItems: 'flex-start', animation: 'slideUp 0.5s ease-out forwards' }}>
      <div className="chat-avatar" style={{ background: type === 'user' ? 'linear-gradient(135deg, var(--secondary), #f97316)' : 'linear-gradient(135deg, var(--primary), #6366f1)', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: '900', flexShrink: 0, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', fontSize: '1rem', overflow: 'hidden' }}>
         {type === 'user' ? (profilePic ? <img src={profilePic} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (userName || 'U').charAt(0).toUpperCase()) : <i className="fa-solid fa-layer-group"></i>}
      </div>
      {isFile ? (
         <div className="glass-card" style={{ padding: '20px 30px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid var(--primary)', background: 'rgba(99,102,241,0.05)' }}>
            <i className="fa-solid fa-file-pdf" style={{ fontSize: '1.8rem', color: '#ff4b5c' }}></i>
            <div>
               <div style={{ fontWeight: '900', fontSize: '0.95rem', color: 'var(--text-main)' }}>{text}</div>
               <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', letterSpacing: '1px' }}>SYNCHRONIZED</div>
            </div>
         </div>
      ) : (
         <div className="chat-bubble" style={{ background: type === 'user' ? 'linear-gradient(135deg, var(--primary), #4f46e5)' : 'var(--glass-bg)', color: type === 'user' ? '#fff' : 'var(--text-main)', padding: '22px 30px', borderRadius: type === 'user' ? '28px 4px 28px 28px' : '4px 28px 28px 28px', fontSize: '1.1rem', border: '1px solid var(--glass-border)', boxShadow: '0 15px 45px -10px rgba(0,0,0,0.1)', lineHeight: 1.8, fontWeight: '500', transition: 'all 0.3s ease', whiteSpace: 'pre-wrap' }}>{type === 'ai' ? <Typewriter text={text} speed={10} /> : text}</div>
      )}
   </div>
);

const PomodoroTimer = () => {
   const [minutes, setMinutes] = useState(25);
   const [seconds, setSeconds] = useState(0);
   const [isActive, setIsActive] = useState(false);

   useEffect(() => {
      let interval = null;
      if (isActive) {
         interval = setInterval(() => {
            if (seconds > 0) {
               setSeconds(seconds - 1);
            } else if (minutes > 0) {
               setMinutes(minutes - 1);
               setSeconds(59);
            } else {
               clearInterval(interval);
               setIsActive(false);
               alert("Study session complete! Take a break, Scholar. 🎓");
            }
         }, 1000);
      } else {
         clearInterval(interval);
      }
      return () => clearInterval(interval);
   }, [isActive, minutes, seconds]);

   return (
      <div className="glass-card" style={{ padding: '20px', marginTop: 'auto', borderRadius: '24px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
         <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1.5px', marginBottom: '10px' }}>FOCUS MATRIX</div>
         <div style={{ fontSize: '2.2rem', fontWeight: '900', textAlign: 'center', marginBottom: '15px', fontVariantNumeric: 'tabular-nums' }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
         </div>
         <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsActive(!isActive)} className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '10px' }}>
               {isActive ? 'Pause' : 'Focus'}
            </button>
            <button onClick={() => { setIsActive(false); setMinutes(25); setSeconds(0); }} className="btn-glass" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '10px' }}>
               Reset
            </button>
         </div>
      </div>
   );
};

const Typewriter = ({ text, speed = 15 }) => {
   const [displayedText, setDisplayedText] = useState('');
   const [index, setIndex] = useState(0);

   useEffect(() => {
      setDisplayedText('');
      setIndex(0);
   }, [text]);

   useEffect(() => {
      if (index < text.length) {
         const timeout = setTimeout(() => {
            setDisplayedText(prev => prev + text.charAt(index));
            setIndex(prev => prev + 1);
         }, speed);
         return () => clearTimeout(timeout);
      }
   }, [index, text, speed]);

   return <span style={{ whiteSpace: 'pre-wrap' }}>{displayedText}<span className="cursor-blink">|</span></span>;
};

function App() {
   const [view, setView] = useState(() => localStorage.getItem('coachai_active_session') ? 'dashboard' : 'landing');
   const [activeTab, setActiveTab] = useState('Dashboard');
   const [userName, setUserName] = useState(() => {
      const session = localStorage.getItem('coachai_active_session');
      return session ? JSON.parse(session).fullName.split(' ')[0] : '';
   });
   const [isDark, setIsDark] = useState(false);
   const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('coachai_active_session'));
   const [isUserModalOpen, setIsUserModalOpen] = useState(false);
   const [documents, setDocuments] = useState([]);
   const [selectedDoc, setSelectedDoc] = useState(null);
   const [qaHistory, setQaHistory] = useState([]);
   const [question, setQuestion] = useState('');
   const [isTyping, setIsTyping] = useState(false);
   const [docSummary, setDocSummary] = useState('');
   const [isSummarizing, setIsSummarizing] = useState(false);
   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
   const [scrollProgress, setScrollProgress] = useState(0);
   const [authMode, setAuthMode] = useState('signup');
   const [authStep, setAuthStep] = useState(1);
   const [authError, setAuthError] = useState('');
   const [isRecording, setIsRecording] = useState(false);
   const [profilePic, setProfilePic] = useState(() => {
      const session = localStorage.getItem('coachai_active_session');
      return session ? JSON.parse(session).profilePic || null : null;
   });

   const chatScrollRef = useRef(null);
   const fileInputRef = useRef(null);
   const featuresRef = useRef(null);
   const [formData, setFormData] = useState(() => {
      const session = localStorage.getItem('coachai_active_session');
      return session ? JSON.parse(session) : { fullName: '', email: '', password: '', confirmPassword: '', eduLevel: '', course: '', year: '', studyHours: '', prefTime: '', learnStyle: '', difficulty: '', techUsage: '', language: '', favSubjects: '', weakSubjects: '', examType: '' };
   });

   useEffect(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, [qaHistory, isTyping]);

   useEffect(() => {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.body.classList.toggle('dark-mode', isDark);
   }, [isDark]);

   useEffect(() => {
      if (isLoggedIn && qaHistory.length === 0) {
         setQaHistory([{ type: 'ai', text: `Greetings, Scholar ${userName || ''}! 👋 I am your Coach.ai Intelligence Nexus. I'm synchronized and ready to optimize your research workflow. 🚀 Please remember to use a '?' at the end of your queries for optimal conceptual synthesis. How can I assist in your mastery today? ✨` }]);
      }
   }, [isLoggedIn, userName]);

   useEffect(() => {
      const handleMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
      const handleScroll = () => {
         if (featuresRef.current) {
            const rect = featuresRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0), 1);
            setScrollProgress(progress);
         }
      };
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('scroll', handleScroll);
      return () => {
         window.removeEventListener('mousemove', handleMove);
         window.removeEventListener('scroll', handleScroll);
      };
   }, []);

   useEffect(() => {
      if (selectedDoc) {
         setQaHistory(prev => {
            const hasWelcome = prev.some(m => m.text.includes(selectedDoc.name));
            if (hasWelcome) return prev;
            return [...prev, { type: 'ai', text: `Greetings again, Scholar! 🎓 I am now synchronized with your specific corpus: "${selectedDoc.name}".` }];
         });
         setQuestion('');

         // AUTOMATIC NEURAL SUMMARY VECTOR (Priority: Pre-generated Data)
         if (selectedDoc.summary) {
            setDocSummary(selectedDoc.summary);
            setQaHistory(prev => {
               if (prev.some(m => m.text.includes("Executive Summary"))) return prev;
               return [...prev, { type: 'ai', text: `Executive Summary for ${selectedDoc.name}:\n\n${selectedDoc.summary}` }];
            });
            setIsSummarizing(false);
         } else {
            setDocSummary('');
            setIsSummarizing(true);
            const formData = new FormData();
            formData.append('question', 'Provide a concise bulleted document summary.');
            formData.append('context', selectedDoc.extractedText || '');

            fetch(import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/ask` : 'http://localhost:8000/ask', {
               method: 'POST',
               body: formData
            })
               .then(res => res.json())
               .then(data => {
                  const summaryText = data.answer ? data.answer.replace('Institutional Execution Overview: ', '') : 'I encountered a neural synchronization error while synthesizing this summary.';
                  setDocSummary(summaryText);
                  setQaHistory(prev => {
                     if (prev.some(m => m.text.includes("Executive Summary"))) return prev;
                     return [...prev, { type: 'ai', text: `Executive Summary for ${selectedDoc.name}:\n\n${summaryText}` }];
                  });
                  setIsSummarizing(false);
               })
               .catch(err => {
                  console.error(err);
                  setIsSummarizing(false);
               });
         }

      } else {
         setQaHistory([]);
      }
   }, [selectedDoc]);

   const handleSignupComplete = () => {
      setAuthError('🚀 Initializing Neural Identity...');
      setTimeout(() => {
         const users = JSON.parse(localStorage.getItem('coachai_users') || '[]');
         const { confirmPassword, ...storedUser } = formData;
         users.push(storedUser);
         localStorage.setItem('coachai_users', JSON.stringify(users));
         localStorage.setItem('coachai_active_session', JSON.stringify(storedUser));

         setUserName(formData.fullName.split(' ')[0]);
         setIsLoggedIn(true);
         setActiveTab('Dashboard');
         setSelectedDoc(null);
         setView('dashboard');
         setAuthError('');
      }, 1500);
   };

   const handleLogin = (e) => {
      e.preventDefault();
      if (!formData.email.trim() || !formData.password.trim()) {
         setAuthError("🔒 Please enter your email and password.");
         return;
      }

      const users = JSON.parse(localStorage.getItem('coachai_users') || '[]');
      const user = users.find(u => u.email === formData.email);

      if (!user) {
         setAuthError("User not registered. Please Sign Up First.");
         return;
      }

      if (user.password !== formData.password) {
         setAuthError("Incorrect password. Neural access denied.");
         return;
      }

      setAuthError('🚀 Synchronizing Profile...');
      setTimeout(() => {
          localStorage.setItem('coachai_active_session', JSON.stringify(user));
          setFormData({ ...formData, ...user, confirmPassword: user.password });
          setUserName(user.fullName.split(' ')[0]);
          setIsLoggedIn(true);
          setActiveTab('Dashboard');
          setSelectedDoc(null);
          setView('dashboard');
          setAuthError('');
      }, 1000);
   };
   const triggerFileUpload = () => fileInputRef.current.click();
   const triggerVoiceInput = () => setIsRecording(!isRecording);

   const validateAuthStep = () => {
      setAuthError('');
      if (authStep === 1) {
         if (!formData.fullName.trim()) return "Full Name is required";
         if (!formData.email.includes('@')) return "Enter a valid Institutional Email";
         if (formData.password.length < 8 || !/\d/.test(formData.password) || !/[!@#$%^&*.,?]/.test(formData.password)) return "Password must be min 8 chars, include a number and symbol";
         if (formData.password !== formData.confirmPassword) return "Passwords do not match";
         const users = JSON.parse(localStorage.getItem('coachai_users') || '[]');
         if (users.find(u => u.email === formData.email)) return "Email is already registered. Please log in.";
      } else if (authStep === 2) {
         if (!formData.eduLevel) return "Please select Education Level";
         if (!formData.course.trim()) return "Course / Stream is required";
         if (!formData.year.trim()) return "Current Year is required";
      } else if (authStep === 3) {
         if (!formData.studyHours.trim()) return "Average Study Hours is required";
         if (!formData.prefTime) return "Please select Preferred Study Time";
         if (!formData.learnStyle) return "Please select Learning Style";
         if (!formData.difficulty) return "Please select Difficulty Level";
      } else if (authStep === 4) {
         if (!formData.techUsage) return "Please select Technology Usage";
         if (!formData.language) return "Please select Preferred Language";
         if (!formData.favSubjects.trim()) return "Favorite Subjects are required";
         if (!formData.weakSubjects.trim()) return "Weak Subjects are required";
         if (!formData.examType) return "Please select Exam Type";
      }
      return "";
   };

   const handleNextStep = () => {
      const err = validateAuthStep();
      if (err) { setAuthError(err); return; }
      if (authStep < 4) setAuthStep(prev => prev + 1);
      else handleSignupComplete();
   };

   const extractTextFromPDF = async (url) => {
      try {
         const pdf = await pdfjs.getDocument(url).promise;
         let fullText = "";
         for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map(item => item.str).join(" ") + " ";
         }
         return fullText;
      } catch (err) {
         console.error("Neural Ingestion Fracture:", err);
         return "Failed to decipher document context.";
      }
   };

   const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf') {
         const url = URL.createObjectURL(file);

         // UNIVERSAL BE EXTRACTION VECTOR
         setIsSummarizing(true);
         const formData = new FormData();
         formData.append('file', file);

         try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/analyze` : 'http://localhost:8000/analyze', {
               method: 'POST',
               body: formData
            });
            const data = await response.json();

            const newDoc = {
               id: Date.now(),
               name: file.name,
               date: new Date().toLocaleDateString(),
               url,
               extractedText: data.text,
               summary: data.summary.join(' '),
               concepts: data.concepts
            };
            setDocuments([...documents, newDoc]);
            setSelectedDoc(newDoc);
            setQaHistory(prev => [...prev, 
               { type: 'user', isFile: true, text: file.name },
               { type: 'ai', text: `Research Corpus "${file.name}" has been successfully synchronized and ingested into the neural matrix. I've extracted the core concepts and am ready for your interrogation.` }
            ]);
            setIsSummarizing(false);
         } catch (err) {
            console.error("Neural Backend Ingestion Fracture:", err);
            // Fallback for local view
            const text = await extractTextFromPDF(url);
            const localInsights = extractInsights(text);
            const newDoc = {
               id: Date.now(),
               name: file.name,
               date: new Date().toLocaleDateString(),
               url,
               extractedText: text,
               summary: "• " + localInsights.summary.join("\n• "),
               concepts: localInsights.keyPoints
            };
            setDocuments([...documents, newDoc]);
            setSelectedDoc(newDoc);
            setQaHistory(prev => [...prev, 
               { type: 'user', isFile: true, text: file.name },
               { type: 'ai', text: `I've ingested "${file.name}" into my local knowledge buffer. While the primary neural vector is offline, I have extracted the text locally and am formulating your summary...` }
            ]);
            setIsSummarizing(false);
         }
      }
   };

   const handleAsk = async (customQ) => {
      let q = customQ || question;
      if (typeof q !== 'string') q = question;
      if (!q.trim()) return;

      if (typeof customQ === 'string' && !q.trim().endsWith('?')) {
         q += '?';
      }

      setQaHistory(prev => [...prev, { type: 'user', text: q }]);
      setQuestion('');
      setIsTyping(true);

      try {
         const formData = new FormData();
         formData.append('question', q);
         formData.append('context', selectedDoc ? selectedDoc.extractedText : (documents.length > 0 ? documents[documents.length - 1].extractedText : ""));

         const response = await fetch(import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/ask` : 'http://localhost:8000/ask', {
            method: 'POST',
            body: formData
         });

         if (response.ok) {
            const data = await response.json();
            setQaHistory(prev => [...prev, { type: 'ai', text: data.answer }]);
         } else {
            throw new Error("API Vector Failed");
         }
      } catch (err) {
         console.warn("Neural API Fracture, falling back to Local Engine:", err);
         try {
            const ans = answerQuestion(selectedDoc ? selectedDoc.extractedText : "", q);
            setQaHistory(prev => [...prev, { type: 'ai', text: ans }]);
         } catch (localErr) {
            setQaHistory(prev => [...prev, { type: 'ai', text: "I encountered a synchronization error across all neural vectors. Please try rephrasing." }]);
         }
      } finally {
         setIsTyping(false);
      }
   };

   return (
      <div className="app-wrapper" style={{ '--px': (mousePos.x / window.innerWidth - 0.5).toFixed(2), '--py': (mousePos.y / window.innerHeight - 0.5).toFixed(2) }}>
         <CustomCursor />
         <FloatingParticles />
         {isLoggedIn && <StudentProfileModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} userName={userName} formData={formData} handleLogout={() => { setView('landing'); setIsLoggedIn(false); localStorage.removeItem('coachai_active_session'); }} profilePic={profilePic} setProfilePic={setProfilePic} />}

         {view === 'landing' && (
            <>
               <header className="header-glass fade-up">
                  <div className="logo-btn" onClick={() => setView('landing')}><i className="fa-solid fa-layer-group"></i> coach.ai</div>
                  <nav className="nav-links"><a href="#about">About</a><a href="#features">Features</a><a href="#how-it-works">How it Works</a></nav>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                     {isLoggedIn ? (
                        <div onClick={() => setView('dashboard')} title="Enter Dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px 15px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                           <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1' }}>{userName}</div>
                              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px', marginTop: '3px', textTransform: 'uppercase' }}>Scholar Elite</div>
                           </div>
                           <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', color: '#fff', fontWeight: '900', overflow: 'hidden' }}>{profilePic ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (userName || 'S').charAt(0)}</div>
                        </div>
                     ) : (
                        <>
                           <button className="btn-glass" onClick={() => { setView('auth'); setAuthMode('login'); }} style={{ padding: '10px 25px', borderRadius: '12px' }}>Log In</button>
                           <button className="btn-primary" onClick={() => { setView('auth'); setAuthMode('signup'); setAuthStep(1); }} style={{ padding: '10px 25px', borderRadius: '12px' }}>Start Now</button>
                        </>
                     )}
                     <button onClick={() => setIsDark(!isDark)} className="icon-btn" style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}><i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i></button>
                  </div>
               </header>

               <section className="hero-section" style={{ minHeight: '98vh' }}>
                  <div className="hero-badge fade-up delay-1">LMS Vanguard Evolution</div>
                  <HeroTypewriter />
                  <div className="hero-actions fade-up delay-3">
                     {isLoggedIn ? (
                        <button className="btn-primary" onClick={() => setView('dashboard')} style={{ padding: '22px 55px', fontSize: '1.25rem', borderRadius: '50px' }}>Go to Dashboard</button>
                     ) : (
                        <button className="btn-primary" onClick={() => { setView('auth'); setAuthMode('signup'); setAuthStep(1); }} style={{ padding: '22px 55px', fontSize: '1.25rem', borderRadius: '50px' }}>Start Learning</button>
                     )}
                     <button className="btn-glass" onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '22px 55px', fontSize: '1.25rem', borderRadius: '50px' }}>Explore Features</button>
                  </div>
               </section>

               <FeatureWave />

               <section className="video-section fade-up delay-4" style={{ padding: '40px 20px 80px', display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
                  <div style={{ width: '100%', borderRadius: '32px', overflow: 'hidden', background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5), 0 0 50px rgba(99,102,241,0.25)' }}>
                     <video 
                        src="/promo-video.mp4" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        style={{ width: '100%', display: 'block', objectFit: 'cover', outline: 'none' }}
                     />
                  </div>
               </section>

               <section id="features" ref={featuresRef} className="section" style={{ padding: '100px 0 160px', overflow: 'hidden' }}>
                  <div className="section-header"><h2>Core Features</h2></div>
                  <div className="features-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', perspective: '1000px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                     {[
                        { t: 'Smart Note-Taking', x: -200, y: -100 },
                        { t: 'AI Analysis', x: 0, y: -150 },
                        { t: 'Project Management', x: 200, y: -100 },
                        { t: 'Research Memory', x: -200, y: 100 },
                        { t: 'Study Analytics', x: 0, y: 150 },
                        { t: 'Gamified Mastery', x: 200, y: 100 }
                     ].map((f, i) => {
                        const currentOffset = Math.max(0, 1 - (scrollProgress * 2));
                        return (
                           <div key={i} className="glass-card feature-card" style={{ transform: `translate(${f.x * currentOffset}px, ${f.y * currentOffset}px)`, opacity: Math.min(1, scrollProgress * 2.5), transition: 'transform 0.2s ease-out, opacity 0.3s ease-out' }}>
                              <div style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '20px' }}>✧</div>
                              <h3 className="feature-title">{f.t}</h3>
                              <p className="feature-desc">Coach.ai automates your knowledge workflow with extreme precision.</p>
                           </div>
                        );
                     })}
                  </div>
               </section>

               <section id="how-it-works" className="section fade-up" style={{ padding: '100px 0' }}>
                  <div className="section-header"><h2>Simple Mastery Pipeline</h2></div>
                  <div className="steps-container">
                     {[
                        { step: '01', title: 'Upload Material', icon: 'fa-file-arrow-up', desc: 'Securely upload your academic PDF materials to the Coach.ai cloud hub.' },
                        { step: '02', title: 'AI Integration', icon: 'fa-gears', desc: 'Our high-end neural models process and extract every core concept from your text.' },
                        { step: '03', title: 'Mastery Output', icon: 'fa-check-double', desc: 'Receive structured notes, summaries, and instant answers to your research queries.' }
                     ].map((s, i) => (
                        <div key={i} className="glass-card step-card">
                           <div className="step-number" style={{ opacity: 0.05 }}>{s.step}</div>
                           <div className="feature-icon-wrapper" style={{ margin: '0 auto 24px' }}><i className={`fa-solid ${s.icon}`}></i></div>
                           <h3 className="feature-title">{s.title}</h3>
                           <p className="feature-desc">{s.desc}</p>
                        </div>
                     ))}
                  </div>
               </section>

               <footer className="fade-up" style={{ background: 'var(--bg-glass)', borderTop: '1px solid var(--glass-border)', padding: '100px 5% 40px', backdropFilter: 'blur(20px)' }}>
                  <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '50px' }}>
                     <div style={{ flex: 2, minWidth: '300px' }}>
                        <div className="logo-btn" style={{ marginBottom: '20px' }}><i className="fa-solid fa-layer-group"></i> coach.ai</div>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1rem', maxWidth: '350px', marginBottom: '30px' }}>Transforming academic raw data into profound research mastery through multidimensional intelligence.</p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                           <a href="#" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', transition: '0.3s' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}><i className="fa-brands fa-twitter"></i></a>
                           <a href="#" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', transition: '0.3s' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}><i className="fa-brands fa-github"></i></a>
                           <a href="#" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', transition: '0.3s' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}><i className="fa-brands fa-discord"></i></a>
                        </div>
                     </div>
                     
                     <div style={{ flex: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
                        <div>
                           <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '25px', letterSpacing: '0.5px' }}>Platform</h4>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Features</a>
                              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Documentation</a>
                              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Neural API</a>
                              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Status</a>
                           </div>
                        </div>
                        <div>
                           <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '25px', letterSpacing: '0.5px' }}>Company</h4>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>About Us</a>
                              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Philosophy</a>
                              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center' }}>Careers <span style={{ padding: '2px 8px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontWeight: '900', fontSize: '0.65rem', borderRadius: '10px', marginLeft: '6px' }}>HIRING</span></a>
                              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Contact HQ</a>
                           </div>
                        </div>
                        <div>
                           <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '25px', letterSpacing: '0.5px' }}>Stay Updated</h4>
                           <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px', maxWidth: '250px' }}>Subscribe to our developer and scholar newsletter.</p>
                           <div style={{ display: 'flex', gap: '10px' }}>
                              <input placeholder="scholar@edu.com" style={{ padding: '12px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', outline: 'none', width: '100%', maxWidth: '200px' }} />
                           </div>
                        </div>
                     </div>
                  </div>
                  <div style={{ maxWidth: '1200px', margin: '70px auto 0', borderTop: '1px solid var(--glass-border)', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>© 2026 Coach.ai. All rights reserved.</p>
                     <div style={{ display: 'flex', gap: '25px' }}>
                        <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Privacy Policy</a>
                        <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Terms of Service</a>
                        <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cookie Settings</a>
                     </div>
                  </div>
               </footer>
            </>
         )}

         {view === 'auth' && (
            <div className="auth-wrapper fade-up" style={{ overflowY: 'auto' }}>
               <div onClick={() => setView('landing')} style={{ position: 'fixed', top: '30px', left: '30px', opacity: 0.15, cursor: 'pointer', transition: '0.3s', zIndex: 5000 }} onMouseEnter={e => e.currentTarget.style.opacity = 0.7} onMouseLeave={e => e.currentTarget.style.opacity = 0.15} title="Administrative Return"><i className="fa-solid fa-house" style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}></i></div>
               <div className="glass-card auth-box" style={{ padding: '50px', borderRadius: '40px', width: '95%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', margin: '40px auto' }}>
                  {authMode === 'login' ? (
                     <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
                        <h1 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: '900', textAlign: 'center', letterSpacing: '-3px', margin: 0 }}>Portal Entrance</h1>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '10px', fontSize: '1.1rem' }}>Enter your identity to synchronize the hub.</p>
                        <div className="form-group" style={{ marginTop: '40px' }}><label>Email Address</label><input className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="scholar@university.edu" /></div>
                        <div className="form-group"><label>Password</label><input className="form-input" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" /></div>
                        <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '20px' }}>
                           <span style={{ fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: '700' }} onClick={() => alert("Password recovery matrix engaged. Check your student email.")}>Forgot Password?</span>
                        </div>
                        {authError && <div style={{ padding: '12px', background: authError.includes('🚀') ? 'rgba(16,185,129,0.1)' : 'rgba(255,75,92,0.1)', color: authError.includes('🚀') ? '#10b981' : '#ff4b5c', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '20px', border: authError.includes('🚀') ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,75,92,0.2)' }}><i className={`fa-solid ${authError.includes('🚀') ? 'fa-circle-notch fa-spin' : 'fa-triangle-exclamation'}`} style={{ marginRight: '10px' }}></i> {authError}</div>}
                        <button onClick={handleLogin} className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.1rem', borderRadius: '15px' }} disabled={authError.includes('🚀')}>Authorize Entry</button>
                        <p onClick={() => { setAuthMode('signup'); setAuthError(''); }} style={{ textAlign: 'center', marginTop: '25px', cursor: 'pointer', color: 'var(--primary)', fontWeight: '800' }}>Don't have an ID? Please Sign Up First</p>
                     </div>
                  ) : (
                     <>
                        <div className="auth-stepper" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                           {[1, 2, 3, 4].map(s => <div key={s} className={`step-indicator ${authStep >= s ? 'active' : ''}`} style={{ width: '30px', height: '30px', borderRadius: '50%', background: authStep >= s ? 'var(--primary)' : 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', transition: '0.3s' }}>{s}</div>)}
                        </div>
                        <div className="auth-step-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 1fr', gap: '50px', position: 'relative' }}>
                           <div className="auth-form-side">
                              <h2 className="gradient-text" style={{ fontSize: '2.8rem', fontWeight: '900', marginTop: 0 }}>Step {authStep}: {authStep === 1 ? 'Basic Info' : authStep === 2 ? 'Academic Profile' : authStep === 3 ? 'Study Preferences' : 'Additional Info'}</h2>
                              {authStep === 1 && (
                                 <div className="fade-in">
                                    <div className="form-group"><label>Full Identity Name</label><input className="form-input" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} placeholder="e.g. Sagar Makvana" required /></div>
                                    <div className="form-group"><label>Institutional Email</label><input className="form-input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="scholar@university.edu" required /></div>
                                    <div className="form-group"><label>Create Password</label><input className="form-input" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Min 8 chars, 1 number, 1 symbol" required /></div>
                                    <div className="form-group"><label>Confirm Password</label><input className="form-input" type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Repeat password" required /></div>
                                 </div>
                              )}
                              {authStep === 2 && (
                                 <div className="fade-in">
                                    <div className="form-group"><label>Education Level</label><select className="form-input" value={formData.eduLevel} onChange={e => setFormData({ ...formData, eduLevel: e.target.value })} required><option value="">Select Level</option><option>School</option><option>College</option><option>University</option></select></div>
                                    <div className="form-group"><label>Course / Stream</label><input className="form-input" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} placeholder="e.g. Science / Computer Engineering" required /></div>
                                    <div className="form-group"><label>Current Year</label><input className="form-input" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} placeholder="e.g. 1st Year" required /></div>
                                 </div>
                              )}
                              {authStep === 3 && (
                                 <div className="fade-in">
                                    <div className="form-group"><label>Average Study Hours</label><input className="form-input" value={formData.studyHours} onChange={e => setFormData({ ...formData, studyHours: e.target.value })} placeholder="e.g. 4 Hours" required /></div>
                                    <div className="form-group"><label>Preferred Study Time</label><select className="form-input" value={formData.prefTime} onChange={e => setFormData({ ...formData, prefTime: e.target.value })} required><option value="">Select Time</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></div>
                                    <div className="form-group"><label>Learning Style</label><select className="form-input" value={formData.learnStyle} onChange={e => setFormData({ ...formData, learnStyle: e.target.value })} required><option value="">Select Style</option><option>Reading</option><option>Video</option><option>Notes</option></select></div>
                                    <div className="form-group"><label>Difficulty Level</label><select className="form-input" value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} required><option value="">Select Level</option><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                                 </div>
                              )}
                              {authStep === 4 && (
                                 <div className="fade-in">
                                    <div className="form-group"><label>Technology Usage</label><select className="form-input" value={formData.techUsage} onChange={e => setFormData({ ...formData, techUsage: e.target.value })} required><option value="">Select Primary Device</option><option>Laptop</option><option>Mobile</option><option>Tablet</option></select></div>
                                    <div className="form-group"><label>Preferred Language</label><select className="form-input" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} required><option value="">Select Language</option><option>English</option><option>Hindi</option><option>Gujarati</option></select></div>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                       <div className="form-group" style={{ flex: 1 }}><label>Favorite Subjects</label><input className="form-input" value={formData.favSubjects} onChange={e => setFormData({ ...formData, favSubjects: e.target.value })} placeholder="e.g. AI, Math" required /></div>
                                       <div className="form-group" style={{ flex: 1 }}><label>Weak Subjects</label><input className="form-input" value={formData.weakSubjects} onChange={e => setFormData({ ...formData, weakSubjects: e.target.value })} placeholder="e.g. Chemistry" required /></div>
                                    </div>
                                    <div className="form-group"><label>Exam Type</label><select className="form-input" value={formData.examType} onChange={e => setFormData({ ...formData, examType: e.target.value })} required><option value="">Select Exam Type</option><option>Semester</option><option>Competitive</option></select></div>
                                 </div>
                              )}
                              
                              {authError && <div className="fade-in" style={{ padding: '12px', background: authError.includes('🚀') ? 'rgba(16,185,129,0.1)' : 'rgba(255,75,92,0.1)', color: authError.includes('🚀') ? '#10b981' : '#ff4b5c', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '20px', border: authError.includes('🚀') ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,75,92,0.2)' }}>
                                 <i className={`fa-solid ${authError.includes('🚀') ? 'fa-circle-notch fa-spin' : 'fa-triangle-exclamation'}`} style={{ marginRight: '10px' }}></i> {authError}
                              </div>}
                              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                                 {authStep > 1 && <button className="btn-glass" onClick={() => { setAuthStep(prev => prev - 1); setAuthError(''); }} style={{ flex: 1 }} disabled={authError.includes('🚀')}>Back</button>}
                                 <button className="btn-primary" onClick={handleNextStep} style={{ flex: 2, opacity: authError.includes('🚀') ? 0.7 : 1 }} disabled={authError.includes('🚀')}>{authStep === 4 ? 'Complete Signup' : 'Continue'}</button>
                              </div>
                           </div>
                           <div className="auth-info-side">
                              <div className="glass-card" style={{ height: '100%', padding: '40px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                 {authStep === 1 && (
                                    <div className="fade-in">
                                       <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}><i className="fa-solid fa-lock" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i><div><h4 style={{ margin: 0 }}>Secure Authentication</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Military-grade encryption</p></div></div>
                                       <div style={{ display: 'flex', gap: '15px' }}><i className="fa-solid fa-user-shield" style={{ fontSize: '2rem', color: 'var(--secondary)' }}></i><div><h4 style={{ margin: 0 }}>Identity Verification</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Protecting your academic data</p></div></div>
                                    </div>
                                 )}
                                 {authStep === 2 && (
                                    <div className="fade-in">
                                       <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}><i className="fa-solid fa-graduation-cap" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i><div><h4 style={{ margin: 0 }}>Academic Stratum</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tailored to your educational level</p></div></div>
                                       <div style={{ display: 'flex', gap: '15px' }}><i className="fa-solid fa-book-journal-whills" style={{ fontSize: '2rem', color: 'var(--secondary)' }}></i><div><h4 style={{ margin: 0 }}>Course Alignment</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Synchronized curriculum vectors</p></div></div>
                                    </div>
                                 )}
                                 {authStep === 3 && (
                                    <div className="fade-in">
                                       <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}><i className="fa-solid fa-clock" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i><div><h4 style={{ margin: 0 }}>Study Dynamics</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optimizing chronobiology</p></div></div>
                                       <div style={{ display: 'flex', gap: '15px' }}><i className="fa-solid fa-brain" style={{ fontSize: '2rem', color: 'var(--secondary)' }}></i><div><h4 style={{ margin: 0 }}>Cognitive Style</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Personalized learning absorption</p></div></div>
                                    </div>
                                 )}
                                 {authStep === 4 && (
                                    <div className="fade-in">
                                       <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}><i className="fa-solid fa-microchip" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i><div><h4 style={{ margin: 0 }}>Hardware Optimization</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Responsive UX across devices</p></div></div>
                                       <div style={{ display: 'flex', gap: '15px' }}><i className="fa-solid fa-language" style={{ fontSize: '2rem', color: 'var(--secondary)' }}></i><div><h4 style={{ margin: 0 }}>Linguistic Syntax</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Regional language mastery</p></div></div>
                                    </div>
                                 )}
                                 <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(99,102,241,0.1)', borderRadius: '15px', border: '1px solid var(--primary)' }}><i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)', marginRight: '10px' }}></i> Personalized Study Recommendations & Progress Tracking</div>
                              </div>
                           </div>
                        </div>
                        <p onClick={() => { setAuthMode('login'); setAuthError(''); }} style={{ textAlign: 'center', marginTop: '30px', cursor: 'pointer', color: 'var(--text-muted)' }}>Already a scholar? Log In here</p>
                     </>
                  )}
               </div>
            </div>
         )}

         {view === 'dashboard' && (
            <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-main)', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
               <div className="bg-glow" style={{ top: '-15%', right: '-15%', opacity: 0.4 }}></div>

               <nav className="dash-top-nav" style={{ height: '85px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 50px', background: 'var(--bg-glass)', backdropFilter: 'blur(45px)', zIndex: 1000 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => setView('landing')}><i className="fa-solid fa-layer-group" style={{ color: 'var(--primary)', fontSize: '2.1rem' }}></i><span className="logo-text-mobile" style={{ fontSize: '2.1rem', fontWeight: '900', letterSpacing: '-2px' }}>coach.ai</span></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                     <div onClick={() => setIsUserModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', padding: '10px 20px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ textAlign: 'right' }}>
                           <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-main)' }}>{userName}</div>
                           <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '1px' }}>SCHOLAR ELITE</div>
                        </div>
                        <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.6rem', color: '#fff', fontWeight: '900', overflow: 'hidden' }}>{profilePic ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (userName || 'S').charAt(0)}</div>
                     </div>
                  </div>
               </nav>

               <div className="dash-wrapper" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  <aside className="dash-aside" style={{ width: '310px', borderRight: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.015)', padding: '40px 15px', display: 'flex', flexDirection: 'column', gap: '8px', backdropFilter: 'blur(20px)' }}>
                     {[
                        { id: 0, icon: 'fa-house-laptop', text: 'Dashboard' },
                        { id: 1, icon: 'fa-folder-open', text: 'Research Corpus' },
                        { id: 1.5, icon: 'fa-layer-group', text: 'Study Roadmap' },
                        { id: 2, icon: 'fa-arrow-right-from-bracket', text: 'Back to Home' }
                     ].map(tab => (
                        <div key={tab.id} onClick={() => {
                           if (tab.text === 'Back to Home') {
                              setView('landing');
                              return;
                           }
                           setActiveTab(tab.text);
                        }} style={{ padding: '16px 22px', borderRadius: '18px', cursor: 'pointer', background: activeTab === tab.text ? 'linear-gradient(90deg, rgba(99,102,241,0.08), transparent)' : 'transparent', color: activeTab === tab.text ? 'var(--primary)' : tab.text === 'Back to Home' ? '#ff4b5c' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '18px', fontWeight: activeTab === tab.text ? '800' : '500', transition: '0.3s', borderLeft: activeTab === tab.text ? '4px solid var(--primary)' : '4px solid transparent' }}
                        onMouseEnter={e => { if(tab.text === 'Back to Home') e.currentTarget.style.background = 'rgba(255,75,92,0.1)'; }}
                        onMouseLeave={e => { if(tab.text === 'Back to Home') e.currentTarget.style.background = 'transparent'; }}>
                           <i className={`fa-solid ${tab.icon}`} style={{ width: '24px', fontSize: '1.2rem', opacity: activeTab === tab.text ? 1 : 0.8, color: tab.text === 'Back to Home' ? '#ff4b5c' : 'inherit' }}></i> {tab.text}
                        </div>
                     ))}
                     <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                        <PomodoroTimer />
                     </div>
                  </aside>
                  <main className="dash-main-area" style={{ flex: 1, padding: '30px 40px 100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
                     <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf" onChange={handleFileChange} />

                     {activeTab === 'Dashboard' && (
                        <div className="fade-in" style={{ padding: '0 0 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                           <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                              <h1 className="gradient-text hero-greet-mobile" style={{ fontSize: '3.5rem', fontWeight: '950', letterSpacing: '-2.5px', margin: 0, lineHeight: 1.1 }}>Synchronize Mastery, {userName}</h1>
                              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Neural Hub Terminal / System Synchronization Active</p>
                           </div>


                           <div className="glass-card chatbot-stationary" style={{ width: '100%', maxWidth: '1080px', borderRadius: '45px', border: '1px solid var(--glass-border)', overflow: 'hidden', background: 'var(--bg-glass)', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,0.1)', backdropFilter: 'blur(24px)', transform: 'none', transition: 'none' }}>
                              <div style={{ padding: '20px 45px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div><span style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Intelligence Nexus</span></div>
                                 <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>V3.4 SYNC CORE</div>
                              </div>
                              <div ref={chatScrollRef} className="hide-scrollbar" style={{ height: '380px', overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', scrollBehavior: 'smooth' }}>
                                 {!qaHistory.some(m => m.type === 'user') && (
                                    <div style={{ margin: 'auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                       <div className="fade-in" style={{ textAlign: 'center', marginBottom: '45px' }}>
                                          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99,102,241,0.06)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 25px', boxShadow: '0 15px 30px rgba(99,102,241,0.1)' }}><i className="fa-solid fa-sparkles" style={{ fontSize: '2.8rem', color: 'var(--primary)' }}></i></div>
                                          <h3 style={{ fontSize: '2.4rem', fontWeight: '950', color: 'var(--text-main)', margin: 0, letterSpacing: '-1.5px' }}>Intelligence Hub</h3>
                                          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: '12px', fontWeight: '600', maxWidth: '500px', margin: '12px auto 0' }}>Synchronized with {userName} identity. Active for neural ingestion.</p>
                                       </div>

                                       <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '800px' }}>
                                          {['Document summary?'].map((chip, idx) => (
                                             <div key={idx} onClick={() => handleAsk(chip)} className="chip-btn-modern">
                                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 5px 10px rgba(0,0,0,0.05)' }}><i className="fa-solid fa-bolt" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}></i></div>
                                                {chip.replace('?', '')}
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 )}
                                 {qaHistory.map((m, i) => <ChatBubble key={i} type={m.type} text={m.text} isFile={m.isFile} userName={userName} profilePic={profilePic} />)}
                                 {isTyping && <div className="typing-indicator" style={{ alignSelf: 'flex-start', margin: '10px 0 30px 60px' }}><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>}
                              </div>

                              <div style={{ padding: '20px 60px 40px', borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                 {selectedDoc && (
                                    <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', background: 'rgba(99,102,241,0.1)', borderRadius: '15px', border: '1px solid var(--primary)', alignSelf: 'flex-start' }}>
                                       <i className="fa-solid fa-file-pdf" style={{ color: '#ff4b5c', fontSize: '1.2rem' }}></i>
                                       <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedDoc.name}</span>
                                       <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '1rem', marginLeft: '5px' }}></i>
                                       <div onClick={() => { setSelectedDoc(null); setQaHistory([]); }} style={{ cursor: 'pointer', marginLeft: '10px', color: 'var(--text-muted)' }} title="Clear Document Context"><i className="fa-solid fa-times"></i></div>
                                    </div>
                                 )}
                                 <div className="gemini-pill-wrapper">
                                    <div className="gemini-pill-inner">
                                       <div onClick={() => {
                                          setQaHistory(prev => [...prev, { type: 'ai', text: "It has been an honor assisting in your scholarly journey today. Your research context has been successfully archived. I'll be here when you're ready for the next neural deep-dive. Farewell, Scholar! 🎓👋" }]);
                                          setTimeout(() => setQaHistory([]), 5000);
                                       }} className="pill-action-btn" title="End Research Session"><i className="fa-solid fa-power-off" style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}></i></div>
                                       <div className="pill-action-btn" onClick={triggerFileUpload} title="Ingest Document"><i className="fa-solid fa-plus"></i></div>
                                       <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAsk()} placeholder="Interrogate active document context... (End with '?' for deep synthesis)" className="modern-input" />
                                       <div className="pill-action-btn" onClick={triggerVoiceInput} title="Voice Input" style={{ color: isRecording ? 'var(--secondary)' : 'var(--text-muted)' }}>
                                          <i className={`fa-solid ${isRecording ? 'fa-microphone-lines pulse' : 'fa-microphone'}`}></i>
                                       </div>
                                       <div onClick={() => handleAsk()} className="pill-action-btn" style={{ color: 'var(--primary)', background: 'rgba(99,102,241,0.06)' }} title="Transmit"><i className="fa-solid fa-paper-plane"></i></div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'Research Corpus' && !selectedDoc && (
                        <div className="fade-in" style={{ padding: '20px 0' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '30px' }}>
                              <div>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--primary)', marginBottom: '10px' }}>
                                    <i className="fa-solid fa-graduation-cap" style={{ fontSize: '1.4rem' }}></i>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>Academic Workspace</span>
                                 </div>
                                 <h1 className="gradient-text" style={{ fontSize: '3.2rem', fontWeight: '950', letterSpacing: '-2px', margin: 0 }}>Research Corpus</h1>
                                 <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '5px' }}>Synchronized with Scholar ID: {(userName || 'Scholar').toUpperCase()}-2026</p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                 <button onClick={triggerFileUpload} className="btn-primary" style={{ padding: '14px 35px', borderRadius: '15px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 15px 35px rgba(99,102,241,0.2)' }}><i className="fa-solid fa-plus"></i> Ingest New Corpus</button>
                              </div>
                           </div>

                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '40px' }}>
                              {documents.map((doc, idx) => {
                                 const colors = [
                                    'linear-gradient(135deg, #6366f1, #818cf8)',
                                    'linear-gradient(135deg, #ec4899, #f472b6)',
                                    'linear-gradient(135deg, #f59e0b, #fbbf24)',
                                    'linear-gradient(135deg, #10b981, #34d399)',
                                    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                                    'linear-gradient(135deg, #ef4444, #f87171)'
                                 ];
                                 const bannerBg = colors[idx % colors.length];
                                 const codes = ['NEURAL-SYNC-01', 'ALGO-THINK-04', 'Q-STATE-09', 'BIO-SYNTH-12'];
                                 const code = codes[idx % codes.length];

                                 return (
                                    <div key={doc.id} className="glass-card classroom-card" style={{ borderRadius: '22px', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: '0.3s ease', position: 'relative', height: '340px', cursor: 'pointer', padding: 0 }} onClick={() => setSelectedDoc(doc)}>
                                       <div style={{ height: '130px', background: bannerBg, position: 'relative', padding: '25px 30px' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                             <div style={{ maxWidth: '80%' }}>
                                                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '700', marginTop: '4px' }}>Class Code: {code}</div>
                                             </div>
                                             <i className="fa-solid fa-ellipsis-vertical" style={{ color: '#fff', fontSize: '1.2rem', opacity: 0.8 }}></i>
                                          </div>
                                          <div style={{ marginTop: '15px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.5px' }}>Faculty: Coach AI Neural Engine</div>

                                          <div style={{ position: 'absolute', bottom: '-40px', right: '25px', width: '85px', height: '85px', borderRadius: '50%', border: '5px solid var(--bg-main)', background: 'var(--glass-bg)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', color: '#fff', fontWeight: '950', boxShadow: '0 12px 25px rgba(0,0,0,0.12)', background: bannerBg }}>{(userName || 'S').charAt(0)}</div>
                                       </div>

                                       <div style={{ flex: 1, padding: '45px 30px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                          <div>
                                             <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--primary)', fontSize: '0.85rem' }}></i>
                                                Last Sync: {doc.date}
                                             </div>
                                             <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.5', margin: 0 }}>This corpus is active for neural ingestion and context-aware synthesis in the AI terminal.</p>
                                          </div>

                                          <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '18px' }}>
                                             <i className="fa-solid fa-id-badge" title="Profile Analytics" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}></i>
                                             <i className="fa-solid fa-folder-tree" title="Document Structure" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}></i>
                                             <i className="fa-solid fa-share-nodes" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginLeft: 'auto' }}></i>
                                          </div>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     )}

                     {activeTab === 'Study Roadmap' && (
                        <div className="fade-in" style={{ padding: '20px 0' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '30px' }}>
                              <div>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--primary)', marginBottom: '10px' }}>
                                    <i className="fa-solid fa-map-location-dot" style={{ fontSize: '1.4rem' }}></i>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>Algorithmic Trajectory</span>
                                 </div>
                                 <h1 className="gradient-text" style={{ fontSize: '3.2rem', fontWeight: '950', letterSpacing: '-2px', margin: 0 }}>Study Roadmap</h1>
                                 <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '5px' }}>Custom-generated for {formData?.eduLevel || 'Scholar'} • {formData?.course || 'General Studies'}</p>
                              </div>
                           </div>

                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                              <div className="glass-card" style={{ padding: '40px', borderRadius: '30px' }}>
                                 <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '15px', letterSpacing: '-1px' }}>Your Neural Profile</h3>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                                       <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Focus Window</span>
                                       <span style={{ color: 'var(--primary)', fontWeight: '900' }}>{formData?.prefTime || 'Flexible'} • {formData?.studyHours || '2-4'} Hrs/Day</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                                       <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Ingestion Mode</span>
                                       <span style={{ color: 'var(--secondary)', fontWeight: '900' }}>{formData?.learnStyle || 'Mixed Media'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                                       <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Priority Vectors</span>
                                       <span style={{ color: 'var(--text-main)', fontWeight: '900', textAlign: 'right', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={formData?.weakSubjects}>{formData?.weakSubjects || 'All Core Concepts'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Target Milestone</span>
                                       <span style={{ color: 'var(--text-main)', fontWeight: '900' }}>{formData?.examType || 'Semester Finals'}</span>
                                    </div>
                                 </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                 {['Phase 1: Knowledge Acquisition', 'Phase 2: Conceptual Mastery', 'Phase 3: Simulated Readiness'].map((phase, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '25px 30px', borderRadius: '20px', borderLeft: `6px solid ${i === 0 ? 'var(--primary)' : i === 1 ? 'var(--secondary)' : '#10b981'}`, background: 'rgba(255,255,255,0.015)' }}>
                                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{phase}</h4>
                                          <i className={i === 0 ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-lock"} style={{ color: i === 0 ? 'var(--primary)' : 'var(--text-muted)', opacity: i === 0 ? 1 : 0.4, fontSize: '1.2rem' }}></i>
                                       </div>
                                       <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '10px', fontWeight: '600', lineHeight: 1.6 }}>
                                          {i === 0 && `Engage natively with ${formData?.learnStyle || 'materials'} targeting ${formData?.weakSubjects || 'core topics'} during your optimal ${formData?.prefTime || 'study'} workflow window.`}
                                          {i === 1 && `Deep-dive AI analysis and algorithmic retention tests on ${formData?.course || 'your coursework'}.`}
                                          {i === 2 && `Final evaluation protocols and stress-tests optimized for your upcoming ${formData?.examType || 'assessments'}.`}
                                       </p>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'Research Corpus' && selectedDoc && (
                        <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                           <div style={{ marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                 <div onClick={() => setSelectedDoc(null)} style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--glass-border)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} title="Back to Classroom"><i className="fa-solid fa-chevron-left" style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}></i></div>
                                 <div>
                                    <h2 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: '950', margin: 0, letterSpacing: '-1.5px' }}>Neural Mastery: Synchronizing {userName || 'Scholar'}</h2>
                                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '4px' }}>Active Corpus: <span style={{ color: 'var(--primary)' }}>{selectedDoc.name}</span> / Code: NEURAL-{selectedDoc.id.toString().slice(-4)}</p>
                                 </div>
                              </div>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                 <div className="glass-card" style={{ padding: '8px 20px', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px', color: 'var(--text-muted)' }}>RECOGNITION CORE ACTIVE</span>
                                 </div>
                              </div>
                           </div>


                           <div style={{ display: 'flex', gap: '40px', flex: 1, minHeight: '800px', marginBottom: '40px', alignItems: 'stretch' }}>
                              {/* LEFT COLUMN: PDF VIEWER */}
                              <div className="glass-card" style={{ flex: '0 0 55%', borderRadius: '35px', border: '1px solid var(--glass-border)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.1)', backdropFilter: 'blur(30px)' }}>
                                 <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                       <i className="fa-solid fa-file-lines" style={{ color: 'var(--primary)' }}></i>
                                       <span style={{ fontSize: '0.85rem', fontWeight: '950', letterSpacing: '1.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Modern Research Workspace</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                       <i className="fa-solid fa-expand" style={{ fontSize: '1rem', color: 'var(--text-muted)', cursor: 'pointer' }} title="Enter Fullscreen" onClick={() => { const el = document.getElementById('pdf-viewer-iframe'); if (el) { el.requestFullscreen().catch(err => console.error(err)); } }}></i>
                                    </div>
                                 </div>
                                 <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.02)', position: 'relative' }}>
                                    {selectedDoc.url ? (
                                       <iframe id="pdf-viewer-iframe" src={selectedDoc.url + "#toolbar=0&navpanes=0"} style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }} title="Research Context"></iframe>
                                    ) : (
                                       <div style={{ textAlign: 'center', opacity: 0.3, padding: '50px' }}>
                                          <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 25px' }}><i className="fa-solid fa-file-pdf" style={{ fontSize: '4rem', color: 'var(--primary)' }}></i></div>
                                          <h3 style={{ fontSize: '1.8rem', fontWeight: '900' }}>Neural Rendering Matrix</h3>
                                          <p style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Deciphering document context flows...</p>
                                       </div>
                                    )}
                                 </div>
                              </div>

                              {/* RIGHT COLUMN: INTELLIGENCE SYNTHESIS */}
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '25px', padding: '5px 0' }}>
                                 {selectedDoc.concepts && selectedDoc.concepts.length > 0 && (
                                    <div className="fade-in glass-card" style={{ padding: '30px', borderRadius: '28px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(15px)' }}>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', fontSize: '0.9rem' }}><i className="fa-solid fa-brain"></i></div>
                                          <span style={{ fontSize: '0.85rem', fontWeight: '900', letterSpacing: '2px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                                             Conceptual Mastery
                                          </span>
                                       </div>
                                       <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                          {selectedDoc.concepts.map((concept, i) => (
                                             <div key={i} className="chip-btn-modern" style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                                                <i className="fa-solid fa-hashtag" style={{ color: 'var(--primary)', opacity: 0.6, fontSize: '0.75rem', marginRight: '5px' }}></i> {concept}
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 )}

                                 <div className="fade-in glass-card" style={{ flex: 1, padding: '35px', borderRadius: '28px', background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', backdropFilter: 'blur(15px)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                                       <div className="pulse" style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(99,102,241,0.3)' }}><i className="fa-solid fa-sparkles"></i></div>
                                       <div>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: '950', margin: 0, letterSpacing: '-0.5px' }}>
                                               Executive Summary
                                            </h3>
                                            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '800', letterSpacing: '1px' }}>INSTITUTIONAL SYNTHESIS</p>
                                       </div>
                                    </div>

                                    <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '15px' }}>
                                       {isSummarizing ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: 0.5, marginTop: '20px' }}>
                                             <div className="loading-bar-shimmer" style={{ width: '100%', height: '12px', borderRadius: '6px' }}></div>
                                             <div className="loading-bar-shimmer" style={{ width: '85%', height: '12px', borderRadius: '6px' }}></div>
                                             <div className="loading-bar-shimmer" style={{ width: '95%', height: '12px', borderRadius: '6px' }}></div>
                                             <div className="loading-bar-shimmer" style={{ width: '60%', height: '12px', borderRadius: '6px' }}></div>
                                          </div>
                                       ) : (
                                          <div style={{ fontSize: '1.05rem', lineHeight: '2.1', color: 'var(--text-main)', fontWeight: '500' }}>
                                             {docSummary ? <Typewriter text={docSummary.replace('Institutional Execution Overview: ', '')} speed={10} /> : "Summary initialization pending..."}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}
                  </main>
               </div>
            </div>
         )}
      </div>
   );
}

export default App;
