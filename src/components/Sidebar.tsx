import { useState, useEffect } from 'react';
import { Plus, X, FolderClosed, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import UserProfile from './UserProfile';
import { ChallengeType, StartupListType, TokenUsageType } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  challenges: ChallengeType[];
  currentChallengeId: string | null;
  onSelectChallenge: (challengeId: string) => void;
}

const Sidebar = ({ isOpen, toggleSidebar, challenges, currentChallengeId, onSelectChallenge }: SidebarProps) => {
  const navigate = useNavigate();
  const [pulseCount, setPulseCount] = useState(0);
  const [challengeStartups, setChallengeStartups] = useState<Record<string, StartupListType[]>>({});
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageType | null>(null);
  const [groupedChallenges, setGroupedChallenges] = useState<Record<string, ChallengeType[]>>({});

  useEffect(() => {
    if (pulseCount >= 5) return;
    const interval = setInterval(() => {
      setPulseCount(prev => prev + 1);
    }, 180000);
    return () => clearInterval(interval);
  }, [pulseCount]);

  useEffect(() => {
    const fetchStartupLists = async () => {
      const startupsByChallenge: Record<string, StartupListType[]> = {};
      for (const challenge of challenges) {
        const q = query(
          collection(db, 'startupLists'),
          where('challengeId', '==', challenge.id)
        );
        const querySnapshot = await getDocs(q);
        startupsByChallenge[challenge.id] = querySnapshot.docs.map(
          doc => ({ id: doc.id, ...doc.data() } as StartupListType)
        );
      }
      setChallengeStartups(startupsByChallenge);
    };

    fetchStartupLists();
  }, [challenges]);

  useEffect(() => {
    const fetchTokenUsage = async () => {
      if (!auth.currentUser) return;
      try {
        const tokenDoc = await getDoc(doc(db, 'tokenUsage', auth.currentUser.uid));
        if (tokenDoc.exists()) {
          setTokenUsage(tokenDoc.data() as TokenUsageType);
        }
      } catch (error) {
        console.error('Error fetching token usage:', error);
      }
    };

    fetchTokenUsage();
  }, []);

  useEffect(() => {
    // Group challenges by date
    const grouped = challenges.reduce((groups, challenge) => {
      const date = formatDate(challenge.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(challenge);
      return groups;
    }, {} as Record<string, ChallengeType[]>);
    
    setGroupedChallenges(grouped);
  }, [challenges]);

  // Updated to show all folders expanded by default
  useEffect(() => {
    const dates = Object.keys(groupedChallenges);
    setExpandedFolders(dates);
  }, [groupedChallenges]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const challengeDate = new Date(date);
    const distance = formatDistanceToNow(challengeDate, { locale: ptBR, addSuffix: true });
    
    if (challengeDate.toDateString() === now.toDateString()) {
      return 'Hoje';
    }
    
    if (challengeDate.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString()) {
      return 'Ontem';
    }
    
    if (now.getMonth() === challengeDate.getMonth()) {
      return 'Esta semana';
    }
    
    return format(challengeDate, "MMMM 'de' yyyy", { locale: ptBR });
  };

  const renderTokenUsage = () => {
    if (!tokenUsage) return null;

    const percentage = (tokenUsage.usedTokens / tokenUsage.totalTokens) * 100;
    const remainingTokens = tokenUsage.totalTokens - tokenUsage.usedTokens;

    return (
      <div className="px-3 py-2">
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${100 - percentage}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-400 text-center">
          {remainingTokens} de {tokenUsage.totalTokens} tokens
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 ${isOpen ? 'block' : 'hidden'}`}
        onClick={toggleSidebar}
      />

      <div 
        className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-[#1a1b2e] text-gray-300 z-30 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <img 
            src="https://genoi.net/wp-content/uploads/2024/12/Logo-gen.OI-Novo-1-2048x1035.png" 
            alt="Genie Logo" 
            className="h-12"
          />
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white focus:outline-none bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar">
          <div className="p-3">
            <Link 
              to="/new-challenge"
              className="w-full flex items-center gap-2 text-base font-bold bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white p-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={18} />
              <span>Novo desafio</span>
            </Link>
          </div>

          <div className="px-3 mb-2">
            <h2 className="text-sm font-normal text-gray-400 mb-2">Desafios</h2>
          </div>

          <nav className="px-3">
            {Object.entries(groupedChallenges).map(([date, dateGroup]) => (
              <div key={date} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => toggleFolder(date)}
                    className="flex items-center text-xs text-gray-500"
                  >
                    {expandedFolders.includes(date) ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                    {date}
                  </button>
                </div>

                {expandedFolders.includes(date) && (
                  <div className="space-y-1">
                    {dateGroup.map((challenge) => {
                      const isActive = currentChallengeId === challenge.id;
                      const startups = challengeStartups[challenge.id] || [];
                      
                      return (
                        <div key={challenge.id} className="pl-4">
                          <button
                            onClick={() => onSelectChallenge(challenge.id)}
                            className={`w-full flex flex-col text-sm p-2 rounded-lg transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 text-white'
                                : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isActive ? (
                                <FolderOpen size={14} className="text-blue-400" />
                              ) : (
                                <FolderClosed size={14} className="text-gray-500" />
                              )}
                              <span className="truncate text-left flex-1">{challenge.title}</span>
                            </div>
                            {startups.length > 0 && (
                              <div className="text-xs text-gray-500 pl-6 mt-1">
                                {startups.length} startup{startups.length > 1 ? 's' : ''} indicada{startups.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-3">
          {renderTokenUsage()}
          <div className="flex justify-between items-center">
            <UserProfile hideText={false} />
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;