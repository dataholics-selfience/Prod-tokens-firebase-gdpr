import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Calendar, Building2, MapPin, Users, Briefcase, 
  ArrowLeft, Mail, Globe, Box, Linkedin, Facebook, 
  Twitter, Instagram, Trash2, FolderOpen, ChevronRight,
  ChevronLeft, Plus, GripVertical, Settings, Edit
} from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { StartupType, SocialLink } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PipelineStageManager from './PipelineStageManager';

interface SavedStartupType {
  id: string;
  userId: string;
  userEmail: string;
  challengeId: string;
  challengeTitle: string;
  startupName: string;
  startupData: StartupType;
  selectedAt: string;
  stage: string;
  updatedAt: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  emailTemplate?: string;
  emailSubject?: string;
  whatsappTemplate?: string;
}

const DEFAULT_STAGES: PipelineStage[] = [
  { 
    id: 'mapeada', 
    name: 'Mapeada', 
    color: 'bg-yellow-200 text-yellow-800 border-yellow-300', 
    order: 0,
    emailTemplate: '',
    emailSubject: '',
    whatsappTemplate: ''
  },
  { 
    id: 'selecionada', 
    name: 'Selecionada', 
    color: 'bg-blue-200 text-blue-800 border-blue-300', 
    order: 1,
    emailSubject: '{{senderCompany}} - Oportunidade de Colaboração com {{startupName}}',
    emailTemplate: 'Olá {{startupName}},\n\nEspero que esteja bem! Sou {{senderName}} da {{senderCompany}}.\n\nTemos acompanhado o trabalho da {{startupName}} e ficamos impressionados com a solução que vocês desenvolveram. Acreditamos que há uma grande sinergia entre nossos objetivos e gostaríamos de explorar possibilidades de colaboração.\n\nGostaria de agendar uma conversa para conhecermos melhor a {{startupName}} e apresentarmos nossa empresa e nossos desafios.\n\nFico no aguardo do seu retorno.\n\nAtenciosamente,\n{{senderName}}',
    whatsappTemplate: 'Olá! Sou {{senderName}} da {{senderCompany}}. Ficamos impressionados com a solução da {{startupName}} e gostaríamos de explorar uma possível colaboração. Podemos agendar uma conversa? 🚀'
  },
  { 
    id: 'contatada', 
    name: 'Contatada', 
    color: 'bg-red-200 text-red-800 border-red-300', 
    order: 2,
    emailSubject: '{{senderCompany}} - Próximos Passos com {{startupName}}',
    emailTemplate: 'Olá {{startupName}},\n\nObrigado pelo retorno! Fico feliz em saber do interesse em nossa proposta de colaboração.\n\nPara darmos continuidade, gostaria de agendar uma reunião para:\n- Apresentarmos nossa empresa e nossos desafios\n- Conhecermos melhor a solução da {{startupName}}\n- Discutirmos possibilidades de parceria\n\nTeria disponibilidade para uma conversa na próxima semana?\n\nAguardo seu retorno.\n\nAtenciosamente,\n{{senderName}}',
    whatsappTemplate: 'Ótimo! Que tal agendarmos uma reunião para apresentarmos nossos desafios e conhecermos melhor a solução da {{startupName}}? Teria disponibilidade na próxima semana? 📅'
  },
  { 
    id: 'entrevistada', 
    name: 'Entrevistada', 
    color: 'bg-green-200 text-green-800 border-green-300', 
    order: 3,
    emailSubject: '{{senderCompany}} - Avançando para POC com {{startupName}}',
    emailTemplate: 'Olá {{startupName}},\n\nFoi um prazer conhecer melhor a equipe e a solução da {{startupName}} em nossa reunião.\n\nFicamos muito empolgados com as possibilidades de colaboração e gostaríamos de avançar para a próxima etapa: desenvolvimento de um Proof of Concept (POC).\n\nVamos preparar um briefing detalhado com os requisitos e objetivos do POC. Em breve entraremos em contato com mais informações.\n\nObrigado pelo tempo e dedicação!\n\nAtenciosamente,\n{{senderName}}',
    whatsappTemplate: 'Excelente reunião! Ficamos empolgados com a {{startupName}} e queremos avançar para um POC. Em breve enviaremos o briefing detalhado. Obrigado! 🎯'
  },
  { 
    id: 'poc', 
    name: 'POC', 
    color: 'bg-orange-200 text-orange-800 border-orange-300', 
    order: 4,
    emailSubject: '{{senderCompany}} - Briefing POC {{startupName}}',
    emailTemplate: 'Olá {{startupName}},\n\nParabéns! Chegamos à etapa de Proof of Concept.\n\nSegue em anexo o briefing detalhado com:\n- Objetivos do POC\n- Requisitos técnicos\n- Cronograma proposto\n- Critérios de avaliação\n\nEstamos ansiosos para ver a solução da {{startupName}} em ação e avaliar como podemos integrar essa inovação em nossos processos.\n\nQualquer dúvida, estou à disposição.\n\nVamos inovar juntos!\n\n{{senderName}}',
    whatsappTemplate: 'Parabéns {{startupName}}! 🎉 Chegamos ao POC! Enviamos o briefing detalhado por email. Estamos ansiosos para ver a solução em ação! Vamos inovar juntos! 💡'
  }
];

const EVOLUTION_API_CONFIG = {
  baseUrl: 'https://evolution-api-production-f719.up.railway.app',
  instanceKey: '215D70C6CC83-4EE4-B55A-DE7D4146CBF1'
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-3 flex flex-col items-center">
      <span className="text-3xl font-extrabold text-white">{rating}</span>
      <div className="text-sm text-gray-400 mt-1">Match Score</div>
      <div className="flex items-center gap-1 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const SocialLinks = ({ startup, className = "" }: { startup: StartupType; className?: string }) => {
  const links: SocialLink[] = [
    {
      type: 'website',
      url: startup.website,
      icon: Globe,
      label: 'Website'
    },
    {
      type: 'email',
      url: `mailto:${startup.email}`,
      icon: Mail,
      label: 'Email'
    },
    ...(startup.socialLinks?.linkedin ? [{
      type: 'linkedin',
      url: startup.socialLinks.linkedin,
      icon: Linkedin,
      label: 'LinkedIn'
    }] : []),
    ...(startup.socialLinks?.facebook ? [{
      type: 'facebook',
      url: startup.socialLinks.facebook,
      icon: Facebook,
      label: 'Facebook'
    }] : []),
    ...(startup.socialLinks?.twitter ? [{
      type: 'twitter',
      url: startup.socialLinks.twitter,
      icon: Twitter,
      label: 'Twitter'
    }] : []),
    ...(startup.socialLinks?.instagram ? [{
      type: 'instagram',
      url: startup.socialLinks.instagram,
      icon: Instagram,
      label: 'Instagram'
    }] : [])
  ].filter(link => link.url);

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <link.icon size={16} />
          <span>{link.label}</span>
        </a>
      ))}
    </div>
  );
};

const sendAutomaticMessage = async (
  startup: SavedStartupType, 
  stage: PipelineStage,
  messageType: 'email' | 'whatsapp',
  template: string,
  subject: string,
  senderName: string,
  senderCompany: string
) => {
  // CRITICAL: Only send message if template is configured and not empty
  if (!template || template.trim() === '') {
    console.log(`No ${messageType} template configured for stage ${stage.name}, skipping automatic message`);
    return;
  }

  // Get the first contact or use startup data
  const contact = startup.startupData.contacts?.[0];
  const recipientName = contact?.name || startup.startupData.name;
  const recipientEmail = contact?.emails?.[0] || startup.startupData.email;
  const recipientPhone = contact?.phones?.[0];

  // For email, also check if we have a valid recipient email
  if (messageType === 'email' && (!recipientEmail || recipientEmail.trim() === '')) {
    console.log(`No recipient email available for startup ${startup.startupName}, skipping automatic email`);
    return;
  }

  // For WhatsApp, check if we have a valid recipient phone
  if (messageType === 'whatsapp' && (!recipientPhone || recipientPhone.trim() === '')) {
    console.log(`No recipient phone available for startup ${startup.startupName}, skipping automatic WhatsApp`);
    return;
  }

  // CRITICAL: Replace template variables with EXACT user-configured content
  // Do NOT modify the message content beyond variable replacement
  let processedMessage = template
    .replace(/\{\{startupName\}\}/g, startup.startupName)
    .replace(/\{\{senderName\}\}/g, senderName)
    .replace(/\{\{senderCompany\}\}/g, senderCompany)
    .replace(/\{\{recipientName\}\}/g, recipientName);

  let processedSubject = subject
    .replace(/\{\{startupName\}\}/g, startup.startupName)
    .replace(/\{\{senderName\}\}/g, senderName)
    .replace(/\{\{senderCompany\}\}/g, senderCompany)
    .replace(/\{\{recipientName\}\}/g, recipientName);

  try {
    if (messageType === 'email' && recipientEmail) {
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
                ${processedMessage}
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
            <p>Esta mensagem foi enviada automaticamente através da plataforma Gen.OI de inovação aberta.</p>
          </div>
        </body>
        </html>
      `;

      const emailPayload = {
        to: [{ 
          email: recipientEmail, 
          name: recipientName 
        }],
        from: { 
          email: 'contact@genoi.com.br', 
          name: 'Gen.OI - Inovação Aberta' 
        },
        subject: processedSubject,
        html: emailHtml,
        text: processedMessage,
        reply_to: { 
          email: 'contact@genoi.net', 
          name: 'Gen.OI - Suporte' 
        },
        tags: ['crm', 'automatic-message', stage.id],
        metadata: { 
          startupId: startup.id, 
          userId: startup.userId,
          stageId: stage.id,
          automatic: true,
          timestamp: new Date().toISOString()
        }
      };

      await addDoc(collection(db, 'emails'), emailPayload);

      // Save to CRM messages
      await addDoc(collection(db, 'crmMessages'), {
        startupId: startup.id,
        userId: startup.userId,
        senderName,
        recipientName,
        recipientEmail,
        recipientType: contact?.type || 'startup',
        messageType: 'email',
        subject: processedSubject,
        message: processedMessage,
        sentAt: new Date().toISOString(),
        status: 'sent',
        automatic: true,
        stageId: stage.id
      });

      console.log(`Automatic email sent for startup ${startup.startupName} moving to stage ${stage.name}`);

    } else if (messageType === 'whatsapp' && recipientPhone) {
      // Format phone for Evolution API
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

      const formattedPhone = formatPhoneForEvolution(recipientPhone);
      
      // Add footer to WhatsApp message - ONLY add footer, do not modify the user's message
      const finalWhatsAppMessage = processedMessage + `\n\nMensagem automática enviada pela genoi.net pelo cliente ${senderCompany} para a ${startup.startupName}`;
      
      const evolutionPayload = {
        number: formattedPhone,
        text: finalWhatsAppMessage
      };

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
        // Save to CRM messages
        await addDoc(collection(db, 'crmMessages'), {
          startupId: startup.id,
          userId: startup.userId,
          senderName,
          recipientName,
          recipientPhone: formattedPhone,
          recipientType: contact?.type || 'startup',
          messageType: 'whatsapp',
          message: finalWhatsAppMessage,
          sentAt: new Date().toISOString(),
          status: 'sent',
          automatic: true,
          stageId: stage.id
        });

        console.log(`Automatic WhatsApp sent for startup ${startup.startupName} moving to stage ${stage.name}`);
      } else {
        console.error(`Failed to send automatic WhatsApp for startup ${startup.startupName}:`, await evolutionResponse.text());
      }
    }
  } catch (error) {
    console.error(`Error sending automatic ${messageType} message for startup ${startup.startupName}:`, error);
  }
};

const DraggableStartupCard = ({ 
  startup, 
  onRemove,
  onClick
}: { 
  startup: SavedStartupType;
  onRemove: (id: string) => void;
  onClick: () => void;
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isRemoving) return;

    setIsRemoving(true);

    try {
      await deleteDoc(doc(db, 'selectedStartups', startup.id));
      onRemove(startup.id);
    } catch (error) {
      console.error('Error removing startup:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', startup.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleCardClick}
      className="bg-gray-700 rounded-lg p-3 mb-2 cursor-pointer hover:bg-gray-600 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <GripVertical size={16} className="text-gray-400 group-hover:text-gray-300" />
          <span className="text-white font-medium text-sm truncate">{startup.startupName}</span>
        </div>
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className={`p-1 rounded text-xs ${
            isRemoving
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
          }`}
        >
          {isRemoving ? '...' : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  );
};

const PipelineStage = ({ 
  stage, 
  startups, 
  onDrop, 
  onStartupClick,
  onRemoveStartup,
  onDeleteStage,
  onCustomizeMessage,
  canDeleteStage
}: { 
  stage: PipelineStage;
  startups: SavedStartupType[];
  onDrop: (startupId: string, newStage: string) => void;
  onStartupClick: (startupId: string) => void;
  onRemoveStartup: (id: string) => void;
  onDeleteStage: (stageId: string) => void;
  onCustomizeMessage: (stage: PipelineStage) => void;
  canDeleteStage: boolean;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const startupId = e.dataTransfer.getData('text/plain');
    if (startupId) {
      onDrop(startupId, stage.id);
    }
  };

  const handleDeleteStage = () => {
    if (startups.length > 0) {
      setShowDeleteConfirm(true);
    } else {
      onDeleteStage(stage.id);
    }
  };

  const confirmDeleteStage = () => {
    onDeleteStage(stage.id);
    setShowDeleteConfirm(false);
  };

  const hasTemplates = stage.emailTemplate || stage.whatsappTemplate;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-4 min-h-[300px] transition-all ${
        isDragOver 
          ? 'border-blue-400 bg-blue-900/20' 
          : 'border-gray-600 bg-gray-800/50'
      }`}
    >
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <h3 className={`font-bold text-lg px-3 py-1 rounded-full border ${stage.color} flex items-center gap-2`}>
            {stage.name}
            <span className="text-sm font-normal">({startups.length})</span>
          </h3>
          {canDeleteStage && (
            <button
              onClick={handleDeleteStage}
              className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-gray-700 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        
        {/* Desktop: Show button below stage name */}
        <div className="hidden lg:block">
          <button
            onClick={() => onCustomizeMessage(stage)}
            className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
            title="Personalizar mensagem automática"
          >
            <Edit size={12} />
            Personalizar mensagem
          </button>
        </div>
        
        {/* Mobile: Show button inline with stage name */}
        <div className="lg:hidden flex justify-end">
          <button
            onClick={() => onCustomizeMessage(stage)}
            className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
            title="Personalizar mensagem"
          >
            <Edit size={10} />
            Personalizar mensagem
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {startups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Plus size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Arraste startups aqui</p>
          </div>
        ) : (
          startups.map((startup) => (
            <DraggableStartupCard
              key={startup.id}
              startup={startup}
              onRemove={onRemoveStartup}
              onClick={() => onStartupClick(startup.id)}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-300 mb-6">
              Este estágio possui {startups.length} startup{startups.length !== 1 ? 's' : ''} mapeada{startups.length !== 1 ? 's' : ''}. 
              Ao excluir o estágio, você perderá essas startups do pipeline. Deseja continuar?
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmDeleteStage}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Sim, Excluir
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PipelineBoard = ({ 
  startups, 
  stages,
  onStageChange, 
  onStartupClick,
  onRemoveStartup,
  onDeleteStage,
  onCustomizeMessage
}: { 
  startups: SavedStartupType[];
  stages: PipelineStage[];
  onStageChange: (startupId: string, newStage: string) => void;
  onStartupClick: (startupId: string) => void;
  onRemoveStartup: (id: string) => void;
  onDeleteStage: (stageId: string) => void;
  onCustomizeMessage: (stage: PipelineStage) => void;
}) => {
  const handleDrop = async (startupId: string, newStage: string) => {
    try {
      const startup = startups.find(s => s.id === startupId);
      if (!startup) return;

      // Update startup stage in database
      await updateDoc(doc(db, 'selectedStartups', startupId), {
        stage: newStage,
        updatedAt: new Date().toISOString()
      });

      // Get user data for automatic messages
      const userDoc = await getDoc(doc(db, 'users', startup.userId));
      const userData = userDoc.data();
      const senderName = userData?.name || '';
      const senderCompany = userData?.company || '';

      // Find the new stage configuration
      const stageConfig = stages.find(s => s.id === newStage);
      if (stageConfig) {
        // CRITICAL: Only send automatic messages if templates are configured and not empty
        // Send messages EXACTLY as configured by the user, without any modifications
        if (stageConfig.emailTemplate && stageConfig.emailTemplate.trim() !== '') {
          console.log(`Sending automatic email for stage ${stageConfig.name} with EXACT user template`);
          await sendAutomaticMessage(
            startup,
            stageConfig,
            'email',
            stageConfig.emailTemplate, // Use EXACT template as configured by user
            stageConfig.emailSubject || `${senderCompany} - ${stageConfig.name}`,
            senderName,
            senderCompany
          );
        } else {
          console.log(`No email template configured for stage ${stageConfig.name}, skipping automatic email`);
        }

        if (stageConfig.whatsappTemplate && stageConfig.whatsappTemplate.trim() !== '') {
          console.log(`Sending automatic WhatsApp for stage ${stageConfig.name} with EXACT user template`);
          await sendAutomaticMessage(
            startup,
            stageConfig,
            'whatsapp',
            stageConfig.whatsappTemplate, // Use EXACT template as configured by user
            '',
            senderName,
            senderCompany
          );
        } else {
          console.log(`No WhatsApp template configured for stage ${stageConfig.name}, skipping automatic WhatsApp`);
        }
      }

      onStageChange(startupId, newStage);
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  return (
    <>
      {/* Mobile Layout - One stage per row */}
      <div className="grid grid-cols-1 gap-6 lg:hidden">
        {stages.map((stage) => {
          const stageStartups = startups.filter(startup => startup.stage === stage.id);
          
          return (
            <PipelineStage
              key={stage.id}
              stage={stage}
              startups={stageStartups}
              onDrop={handleDrop}
              onStartupClick={onStartupClick}
              onRemoveStartup={onRemoveStartup}
              onDeleteStage={onDeleteStage}
              onCustomizeMessage={onCustomizeMessage}
              canDeleteStage={stages.length > 1}
            />
          );
        })}
      </div>
      
      {/* Desktop Layout - Multiple columns */}
      <div className="hidden lg:grid gap-6" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
        {stages.map((stage) => {
          const stageStartups = startups.filter(startup => startup.stage === stage.id);
          
          return (
            <PipelineStage
              key={stage.id}
              stage={stage}
              startups={stageStartups}
              onDrop={handleDrop}
              onStartupClick={onStartupClick}
              onRemoveStartup={onRemoveStartup}
              onDeleteStage={onDeleteStage}
              onCustomizeMessage={onCustomizeMessage}
              canDeleteStage={stages.length > 1}
            />
          );
        })}
      </div>
    </>
  );
};

const StartupDetailCard = ({ startup }: { startup: StartupType }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white">{startup.name}</h2>
          <SocialLinks startup={startup} />
        </div>
        <StarRating rating={startup.rating} />
      </div>
      <p className="text-gray-400 mb-6">{startup.description}</p>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-300">
          <Calendar className="text-blue-400" size={16} />
          <span className="text-gray-400">Fundação:</span>
          {startup.foundedYear}
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Building2 className="text-purple-400" size={16} />
          <span className="text-gray-400">Categoria:</span>
          {startup.category}
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Box className="text-pink-400" size={16} />
          <span className="text-gray-400">Vertical:</span>
          {startup.vertical}
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <MapPin className="text-emerald-400" size={16} />
          <span className="text-gray-400">Localização:</span>
          {startup.city}
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Users className="text-blue-400" size={16} />
          <span className="text-gray-400">Tamanho da Equipe:</span>
          {startup.teamSize}
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Briefcase className="text-purple-400" size={16} />
          <span className="text-gray-400">Modelo de Negócio:</span>
          {startup.businessModel}
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Globe className="text-pink-400" size={16} />
          <span className="text-gray-400">Status IPO:</span>
          {startup.ipoStatus}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400">{startup.reasonForChoice}</p>
        </div>
      </div>
    </div>
  );
};

const SavedStartups = () => {
  const navigate = useNavigate();
  const [savedStartups, setSavedStartups] = useState<SavedStartupType[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<StartupType | null>(null);
  const [loading, setLoading] = useState(true);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(DEFAULT_STAGES);
  const [showStageManager, setShowStageManager] = useState(false);

  useEffect(() => {
    const fetchSavedStartups = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }

      try {
        const q = query(
          collection(db, 'selectedStartups'),
          where('userId', '==', auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const startups = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SavedStartupType[];
        
        // Sort in memory by updatedAt descending
        startups.sort((a, b) => new Date(b.updatedAt || b.selectedAt).getTime() - new Date(a.updatedAt || a.selectedAt).getTime());
        
        setSavedStartups(startups);
      } catch (error) {
        console.error('Error fetching saved startups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedStartups();
  }, [navigate]);

  const handleStartupClick = (startup: StartupType) => {
    setSelectedStartup(startup);
  };

  const handleStartupInteractionClick = (startupId: string) => {
    navigate(`/startup/${startupId}/timeline`);
  };

  const handleBack = () => {
    if (selectedStartup) {
      setSelectedStartup(null);
    } else {
      // Always navigate back to chat when in Pipeline CRM
      navigate('/');
    }
  };

  const handleRemoveStartup = (removedId: string) => {
    setSavedStartups(prev => prev.filter(startup => startup.id !== removedId));
  };

  const handleStageChange = (startupId: string, newStage: string) => {
    setSavedStartups(prev => prev.map(startup => 
      startup.id === startupId 
        ? { ...startup, stage: newStage, updatedAt: new Date().toISOString() }
        : startup
    ));
  };

  const handleStagesUpdate = (stages: PipelineStage[]) => {
    setPipelineStages(stages);
  };

  const handleDeleteStage = async (stageId: string) => {
    // Remove startups from deleted stage
    const startupsToRemove = savedStartups.filter(startup => startup.stage === stageId);
    
    try {
      // Delete startups from Firestore
      await Promise.all(
        startupsToRemove.map(startup => 
          deleteDoc(doc(db, 'selectedStartups', startup.id))
        )
      );

      // Update local state
      setSavedStartups(prev => prev.filter(startup => startup.stage !== stageId));
      
      // Update stages
      const updatedStages = pipelineStages.filter(stage => stage.id !== stageId);
      setPipelineStages(updatedStages);
    } catch (error) {
      console.error('Error deleting stage and startups:', error);
    }
  };

  const handleCustomizeMessage = (stage: PipelineStage) => {
    // Navigate to the stage manager with the specific stage selected for editing
    setShowStageManager(true);
  };

  // Calculate total startup count
  const totalStartupCount = savedStartups.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando pipeline...</div>
      </div>
    );
  }

  // Show startup detail card
  if (selectedStartup) {
    return (
      <div className="min-h-screen bg-black p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar para pipeline
          </button>

          <StartupDetailCard startup={selectedStartup} />
        </div>
      </div>
    );
  }

  // Show stage manager only
  if (showStageManager) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex flex-col p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowStageManager(false)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2 flex-1 ml-4">
              <Settings size={20} className="text-gray-400" />
              <h2 className="text-lg font-medium">Gerenciar Estágios</h2>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <PipelineStageManager onStagesUpdate={handleStagesUpdate} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex flex-col p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1 ml-4">
            <FolderOpen size={20} className="text-gray-400" />
            <h2 className="text-lg font-medium">Pipeline CRM</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{totalStartupCount} startup{totalStartupCount !== 1 ? 's' : ''}</span>
            <button
              onClick={() => setShowStageManager(true)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              <Settings size={16} />
              Gerenciar Estágios
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {totalStartupCount === 0 ? (
            <div className="text-center py-16">
              <FolderOpen size={64} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Pipeline vazio</h3>
              <p className="text-gray-400 mb-6">
                Você ainda não tem startups no seu pipeline. Explore as listas de startups e adicione suas favoritas.
              </p>
              <button
                onClick={() => navigate('/startups')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Explorar Startups
              </button>
            </div>
          ) : (
            <PipelineBoard
              startups={savedStartups}
              stages={pipelineStages}
              onStageChange={handleStageChange}
              onStartupClick={handleStartupInteractionClick}
              onRemoveStartup={handleRemoveStartup}
              onDeleteStage={handleDeleteStage}
              onCustomizeMessage={handleCustomizeMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedStartups;