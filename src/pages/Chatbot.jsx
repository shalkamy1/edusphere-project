import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getStoredUser, adviseStudent } from '../api.js';

const QUICK = ['My GPA', 'My Schedule', 'Attendance', 'Recommend Courses', 'Help'];

export default function PageChatbot() {
    const [msgs, setMsgs] = useState([
        { from: 'bot', text: "Hello! 👋 I'm EduBot, your AI academic assistant. I am connected to the main EduSphere system. How can I help you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs, typing]);

    const send = async (text) => {
        if (!text.trim()) return;
        const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Add user message
        setMsgs(prev => [...prev, { from: 'user', text, time: t }]);
        setInput('');
        setTyping(true);

        try {
            const user = getStoredUser();
            if (!user || user.role !== 'student' || !user.student_id) {
                throw new Error("Student not found or not authenticated.");
            }

            // Call backend API
            const response = await adviseStudent(user.student_id, text);
            
            let replyText = "I couldn't process your request.";
            if (response && response.data && response.data.recommendation) {
                replyText = response.data.recommendation;
            }

            setMsgs(prev => [...prev, { 
                from: 'bot', 
                text: replyText, 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);

        } catch (error) {
            console.error("Chatbot Error:", error);
            const errorMsg = error.message || "Sorry, I am having trouble connecting to the EduSphere server right now. Please try again later.";
            setMsgs(prev => [...prev, { 
                from: 'bot', 
                text: `⚠️ **Error:** ${errorMsg}`, 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);
        } finally {
            setTyping(false);
        }
    };

    const handleSubmit = (e) => { e.preventDefault(); send(input); };

    return (
        <div className="chatbot-page page-enter">
            {/* Header */}
            <div className="chatbot-header">
                <div className="chatbot-avatar">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="13" rx="2" />
                        <path d="M8 20h8M12 17v3" />
                        <circle cx="8.5" cy="9.5" r="1.5" fill="white" />
                        <circle cx="15.5" cy="9.5" r="1.5" fill="white" />
                    </svg>
                </div>
                <div>
                    <div className="chatbot-header-name">EduBot AI Agent</div>
                    <div className="chatbot-header-status">
                        <span className="chatbot-online-dot" /> AI Academic Assistant · Online
                    </div>
                </div>
                <div className="chatbot-header-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                    EduSphere Backend
                </div>
            </div>

            {/* Messages */}
            <div className="chatbot-messages">
                {msgs.map((m, i) => (
                    <div key={i} className={`chatbot-msg-row ${m.from === 'user' ? 'user' : 'bot'}`}>
                        {m.from === 'bot' && (
                            <div className="chatbot-bot-ic">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="13" rx="2" /><path d="M8 20h8M12 17v3" /></svg>
                            </div>
                        )}
                        <div className="chatbot-bubble-wrap">
                            <div className={`chatbot-bubble ${m.from === 'user' ? 'user' : 'bot'}`} style={{ whiteSpace: m.from === 'bot' ? 'normal' : 'pre-line' }}>
                                {m.from === 'bot' ? (
                                    <div className="markdown-body">
                                        <ReactMarkdown>{m.text}</ReactMarkdown>
                                    </div>
                                ) : (
                                    m.text
                                )}
                            </div>
                            <div className="chatbot-time">{m.time}</div>
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className="chatbot-msg-row bot">
                        <div className="chatbot-bot-ic">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="13" rx="2" /><path d="M8 20h8M12 17v3" /></svg>
                        </div>
                        <div className="chatbot-typing">
                            <span /><span /><span />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div className="chatbot-quick">
                {QUICK.map(q => (
                    <button key={q} className="chatbot-quick-btn" onClick={() => send(q)}>{q}</button>
                ))}
            </div>

            {/* Input */}
            <form className="chatbot-input-row" onSubmit={handleSubmit}>
                <input
                    className="chatbot-input"
                    placeholder="Type your message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={typing}
                />
                <button type="submit" className="chatbot-send-btn" disabled={!input.trim() || typing}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
