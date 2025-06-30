import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTranslation } from '../../utils/i18n';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validateInputs = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Por favor, preencha todos os campos.');
      return false;
    }
    if (!validateEmail(trimmedEmail)) {
      setError('Por favor, insira um email válido.');
      return false;
    }
    if (trimmedPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      
      if (!validateInputs()) {
        return;
      }

      setIsLoading(true);

      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        trimmedPassword
      );

      const user = userCredential.user;
      if (!user) {
        throw new Error('No user data available');
      }

      if (!user.emailVerified) {
        await auth.signOut();
        setError('Por favor, verifique seu email antes de fazer login.');
        navigate('/verify-email');
        return;
      }

      setError('');
      navigate('/', { replace: true });
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessages: { [key: string]: string } = {
        'auth/invalid-credential': 'Email ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.',
        'auth/user-disabled': 'Esta conta foi desativada. Entre em contato com o suporte.',
        'auth/too-many-requests': 'Muitas tentativas de login. Por favor, aguarde alguns minutos e tente novamente.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet e tente novamente.',
        'auth/invalid-email': 'O formato do email é inválido.',
        'auth/user-not-found': 'Não existe uma conta com este email.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/popup-closed-by-user': 'O processo de login foi interrompido. Por favor, tente novamente.',
        'auth/operation-not-allowed': 'Este método de login não está habilitado. Entre em contato com o suporte.',
        'auth/requires-recent-login': 'Por favor, faça login novamente para continuar.',
      };

      setError(
        errorMessages[error.code] || 
        'Ocorreu um erro ao fazer login. Por favor, verifique suas credenciais e tente novamente.'
      );
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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

      // Verificar se o usuário já existe no Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // Usuário já existe, verificar se está desabilitado
        const userData = userDoc.data();
        if (userData.disabled) {
          await auth.signOut();
          setError('Esta conta foi desativada. Entre em contato com o suporte.');
          return;
        }
        
        // Login bem-sucedido
        navigate('/', { replace: true });
      } else {
        // Usuário novo do Google - redirecionar para completar cadastro
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
      }

    } catch (error: any) {
      console.error('Google login error:', error);
      
      const errorMessages: { [key: string]: string } = {
        'auth/popup-closed-by-user': 'O login com Google foi cancelado.',
        'auth/popup-blocked': 'O popup foi bloqueado pelo navegador. Por favor, permita popups para este site.',
        'auth/cancelled-popup-request': 'Solicitação de login cancelada.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet e tente novamente.',
        'auth/too-many-requests': 'Muitas tentativas de login. Por favor, aguarde alguns minutos.',
        'auth/user-disabled': 'Esta conta foi desativada. Entre em contato com o suporte.',
      };

      setError(
        errorMessages[error.code] || 
        'Erro ao fazer login com Google. Por favor, tente novamente.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="https://genoi.net/wp-content/uploads/2024/12/Logo-gen.OI-Novo-1-2048x1035.png" 
            alt="Genie Logo" 
            className="mx-auto h-24"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'fallback-logo.png';
            }}
          />
          <h2 className="mt-6 text-3xl font-bold text-white">{t.login}</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center bg-red-900/20 p-3 rounded-md border border-red-800">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.email}
                disabled={isLoading || isGoogleLoading}
                autoComplete="email"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.password}
                disabled={isLoading || isGoogleLoading}
                minLength={6}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className={`w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 rounded-md text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                isLoading || isGoogleLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Entrando...' : t.login}
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
              onClick={handleGoogleLogin}
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
              {isGoogleLoading ? 'Entrando...' : 'Faça login com o Google'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Link 
              to="/forgot-password" 
              className="text-sm text-blue-400 hover:text-blue-500"
              tabIndex={isLoading || isGoogleLoading ? -1 : 0}
            >
              {t.forgotPassword}
            </Link>
            <Link 
              to="/register" 
              className="text-lg text-blue-400 hover:text-blue-500 font-medium uppercase"
              tabIndex={isLoading || isGoogleLoading ? -1 : 0}
            >
              {t.createAccount}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;