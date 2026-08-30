import React, { useState } from 'react';

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([
    { text: "Hello! Welcome to Her Matters. How can we help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { text: inputValue, sender: 'user' as const };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate automated response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "Thank you for reaching out. A team member or support resources will connect with you shortly.", sender: 'bot' }
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ background: 'var(--color-amber)', color: 'var(--color-blush)' }}
          className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="flex h-96 w-80 flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div 
            style={{ background: 'var(--color-crimson)', color: 'var(--color-blush)' }} 
            className="flex items-center justify-between p-4 font-bold"
          >
            <span>Her Matters Support</span>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-80 text-xl">&times;</button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  msg.sender === 'user'
                    ? 'ml-auto text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
                style={msg.sender === 'user' ? { background: 'var(--color-crimson)' } : {}}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="flex border-t border-gray-200 p-2 bg-white">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-red-400"
            />
            <button 
              type="submit" 
              style={{ color: 'var(--color-crimson)' }} 
              className="ml-2 px-3 font-semibold text-sm hover:opacity-80"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
