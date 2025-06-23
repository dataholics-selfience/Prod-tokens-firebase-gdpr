import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Send, Smartphone, 
  User, Building2, Plus, Users
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../firebase';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  type: 'startup' | 'founder';
}

interface StartupData {
  id: string;
  startupName: string;
  startupData: {
    name: string;
    email: string;
    contacts?: Contact[];
  };
}

const EVOLUTION_API_CONFIG = {
  baseUrl: 'https://evolution-api-production-f719.up.railway.app',
  instanceKey: '215D70C6CC83-4EE4-B55A-DE7D4146CBF1'
};

const MessageComposer = () => {
  const navigate = useNavigate();
  const { startupId } = useParams<{ startupId: string }>();
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageType, setMessageType] = useState<'email' | 'whatsapp'>('email');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderCompany, setSenderCompany] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser || !startupId) {
        navigate('/login');
        return;
      }

      try {
        // Fetch startup data
        const startupDoc = await getDoc(doc(db, 'selectedStartups', startupId));
        if (!startupDoc.exists()) {
          console.error('Startup not found');
          return;
        }

        const startup = { id: startupDoc.id, ...startupDoc.data() } as StartupData;
        setStartupData(startup);

        // Initialize contacts
        const existingContacts = startup.startupData.contacts || [];
        const defaultContact: Contact = {
          id: 'default',
          name: startup.startupData.name,
          email: startup.startupData.email,
          type: 'startup'
        };
        
        const allContacts = [defaultContact, ...existingContacts];
        setContacts(allContacts);
        setSelectedContact(defaultContact);

        // Fetch user data for sender name
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSenderName(userData.name || '');
          setSenderCompany(userData.company || '');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startupId, navigate]);

  const formatPhoneForEvolution = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('55')) {
      return cleanPhone;
    } else if (cleanPhone.length === 11) {
      return '55' + cleanPhone;
    } else if (cleanPhone.length === 10) {
      return '55' + cleanPhone;
    }
    
    return cleanPhone;
  };

  const formatPhoneDisplay = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
      const areaCode = cleanPhone.substring(2, 4);
      const firstPart = cleanPhone.substring(4, 9);
      const secondPart = cleanPhone.substring(9);
      return `+55 ${areaCode} ${firstPart}-${secondPart}`;
    } else if (cleanPhone.length === 11) {
      const areaCode = cleanPhone.substring(0, 2);
      const firstPart = cleanPhone.substring(2, 7);
      const secondPart = cleanPhone.substring(7);
      return `${areaCode} ${firstPart}-${secondPart}`;
    }
    
    return phone;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 13;
  };

  const fetchMessages = async () => {
    if (!auth.currentUser || !startupId) return [];

    try {
      const messagesQuery = query(
        collection(db, 'crmMessages'),
        where('startupId', '==', startupId)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const allMessages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const userMessages = allMessages.filter(message => message.userId === auth.currentUser?.uid);
      userMessages.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      
      return userMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !auth.currentUser || !startupData || !selectedContact) return;

    if (messageType === 'email' && !subject.trim()) {
      setStatus({ type: 'error', message: 'Assunto é obrigatório para emails' });
      return;
    }

    if (messageType === 'email' && !selectedContact.email) {
      setStatus({ type: 'error', message: 'Email do destinatário é obrigatório' });
      return;
    }

    if (messageType === 'whatsapp' && (!selectedContact.phone || !validatePhoneNumber(selectedContact.phone))) {
      setStatus({ type: 'error', message: 'Número de telefone inválido para WhatsApp' });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      let success = false;
      let errorMessage = '';

      if (messageType === 'whatsapp') {
        // Send via Evolution API
        const formattedPhone = formatPhoneForEvolution(selectedContact.phone!);
        
        const evolutionPayload = {
          number: formattedPhone,
          text: message.trim()
        };

        console.log('Sending WhatsApp message via Evolution API:', {
          url: `${EVOLUTION_API_CONFIG.baseUrl}/message/sendText/${EVOLUTION_API_CONFIG.instanceKey}`,
          payload: evolutionPayload
        });

        const evolutionResponse = await fetch(
          `${EVOLUTION_API_CONFIG.baseUrl}/message/sendText/${EVOLUTION_API_CONFIG.instanceKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': EVOLUTION_API_CONFIG.instanceKey
            },
            body: JSON.stringify(evolutionPayload)
          }
        );

        if (evolutionResponse.ok) {
          const responseData = await evolutionResponse.json();
          console.log('Evolution API response:', responseData);
          success = true;
        } else {
          const errorText = await evolutionResponse.text();
          console.error('Evolution API error:', errorText);
          errorMessage = `Erro na Evolution API: ${evolutionResponse.status} - ${errorText}`;
        }
      } else {
        // Send email via MailerSend Firebase Extension
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mensagem da Gen.OI</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <img src="https://genoi.net/wp-content/uploads/2024/12/Logo-gen.OI-Novo-1-2048x1035.png" alt="Gen.OI" style="height: 60px; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Gen.OI - Inovação Aberta</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="white-space: pre-wrap; margin-bottom: 25px; font-size: 16px;">
                  ${message.trim()}
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                <div style="font-size: 14px; color: #666;">
                  <p><strong>Atenciosamente,</strong><br>
                  ${senderName}, ${senderCompany}</p>
                  <p style="margin-top: 20px;">
                    <strong>Gen.OI</strong><br>
                    Conectando empresas às melhores startups do mundo<br>
                    🌐 <a href="https://genoi.net" style="color: #667eea;">genoi.net</a><br>
                    📧 <a href="mailto:contact@genoi.net" style="color: #667eea;">contact@genoi.net</a>
                  </p>
                </div>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
              <p>Esta mensagem foi enviada através da plataforma Gen.OI de inovação aberta.</p>
            </div>
          </body>
          </html>
        `;

        const emailPayload = {
          to: [{ 
            email: selectedContact.email!, 
            name: selectedContact.name 
          }],
          from: { 
            email: 'contact@genoi.com.br', 
            name: 'Gen.OI - Inovação Aberta' 
          },
          subject: subject.trim(),
          html: emailHtml,
          text: message.trim(),
          reply_to: { 
            email: 'contact@genoi.net', 
            name: 'Gen.OI - Suporte' 
          },
          tags: ['crm', 'startup-interaction'],
          metadata: { 
            startupId: startupData.id, 
            userId: auth.currentUser.uid,
            recipientType: selectedContact.type,
            timestamp: new Date().toISOString()
          }
        };

        console.log('Sending email via MailerSend extension:', emailPayload);

        await addDoc(collection(db, 'emails'), emailPayload);
        success = true;
      }

      if (success) {
        // Save message to CRM
        const messageData: any = {
          startupId: startupData.id,
          userId: auth.currentUser.uid,
          senderName,
          recipientName: selectedContact.name,
          recipientType: selectedContact.type,
          messageType,
          message: message.trim(),
          sentAt: new Date().toISOString(),
          status: 'sent' as const
        };

        if (messageType === 'email' && selectedContact.email) {
          messageData.recipientEmail = selectedContact.email;
        }
        if (messageType === 'whatsapp' && selectedContact.phone) {
          messageData.recipientPhone = formatPhoneForEvolution(selectedContact.phone);
        }
        if (messageType === 'email' && subject.trim()) {
          messageData.subject = subject.trim();
        }

        await addDoc(collection(db, 'crmMessages'), messageData);

        setStatus({ 
          type: 'success', 
          message: `${messageType === 'email' ? 'Email' : 'Mensagem WhatsApp'} enviada com sucesso!` 
        });

        // Reset form
        setMessage('');
        setSubject('');

        // Navigate back to timeline after 2 seconds
        setTimeout(() => {
          navigate(`/startup/${startupId}/timeline`);
        }, 2000);
      } else {
        throw new Error(errorMessage || 'Falha no envio');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Erro ao enviar mensagem' 
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleBack = () => {
    navigate(`/startup/${startupId}/timeline`);
  };

  const handleManageContacts = () => {
    navigate(`/startup/${startupId}/contacts`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!startupData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Startup não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="flex flex-col p-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1 ml-4">
            <Building2 size={20} className="text-gray-400" />
            <h2 className="text-lg font-medium">Nova Mensagem - {startupData.startupName}</h2>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Compor Mensagem</h1>
            <button
              onClick={handleManageContacts}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Users size={16} />
              Gerenciar Contatos
            </button>
          </div>

          {/* Message Type Selection */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMessageType('email')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                messageType === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Mail size={20} />
              Email
            </button>
            <button
              onClick={() => setMessageType('whatsapp')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                messageType === 'whatsapp'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Smartphone size={20} />
              WhatsApp
            </button>
          </div>

          {/* Contact Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Destinatário
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-blue-400" />
                    <div className="flex-1">
                      <div className="font-medium text-white">{contact.name}</div>
                      {contact.role && (
                        <div className="text-sm text-gray-400">{contact.role}</div>
                      )}
                      {messageType === 'email' && contact.email && (
                        <div className="text-sm text-gray-300 flex items-center gap-1">
                          <Mail size={12} />
                          {contact.email}
                        </div>
                      )}
                      {messageType === 'whatsapp' && contact.phone && (
                        <div className="text-sm text-gray-300 flex items-center gap-1">
                          <Phone size={12} />
                          {formatPhoneDisplay(contact.phone)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {contact.type === 'startup' ? 'Startup' : 'Fundador'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject (only for email) */}
          {messageType === 'email' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assunto *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Assunto do email"
              />
            </div>
          )}

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mensagem *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={`Digite sua mensagem ${messageType === 'whatsapp' ? 'do WhatsApp' : 'de email'}...`}
            />
          </div>

          {/* Status Messages */}
          {status && (
            <div className={`mb-6 p-4 rounded-lg ${
              status.type === 'success' 
                ? 'bg-green-900/50 text-green-200 border border-green-800' 
                : 'bg-red-900/50 text-red-200 border border-red-800'
            }`}>
              {status.message}
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim() || (messageType === 'email' && !subject.trim()) || !selectedContact}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors ${
                isSending || !message.trim() || (messageType === 'email' && !subject.trim()) || !selectedContact
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : messageType === 'email'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar {messageType === 'email' ? 'Email' : 'WhatsApp'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;