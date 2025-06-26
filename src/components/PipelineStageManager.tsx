import { useState, useEffect } from 'react';
import { Edit2, Plus, Save, X, Trash2, GripVertical, MessageSquare, Mail, Smartphone, Settings } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  emailTemplate?: string;
  whatsappTemplate?: string;
}

interface PipelineStageManagerProps {
  onStagesUpdate: (stages: PipelineStage[]) => void;
}

const DEFAULT_STAGES: PipelineStage[] = [
  { 
    id: 'mapeada', 
    name: 'Mapeada', 
    color: 'bg-yellow-200 text-yellow-800 border-yellow-300', 
    order: 0,
    emailTemplate: '',
    whatsappTemplate: ''
  },
  { 
    id: 'selecionada', 
    name: 'Selecionada', 
    color: 'bg-blue-200 text-blue-800 border-blue-300', 
    order: 1,
    emailTemplate: 'Olá {{startupName}},\n\nEspero que esteja bem! Sou {{senderName}} da {{senderCompany}}.\n\nTemos acompanhado o trabalho da {{startupName}} e ficamos impressionados com a solução que vocês desenvolveram. Acreditamos que há uma grande sinergia entre nossos objetivos e gostaríamos de explorar possibilidades de colaboração.\n\nGostaria de agendar uma conversa para conhecermos melhor a {{startupName}} e apresentarmos nossa empresa e nossos desafios.\n\nFico no aguardo do seu retorno.\n\nAtenciosamente,\n{{senderName}}',
    whatsappTemplate: 'Olá! Sou {{senderName}} da {{senderCompany}}. Ficamos impressionados com a solução da {{startupName}} e gostaríamos de explorar uma possível colaboração. Podemos agendar uma conversa? 🚀'
  },
  { 
    id: 'contatada', 
    name: 'Contatada', 
    color: 'bg-red-200 text-red-800 border-red-300', 
    order: 2,
    emailTemplate: 'Olá {{startupName}},\n\nObrigado pelo retorno! Fico feliz em saber do interesse em nossa proposta de colaboração.\n\nPara darmos continuidade, gostaria de agendar uma reunião para:\n- Apresentarmos nossa empresa e nossos desafios\n- Conhecermos melhor a solução da {{startupName}}\n- Discutirmos possibilidades de parceria\n\nTeria disponibilidade para uma conversa na próxima semana?\n\nAguardo seu retorno.\n\nAtenciosamente,\n{{senderName}}',
    whatsappTemplate: 'Ótimo! Que tal agendarmos uma reunião para apresentarmos nossos desafios e conhecermos melhor a solução da {{startupName}}? Teria disponibilidade na próxima semana? 📅'
  },
  { 
    id: 'entrevistada', 
    name: 'Entrevistada', 
    color: 'bg-green-200 text-green-800 border-green-300', 
    order: 3,
    emailTemplate: 'Olá {{startupName}},\n\nFoi um prazer conhecer melhor a equipe e a solução da {{startupName}} em nossa reunião.\n\nFicamos muito empolgados com as possibilidades de colaboração e gostaríamos de avançar para a próxima etapa: desenvolvimento de um Proof of Concept (POC).\n\nVamos preparar um briefing detalhado com os requisitos e objetivos do POC. Em breve entraremos em contato com mais informações.\n\nObrigado pelo tempo e dedicação!\n\nAtenciosamente,\n{{senderName}}',
    whatsappTemplate: 'Excelente reunião! Ficamos empolgados com a {{startupName}} e queremos avançar para um POC. Em breve enviaremos o briefing detalhado. Obrigado! 🎯'
  },
  { 
    id: 'poc', 
    name: 'POC', 
    color: 'bg-orange-200 text-orange-800 border-orange-300', 
    order: 4,
    emailTemplate: 'Olá {{startupName}},\n\nParabéns! Chegamos à etapa de Proof of Concept.\n\nSegue em anexo o briefing detalhado com:\n- Objetivos do POC\n- Requisitos técnicos\n- Cronograma proposto\n- Critérios de avaliação\n\nEstamos ansiosos para ver a solução da {{startupName}} em ação e avaliar como podemos integrar essa inovação em nossos processos.\n\nQualquer dúvida, estou à disposição.\n\nVamos inovar juntos!\n\n{{senderName}}',
    whatsappTemplate: 'Parabéns {{startupName}}! 🎉 Chegamos ao POC! Enviamos o briefing detalhado por email. Estamos ansiosos para ver a solução em ação! Vamos inovar juntos! 💡'
  }
];

