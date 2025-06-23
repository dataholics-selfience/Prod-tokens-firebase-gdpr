export interface Translations {
  // Navigation and Layout
  newChallenge: string;
  pipelineCRM: string;
  challenges: string;
  logout: string;
  profile: string;
  plans: string;
  
  // Authentication
  login: string;
  register: string;
  email: string;
  password: string;
  name: string;
  cpf: string;
  company: string;
  phone: string;
  forgotPassword: string;
  createAccount: string;
  alreadyHaveAccount: string;
  acceptTerms: string;
  verifyEmail: string;
  resendVerification: string;
  backToLogin: string;
  
  // Challenge Creation
  challengeTitle: string;
  challengeDescription: string;
  businessArea: string;
  createChallenge: string;
  
  // Chat Interface
  typeMessage: string;
  selectChallenge: string;
  loading: string;
  
  // Startup List
  startups: string;
  selectStartup: string;
  selected: string;
  saving: string;
  matchScore: string;
  founded: string;
  category: string;
  vertical: string;
  location: string;
  teamSize: string;
  businessModel: string;
  ipoStatus: string;
  website: string;
  linkedin: string;
  facebook: string;
  twitter: string;
  instagram: string;
  
  // Pipeline CRM
  mapped: string;
  selected: string;
  contacted: string;
  interviewed: string;
  poc: string;
  emptyPipeline: string;
  exploreStartups: string;
  manageStages: string;
  
  // Contact Management
  contactManagement: string;
  contacts: string;
  addContact: string;
  newContact: string;
  editContact: string;
  deleteContact: string;
  contactName: string;
  contactRole: string;
  emails: string;
  phones: string;
  addEmail: string;
  addPhone: string;
  save: string;
  cancel: string;
  startup: string;
  founder: string;
  
  // Message Composer
  newMessage: string;
  composeMessage: string;
  recipient: string;
  subject: string;
  message: string;
  sendEmail: string;
  sendWhatsApp: string;
  sending: string;
  
  // Timeline
  interactionTimeline: string;
  noInteractions: string;
  firstMessage: string;
  sendFirstMessage: string;
  response: string;
  responseReceived: string;
  
  // Plans
  choosePlan: string;
  currentPlan: string;
  startNow: string;
  initialPlan: string;
  tokens: string;
  free: string;
  mostPopular: string;
  securePayment: string;
  
  // Profile
  updateProfile: string;
  resetPassword: string;
  deleteAccount: string;
  dangerZone: string;
  confirmDeletion: string;
  typeDelete: string;
  
  // Common
  back: string;
  next: string;
  continue: string;
  confirm: string;
  yes: string;
  no: string;
  close: string;
  open: string;
  edit: string;
  delete: string;
  add: string;
  remove: string;
  search: string;
  filter: string;
  sort: string;
  
  // Messages
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // Email Templates
  emailSubjectPrefix: string;
  emailFooterCompany: string;
  emailFooterDescription: string;
  emailFooterWebsite: string;
  emailFooterContact: string;
  emailFooterDisclaimer: string;
  
  // Language
  language: string;
  portuguese: string;
  english: string;
  french: string;
  german: string;
  italian: string;
}

