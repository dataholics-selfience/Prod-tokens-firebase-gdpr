import { useState, useRef, useEffect } from 'react';
import { Menu, SendHorizontal, Rocket, FolderOpen } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { MessageType, ChallengeType, TokenUsageType } from '../types';
import { LoadingStates } from './LoadingStates';

interface ChatInterfaceProps {
  messages: MessageType[];
  addMessage: (message: Omit<MessageType, 'id' | 'timestamp'>) => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentChallenge: ChallengeType | undefined;
}

const MESSAGE_TOKEN_COST = 3;
const ANONYMOUS_MESSAGE_LIMIT = 3;

const ChatInterface = ({ messages, addMessage, toggleSidebar, isSidebarOpen, currentChallenge }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [anonymousMessageCount, setAnonymousMessageCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const count = localStorage.getItem('anonymousMessageCount');
    if (count) {
      setAnonymousMessageCount(parseInt(count));
    }
  }, []);

  const handleInputClick = () => {
    if (!currentChallenge) {
      navigate('/new-challenge');
      return;
    }

    if (!auth.currentUser && anonymousMessageCount >= ANONYMOUS_MESSAGE_LIMIT) {
      setShowLoginPrompt(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    if (!currentChallenge) {
      navigate('/new-challenge');
      return;
    }

    setInput('');
    setIsLoading(true);

    try {
      if (!auth.currentUser) {
        const newCount = anonymousMessageCount + 1;
        setAnonymousMessageCount(newCount);
        localStorage.setItem('anonymousMessageCount', newCount.toString());

        if (newCount >= ANONYMOUS_MESSAGE_LIMIT) {
          await addMessage({
            role: 'assistant',
            content: 'Você atingiu o limite de mensagens para usuários anônimos. Crie uma conta gratuita para continuar conversando!\n\n<login-prompt>'
          });
          setShowLoginPrompt(true);
          setIsLoading(false);
          return;
        }
      }

      // Add user message
      await addMessage({ role: 'user', content: trimmedInput });

      // Send to webhook
      const response = await fetch('https://primary-production-2e3b.up.railway.app/webhook/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          sessionId: currentChallenge.sessionId,
          isAnonymous: !auth.currentUser
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message to webhook');
      }

      const data = await response.json();
      if (data[0]?.output) {
        await addMessage({ role: 'assistant', content: data[0].output });
      }

    } catch (error) {
      console.error('Error in chat:', error);
      await addMessage({
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setInput(target.value);
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessage = (message: MessageType) => {
    if (message.content.includes('<login-prompt>')) {
      return (
        <div className="space-y-4">
          <p>{message.content.split('<login-prompt>')[0]}</p>
          <Link
            to="/register"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Criar conta grátis
          </Link>
        </div>
      );
    }

    return <p className="whitespace-pre-wrap">{message.content}</p>;
  };

  const visibleMessages = messages.filter(message => !message.hidden);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-black">
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-2xl font-bold text-white text-center">Limite de mensagens atingido</h2>
            <p className="text-gray-300 text-center">
              Você atingiu o limite de mensagens para usuários anônimos. Crie uma conta gratuita para continuar conversando!
            </p>
            <div className="flex gap-4">
              <Link
                to="/register"
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-center font-bold"
              >
                Criar conta
              </Link>
              <Link
                to="/login"
                className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-center font-bold"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <button 
            onClick={toggleSidebar}
            className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white focus:outline-none bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 flex-1 ml-4">
            <h2 className="text-lg font-medium">Gen.OI, sua agente IA para inovação aberta com base de milhares de startups</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar">
        {visibleMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-900 text-white ml-8'
                  : 'bg-gray-800 text-gray-100 mr-8'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-semibold mr-2">
                    AI
                  </div>
                  <span className="font-medium">Genie</span>
                </div>
              )}
              {message.role === 'user' && (
                <div className="flex items-center mb-2 justify-end">
                  <span className="font-medium mr-2">Você</span>
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold">
                    {auth.currentUser ? 'U' : 'AN'}
                  </div>
                </div>
              )}
              {renderMessage(message)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-3xl rounded-lg p-4 bg-gray-800 text-gray-100 mr-8">
              <LoadingStates />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onClick={handleInputClick}
            placeholder={!auth.currentUser && anonymousMessageCount >= ANONYMOUS_MESSAGE_LIMIT ? "Crie uma conta para continuar conversando" : "Digite uma mensagem..."}
            className="w-full py-3 pl-4 pr-12 bg-gray-800 border border-gray-700 rounded-lg resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-[200px] text-gray-100"
            rows={1}
            disabled={isLoading || (!auth.currentUser && anonymousMessageCount >= ANONYMOUS_MESSAGE_LIMIT)}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || (!auth.currentUser && anonymousMessageCount >= ANONYMOUS_MESSAGE_LIMIT)}
            className={`absolute right-2 bottom-2.5 p-1.5 rounded-md ${
              input.trim() && !isLoading && (auth.currentUser || anonymousMessageCount < ANONYMOUS_MESSAGE_LIMIT) ? 'text-blue-500 hover:bg-gray-700' : 'text-gray-500'
            } transition-colors`}
          >
            <SendHorizontal size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;