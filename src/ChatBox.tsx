import React, { useState, useEffect } from 'react';

interface Message {
  id?: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! Welcome to Her Matters. How can we help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentPatientId = localStorage.getItem("patientId") || "1";

  // Helper function strictly using "Token <token_string>"
  const getAuthHeaders = () => {
    const token = localStorage.getItem("userToken");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }

    return headers;
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/patients/chat/?patient=${currentPatientId}`, {
          headers: getAuthHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const formattedMessages: Message[] = data.map((msg: any) => ({
              id: msg.id,
              text: msg.message,
              sender: msg.sender
            }));
            setMessages(formattedMessages);
          }
        }
      } catch (error) {
        console.error("Failed to load conversation history:", error);
      }
    };

    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen, currentPatientId]);

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
        headers: getAuthHeaders(),
        body: JSON.stringify({
          patient: parseInt(currentPatientId, 10),
          message: userText
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botResponseText = data.bot_message ? data.bot_message.message : (data.message || "Message received.");
        const botMsg: Message = {
          id: data.bot_message?.id || data.id,
          text: botResponseText,
          sender: 'bot'
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Django Chat API Error:", response.status, errorData);
        setMessages((prev) => [
          ...prev,
          { text: `Error ${response.status}: Failed to process message.`, sender: 'bot' }
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
          className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="flex h-96 w-80 flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
          <div 
            style={{ background: 'var(--color-crimson)', color: 'var(--color-blush)' }} 
            className="flex items-center justify-between p-4 font-bold"
          >
            <span>Her Matters Support</span>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-80 text-xl cursor-pointer">&times;</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
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
            {isLoading && (
              <div className="max-w-[80%] rounded-2xl p-3 text-sm bg-white text-gray-400 italic border border-gray-200">
                Processing NLP analysis...
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex border-t border-gray-200 p-2 bg-white">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
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