export const translations: Record<string, Translations> = {
  pt: {
    // Navigation and Layout
    newChallenge: 'Novo desafio',
    pipelineCRM: 'Pipeline CRM',
    challenges: 'Desafios',
    logout: 'Sair',
    profile: 'Perfil',
    plans: 'Planos',
    
    // Authentication
    login: 'Login',
    register: 'Criar Conta',
    email: 'Email',
    password: 'Senha',
    name: 'Nome completo',
    cpf: 'CPF',
    company: 'Empresa',
    phone: 'Celular',
    forgotPassword: 'Esqueceu a senha?',
    createAccount: 'CRIAR CONTA',
    alreadyHaveAccount: 'Já tem uma conta? Faça login',
    acceptTerms: 'Li e aceito os termos de uso',
    verifyEmail: 'Verifique seu Email',
    resendVerification: 'Reenviar email de verificação',
    backToLogin: 'Voltar para o Login',
    
    // Challenge Creation
    challengeTitle: 'Título do Desafio',
    challengeDescription: 'Descrição do Desafio',
    businessArea: 'Área de atuação da empresa',
    createChallenge: 'Criar Desafio',
    
    // Chat Interface
    typeMessage: 'Digite uma mensagem...',
    selectChallenge: 'Selecione um desafio para começar',
    loading: 'Carregando...',
    
    // Startup List
    startups: 'Startups',
    selectStartup: 'Selecionar startup',
    selected: 'Selecionada',
    saving: 'Salvando...',
    matchScore: 'Match Score',
    founded: 'Fundação',
    category: 'Categoria',
    vertical: 'Vertical',
    location: 'Localização',
    teamSize: 'Tamanho da Equipe',
    businessModel: 'Modelo de Negócio',
    ipoStatus: 'Status IPO',
    website: 'Website',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
    
    // Pipeline CRM
    mapped: 'Mapeada',
    contacted: 'Contatada',
    interviewed: 'Entrevistada',
    poc: 'POC',
    emptyPipeline: 'Pipeline vazio',
    exploreStartups: 'Explorar Startups',
    manageStages: 'Gerenciar Estágios',
    
    // Contact Management
    contactManagement: 'Gestão de Contatos',
    contacts: 'Contatos',
    addContact: 'Adicionar Contato',
    newContact: 'Novo Contato',
    editContact: 'Editar Contato',
    deleteContact: 'Remover Contato',
    contactName: 'Nome',
    contactRole: 'Cargo/Função',
    emails: 'Emails',
    phones: 'Telefones/WhatsApp',
    addEmail: 'Adicionar outro email',
    addPhone: 'Adicionar outro telefone',
    save: 'Salvar',
    cancel: 'Cancelar',
    startup: 'Startup',
    founder: 'Fundador',
    
    // Message Composer
    newMessage: 'Nova Mensagem',
    composeMessage: 'Compor Mensagem',
    recipient: 'Destinatário',
    subject: 'Assunto',
    message: 'Mensagem',
    sendEmail: 'Enviar Email',
    sendWhatsApp: 'Enviar WhatsApp',
    sending: 'Enviando...',
    
    // Timeline
    interactionTimeline: 'Timeline de Interações',
    noInteractions: 'Nenhuma interação ainda',
    firstMessage: 'Comece a interação com esta startup enviando sua primeira mensagem',
    sendFirstMessage: 'Enviar Primeira Mensagem',
    response: 'Resposta',
    responseReceived: 'Resposta recebida',
    
    // Plans
    choosePlan: 'Escolha seu plano',
    currentPlan: 'Plano atual',
    startNow: 'Começar agora',
    initialPlan: 'Plano inicial',
    tokens: 'tokens',
    free: 'Grátis',
    mostPopular: 'Mais popular',
    securePayment: 'Pagamento Seguro SSL',
    
    // Profile
    updateProfile: 'Atualizar Perfil',
    resetPassword: 'Redefinir Senha',
    deleteAccount: 'Apagar conta',
    dangerZone: 'Zona de Perigo',
    confirmDeletion: 'Confirmar Deleção',
    typeDelete: 'Digite DELETAR',
    
    // Common
    back: 'Voltar',
    next: 'Próximo',
    continue: 'Continuar',
    confirm: 'Confirmar',
    yes: 'Sim',
    no: 'Não',
    close: 'Fechar',
    open: 'Abrir',
    edit: 'Editar',
    delete: 'Deletar',
    add: 'Adicionar',
    remove: 'Remover',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    
    // Messages
    success: 'Sucesso',
    error: 'Erro',
    warning: 'Aviso',
    info: 'Informação',
    
    // Email Templates
    emailSubjectPrefix: 'A {company} deseja contatar a {startup} - ',
    emailFooterCompany: 'Gen.OI',
    emailFooterDescription: 'Conectando empresas às melhores startups do mundo',
    emailFooterWebsite: 'genoi.net',
    emailFooterContact: 'contact@genoi.net',
    emailFooterDisclaimer: 'Esta mensagem foi enviada através da plataforma Gen.OI de inovação aberta.',
    
    // Language
    language: 'Idioma',
    portuguese: 'Português',
    english: 'Inglês',
    french: 'Francês',
    german: 'Alemão',
    italian: 'Italiano',
  },
  
  en: {
    // Navigation and Layout
    newChallenge: 'New challenge',
    pipelineCRM: 'Pipeline CRM',
    challenges: 'Challenges',
    logout: 'Logout',
    profile: 'Profile',
    plans: 'Plans',
    
    // Authentication
    login: 'Login',
    register: 'Create Account',
    email: 'Email',
    password: 'Password',
    name: 'Full name',
    cpf: 'Tax ID',
    company: 'Company',
    phone: 'Phone',
    forgotPassword: 'Forgot password?',
    createAccount: 'CREATE ACCOUNT',
    alreadyHaveAccount: 'Already have an account? Sign in',
    acceptTerms: 'I have read and accept the terms of use',
    verifyEmail: 'Verify your Email',
    resendVerification: 'Resend verification email',
    backToLogin: 'Back to Login',
    
    // Challenge Creation
    challengeTitle: 'Challenge Title',
    challengeDescription: 'Challenge Description',
    businessArea: 'Company business area',
    createChallenge: 'Create Challenge',
    
    // Chat Interface
    typeMessage: 'Type a message...',
    selectChallenge: 'Select a challenge to start',
    loading: 'Loading...',
    
    // Startup List
    startups: 'Startups',
    selectStartup: 'Select startup',
    selected: 'Selected',
    saving: 'Saving...',
    matchScore: 'Match Score',
    founded: 'Founded',
    category: 'Category',
    vertical: 'Vertical',
    location: 'Location',
    teamSize: 'Team Size',
    businessModel: 'Business Model',
    ipoStatus: 'IPO Status',
    website: 'Website',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
    
    // Pipeline CRM
    mapped: 'Mapped',
    contacted: 'Contacted',
    interviewed: 'Interviewed',
    poc: 'POC',
    emptyPipeline: 'Empty pipeline',
    exploreStartups: 'Explore Startups',
    manageStages: 'Manage Stages',
    
    // Contact Management
    contactManagement: 'Contact Management',
    contacts: 'Contacts',
    addContact: 'Add Contact',
    newContact: 'New Contact',
    editContact: 'Edit Contact',
    deleteContact: 'Delete Contact',
    contactName: 'Name',
    contactRole: 'Role/Position',
    emails: 'Emails',
    phones: 'Phones/WhatsApp',
    addEmail: 'Add another email',
    addPhone: 'Add another phone',
    save: 'Save',
    cancel: 'Cancel',
    startup: 'Startup',
    founder: 'Founder',
    
    // Message Composer
    newMessage: 'New Message',
    composeMessage: 'Compose Message',
    recipient: 'Recipient',
    subject: 'Subject',
    message: 'Message',
    sendEmail: 'Send Email',
    sendWhatsApp: 'Send WhatsApp',
    sending: 'Sending...',
    
    // Timeline
    interactionTimeline: 'Interaction Timeline',
    noInteractions: 'No interactions yet',
    firstMessage: 'Start interacting with this startup by sending your first message',
    sendFirstMessage: 'Send First Message',
    response: 'Response',
    responseReceived: 'Response received',
    
    // Plans
    choosePlan: 'Choose your plan',
    currentPlan: 'Current plan',
    startNow: 'Start now',
    initialPlan: 'Initial plan',
    tokens: 'tokens',
    free: 'Free',
    mostPopular: 'Most popular',
    securePayment: 'Secure SSL Payment',
    
    // Profile
    updateProfile: 'Update Profile',
    resetPassword: 'Reset Password',
    deleteAccount: 'Delete account',
    dangerZone: 'Danger Zone',
    confirmDeletion: 'Confirm Deletion',
    typeDelete: 'Type DELETE',
    
    // Common
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    open: 'Open',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    remove: 'Remove',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    
    // Messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    
    // Email Templates
    emailSubjectPrefix: '{company} wants to contact {startup} - ',
    emailFooterCompany: 'Gen.OI',
    emailFooterDescription: 'Connecting companies to the world\'s best startups',
    emailFooterWebsite: 'genoi.net',
    emailFooterContact: 'contact@genoi.net',
    emailFooterDisclaimer: 'This message was sent through the Gen.OI open innovation platform.',
    
    // Language
    language: 'Language',
    portuguese: 'Portuguese',
    english: 'English',
    french: 'French',
    german: 'German',
    italian: 'Italian',
  },
  
  fr: {
    // Navigation and Layout
    newChallenge: 'Nouveau défi',
    pipelineCRM: 'Pipeline CRM',
    challenges: 'Défis',
    logout: 'Déconnexion',
    profile: 'Profil',
    plans: 'Plans',
    
    // Authentication
    login: 'Connexion',
    register: 'Créer un compte',
    email: 'Email',
    password: 'Mot de passe',
    name: 'Nom complet',
    cpf: 'ID fiscal',
    company: 'Entreprise',
    phone: 'Téléphone',
    forgotPassword: 'Mot de passe oublié?',
    createAccount: 'CRÉER UN COMPTE',
    alreadyHaveAccount: 'Vous avez déjà un compte? Connectez-vous',
    acceptTerms: 'J\'ai lu et j\'accepte les conditions d\'utilisation',
    verifyEmail: 'Vérifiez votre email',
    resendVerification: 'Renvoyer l\'email de vérification',
    backToLogin: 'Retour à la connexion',
    
    // Challenge Creation
    challengeTitle: 'Titre du défi',
    challengeDescription: 'Description du défi',
    businessArea: 'Secteur d\'activité de l\'entreprise',
    createChallenge: 'Créer un défi',
    
    // Chat Interface
    typeMessage: 'Tapez un message...',
    selectChallenge: 'Sélectionnez un défi pour commencer',
    loading: 'Chargement...',
    
    // Startup List
    startups: 'Startups',
    selectStartup: 'Sélectionner startup',
    selected: 'Sélectionnée',
    saving: 'Sauvegarde...',
    matchScore: 'Score de correspondance',
    founded: 'Fondée',
    category: 'Catégorie',
    vertical: 'Vertical',
    location: 'Localisation',
    teamSize: 'Taille de l\'équipe',
    businessModel: 'Modèle d\'affaires',
    ipoStatus: 'Statut IPO',
    website: 'Site web',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
    
    // Pipeline CRM
    mapped: 'Cartographiée',
    contacted: 'Contactée',
    interviewed: 'Interviewée',
    poc: 'POC',
    emptyPipeline: 'Pipeline vide',
    exploreStartups: 'Explorer les startups',
    manageStages: 'Gérer les étapes',
    
    // Contact Management
    contactManagement: 'Gestion des contacts',
    contacts: 'Contacts',
    addContact: 'Ajouter un contact',
    newContact: 'Nouveau contact',
    editContact: 'Modifier le contact',
    deleteContact: 'Supprimer le contact',
    contactName: 'Nom',
    contactRole: 'Rôle/Poste',
    emails: 'Emails',
    phones: 'Téléphones/WhatsApp',
    addEmail: 'Ajouter un autre email',
    addPhone: 'Ajouter un autre téléphone',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    startup: 'Startup',
    founder: 'Fondateur',
    
    // Message Composer
    newMessage: 'Nouveau message',
    composeMessage: 'Composer un message',
    recipient: 'Destinataire',
    subject: 'Sujet',
    message: 'Message',
    sendEmail: 'Envoyer un email',
    sendWhatsApp: 'Envoyer WhatsApp',
    sending: 'Envoi...',
    
    // Timeline
    interactionTimeline: 'Chronologie des interactions',
    noInteractions: 'Aucune interaction encore',
    firstMessage: 'Commencez à interagir avec cette startup en envoyant votre premier message',
    sendFirstMessage: 'Envoyer le premier message',
    response: 'Réponse',
    responseReceived: 'Réponse reçue',
    
    // Plans
    choosePlan: 'Choisissez votre plan',
    currentPlan: 'Plan actuel',
    startNow: 'Commencer maintenant',
    initialPlan: 'Plan initial',
    tokens: 'jetons',
    free: 'Gratuit',
    mostPopular: 'Le plus populaire',
    securePayment: 'Paiement sécurisé SSL',
    
    // Profile
    updateProfile: 'Mettre à jour le profil',
    resetPassword: 'Réinitialiser le mot de passe',
    deleteAccount: 'Supprimer le compte',
    dangerZone: 'Zone de danger',
    confirmDeletion: 'Confirmer la suppression',
    typeDelete: 'Tapez SUPPRIMER',
    
    // Common
    back: 'Retour',
    next: 'Suivant',
    continue: 'Continuer',
    confirm: 'Confirmer',
    yes: 'Oui',
    no: 'Non',
    close: 'Fermer',
    open: 'Ouvrir',
    edit: 'Modifier',
    delete: 'Supprimer',
    add: 'Ajouter',
    remove: 'Retirer',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    
    // Messages
    success: 'Succès',
    error: 'Erreur',
    warning: 'Avertissement',
    info: 'Information',
    
    // Email Templates
    emailSubjectPrefix: '{company} souhaite contacter {startup} - ',
    emailFooterCompany: 'Gen.OI',
    emailFooterDescription: 'Connecter les entreprises aux meilleures startups du monde',
    emailFooterWebsite: 'genoi.net',
    emailFooterContact: 'contact@genoi.net',
    emailFooterDisclaimer: 'Ce message a été envoyé via la plateforme d\'innovation ouverte Gen.OI.',
    
    // Language
    language: 'Langue',
    portuguese: 'Portugais',
    english: 'Anglais',
    french: 'Français',
    german: 'Allemand',
    italian: 'Italien',
  },
  
  de: {
    // Navigation and Layout
    newChallenge: 'Neue Herausforderung',
    pipelineCRM: 'Pipeline CRM',
    challenges: 'Herausforderungen',
    logout: 'Abmelden',
    profile: 'Profil',
    plans: 'Pläne',
    
    // Authentication
    login: 'Anmelden',
    register: 'Konto erstellen',
    email: 'E-Mail',
    password: 'Passwort',
    name: 'Vollständiger Name',
    cpf: 'Steuer-ID',
    company: 'Unternehmen',
    phone: 'Telefon',
    forgotPassword: 'Passwort vergessen?',
    createAccount: 'KONTO ERSTELLEN',
    alreadyHaveAccount: 'Haben Sie bereits ein Konto? Anmelden',
    acceptTerms: 'Ich habe die Nutzungsbedingungen gelesen und akzeptiert',
    verifyEmail: 'E-Mail verifizieren',
    resendVerification: 'Bestätigungs-E-Mail erneut senden',
    backToLogin: 'Zurück zur Anmeldung',
    
    // Challenge Creation
    challengeTitle: 'Herausforderungstitel',
    challengeDescription: 'Herausforderungsbeschreibung',
    businessArea: 'Geschäftsbereich des Unternehmens',
    createChallenge: 'Herausforderung erstellen',
    
    // Chat Interface
    typeMessage: 'Nachricht eingeben...',
    selectChallenge: 'Wählen Sie eine Herausforderung zum Starten',
    loading: 'Laden...',
    
    // Startup List
    startups: 'Startups',
    selectStartup: 'Startup auswählen',
    selected: 'Ausgewählt',
    saving: 'Speichern...',
    matchScore: 'Match-Score',
    founded: 'Gegründet',
    category: 'Kategorie',
    vertical: 'Vertikal',
    location: 'Standort',
    teamSize: 'Teamgröße',
    businessModel: 'Geschäftsmodell',
    ipoStatus: 'IPO-Status',
    website: 'Website',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
    
    // Pipeline CRM
    mapped: 'Kartiert',
    contacted: 'Kontaktiert',
    interviewed: 'Interviewt',
    poc: 'POC',
    emptyPipeline: 'Leere Pipeline',
    exploreStartups: 'Startups erkunden',
    manageStages: 'Phasen verwalten',
    
    // Contact Management
    contactManagement: 'Kontaktverwaltung',
    contacts: 'Kontakte',
    addContact: 'Kontakt hinzufügen',
    newContact: 'Neuer Kontakt',
    editContact: 'Kontakt bearbeiten',
    deleteContact: 'Kontakt löschen',
    contactName: 'Name',
    contactRole: 'Rolle/Position',
    emails: 'E-Mails',
    phones: 'Telefone/WhatsApp',
    addEmail: 'Weitere E-Mail hinzufügen',
    addPhone: 'Weiteres Telefon hinzufügen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    startup: 'Startup',
    founder: 'Gründer',
    
    // Message Composer
    newMessage: 'Neue Nachricht',
    composeMessage: 'Nachricht verfassen',
    recipient: 'Empfänger',
    subject: 'Betreff',
    message: 'Nachricht',
    sendEmail: 'E-Mail senden',
    sendWhatsApp: 'WhatsApp senden',
    sending: 'Senden...',
    
    // Timeline
    interactionTimeline: 'Interaktions-Timeline',
    noInteractions: 'Noch keine Interaktionen',
    firstMessage: 'Beginnen Sie die Interaktion mit diesem Startup, indem Sie Ihre erste Nachricht senden',
    sendFirstMessage: 'Erste Nachricht senden',
    response: 'Antwort',
    responseReceived: 'Antwort erhalten',
    
    // Plans
    choosePlan: 'Wählen Sie Ihren Plan',
    currentPlan: 'Aktueller Plan',
    startNow: 'Jetzt starten',
    initialPlan: 'Anfangsplan',
    tokens: 'Token',
    free: 'Kostenlos',
    mostPopular: 'Am beliebtesten',
    securePayment: 'Sichere SSL-Zahlung',
    
    // Profile
    updateProfile: 'Profil aktualisieren',
    resetPassword: 'Passwort zurücksetzen',
    deleteAccount: 'Konto löschen',
    dangerZone: 'Gefahrenzone',
    confirmDeletion: 'Löschung bestätigen',
    typeDelete: 'LÖSCHEN eingeben',
    
    // Common
    back: 'Zurück',
    next: 'Weiter',
    continue: 'Fortfahren',
    confirm: 'Bestätigen',
    yes: 'Ja',
    no: 'Nein',
    close: 'Schließen',
    open: 'Öffnen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    add: 'Hinzufügen',
    remove: 'Entfernen',
    search: 'Suchen',
    filter: 'Filtern',
    sort: 'Sortieren',
    
    // Messages
    success: 'Erfolg',
    error: 'Fehler',
    warning: 'Warnung',
    info: 'Information',
    
    // Email Templates
    emailSubjectPrefix: '{company} möchte {startup} kontaktieren - ',
    emailFooterCompany: 'Gen.OI',
    emailFooterDescription: 'Unternehmen mit den besten Startups der Welt verbinden',
    emailFooterWebsite: 'genoi.net',
    emailFooterContact: 'contact@genoi.net',
    emailFooterDisclaimer: 'Diese Nachricht wurde über die Gen.OI Open Innovation Plattform gesendet.',
    
    // Language
    language: 'Sprache',
    portuguese: 'Portugiesisch',
    english: 'Englisch',
    french: 'Französisch',
    german: 'Deutsch',
    italian: 'Italienisch',
  },
  
  it: {
    // Navigation and Layout
    newChallenge: 'Nuova sfida',
    pipelineCRM: 'Pipeline CRM',
    challenges: 'Sfide',
    logout: 'Disconnetti',
    profile: 'Profilo',
    plans: 'Piani',
    
    // Authentication
    login: 'Accedi',
    register: 'Crea account',
    email: 'Email',
    password: 'Password',
    name: 'Nome completo',
    cpf: 'ID fiscale',
    company: 'Azienda',
    phone: 'Telefono',
    forgotPassword: 'Password dimenticata?',
    createAccount: 'CREA ACCOUNT',
    alreadyHaveAccount: 'Hai già un account? Accedi',
    acceptTerms: 'Ho letto e accetto i termini di utilizzo',
    verifyEmail: 'Verifica la tua email',
    resendVerification: 'Invia nuovamente email di verifica',
    backToLogin: 'Torna al login',
    
    // Challenge Creation
    challengeTitle: 'Titolo della sfida',
    challengeDescription: 'Descrizione della sfida',
    businessArea: 'Area di business dell\'azienda',
    createChallenge: 'Crea sfida',
    
    // Chat Interface
    typeMessage: 'Digita un messaggio...',
    selectChallenge: 'Seleziona una sfida per iniziare',
    loading: 'Caricamento...',
    
    // Startup List
    startups: 'Startup',
    selectStartup: 'Seleziona startup',
    selected: 'Selezionata',
    saving: 'Salvando...',
    matchScore: 'Punteggio di corrispondenza',
    founded: 'Fondata',
    category: 'Categoria',
    vertical: 'Verticale',
    location: 'Posizione',
    teamSize: 'Dimensione del team',
    businessModel: 'Modello di business',
    ipoStatus: 'Stato IPO',
    website: 'Sito web',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
    
    // Pipeline CRM
    mapped: 'Mappata',
    contacted: 'Contattata',
    interviewed: 'Intervistata',
    poc: 'POC',
    emptyPipeline: 'Pipeline vuota',
    exploreStartups: 'Esplora startup',
    manageStages: 'Gestisci fasi',
    
    // Contact Management
    contactManagement: 'Gestione contatti',
    contacts: 'Contatti',
    addContact: 'Aggiungi contatto',
    newContact: 'Nuovo contatto',
    editContact: 'Modifica contatto',
    deleteContact: 'Elimina contatto',
    contactName: 'Nome',
    contactRole: 'Ruolo/Posizione',
    emails: 'Email',
    phones: 'Telefoni/WhatsApp',
    addEmail: 'Aggiungi un\'altra email',
    addPhone: 'Aggiungi un altro telefono',
    save: 'Salva',
    cancel: 'Annulla',
    startup: 'Startup',
    founder: 'Fondatore',
    
    // Message Composer
    newMessage: 'Nuovo messaggio',
    composeMessage: 'Componi messaggio',
    recipient: 'Destinatario',
    subject: 'Oggetto',
    message: 'Messaggio',
    sendEmail: 'Invia email',
    sendWhatsApp: 'Invia WhatsApp',
    sending: 'Invio...',
    
    // Timeline
    interactionTimeline: 'Timeline delle interazioni',
    noInteractions: 'Nessuna interazione ancora',
    firstMessage: 'Inizia a interagire con questa startup inviando il tuo primo messaggio',
    sendFirstMessage: 'Invia primo messaggio',
    response: 'Risposta',
    responseReceived: 'Risposta ricevuta',
    
    // Plans
    choosePlan: 'Scegli il tuo piano',
    currentPlan: 'Piano attuale',
    startNow: 'Inizia ora',
    initialPlan: 'Piano iniziale',
    tokens: 'token',
    free: 'Gratuito',
    mostPopular: 'Più popolare',
    securePayment: 'Pagamento sicuro SSL',
    
    // Profile
    updateProfile: 'Aggiorna profilo',
    resetPassword: 'Reimposta password',
    deleteAccount: 'Elimina account',
    dangerZone: 'Zona di pericolo',
    confirmDeletion: 'Conferma eliminazione',
    typeDelete: 'Digita ELIMINA',
    
    // Common
    back: 'Indietro',
    next: 'Avanti',
    continue: 'Continua',
    confirm: 'Conferma',
    yes: 'Sì',
    no: 'No',
    close: 'Chiudi',
    open: 'Apri',
    edit: 'Modifica',
    delete: 'Elimina',
    add: 'Aggiungi',
    remove: 'Rimuovi',
    search: 'Cerca',
    filter: 'Filtra',
    sort: 'Ordina',
    
    // Messages
    success: 'Successo',
    error: 'Errore',
    warning: 'Avviso',
    info: 'Informazione',
    
    // Email Templates
    emailSubjectPrefix: '{company} vuole contattare {startup} - ',
    emailFooterCompany: 'Gen.OI',
    emailFooterDescription: 'Collegare le aziende alle migliori startup del mondo',
    emailFooterWebsite: 'genoi.net',
    emailFooterContact: 'contact@genoi.net',
    emailFooterDisclaimer: 'Questo messaggio è stato inviato tramite la piattaforma di innovazione aperta Gen.OI.',
    
    // Language
    language: 'Lingua',
    portuguese: 'Portoghese',
    english: 'Inglese',
    french: 'Francese',
    german: 'Tedesco',
    italian: 'Italiano',
  },
};

// Language detection based on IP geolocation
export const detectLanguageFromIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data.country_code?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      'br': 'pt',
      'pt': 'pt',
      'us': 'en',
      'gb': 'en',
      'ca': 'en',
      'au': 'en',
      'nz': 'en',
      'ie': 'en',
      'za': 'en',
      'fr': 'fr',
      'be': 'fr',
      'ch': 'fr',
      'mc': 'fr',
      'de': 'de',
      'at': 'de',
      'it': 'it',
      'sm': 'it',
      'va': 'it',
    };
    
    return languageMap[countryCode] || 'en'; // Default to English
  } catch (error) {
    console.error('Error detecting language from IP:', error);
    return 'en'; // Default to English on error
  }
};

// Get browser language as fallback
export const getBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = ['pt', 'en', 'fr', 'de', 'it'];
  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
};

// Initialize language
export const initializeLanguage = async (): Promise<string> => {
  // Check if user has a saved language preference
  const savedLanguage = localStorage.getItem('genoi-language');
  if (savedLanguage && translations[savedLanguage]) {
    return savedLanguage;
  }
  
  // Try to detect from IP
  try {
    const detectedLanguage = await detectLanguageFromIP();
    if (translations[detectedLanguage]) {
      localStorage.setItem('genoi-language', detectedLanguage);
      return detectedLanguage;
    }
  } catch (error) {
    console.error('IP language detection failed:', error);
  }
  
  // Fallback to browser language
  const browserLanguage = getBrowserLanguage();
  localStorage.setItem('genoi-language', browserLanguage);
  return browserLanguage;
};

// Set language
export const setLanguage = (language: string): void => {
  if (translations[language]) {
    localStorage.setItem('genoi-language', language);
    window.location.reload(); // Reload to apply new language
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return localStorage.getItem('genoi-language') || 'en';
};

// Get translations for current language
export const getTranslations = (language?: string): Translations => {
  const currentLang = language || getCurrentLanguage();
  return translations[currentLang] || translations.en;
};

// Translation hook
export const useTranslation = () => {
  const currentLanguage = getCurrentLanguage();
  const t = getTranslations(currentLanguage);
  
  return {
    t,
    language: currentLanguage,
    setLanguage,
    availableLanguages: Object.keys(translations),
  };
};