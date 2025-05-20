import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserType, TokenUsageType } from '../types';
import TokenUsageChart from './TokenUsageChart';

interface UserProfileProps {
  hideText?: boolean;
}

const UserProfile = ({ hideText = false }: UserProfileProps) => {
  const [userData, setUserData] = useState<UserType | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageType | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserType);
        }

        const tokenDoc = await getDoc(doc(db, 'tokenUsage', auth.currentUser.uid));
        if (tokenDoc.exists()) {
          setTokenUsage(tokenDoc.data() as TokenUsageType);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) return null;

  const initials = userData.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link to="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
      <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center text-white font-semibold shadow-lg">
        {initials}
      </div>
      {!hideText && tokenUsage && (
        <div className="flex-1">
          <TokenUsageChart
            totalTokens={tokenUsage.totalTokens}
            usedTokens={tokenUsage.usedTokens}
          />
        </div>
      )}
    </Link>
  );
};

export default UserProfile;