import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import UserManagement from './components/UserProfile/UserManagement';
import NewChallenge from './components/NewChallenge';
import Plans from './components/Plans';
import EmailVerification from './components/auth/EmailVerification';
import AccountDeleted from './components/AccountDeleted';
import StartupList from './components/StartupList';
import JediSuccess from './components/plans/JediSuccess';
import MestreJediSuccess from './components/plans/MestreJediSuccess';
import MestreYodaSuccess from './components/plans/MestreYodaSuccess';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().disabled) {
            await signOut(auth);
            setUser(null);
          } else {
            setUser(user);
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" replace />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/profile" element={user?.emailVerified ? <UserManagement /> : <Navigate to="/verify-email" replace />} />
        <Route path="/new-challenge" element={user?.emailVerified ? <NewChallenge /> : <Navigate to="/verify-email" replace />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/startups" element={user?.emailVerified ? <StartupList /> : <Navigate to="/verify-email" replace />} />
        <Route path="/account-deleted" element={<AccountDeleted />} />
        
        {/* Plan success routes */}
        <Route path="j8k2m9n4p5q7r3s6t1v8w2x" element={<JediSuccess />} />
        <Route path="h5g9f3d7c1b4n8m2k6l9p4q" element={<MestreJediSuccess />} />
        <Route path="w2x6y9z4a7b1c5d8e3f2g4h" element={<MestreYodaSuccess />} />
        
        <Route path="/" element={
          user ? (
            user.emailVerified ? (
              <Layout />
            ) : (
              <Navigate to="/verify-email" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;