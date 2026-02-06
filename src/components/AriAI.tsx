'use client';
import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaMagic } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function AriAI() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: `¡Hola ${user?.nombre || ''}! Soy Ari 🦁, tu asistente inmobiliaria. Puedo decirte cuántos clientes ingresaron hoy, buscar propiedades o redactar correos. ¿En qué te ayudo?`,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Mostrar mensaje del usuario
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Enviar al Backend real
      const { data } = await api.post('/ai/chat-ari', { prompt: input });
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.respuesta,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: "Ups, tuve un problema conectando con la base de datos. Inténtalo de nuevo.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* VENTANA DE CHAT */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden animate-fade-in-up transition-all">
          {/* Header con gradiente Sillar */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full border border-white/30 backdrop-blur-md">
                <FaRobot className="text-xl text-white"/>
              </div>
              <div>
                <h3 className="font-bold text-sm">Ari AI</h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_#4ade80]"></span> Conectada a Base de Datos
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition"><FaMinus size={12}/></button>
            </div>
          </div>

          {/* Cuerpo Mensajes */}
          <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0"><FaMagic className="text-indigo-500 text-xs"/></div>}
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0"><FaMagic className="text-indigo-500 text-xs"/></div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center h-10">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input 
              type="text" 
              className="flex-1 input input-sm h-10 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 border-gray-200 rounded-full px-4 text-sm transition-all"
              placeholder="Pregúntale algo a Ari..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim() || isTyping} className="btn btn-sm h-10 w-10 btn-circle bg-indigo-600 hover:bg-indigo-700 border-none text-white shadow-lg shadow-indigo-200 disabled:bg-gray-300">
              <FaPaperPlane className="text-xs ml-[-2px] mt-[1px]"/>
            </button>
          </form>
        </div>
      )}

      {/* BOTÓN FLOTANTE */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center btn btn-circle btn-lg h-14 w-14 bg-gradient-to-r from-indigo-600 to-blue-600 border-none text-white shadow-xl hover:shadow-indigo-500/40 hover:scale-110 transition-all duration-300 z-50"
      >
        {isOpen ? <FaTimes className="text-2xl"/> : <FaRobot className="text-3xl animate-pulse-slow"/>}
        
        {/* Tooltip flotante */}
        {!isOpen && (
            <span className="absolute right-16 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Soy Ari, ¿te ayudo? ✨
            </span>
        )}
      </button>
    </div>
  );
}