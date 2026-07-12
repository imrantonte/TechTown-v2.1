import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaTimes, FaPaperPlane, FaTrash, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const ChatBot = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! I am your TechTown Assistant. Ask me anything about our products, stores, or policies!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userPrompt = input.trim();
        setInput('');
        setErrorMsg('');

        // Add user message to UI
        const newMessages = [...messages, { role: 'user', text: userPrompt }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Prepare history for Gemini: skip the initial welcome message from Gemini to prevent format clutter
            const apiHistory = newMessages.slice(1, -1).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                text: msg.text
            }));

            const response = await axios.post('/api/ai/chat', {
                prompt: userPrompt,
                history: apiHistory
            });

            if (response.data && response.data.reply) {
                setMessages(prev => [...prev, { role: 'model', text: response.data.reply }]);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("ChatBot API error:", error);
            const errMsg = error.response?.data?.message || "Failed to generate AI response. Please try again.";
            setErrorMsg(errMsg);
            setMessages(prev => [...prev, { role: 'model', text: `⚠️ Error: ${errMsg}`, isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([
            { role: 'model', text: 'Hello! I am your TechTown Assistant. Ask me anything about our products, stores, or policies!' }
        ]);
        setErrorMsg('');
    };

    return (
        <>
            <style>{`
                /* Floating chat bubble button */
                .chatbot-launcher {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
                    cursor: pointer;
                    z-index: 9999;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                }

                .chatbot-launcher:hover {
                    transform: scale(1.1) rotate(5deg);
                    box-shadow: 0 12px 35px rgba(99, 102, 241, 0.6);
                }

                .chatbot-launcher::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 2px solid #6366f1;
                    animation: chatbot-pulse 2s infinite;
                    opacity: 0;
                }

                @keyframes chatbot-pulse {
                    0% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(1.4);
                        opacity: 0;
                    }
                }

                /* Chat widget window */
                .chatbot-widget {
                    position: fixed;
                    bottom: 110px;
                    right: 30px;
                    width: 400px;
                    height: 550px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    display: flex;
                    flex-direction: column;
                    z-index: 9998;
                    overflow: hidden;
                    transform-origin: bottom right;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
                    opacity: 0;
                    transform: scale(0.8) translateY(20px);
                    pointer-events: none;
                }

                .chatbot-widget.open {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    pointer-events: auto;
                }

                /* Header */
                .chatbot-header {
                    padding: 16px 20px;
                    background: linear-gradient(135deg, #1e1b4b, #312e81);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .chatbot-header-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .chatbot-header-logo {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    color: #818cf8;
                    box-shadow: 0 0 10px rgba(129, 140, 248, 0.3);
                }

                .chatbot-header-text h4 {
                    margin: 0;
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }

                .chatbot-header-text span {
                    font-size: 11px;
                    color: #a5b4fc;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .chatbot-header-text span::before {
                    content: '';
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #10b981;
                }

                .chatbot-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .chatbot-action-btn {
                    background: none;
                    border: none;
                    color: #c7d2fe;
                    cursor: pointer;
                    font-size: 16px;
                    transition: color 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                }

                .chatbot-action-btn:hover {
                    color: white;
                }

                /* Messages Body */
                .chatbot-body {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    scroll-behavior: smooth;
                    background: rgba(248, 250, 252, 0.4);
                }

                .chatbot-message {
                    max-width: 80%;
                    padding: 10px 14px;
                    border-radius: 16px;
                    font-size: 14px;
                    line-height: 1.45;
                    word-wrap: break-word;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }

                .chatbot-message.model {
                    align-self: flex-start;
                    background: white;
                    color: #1e293b;
                    border-bottom-left-radius: 4px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }

                .chatbot-message.model.error {
                    background: #fee2e2;
                    color: #991b1b;
                    border-color: #fca5a5;
                }

                .chatbot-message.user {
                    align-self: flex-end;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    border-bottom-right-radius: 4px;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
                }

                /* Loading Indicator */
                .chatbot-typing {
                    align-self: flex-start;
                    background: white;
                    padding: 12px 18px;
                    border-radius: 16px;
                    border-bottom-left-radius: 4px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }

                .chatbot-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #94a3b8;
                    animation: chatbot-dot-bounce 1.4s infinite ease-in-out both;
                }

                .chatbot-dot:nth-child(1) { animation-delay: -0.32s; }
                .chatbot-dot:nth-child(2) { animation-delay: -0.16s; }

                @keyframes chatbot-dot-bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }

                /* Input Footer */
                .chatbot-footer {
                    padding: 16px 20px;
                    background: white;
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                }

                .chatbot-form {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #f1f5f9;
                    border-radius: 25px;
                    padding: 4px 8px 4px 16px;
                    border: 1.5px solid transparent;
                    transition: all 0.2s ease;
                }

                .chatbot-form:focus-within {
                    border-color: #6366f1;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }

                .chatbot-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    padding: 8px 0;
                    font-size: 14px;
                    color: #1e293b;
                    outline: none;
                }

                .chatbot-submit-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }

                .chatbot-submit-btn:hover:not(:disabled) {
                    background: #3730a3;
                    transform: scale(1.05);
                }

                .chatbot-submit-btn:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                }

                /* Guest Overlay Screen */
                .chatbot-guest-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 30px;
                    text-align: center;
                    background: rgba(248, 250, 252, 0.95);
                }

                .chatbot-guest-icon {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: rgba(99, 102, 241, 0.1);
                    color: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    margin-bottom: 20px;
                    border: 2px dashed rgba(99, 102, 241, 0.3);
                }

                .chatbot-guest-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 10px;
                }

                .chatbot-guest-desc {
                    font-size: 13.5px;
                    color: #64748b;
                    margin-bottom: 24px;
                    line-height: 1.5;
                }

                .chatbot-login-btn {
                    padding: 10px 24px;
                    border-radius: 20px;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
                    transition: all 0.2s ease;
                }

                .chatbot-login-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 18px rgba(99, 102, 241, 0.4);
                }

                /* Responsive */
                @media (max-width: 480px) {
                    .chatbot-widget {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 120px);
                        bottom: 90px;
                        right: 20px;
                    }
                    .chatbot-launcher {
                        bottom: 20px;
                        right: 20px;
                    }
                }
            `}</style>

            {/* Chat Launcher Button */}
            <div 
                className="chatbot-launcher" 
                onClick={() => setIsOpen(!isOpen)}
                title="Chat with AI Assistant"
            >
                {isOpen ? <FaTimes style={{ fontSize: '22px' }} /> : <FaRobot style={{ fontSize: '26px' }} />}
            </div>

            {/* Chat Widget Window */}
            <div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="chatbot-header">
                    <div className="chatbot-header-info">
                        <div className="chatbot-header-logo">
                            <FaRobot />
                        </div>
                        <div className="chatbot-header-text">
                            <h4>TechTown AI</h4>
                            <span>AI Assistant</span>
                        </div>
                    </div>
                    <div className="chatbot-header-actions">
                        {user && (
                            <button 
                                className="chatbot-action-btn" 
                                onClick={clearChat} 
                                title="Clear conversation"
                            >
                                <FaTrash style={{ fontSize: '14px' }} />
                            </button>
                        )}
                        <button 
                            className="chatbot-action-btn" 
                            onClick={() => setIsOpen(false)} 
                            title="Close chat"
                        >
                            <FaTimes style={{ fontSize: '18px' }} />
                        </button>
                    </div>
                </div>

                {/* Content Panel based on Authentication State */}
                {!user ? (
                    <div className="chatbot-guest-container">
                        <div className="chatbot-guest-icon">
                            <FaLock />
                        </div>
                        <div className="chatbot-guest-title">Secure AI Support</div>
                        <div className="chatbot-guest-desc">
                            Please log in to chat with our AI Customer Support Bot. Get instant help with product availability, return policies, and order tracking.
                        </div>
                        <button 
                            className="chatbot-login-btn"
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/login');
                            }}
                        >
                            Log In to Chat
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Messages Area */}
                        <div className="chatbot-body">
                            {messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`chatbot-message ${msg.role} ${msg.isError ? 'error' : ''}`}
                                    style={{ whiteSpace: 'pre-line' }}
                                >
                                    {msg.text}
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isLoading && (
                                <div className="chatbot-typing">
                                    <span className="chatbot-dot"></span>
                                    <span className="chatbot-dot"></span>
                                    <span className="chatbot-dot"></span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="chatbot-footer">
                            <form onSubmit={handleSend} className="chatbot-form">
                                <input
                                    type="text"
                                    className="chatbot-input"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isLoading}
                                    maxLength={1000}
                                />
                                <button 
                                    type="submit" 
                                    className="chatbot-submit-btn"
                                    disabled={!input.trim() || isLoading}
                                >
                                    <FaPaperPlane />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ChatBot;