const COLOR_OPTIONS = [
  { value: 'bg-yellow-200 text-yellow-800 border-yellow-300', label: 'Amarelo' },
  { value: 'bg-blue-200 text-blue-800 border-blue-300', label: 'Azul' },
  { value: 'bg-red-200 text-red-800 border-red-300', label: 'Vermelho' },
  { value: 'bg-green-200 text-green-800 border-green-300', label: 'Verde' },
  { value: 'bg-orange-200 text-orange-800 border-orange-300', label: 'Laranja' },
  { value: 'bg-purple-200 text-purple-800 border-purple-300', label: 'Roxo' },
  { value: 'bg-pink-200 text-pink-800 border-pink-300', label: 'Rosa' },
  { value: 'bg-indigo-200 text-indigo-800 border-indigo-300', label: 'Índigo' },
  { value: 'bg-gray-200 text-gray-800 border-gray-300', label: 'Cinza' }
];

const MessageTemplateModal = ({ 
  stage, 
  onSave, 
  onClose 
}: { 
  stage: PipelineStage; 
  onSave: (stage: PipelineStage) => void; 
  onClose: () => void; 
}) => {
  const [emailTemplate, setEmailTemplate] = useState(stage.emailTemplate || '');
  const [whatsappTemplate, setWhatsappTemplate] = useState(stage.whatsappTemplate || '');

  const handleSave = () => {
    onSave({
      ...stage,
      emailTemplate,
      whatsappTemplate
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            Configurar Mensagens - {stage.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Variables Help */}
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
            <h4 className="text-blue-200 font-medium mb-2">Variáveis Disponíveis:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-300">
              <span>{{startupName}} - Nome da startup</span>
              <span>{{senderName}} - Seu nome</span>
              <span>{{senderCompany}} - Sua empresa</span>
              <span>{{recipientName}} - Nome do contato</span>
            </div>
          </div>

          {/* Email Template */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mail size={20} className="text-blue-400" />
              <label className="text-lg font-medium text-white">Modelo de Email</label>
            </div>
            <textarea
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Digite o modelo de email para esta etapa..."
            />
          </div>

          {/* WhatsApp Template */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone size={20} className="text-green-400" />
              <label className="text-lg font-medium text-white">Modelo de WhatsApp</label>
            </div>
            <textarea
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Digite o modelo de WhatsApp para esta etapa..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save size={16} />
              Salvar Modelos
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DraggableStageItem = ({ 
  stage, 
  editingStage, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete, 
  onConfigureMessages,
  canDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver
}: {
  stage: PipelineStage;
  editingStage: PipelineStage | null;
  onEdit: (stage: PipelineStage) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (stageId: string) => void;
  onConfigureMessages: (stage: PipelineStage) => void;
  canDelete: boolean;
  onDragStart: (e: React.DragEvent, stage: PipelineStage) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetStage: PipelineStage) => void;
  isDragOver: boolean;
}) => {
  const isEditing = editingStage?.id === stage.id;

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, stage);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(e, stage);
  };

  const getColorPreview = (colorClass: string) => {
    const bgColor = colorClass.split(' ')[0].replace('bg-', '');
    return `bg-${bgColor}`;
  };

  const hasTemplates = stage.emailTemplate || stage.whatsappTemplate;

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`bg-gray-700 rounded-lg p-4 transition-all ${
        isDragOver ? 'border-2 border-blue-400 bg-blue-900/20' : 'border-2 border-transparent'
      } ${!isEditing ? 'cursor-move' : ''}`}
    >
      {isEditing ? (
        // Edit Form
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <input
            type="text"
            value={editingStage.name}
            onChange={(e) => onEdit({ ...editingStage, name: e.target.value })}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={editingStage.color}
            onChange={(e) => onEdit({ ...editingStage, color: e.target.value })}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {COLOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save size={16} />
              Salvar
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        // Display Stage
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <GripVertical size={20} className="text-gray-400 hover:text-gray-300" />
            <span className={`px-3 py-1 rounded-full border font-medium ${stage.color}`}>
              {stage.name}
            </span>
            <div className={`w-6 h-6 rounded-full ${getColorPreview(stage.color)}`} />
            <span className="text-sm text-gray-400">Ordem: {stage.order + 1}</span>
            {hasTemplates && (
              <div className="flex items-center gap-1">
                {stage.emailTemplate && <Mail size={14} className="text-blue-400" />}
                {stage.whatsappTemplate && <Smartphone size={14} className="text-green-400" />}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onConfigureMessages(stage)}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
              title="Configurar mensagens automáticas"
            >
              <MessageSquare size={16} />
            </button>
            <button
              onClick={() => onEdit(stage)}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Edit2 size={16} />
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(stage.id)}
                className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PipelineStageManager = ({ onStagesUpdate }: PipelineStageManagerProps) => {
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_STAGES);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [showAddStage, setShowAddStage] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState<PipelineStage | null>(null);
  const [newStage, setNewStage] = useState<Partial<PipelineStage>>({
    name: '',
    color: COLOR_OPTIONS[0].value,
    emailTemplate: '',
    whatsappTemplate: ''
  });
  const [draggedStage, setDraggedStage] = useState<PipelineStage | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  useEffect(() => {
    const loadStages = async () => {
      if (!auth.currentUser) return;

      try {
        const stagesDoc = await getDoc(doc(db, 'pipelineStages', auth.currentUser.uid));
        if (stagesDoc.exists()) {
          const userStages = stagesDoc.data().stages as PipelineStage[];
          // Sort stages by order
          const sortedStages = userStages.sort((a, b) => a.order - b.order);
          setStages(sortedStages);
          onStagesUpdate(sortedStages);
        } else {
          onStagesUpdate(DEFAULT_STAGES);
        }
      } catch (error) {
        console.error('Error loading stages:', error);
        onStagesUpdate(DEFAULT_STAGES);
      }
    };

    loadStages();
  }, [onStagesUpdate]);

  const saveStages = async (updatedStages: PipelineStage[]) => {
    if (!auth.currentUser) return;

    try {
      // Ensure stages have correct order values
      const stagesWithOrder = updatedStages.map((stage, index) => ({
        ...stage,
        order: index
      }));

      await setDoc(doc(db, 'pipelineStages', auth.currentUser.uid), {
        stages: stagesWithOrder,
        updatedAt: new Date().toISOString()
      });
      setStages(stagesWithOrder);
      onStagesUpdate(stagesWithOrder);
    } catch (error) {
      console.error('Error saving stages:', error);
    }
  };

  const handleEditStage = async () => {
    if (!editingStage) return;

    const updatedStages = stages.map(stage =>
      stage.id === editingStage.id ? editingStage : stage
    );
    
    await saveStages(updatedStages);
    setEditingStage(null);
  };

  const handleAddStage = async () => {
    if (!newStage.name) return;

    const stageToAdd: PipelineStage = {
      id: Date.now().toString(),
      name: newStage.name,
      color: newStage.color || COLOR_OPTIONS[0].value,
      order: stages.length,
      emailTemplate: newStage.emailTemplate || '',
      whatsappTemplate: newStage.whatsappTemplate || ''
    };

    const updatedStages = [...stages, stageToAdd];
    await saveStages(updatedStages);
    
    setNewStage({ 
      name: '', 
      color: COLOR_OPTIONS[0].value,
      emailTemplate: '',
      whatsappTemplate: ''
    });
    setShowAddStage(false);
  };

  const handleDeleteStage = async (stageId: string) => {
    if (stages.length <= 1) return; // Don't allow deleting the last stage
    
    const updatedStages = stages.filter(stage => stage.id !== stageId);
    await saveStages(updatedStages);
  };

  const handleConfigureMessages = (stage: PipelineStage) => {
    setShowMessageModal(stage);
  };

  const handleSaveMessageTemplates = async (updatedStage: PipelineStage) => {
    const updatedStages = stages.map(stage =>
      stage.id === updatedStage.id ? updatedStage : stage
    );
    
    await saveStages(updatedStages);
  };

  const handleDragStart = (e: React.DragEvent, stage: PipelineStage) => {
    setDraggedStage(stage);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    
    if (!draggedStage || draggedStage.id === targetStage.id) {
      setDraggedStage(null);
      setDragOverStage(null);
      return;
    }

    const draggedIndex = stages.findIndex(s => s.id === draggedStage.id);
    const targetIndex = stages.findIndex(s => s.id === targetStage.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedStage(null);
      setDragOverStage(null);
      return;
    }

    // Create new array with reordered stages
    const newStages = [...stages];
    const [removed] = newStages.splice(draggedIndex, 1);
    newStages.splice(targetIndex, 0, removed);

    // Update order values
    const reorderedStages = newStages.map((stage, index) => ({
      ...stage,
      order: index
    }));

    await saveStages(reorderedStages);
    setDraggedStage(null);
    setDragOverStage(null);
  };

  const handleStageEdit = (stage: PipelineStage) => {
    setEditingStage({ ...stage });
  };

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Gerenciar Estágios do Pipeline</h3>
          <button
            onClick={() => setShowAddStage(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            Novo Estágio
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
          <p className="text-blue-200 text-sm mb-2">
            💡 <strong>Dica:</strong> Arraste os estágios usando o ícone <GripVertical size={16} className="inline mx-1" /> para reordenar a sequência do pipeline.
          </p>
          <p className="text-blue-200 text-sm">
            📧 Use o ícone <MessageSquare size={16} className="inline mx-1" /> para configurar mensagens automáticas que serão enviadas quando uma startup for movida para o estágio.
          </p>
        </div>

        {/* Add New Stage Form */}
        {showAddStage && (
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="text-white font-medium mb-4">Novo Estágio</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nome do estágio *"
                value={newStage.name}
                onChange={(e) => setNewStage(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newStage.color}
                onChange={(e) => setNewStage(prev => ({ ...prev, color: e.target.value }))}
                className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COLOR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddStage}
                disabled={!newStage.name}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Save size={16} />
                Salvar
              </button>
              <button
                onClick={() => {
                  setShowAddStage(false);
                  setNewStage({ 
                    name: '', 
                    color: COLOR_OPTIONS[0].value,
                    emailTemplate: '',
                    whatsappTemplate: ''
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Stages List */}
        <div className="space-y-4">
          {sortedStages.map((stage) => (
            <DraggableStageItem
              key={stage.id}
              stage={stage}
              editingStage={editingStage}
              onEdit={handleStageEdit}
              onSave={handleEditStage}
              onCancel={() => setEditingStage(null)}
              onDelete={handleDeleteStage}
              onConfigureMessages={handleConfigureMessages}
              canDelete={stages.length > 1}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragOver={dragOverStage === stage.id}
            />
          ))}
        </div>

        {sortedStages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhum estágio configurado</p>
          </div>
        )}
      </div>

      {/* Message Template Modal */}
      {showMessageModal && (
        <MessageTemplateModal
          stage={showMessageModal}
          onSave={handleSaveMessageTemplates}
          onClose={() => setShowMessageModal(null)}
        />
      )}
    </>
  );
};

export default PipelineStageManager;