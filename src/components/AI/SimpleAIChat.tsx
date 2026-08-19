// src/components/AI/SimpleAIChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';

interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const SimpleAIChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            type: 'assistant',
            content: '👋 Hello! I can answer questions about employees.\n\nTry asking:\n• "How many employees are male?"\n• "Who is retiring this year?"\n• "Show me HR department employees"',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { token } = useAuthStore();

    useEffect(() => {
        fetchSuggestions();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchSuggestions = async () => {
        try {
            const response = await fetch('/api/ai/chat/suggestions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSuggestions(data.data);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query: input })
            });

            const data = await response.json();

            if (data.success) {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    type: 'assistant',
                    content: data.data.message,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error(data.message || 'Failed to get response');
            }
        } catch (error: any) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        setTimeout(() => handleSend(), 100);
    };

    return (
        <div className="flex flex-col h-full bg-navy rounded-xl border border-gold/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gold/20 bg-navy-light">
                <div className="w-8 h-8 rounded-full bg-gold-gradient text-navy flex items-center justify-center">
                    <MessageSquare size={16} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gold">HR Assistant</h3>
                    <p className="text-xs text-gold-dim">Ask about employees</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                    <span className="text-xs text-gold-dim">Online</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-2 ${message.type === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className="flex-shrink-0">
                            {message.type === 'assistant' ? (
                                <div className="w-7 h-7 rounded-full bg-gold-gradient text-navy flex items-center justify-center text-xs">
                                    <Bot size={14} />
                                </div>
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-navy-light border border-gold/20 text-gold flex items-center justify-center text-xs">
                                    <User size={14} />
                                </div>
                            )}
                        </div>
                        <div className={`max-w-[80%] ${message.type === 'assistant' ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                                message.type === 'assistant'
                                    ? 'bg-navy-light border border-gold/20 text-gold'
                                    : 'bg-gold-gradient text-navy font-medium'
                            }`}>
                                {message.content}
                            </div>
                            <div className={`text-[10px] text-gold-faint mt-0.5 ${message.type === 'assistant' ? 'ml-1' : 'text-right mr-1'}`}>
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-center gap-2 text-gold-dim">
                        <div className="w-7 h-7 rounded-full bg-gold-gradient text-navy flex items-center justify-center">
                            <Bot size={14} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length < 3 && suggestions.length > 0 && (
                <div className="px-4 py-2 border-t border-gold/10">
                    <p className="text-xs text-gold-dim mb-1.5">Quick questions:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {suggestions.slice(0, 4).map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-2.5 py-1 text-xs rounded-full bg-navy-light border border-gold/20 text-gold-dim hover:text-gold hover:bg-gold-subtle transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gold/20 bg-navy-light">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about employees..."
                        className="flex-1 px-3 py-2 rounded-lg bg-navy border border-gold/20 text-gold placeholder:text-gold-faint text-sm focus:outline-none focus:border-gold transition-colors"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="px-3 py-2 bg-gold-gradient text-navy font-bold rounded-lg hover:shadow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimpleAIChat;