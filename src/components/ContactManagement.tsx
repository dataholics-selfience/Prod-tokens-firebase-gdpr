import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, User, Building2, Plus, 
  Edit2, Trash2, Save, X, UserPlus
} from 'lucide-react';
import { 
  doc, 
  getDoc, 
  updateDoc
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

const ContactManagement = () => {
  const navigate = useNavigate();
  const { startupId } = useParams<{ startupId: string }>();
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    email: '',
    phone: '',
    role: '',
    type: 'startup'
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser || !startupId) {
        navigate('/login');
        return;
      }

      try {
        const startupDoc = await getDoc(doc(db, 'selectedStartups', startupId));
        if (!startupDoc.exists()) {
          console.error('Startup not found');
          return;
        }

        const startup = { id: startupDoc.id, ...startupDoc.data() } as StartupData;
        setStartupData(startup);

        // Initialize contacts with default startup contact
        const existingContacts = startup.startupData.contacts || [];
        const defaultContact: Contact = {
          id: 'default',
          name: startup.startupData.name,
          email: startup.startupData.email,
          type: 'startup'
        };
        
        const allContacts = [defaultContact, ...existingContacts];
        setContacts(allContacts);
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

  const handleAddContact = async () => {
    if (!newContact.name || !startupData || !startupId) return;

    const contactToAdd: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email || undefined,
      phone: newContact.phone ? formatPhoneForEvolution(newContact.phone) : undefined,
      role: newContact.role || undefined,
      type: newContact.type || 'startup'
    };

    try {
      const updatedContacts = [...(startupData.startupData.contacts || []), contactToAdd];
      
      await updateDoc(doc(db, 'selectedStartups', startupId), {
        'startupData.contacts': updatedContacts
      });

      setContacts(prev => [...prev, contactToAdd]);
      setNewContact({ name: '', email: '', phone: '', role: '', type: 'startup' });
      setShowAddContact(false);
      setStatus({ type: 'success', message: 'Contato adicionado com sucesso!' });
    } catch (error) {
      console.error('Error adding contact:', error);
      setStatus({ type: 'error', message: 'Erro ao adicionar contato' });
    }
  };

  const handleEditContact = async () => {
    if (!editingContact || !startupData || !startupId) return;

    try {
      const updatedContact = {
        ...editingContact,
        phone: editingContact.phone ? formatPhoneForEvolution(editingContact.phone) : undefined
      };

      const updatedContacts = (startupData.startupData.contacts || []).map(contact =>
        contact.id === editingContact.id ? updatedContact : contact
      );
      
      await updateDoc(doc(db, 'selectedStartups', startupId), {
        'startupData.contacts': updatedContacts
      });

      setContacts(prev => prev.map(contact =>
        contact.id === editingContact.id ? updatedContact : contact
      ));
      
      setEditingContact(null);
      setStatus({ type: 'success', message: 'Contato atualizado com sucesso!' });
    } catch (error) {
      console.error('Error updating contact:', error);
      setStatus({ type: 'error', message: 'Erro ao atualizar contato' });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!startupData || contactId === 'default' || !startupId) return;

    try {
      const updatedContacts = (startupData.startupData.contacts || []).filter(
        contact => contact.id !== contactId
      );
      
      await updateDoc(doc(db, 'selectedStartups', startupId), {
        'startupData.contacts': updatedContacts
      });

      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      setStatus({ type: 'success', message: 'Contato removido com sucesso!' });
    } catch (error) {
      console.error('Error deleting contact:', error);
      setStatus({ type: 'error', message: 'Erro ao remover contato' });
    }
  };

  const handleBack = () => {
    navigate(`/startup/${startupId}/timeline`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando contatos...</div>
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
            <h2 className="text-lg font-medium">Gestão de Contatos - {startupData.startupName}</h2>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        {/* Add Contact Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Contatos</h1>
          <button
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <UserPlus size={16} />
            Adicionar Contato
          </button>
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

        {/* Add Contact Form */}
        {showAddContact && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Novo Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nome *"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Cargo/Função"
                value={newContact.role}
                onChange={(e) => setNewContact(prev => ({ ...prev, role: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={newContact.email}
                onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Telefone/WhatsApp"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <select
                value={newContact.type}
                onChange={(e) => setNewContact(prev => ({ ...prev, type: e.target.value as 'startup' | 'founder' }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="startup">Startup</option>
                <option value="founder">Fundador</option>
              </select>
              <button
                onClick={handleAddContact}
                disabled={!newContact.name}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Save size={16} />
                Salvar
              </button>
              <button
                onClick={() => {
                  setShowAddContact(false);
                  setNewContact({ name: '', email: '', phone: '', role: '', type: 'startup' });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-gray-800 rounded-lg p-6">
              {editingContact?.id === contact.id ? (
                // Edit Form
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome *"
                    value={editingContact.name}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Cargo/Função"
                    value={editingContact.role || ''}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, role: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={editingContact.email || ''}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Telefone/WhatsApp"
                    value={editingContact.phone ? formatPhoneDisplay(editingContact.phone) : ''}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={editingContact.type}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, type: e.target.value as 'startup' | 'founder' } : null)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="startup">Startup</option>
                    <option value="founder">Fundador</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditContact}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Save size={16} />
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingContact(null)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <X size={16} />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Display Contact
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <User size={24} className="text-blue-400" />
                      <div>
                        <h3 className="font-bold text-white text-lg">{contact.name}</h3>
                        {contact.role && (
                          <p className="text-gray-400 text-sm">{contact.role}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.id !== 'default' && (
                        <>
                          <button
                            onClick={() => setEditingContact(contact)}
                            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {contact.email && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <Mail size={16} className="text-blue-400" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <Phone size={16} className="text-green-400" />
                        <span>{formatPhoneDisplay(contact.phone)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Building2 size={16} className="text-purple-400" />
                      <span className="text-gray-300">
                        {contact.type === 'startup' ? 'Startup' : 'Fundador'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {contacts.length === 0 && (
          <div className="text-center py-12">
            <User size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum contato cadastrado</h3>
            <p className="text-gray-400 mb-6">
              Adicione contatos para facilitar o envio de mensagens
            </p>
            <button
              onClick={() => setShowAddContact(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
            >
              <UserPlus size={20} />
              Adicionar Primeiro Contato
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManagement;