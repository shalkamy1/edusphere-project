import React, { useState, useRef, useEffect } from 'react';

const BOT_RESPONSES = {
    default: "I'm here to help! You can ask me about your courses, grades, schedule, or any academic questions.",
    hello: "Hello! 👋 Welcome to EduSphere! How can I assist you today?",
    hi: "Hi there! 😊 I'm your EduSphere AI assistant. What would you like to know?",
    grades: "📊 Your current GPA is 3.82/4.0. You have 4 courses this semester. Would you like details on a specific course?",
    schedule: "📅 Your next class is Advanced Web Development (CS431) at 10:00 AM in Room B-204. Check the Timetable for your full schedule.",
    attendance: "✅ Your overall attendance rate is 87%. You have 3 pending absences in ENG101. Please submit any medical excuses soon.",
    help: "I can help you with:\n• 📊 Grades & GPA\n• 📅 Class schedule\n• 📋 Attendance status\n• 📚 Course information\n• 🎓 Graduation requirements\n• 💡 General questions",
    gpa: "🎓 Your current GPA is 3.82/4.0 — Great Standing! You need 45 more credit hours to graduate.",
    courses: "📚 This semester you're enrolled in:\n• CS5402 - Advanced Software Engineering\n• CS412 - Database Systems II\n• MATH301 - Discrete Mathematics\n• HUM401 - Professional Ethics",
    assignment: "📝 You have 2 upcoming assignments:\n• Web Development Project 3 (due tomorrow)\n• Database Lab Report (due in 3 days)",
    deadline: "⏰ Upcoming deadlines:\n• Assignment due: Tomorrow - CS431\n• Lab Report: Dec 15 - CS412\n• Final Submission: Dec 20 - MATH301",
};

function getBotReply(text) {
    const lower = text.toLowerCase();
    if (lower.includes('hello') || lower.includes('hey')) return BOT_RESPONSES.hello;
    if (lower.includes('hi')) return BOT_RESPONSES.hi;
    if (lower.includes('grade') || lower.includes('mark')) return BOT_RESPONSES.grades;
    if (lower.includes('schedule') || lower.includes('timetable') || lower.includes('class')) return BOT_RESPONSES.schedule;
    if (lower.includes('attend')) return BOT_RESPONSES.attendance;
    if (lower.includes('help') || lower.includes('what can')) return BOT_RESPONSES.help;
    if (lower.includes('gpa')) return BOT_RESPONSES.gpa;
    if (lower.includes('course') || lower.includes('enrolled')) return BOT_RESPONSES.courses;
    if (lower.includes('assignment') || lower.includes('homework')) return BOT_RESPONSES.assignment;
    if (lower.includes('deadline') || lower.includes('due')) return BOT_RESPONSES.deadline;
    return BOT_RESPONSES.default;
}

const QUICK = ['My GPA', 'My Schedule', 'Attendance', 'Assignments', 'Help'];

export default function PageChatbot() {
    const [msgs, setMsgs] = useState([
        { from: 'bot', text: "Hello! 👋 I'm EduBot, your AI academic assistant. How can I help you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
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
        setMsgs(prev => [...prev, { from: 'user', text, time: t }]);
        setInput('');
        setTyping(true);
        await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
        setTyping(false);
        const reply = getBotReply(text);
        setMsgs(prev => [...prev, { from: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
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
                    <div className="chatbot-header-name">EduBot</div>
                    <div className="chatbot-header-status">
                        <span className="chatbot-online-dot" /> AI Academic Assistant · Online
                    </div>
                </div>
                <div className="chatbot-header-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                    EduSphere AI
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
                            <div className={`chatbot-bubble ${m.from === 'user' ? 'user' : 'bot'}`} style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
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
                />
                <button type="submit" className="chatbot-send-btn" disabled={!input.trim()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
