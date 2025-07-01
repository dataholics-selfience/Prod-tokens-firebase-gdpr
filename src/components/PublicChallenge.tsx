import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Building2, Globe, Mail, Phone, Upload, 
  CheckCircle, ArrowLeft, ExternalLink, Target, Clock
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChallengeData {
  id: string;
  title: string;
  description: string;
  companyName: string;
  logoUrl?: string;
  deadline?: string;
  businessArea: string;
  createdAt: string;
  status: string;
}

interface StartupFormData {
  startupName: string;
  website: string;
  pitchUrl: string;
  founderName: string;
  email: string;
  whatsapp: string;
}

const PublicChallenge = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<StartupFormData>({
    startupName: '',
    website: '',
    pitchUrl: '',
    founderName: '',
    email: '',
    whatsapp: ''
  });

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!slug) {
        setError('Slug do desafio não encontrado');
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'challenges'),
          where('slug', '==', slug),
          where('isPublic', '==', true),
          where('status', '==', 'active')
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Desafio não encontrado ou não está mais ativo');
          setLoading(false);
          return;
        }

        const challengeDoc = querySnapshot.docs[0];
        const challengeData = { id: challengeDoc.id, ...challengeDoc.data() } as ChallengeData;
        
        // Verificar se o prazo ainda está válido
        if (challengeData.deadline) {
          const deadlineDate = new Date(challengeData.deadline);
          const now = new Date();
          if (now > deadlineDate) {
            setError('O prazo para inscrições neste desafio já expirou');
            setLoading(false);
            return;
          }
        }

        setChallenge(challengeData);
      } catch (error) {
        console.error('Error fetching challenge:', error);
        setError('Erro ao carregar desafio');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { startupName, website, founderName, email, whatsapp } = formData;
    
    if (!startupName.trim()) {
      setError('Nome da startup é obrigatório');
      return false;
    }
    
    if (!website.trim()) {
      setError('Site da startup é obrigatório');
      return false;
    }
    
    if (!founderName.trim()) {
      setError('Nome do fundador é obrigatório');
      return false;
    }
    
    if (!email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    
    if (!whatsapp.trim()) {
      setError('WhatsApp é obrigatório');
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Formato de email inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challenge) return;
    
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Verificar se a startup já existe
      const existingStartupQuery = query(
        collection(db, 'startups'),
        where('name', '==', formData.startupName.trim())
      );
      
      const existingStartups = await getDocs(existingStartupQuery);
      
      const startupData = {
        name: formData.startupName.trim(),
        website: formData.website.trim(),
        pitchUrl: formData.pitchUrl.trim(),
        founderName: formData.founderName.trim(),
        email: formData.email.trim().toLowerCase(),
        whatsapp: formData.whatsapp.trim(),
        status: 'inscrita',
        desafioId: challenge.id,
        desafioTitle: challenge.title,
        companyName: challenge.companyName,
        inscritaEm: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!existingStartups.empty) {
        // Atualizar startup existente
        const startupDoc = existingStartups.docs[0];
        await addDoc(collection(db, 'startups'), {
          ...startupDoc.data(),
          ...startupData
        });
      } else {
        // Criar nova startup
        await addDoc(collection(db, 'startups'), {
          ...startupData,
          createdAt: new Date().toISOString()
        });
      }

      setSubmitted(true);
      
      // Scroll to top para mostrar mensagem de sucesso
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error submitting startup:', error);
      setError('Erro ao enviar inscrição. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando desafio...</div>
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-900/50 text-red-200 p-6 rounded-lg border border-red-800">
            <h2 className="text-xl font-bold mb-2">Desafio não encontrado</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mx-auto text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft size={16} />
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-blue-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-900/50 text-green-200 p-8 rounded-lg border border-green-800">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-400" />
            <h2 className="text-2xl font-bold mb-4">Inscrição Enviada!</h2>
            <p className="mb-6">
              Obrigado por se inscrever no desafio <strong>{challenge.title}</strong>. 
              Sua startup foi registrada com sucesso e será avaliada pela equipe da {challenge.companyName}.
            </p>
            <p className="text-sm text-green-300 mb-6">
              Você receberá um retorno em breve através do email fornecido.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Nova Inscrição
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {challenge.logoUrl && (
                <img 
                  src={challenge.logoUrl} 
                  alt={`${challenge.companyName} Logo`}
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{challenge.companyName}</h1>
                <p className="text-blue-200">{challenge.businessArea}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-300 mb-1">
                <Clock size={16} />
                <span className="text-sm font-medium">Prazo</span>
              </div>
              {challenge.deadline ? (
                <p className="text-white font-bold">{formatDate(challenge.deadline)}</p>
              ) : (
                <p className="text-gray-300">Sem prazo definido</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Challenge Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-blue-400" size={24} />
              <h2 className="text-2xl font-bold text-white">O Desafio</h2>
            </div>
            
            <h3 className="text-xl font-bold text-blue-200 mb-4">{challenge.title}</h3>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {challenge.description}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <Building2 size={16} />
                <span className="font-medium">Empresa:</span>
                <span>{challenge.companyName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <Calendar size={16} />
                <span className="font-medium">Publicado em:</span>
                <span>{formatDate(challenge.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Inscreva sua Startup</h2>
            
            {error && (
              <div className="bg-red-900/50 text-red-200 p-4 rounded-lg border border-red-800 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Nome da Startup *
                </label>
                <input
                  type="text"
                  name="startupName"
                  value={formData.startupName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome da sua startup"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Site da Startup *
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://suastartup.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Pitch/Apresentação (URL)
                </label>
                <input
                  type="url"
                  name="pitchUrl"
                  value={formData.pitchUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Link para pitch deck, vídeo ou apresentação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Nome do Fundador *
                </label>
                <input
                  type="text"
                  name="founderName"
                  value={formData.founderName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+55 11 99999-9999"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Enviando Inscrição...' : 'Inscrever Startup'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/20 text-center">
              <p className="text-gray-300 text-sm">
                Ao se inscrever, você concorda que seus dados sejam compartilhados com {challenge.companyName} para avaliação do desafio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-300 mb-2">
            Powered by <strong className="text-blue-400">Gen.OI</strong> - Plataforma de Inovação Aberta
          </p>
          <a 
            href="https://genoi.net" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Globe size={16} />
            genoi.net
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PublicChallenge;