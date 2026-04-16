const fs = require('fs');

const code = fs.readFileSync('src/App.jsx', 'utf8');
const lines = code.split('\n');

let startIndex = -1;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes("{view === 'dashboard' && (")) {
       startIndex = i;
       break;
   }
}

// Keep everything before startIndex.
const beforeCode = lines.slice(0, startIndex).join('\n');

// The replacement code:
const newDashboardCode = `      {view === 'dashboard' && (
        <section className="dashboard-section fade-up" style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {/* Abstract Background Orbs */}
          <div className="bg-glow" style={{ top: '-10%', left: '-10%', filter: 'blur(120px)', opacity: 0.6 }}></div>
          <div className="bg-glow-2" style={{ bottom: '-10%', right: '-10%', filter: 'blur(150px)', opacity: 0.4 }}></div>

          <nav style={{position: 'fixed', top: 0, left: 0, right: 0, height: '80px', background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
            {/* Left - Logo */}
            <div style={{display: 'flex', alignItems: 'center', width: '250px'}}>
               <div style={{display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer'}} onClick={() => setView('landing')}>
                  <i className="fa-solid fa-layer-group" style={{color: 'var(--primary)', filter: 'drop-shadow(0 0 10px var(--primary))', fontSize: '2rem'}}></i>
                  <span style={{fontSize: '1.8rem', fontWeight: '800', background: \`linear-gradient(to right, \${isDark ? '#fff' : 'var(--text-main)'}, var(--secondary))\`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px'}}>coach.ai</span>
               </div>
            </div>

            {/* Right - Profile */}
            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
               <span style={{fontWeight: '600', color: 'var(--text-main)'}}>{userName || 'User'}</span>
               <div style={{background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '45px', height: '45px', borderRadius: '50%', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 0 20px rgba(236,72,153,0.4)', cursor: 'pointer', border: '2px solid white'}} onClick={handleLogout}>{userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
            </div>
          </nav>

          <div style={{display: 'flex', marginTop: '80px', height: 'calc(100vh - 80px)'}}>
             {/* LEFT SIDEBAR */}
             <aside style={{width: '280px', height: '100%', borderRight: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(20px)', padding: '20px 0', overflowY: 'auto', display: 'flex', flexDirection: 'column', zIndex: 10}}>
                <div style={{padding: '0 25px', marginBottom: '20px'}}>
                   <div style={{background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '15px', color: 'var(--text-main)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--glass-border)'}}>
                      <i className="fa-solid fa-cube" style={{color: 'var(--primary)'}}></i> Logo / Workspace
                   </div>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 15px'}}>
                   {[
                      {id: 1, icon: 'fa-table-columns', text: 'Feature-1'},
                      {id: 2, icon: 'fa-book-open', text: 'Feature-2'},
                      {id: 3, icon: 'fa-bolt', text: 'Feature-3'},
                      {id: 4, icon: 'fa-chart-pie', text: 'Feature-4'},
                      {id: 5, icon: 'fa-calendar-days', text: 'Feature-5'},
                      {id: 6, icon: 'fa-users', text: 'Feature-6'},
                      {id: 7, icon: 'fa-bullseye', text: 'Feature-7'},
                      {id: 8, icon: 'fa-layer-group', text: 'Feature-8'},
                      {id: 9, icon: 'fa-certificate', text: 'Feature-9'},
                      {id: 10, icon: 'fa-folder-open', text: 'Feature-10'},
                      {id: 11, icon: 'fa-gear', text: 'Feature-11'}
                   ].map((f, idx) => (
                      <div key={idx} style={{padding: '12px 20px', borderRadius: '12px', background: idx === 0 ? 'linear-gradient(90deg, rgba(99,102,241,0.1), transparent)' : 'transparent', borderLeft: idx === 0 ? '3px solid var(--primary)' : '3px solid transparent', color: idx === 0 ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: idx===0 ? '600':'500'}} onMouseOver={e=>{if(idx!==0) e.currentTarget.style.background='rgba(255,255,255,0.03)'}} onMouseOut={e=>{if(idx!==0) e.currentTarget.style.background='transparent'}}>
                         <i className={\`fa-solid \${f.icon}\`} style={{width: '20px', textAlign: 'center'}}></i>
                         {f.text}
                      </div>
                   ))}
                </div>
             </aside>

             {/* MAIN CONTENT AREA */}
             <main style={{flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10}}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf" onChange={handleFileChange} />
                
                {/* HERO WELCOME CARD */}
                {!selectedDoc && (
                   <div style={{position: 'relative', width: '100%', minHeight: '200px', borderRadius: '30px', overflow: 'hidden', padding: '50px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', marginBottom: '30px', flexShrink: 0}}>
                      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1))', filter: 'blur(20px)'}}></div>
                      <div style={{position: 'absolute', inset: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)'}}></div>
                      
                      <div style={{position: 'relative', zIndex: 1, textAlign: 'center'}}>
                         <h1 style={{fontSize: '2.5rem', margin: '0 0 15px 0', fontWeight: '800', color: 'var(--text-main)'}}>
                            Welcome back, {userName || 'John'}!
                         </h1>
                         <p style={{fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                            Here's your personalized study hub to achieve your goals <i className="fa-solid fa-bullseye" style={{color: 'var(--secondary)'}}></i>
                         </p>
                      </div>
                   </div>
                )}

                {/* ACTION BUTTONS ROW */}
                <div style={{display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px', flexShrink: 0}}>
                   <button onClick={triggerFileUpload} style={{background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', padding: '15px 35px', borderRadius: '50px', color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transition: 'transform 0.2s'}} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='translateY(-3px)'}} onMouseOut={e=>{e.currentTarget.style.background='var(--glass-bg)'; e.currentTarget.style.transform='none'}}>
                      <i className="fa-solid fa-upload" style={{color: 'var(--text-muted)'}}></i> Upload PDF
                   </button>
                   <button onClick={handleSummarize} disabled={!selectedDoc || isSummarizing} style={{background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', padding: '15px 35px', borderRadius: '50px', color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', opacity: selectedDoc ? 1 : 0.5}} onMouseOver={e=>{if(selectedDoc) {e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='translateY(-3px)'}}} onMouseOut={e=>{if(selectedDoc) {e.currentTarget.style.background='var(--glass-bg)'; e.currentTarget.style.transform='none'}}}>
                      <i className="fa-solid fa-file-lines" style={{color: 'var(--text-muted)'}}></i> Generate Summary
                   </button>
                   <button onClick={() => document.getElementById('chat-input')?.focus()} style={{background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', padding: '15px 35px', borderRadius: '50px', color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', opacity: selectedDoc ? 1 : 0.5}} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='translateY(-3px)'}} onMouseOut={e=>{e.currentTarget.style.background='var(--glass-bg)'; e.currentTarget.style.transform='none'}}>
                      <i className="fa-solid fa-comment-dots" style={{color: 'var(--text-muted)'}}></i> Ask a Question
                   </button>
                </div>

                {/* AI CHATBOARD AREA */}
                <div style={{flex: 1, position: 'relative', background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '30px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'}}>
                   
                   {/* Chatboard Label */}
                   <div style={{position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-light)', padding: '5px 30px', borderTopLeftRadius: '15px', borderTopRightRadius: '15px', border: '1px solid var(--glass-border)', borderBottom: 'none', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 'bold', zIndex: 10}}>AI Chatboard</div>

                   {!selectedDoc ? (
                      /* Emtpy State */
                      <div style={{flex: 1, display: 'flex', flexDirection: 'column', padding: '30px', position: 'relative'}}>
                         <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.5}}>
                            <i className="fa-solid fa-robot" style={{fontSize: '5rem', color: 'var(--text-muted)', marginBottom: '20px'}}></i>
                            <h2 style={{color: 'var(--text-main)'}}>Initialize Chatboard...</h2>
                         </div>

                         {/* Input box */}
                         <div style={{position: 'relative', marginTop: 'auto', background: 'var(--bg-light)', borderRadius: '20px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', padding: '5px 5px 5px 25px', zIndex: 11}}>
                            <input disabled type="text" placeholder="Upload a document to begin..." style={{flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '1.1rem'}} />
                            <button disabled style={{background: 'rgba(255,255,255,0.1)', border: 'none', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)'}}>
                               <i className="fa-solid fa-paper-plane" style={{marginRight: '2px', marginTop: '2px'}}></i>
                            </button>
                         </div>
                      </div>
                   ) : (
                      /* Split View Loaded State */
                      <div style={{flex: 1, display: 'flex', height: '100%', overflow: 'hidden'}}>
                         <div style={{flex: 1, borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)'}}>
                            <iframe src={selectedDoc.url} style={{width: '100%', flex: 1, border: 'none', filter: isDark ? 'contrast(0.9) brightness(0.9)' : 'none'}} title="PDF"></iframe>
                         </div>
                         
                         <div style={{width: '350px', display: 'flex', flexDirection: 'column', padding: '20px', background: 'rgba(255,255,255,0.01)'}}>
                            <div className="qa-history" style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '10px', marginBottom: '20px'}}>
                               {analyzedData && analyzedData.summary.length > 0 && (
                                 <div style={{background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1))', padding: '15px', borderRadius: '15px', border: '1px solid rgba(236,72,153,0.2)'}}>
                                   <h4 style={{margin: '0 0 10px 0', color: 'var(--text-main)'}}><i className="fa-solid fa-bolt" style={{color: 'var(--secondary)'}}></i> Document Summary</h4>
                                   <ul style={{margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.5}}>
                                     {analyzedData.summary.map((point, i) => <li key={i} style={{marginBottom: '5px'}}>{point}</li>)}
                                   </ul>
                                 </div>
                               )}
                               {qaHistory.length === 0 && !analyzedData && (
                                  <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.5}}>
                                     <span style={{color: 'var(--text-main)'}}>PDF Loaded. Ask anything!</span>
                                  </div>
                               )}
                               {qaHistory.map((q, i) => (
                                  <div key={i} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                     <div style={{alignSelf: 'flex-start', background: 'var(--bg-light)', padding: '10px 15px', borderRadius: '15px 15px 15px 5px', color: 'var(--text-main)', border: '1px solid var(--glass-border)', maxWidth: '90%', fontSize: '0.95rem'}}>{q.question}</div>
                                     <div style={{alignSelf: 'flex-end', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.15))', padding: '10px 15px', borderRadius: '15px 15px 5px 15px', color: isDark ? '#e0e7ff' : 'var(--text-main)', border: '1px solid rgba(99,102,241,0.2)', maxWidth: '90%', fontSize: '0.95rem'}}>{q.answer}</div>
                                  </div>
                               ))}
                            </div>

                            <div style={{position: 'relative', background: 'var(--bg-light)', borderRadius: '20px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', padding: '5px 5px 5px 20px', zIndex: 11}}>
                               <input id="chat-input" type="text" placeholder="Ask a question..." value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleAsk()} style={{flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '1rem', width: '100%'}} />
                               <button onClick={handleAsk} style={{background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none', width: '40px', height: '40px', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 5px 15px rgba(236,72,153,0.3)', flexShrink: 0}} onMouseOver={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e=>e.currentTarget.style.transform='none'}>
                                  <i className="fa-solid fa-paper-plane" style={{marginRight: '2px', marginTop: '2px'}}></i>
                               </button>
                            </div>
                         </div>
                      </div>
                   )}

                   {/* FLOATING ACTION BUTTON (HEXAGON UPLOAD) */}
                   <div onClick={triggerFileUpload} style={{position: 'absolute', bottom: '20px', right: '30px', width: '70px', height: '80px', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: 'var(--bg-light)', border: '2px solid var(--glass-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 20, transition: 'transform 0.3s', backdropFilter: 'blur(10px)'}} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1) translateY(-5px)'} onMouseOut={e=>e.currentTarget.style.transform='none'}>
                      <i className="fa-solid fa-cloud-arrow-up" style={{fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '5px'}}></i>
                      <span style={{fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.1}}>Upload<br/>PDF</span>
                   </div>
                </div>
                
             </main>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
`;

const afterCode = "\\n";

const finalCode = beforeCode + '\\n' + newDashboardCode + afterCode;

fs.writeFileSync('src/App.jsx', finalCode);
console.log('Update Complete.');
