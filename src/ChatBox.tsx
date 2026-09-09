import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id?: number;
  text: string;
  sender: 'user' | 'bot';
  nlpIntent?: string;
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! Welcome to Her Matters. How can we help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    const optimisticUserMsg: Message = { text: userText, sender: 'user' };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/patients/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userText
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const botMsg: Message = {
          text: data.bot_message?.message || "Response generated.",
          sender: 'bot',
          nlpIntent: data.bot_message?.nlp_intent
        };

        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Django Chat NLP Error:", response.status, errorData);
        setMessages((prev) => [
          ...prev,
          { text: `Error ${response.status}: Failed to process clinical message.`, sender: 'bot' }
        ]);
      }
    } catch (error) {
      console.error("Chat routing failure:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Server unreachable. Please check backend connection.", sender: 'bot' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ background: 'var(--color-amber)', color: 'var(--color-blush)' }}
          className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer text-xl"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="flex h-[28rem] w-80 flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
          <div 
            style={{ background: 'var(--color-crimson)', color: 'white' }} 
            className="flex items-center justify-between p-4 font-bold"
          >
            <span>Her Matters NLP Assistant</span>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-80 text-xl cursor-pointer">&times;</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'ml-auto text-white'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                }`}
                style={msg.sender === 'user' ? { background: 'var(--color-crimson)' } : {}}
              >
                {msg.text}
              </div>
            ))}
            
            {/* Thinking Indicator Dots */}
            {isLoading && (
              <div className="max-w-[85%] rounded-2xl p-3 bg-white text-gray-500 border border-gray-200 shadow-sm w-fit">
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex border-t border-gray-200 p-2 bg-white">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask an anonymous question..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-red-400"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ color: 'var(--color-crimson)' }} 
              className="ml-2 px-3 font-semibold text-sm hover:opacity-80 disabled:opacity-40 cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}