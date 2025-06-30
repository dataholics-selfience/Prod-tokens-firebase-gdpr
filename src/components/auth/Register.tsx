import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '../../utils/i18n';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    company: '',
    email: '',
    phone: '',
    password: '',
    terms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const checkDeletedUser = async (email: string) => {
    const q = query(
      collection(db, 'deletedUsers'),
      where('email', '==', email.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.terms) {
      setError('Você precisa aceitar os termos de uso para continuar.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const isDeleted = await checkDeletedUser(formData.email);
      if (isDeleted) {
        setError('Email e dados já excluídos da plataforma');
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email.trim(), 
        formData.password
      );
      const user = userCredential.user;

      const transactionId = crypto.randomUUID();
      const now = new Date();
      const expirationDate = new Date(now.setMonth(now.getMonth() + 1));

      const userData = {
        uid: user.uid,
        name: formData.name.trim(),
        cpf: formData.cpf.trim(),
        company: formData.company.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        plan: 'Padawan',
        acceptedTerms: true,
        createdAt: new Date().toISOString(),
        termsAcceptanceId: transactionId,
        authProvider: 'email'
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      await setDoc(doc(db, 'tokenUsage', user.uid), {
        uid: user.uid,
        email: formData.email.trim().toLowerCase(),
        plan: 'Padawan',
        totalTokens: 100,
        usedTokens: 0,
        lastUpdated: new Date().toISOString(),
        expirationDate: expirationDate.toISOString()
      });

      await setDoc(doc(collection(db, 'gdprCompliance'), transactionId), {
        uid: user.uid,
        email: formData.email.trim().toLowerCase(),
        type: 'terms_acceptance',
        acceptedTerms: true,
        acceptedAt: new Date().toISOString(),
        transactionId,
        authProvider: 'email'
      });

      await setDoc(doc(collection(db, 'gdprCompliance'), crypto.randomUUID()), {
        uid: user.uid,
        email: formData.email.trim().toLowerCase(),
        type: 'registration',
        registeredAt: new Date().toISOString(),
        transactionId: crypto.randomUUID(),
        authProvider: 'email'
      });

      await sendEmailVerification(user);

      navigate('/verify-email');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso. Por favor, use outro email ou faça login.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido. Por favor, verifique o email informado.');
      } else if (error.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao criar conta. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setError('');
      setIsGoogleLoading(true);

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) {
        throw new Error('No user data available');
      }

      // Verificar se o email foi deletado anteriormente
      const isDeleted = await checkDeletedUser(user.email || '');
      if (isDeleted) {
        await auth.signOut();
        setError('Email e dados já excluídos da plataforma');
        return;
      }

      // Redirecionar para completar cadastro
      navigate('/register/google-complete', { 
        state: { 
          googleUser: {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL
          }
        }
      });

    } catch (error: any) {
      console.error('Google register error:', error);
      
      const errorMessages: { [key: string]: string } = {
        'auth/popup-closed-by-user': 'O cadastro com Google foi cancelado.',
        'auth/popup-blocked': 'O popup foi bloqueado pelo navegador. Por favor, permita popups para este site.',
        'auth/cancelled-popup-request': 'Solicitação de cadastro cancelada.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet e tente novamente.',
        'auth/too-many-requests': 'Muitas tentativas. Por favor, aguarde alguns minutos.',
        'auth/account-exists-with-different-credential': 'Já existe uma conta com este email usando um método diferente.',
      };

      setError(
        errorMessages[error.code] || 
        'Erro ao fazer cadastro com Google. Por favor, tente novamente.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src="https://genoi.net/wp-content/uploads/2024/12/Logo-gen.OI-Novo-1-2048x1035.png" alt="Genie Logo" className="mx-auto h-24" />
          <h2 className="mt-6 text-3xl font-bold text-white">{t.register}</h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-center bg-red-900/20 p-3 rounded-md">{error}</div>}
          
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.name}
              disabled={isLoading || isGoogleLoading}
            />
            <input
              type="text"
              name="cpf"
              required
              value={formData.cpf}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.cpf}
              disabled={isLoading || isGoogleLoading}
            />
            <input
              type="text"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.company}
              disabled={isLoading || isGoogleLoading}
            />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.email}
              disabled={isLoading || isGoogleLoading}
            />
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.phone}
              disabled={isLoading || isGoogleLoading}
            />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.password}
              minLength={6}
              disabled={isLoading || isGoogleLoading}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
                disabled={isLoading || isGoogleLoading}
              />
              <label className="ml-2 block text-sm text-gray-300">
                {t.acceptTerms}
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !formData.terms || isGoogleLoading}
              className={`w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 rounded-md text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading || !formData.terms || isGoogleLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Criando conta...' : t.register}
            </button>
          </div>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">ou</span>
            </div>
          </div>

          {/* Botão do Google */}
          <div>
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={isLoading || isGoogleLoading}
              className={`w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-md text-gray-700 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-3 ${
                isLoading || isGoogleLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isGoogleLoading ? 'Cadastrando...' : 'Cadastre-se com o Google'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-lg text-blue-400 hover:text-blue-500 font-medium">
              {t.alreadyHaveAccount}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;