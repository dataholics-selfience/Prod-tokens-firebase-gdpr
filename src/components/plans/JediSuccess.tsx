import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const PLAN_CONFIG = {
  name: 'Jedi',
  tokens: 1000
};

const JediSuccess = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handlePlanSuccess = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }

      try {
        const now = new Date();
        const expirationDate = new Date(now.setMonth(now.getMonth() + 1));
        const transactionId = crypto.randomUUID();

        // Update user's plan
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          plan: PLAN_CONFIG.name,
          updatedAt: now.toISOString()
        });

        // Update token usage
        await setDoc(doc(db, 'tokenUsage', auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          plan: PLAN_CONFIG.name,
          totalTokens: PLAN_CONFIG.tokens,
          usedTokens: 0,
          lastUpdated: now.toISOString(),
          expirationDate: expirationDate.toISOString()
        });

        // Record plan purchase
        await setDoc(doc(db, 'gdprCompliance', transactionId), {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          type: 'plan_purchase',
          plan: PLAN_CONFIG.name,
          tokens: PLAN_CONFIG.tokens,
          purchasedAt: now.toISOString(),
          transactionId
        });

        // Navigate home
        navigate('/');
      } catch (error) {
        console.error('Error processing plan:', error);
        setError('Erro ao processar plano');
      }
    };

    handlePlanSuccess();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-900/50 text-red-200 p-4 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="animate-spin mx-auto w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full" />
        <h2 className="text-2xl font-bold text-white">Ativando seu plano Jedi</h2>
        <p className="text-gray-400">
          Aguarde enquanto configuramos seus novos poderes...
        </p>
      </div>
    </div>
  );
};

export default JediSuccess;