import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';

const NewChallenge = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    businessArea: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const publicUserId = localStorage.getItem('publicUserId');
      const userId = auth.currentUser?.uid || publicUserId;
      const userEmail = auth.currentUser?.email || 'anonymous@user.com';
      const sessionId = uuidv4().replace(/-/g, '');

      let userData = {
        name: 'Anônimo',
        company: 'Não informada'
      };

      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          userData = userDoc.data();
        }
      }

      // Create challenge
      const challengeRef = await addDoc(collection(db, 'challenges'), {
        userId,
        userEmail,
        company: userData.company,
        businessArea: formData.businessArea,
        title: formData.title,
        description: formData.description,
        sessionId,
        createdAt: new Date().toISOString()
      });

      // Prepare webhook message
      const message = `Eu sou ${userData.name.split(' ')[0]}, um profissional gestor antenado nas novidades e que curte uma fala informal e ao mesmo tempo séria nos assuntos relativos ao Desafio. Eu trabalho na empresa ${userData.company} que atua na área de ${formData.businessArea}. O meu desafio é ${formData.title} e a descrição do desafio é ${formData.description}. Faça uma breve saudação bem humorada e criativa que remete à cultura Geek e que tenha ligação direta com o desafio proposto.`;

      // Send webhook message
      const response = await fetch('https://primary-production-2e3b.up.railway.app/webhook/production', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send initial message');
      }

      // Save user message
      await addDoc(collection(db, 'messages'), {
        challengeId: challengeRef.id,
        userId,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        hidden: true
      });

      // Handle webhook response
      const data = await response.json();
      if (data[0]?.output) {
        await addDoc(collection(db, 'messages'), {
          challengeId: challengeRef.id,
          userId,
          role: 'assistant',
          content: data[0].output,
          timestamp: new Date().toISOString()
        });
      }

      navigate('/');
    } catch (error) {
      console.error('Error creating challenge:', error);
      setError('Erro ao criar desafio. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">Novo Desafio</h1>
          <div className="w-6" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-500 text-center">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título do Desafio
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o título do seu desafio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Área de atuação da empresa
              </label>
              <input
                type="text"
                name="businessArea"
                value={formData.businessArea}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Tecnologia, Saúde, Educação"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição do Desafio
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Descreva seu desafio em detalhes"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 rounded-md text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
          >
            <span>Criar Desafio</span>
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewChallenge;