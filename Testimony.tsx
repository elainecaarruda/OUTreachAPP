
import React, { useState, useEffect } from 'react';
import { 
  User, Heart, MessageSquare, Sparkles, 
  FileText, Upload, Save, Loader2, CheckCircle,
  Mic, Wand2, AlertCircle, X, ChevronRight, Plus, Filter, Calendar, ArrowLeft, Users, Globe, Phone,
  ChevronLeft, BarChart3, LayoutGrid, Star, StopCircle
} from 'lucide-react';
import { useAuth } from '../App';
import { MOCK_TESTIMONIES } from '../mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useGemini } from '../hooks/useGemini';
import { TranslatableText } from '../components/TranslatableText';
import { ImproveWithAI } from '../components/ImproveWithAI';
import { TranslationKey } from '../i18n';

// --- Constants ---

const TEAMS_MOCK = [
  { id: '1', team_name: 'Equipa Alpha', team_leader: 'João Silva' },
  { id: '2', team_name: 'Dunamis Fire', team_leader: 'Ana Beatriz' },
  { id: '3', team_name: 'Base Lisboa', team_leader: 'Pedro Santos' }
];

const PROFILE_OPTIONS = ['Homem', 'Mulher', 'Família', 'Jovem', 'Idoso', 'Criança'];

const RELIGION_OPTIONS = [
  'Catolicismo', 'Protestantismo/Evangélico', 'Islamismo', 'Judaísmo', 
  'Hinduísmo', 'Ateísmo / Agnosticismo', 'Outras'
];

const EMOTIONAL_STATES = [
  'Sozinho(a)', 'Chorando', 'Fumando / usando drogas', 'Em prostituição',
  'Casal homoafetivo', 'Em conflito familiar', 'Doente / debilitado(a)',
  'Desempregado(a) / sem renda', 'Ansioso(a) / estressado(a)',
  'Triste / desanimado(a)', 'Buscando ajuda espiritual', 'Aguardando / esperando alguém'
];

const INITIAL_ACTIONS = [
  'Deus destacou / palavra de conhecimento', 'Veio até mim / me abordou',
  'Parecia triste ou chorando', 'Parecia perdida / sozinha',
  'Durante caça ao tesouro / atividade da equipe', 'Parecia aberta para conversar',
  'Atraída por algo que eu falava / estava fazendo', 'Parecia confusa / ansiosa',
  'Em necessidade visível', 'Sinal ou direção do Espírito',
  'Pregando em público'
];

const EVENT_OPTIONS = [
  'Chorou', 'Sorriu', 'Ficou em paz', 'Sentiu leveza',
  'Sentiu presença de Deus', 'Recebeu cura física', 'Recebeu cura emocional',
  'Recebeu libertação', 'Manifestou demônio', 'Se emocionou',
  'Tremeu', 'Suspirou fundo', 'Mudou a expressão', 'Agradeceu muito',
  'Ficou quieto(a), mas tocado(a)', 'Pediu um abraço', 'Abraçou espontaneamente',
  'Pediu uma Bíblia', 'Pediu oração extra', 'Quis continuar conversando'
];

const DECISION_OPTIONS = [
  { label: 'Aceitou Jesus', emoji: '❤️' },
  { label: 'Milagre', emoji: '✨' },
  { label: 'Cura física', emoji: '💚' },
  { label: 'Foi batizado', emoji: '💧' },
  { label: 'Quis visitar a igreja', emoji: '⛪' },
  { label: 'Se reconciliou com Deus', emoji: '🙏' },
  { label: 'Recebeu o Espírito Santo', emoji: '🕊️' },
  { label: 'Cura emocional', emoji: '💙' },
  { label: 'Aceitou uma Bíblia', emoji: '📖' },
  { label: 'Pediu uma ligação depois', emoji: '📞' },
  { label: 'Pediu discipulado', emoji: '📚' },
  { label: 'Decidiu perdoar alguém', emoji: '🤝' },
  { label: 'Se comprometeu a mudar algo', emoji: '🌟' },
  { label: 'Quis participar de célula / grupo', emoji: '👥' }
];

// Helper for feed icons
const DECISION_ICONS: Record<string, string> = DECISION_OPTIONS.reduce((acc, curr) => ({...acc, [curr.label]: curr.emoji}), {});

// --- Generic Components ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }: any) => {
  const baseStyle = "px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border active:scale-95 duration-200";
  const variants: any = {
    primary: "bg-slate-900 text-white border-transparent hover:bg-slate-800 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none",
    outline: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50",
    ghost: "border-transparent text-slate-600 hover:bg-slate-100 disabled:opacity-50",
    secondary: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 disabled:opacity-50"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};
const Card = ({ children, className = '' }: any) => <div className={`bg-white shadow-sm rounded-2xl border border-slate-100 ${className}`}>{children}</div>;
const Label = ({ children, required, className = '' }: any) => <label className={`block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ${className}`}>{children} {required && <span className="text-red-500">*</span>}</label>;
const Input = (props: any) => <input {...props} className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all text-sm font-medium ${props.className}`} />;
const Textarea = (props: any) => <textarea {...props} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 focus:bg-white min-h-[120px] transition-all resize-y text-sm font-medium" />;


export const Testimony = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // New Transcription Hooks
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const { isProcessing, transcribeAudio, improveText, generateTestimonySummary } = useGemini();
  // State to track which field is currently recording
  const [activeRecordingField, setActiveRecordingField] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('personal');
  const [viewMode, setViewMode] = useState<'form' | 'feed'>('feed');
  const [feedTab, setFeedTab] = useState<'highlights' | 'wall' | 'stats'>('highlights');
  
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  // Filters State
  const [filters, setFilters] = useState({
    team: '',
    decision: '',
    sort: 'newest'
  });

  // Form State
  const [formData, setFormData] = useState({
    team_id: '', 
    testimony_title: '', 
    date: new Date().toISOString().split('T')[0],
    people_profiles: [] as any[], 
    emotional_states: [] as string[], 
    initial_actions: [] as string[],
    initial_context: '', 
    events_during: [] as string[], 
    during_approach: '',
    testimony_witnessed: '', 
    final_summary: '', 
    has_media: 'Sim',
    photos_urls: [],
    videos_urls: []
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Helper functions ---
  
  const addPersonProfile = (type: string) => {
    const newPerson = { 
      id: Date.now(), 
      profile_type: type, 
      name: '', 
      nationality: '', 
      living_in_europe: false, 
      never_heard_jesus: false, 
      religion: '', 
      phone: '', 
      email: '', 
      instagram: '', 
      decisions: [] as string[] 
    };
    setFormData(prev => ({ ...prev, people_profiles: [...prev.people_profiles, newPerson] }));
  };

  const updatePerson = (id: number, field: string, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      people_profiles: prev.people_profiles.map(p => p.id === id ? { ...p, [field]: value } : p) 
    }));
  };

  const removePerson = (id: number) => {
    setFormData(prev => ({ ...prev, people_profiles: prev.people_profiles.filter(p => p.id !== id) }));
  };

  const toggleDecision = (personId: number, decision: string) => {
    setFormData(prev => ({ 
      ...prev, 
      people_profiles: prev.people_profiles.map(p => { 
        if (p.id === personId) { 
          const current = p.decisions || []; 
          const newDecisions = current.includes(decision) 
            ? current.filter((d: string) => d !== decision) 
            : [...current, decision]; 
          return { ...p, decisions: newDecisions }; 
        } 
        return p; 
      }) 
    }));
  };

  const toggleArrayItem = (field: 'emotional_states' | 'initial_actions' | 'events_during', item: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };
  
  const handleSaveProgress = () => { 
    setLoading(true); 
    setTimeout(() => { 
      setLoading(false); 
      showToast("Progresso salvo com sucesso!"); 
    }, 800); 
  };
  
  // Transcription Logic
  const handleTranscription = async (field: 'initial_context' | 'during_approach' | 'testimony_witnessed') => {
    if (isRecording) {
      // Stop if recording on the same field
      if (activeRecordingField === field) {
        try {
          const blob = await stopRecording();
          setActiveRecordingField(null);
          const text = await transcribeAudio(blob);
          if (text) {
            setFormData(prev => ({ 
              ...prev, 
              [field]: prev[field] ? prev[field] + '\n' + text : text 
            }));
            showToast("Áudio transcrito com sucesso!");
          }
        } catch (e) {
          console.error(e);
          showToast("Erro na transcrição.");
          setActiveRecordingField(null);
        }
      }
    } else {
      // Start recording
      try {
        await startRecording();
        setActiveRecordingField(field);
      } catch (e) {
        console.error(e);
        showToast("Erro ao acessar microfone.");
      }
    }
  };

  const handleAICorrection = async (field: 'initial_context' | 'during_approach' | 'testimony_witnessed') => { 
    const currentText = formData[field];
    if (!currentText) return;

    setAiProcessing(field); 
    try {
      const improved = await improveText(currentText, language);
      setFormData(prev => ({ ...prev, [field]: improved }));
      showToast("Texto melhorado pela IA!");
    } catch (e) {
      showToast("Erro ao processar IA.");
    } finally {
      setAiProcessing('');
    }
  };

  const handleImproveWithAI = (field: 'initial_context' | 'during_approach' | 'testimony_witnessed', improvedText: string) => {
    setFormData(prev => ({ ...prev, [field]: improvedText }));
    showToast("Texto aceito e aplicado!");
  };

  const handleGenerateSummary = async () => { 
    setAiProcessing('final_summary');
    try {
      const team = TEAMS_MOCK.find(t => t.id === formData.team_id)?.team_name;
      const summary = await generateTestimonySummary(formData, team);
      if (summary) {
        setFormData(prev => ({ ...prev, final_summary: summary }));
        showToast("Resumo gerado com sucesso!");
      } else {
        showToast("Não foi possível gerar o resumo.");
      }
    } catch (e) {
      showToast("Erro ao gerar resumo.");
    } finally {
      setAiProcessing('');
    }
  };

  const handleFinalSave = () => { 
    if (!formData.team_id || !formData.testimony_title) {
      showToast("Preencha Equipe e Título antes de salvar.");
      return;
    }
    setLoading(true); 
    setTimeout(() => { 
      setLoading(false); 
      setShowSuccess(true); 
    }, 2000); 
  };

  // --- Statistics Calculation ---
  const stats = {
    gender: {
      Homem: 0,
      Mulher: 0,
      Família: 0,
      Jovem: 0,
      Idoso: 0,
      Criança: 0
    },
    nationalities: new Map<string, number>(),
    impact: {
      salvations: 0,
      physicalHealings: 0,
      emotionalHealings: 0,
      bibles: 0,
      baptisms: 0,
      discipleship: 0,
      calls: 0
    }
  };

  MOCK_TESTIMONIES.forEach(t => {
    t.profiles?.forEach(p => {
      if (stats.gender[p.type as keyof typeof stats.gender] !== undefined) {
        stats.gender[p.type as keyof typeof stats.gender]++;
      }
      if (p.nationality) {
        stats.nationalities.set(p.nationality, (stats.nationalities.get(p.nationality) || 0) + 1);
      }
    });

    t.decisions.forEach(d => {
      if (d === 'Aceitou Jesus' || d === 'Se reconciliou com Deus') stats.impact.salvations++;
      if (d === 'Cura física' || d === 'Milagre') stats.impact.physicalHealings++;
      if (d === 'Cura emocional') stats.impact.emotionalHealings++;
      if (d === 'Aceitou uma Bíblia') stats.impact.bibles++;
      if (d === 'Foi batizado' || d === 'Recebeu o Espírito Santo') stats.impact.baptisms++;
      if (d === 'Pediu discipulado' || d === 'Quis participar de célula / grupo' || d === 'Quis visitar a igreja') stats.impact.discipleship++;
      if (d === 'Pediu uma ligação depois') stats.impact.calls++;
    });
  });

  // Reset form when entering form mode
  useEffect(() => {
    if (viewMode === 'form') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [viewMode]);

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 bg-slate-50/50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center space-y-8 border border-slate-100"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('save_success_title' as TranslationKey)}</h2>
            <p className="text-slate-500">{t('save_success_message' as TranslationKey)}</p>
          </div>
          <Button onClick={() => { setShowSuccess(false); setFormData({ team_id: '', testimony_title: '', date: new Date().toISOString().split('T')[0], people_profiles: [], emotional_states: [], initial_actions: [], initial_context: '', events_during: [], during_approach: '', testimony_witnessed: '', final_summary: '', has_media: 'Sim', photos_urls: [], videos_urls: [] }); setActiveTab('personal'); setViewMode('feed'); }} className="w-full py-4 text-lg">
            {t('btn_back')}
          </Button>
        </motion.div>
      </div>
    );
  }

  // --- Render Feed View (Mural) ---
  const renderFeedView = () => {
    // Data processing
    const featuredTestimonies = MOCK_TESTIMONIES.filter(t => t.highlight || t.decisions.includes('Milagre'));
    
    const filteredFeed = MOCK_TESTIMONIES.filter(post => {
      if (filters.team && post.teamId !== filters.team) return false;
      if (filters.decision && !post.decisions.includes(filters.decision)) return false;
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return filters.sort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const feedTabs = [
      { id: 'highlights', labelKey: 'feed_tab_highlights', icon: Star },
      { id: 'wall', labelKey: 'feed_tab_wall', icon: LayoutGrid },
      { id: 'stats', labelKey: 'feed_tab_stats', icon: BarChart3 },
    ];

    return (
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-purple-200">
                <Sparkles className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-900">{t('testimony_feed_title_short')}</h1>
                <p className="text-xs font-medium text-slate-500">{t('testimony_feed_subtitle' as TranslationKey)}</p>
             </div>
          </div>
          
          {(user?.role === 'admin' || user?.role === 'leader' || user?.role === 'evangelist') && (
            <Button onClick={() => setViewMode('form')} className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 py-3 px-6 rounded-xl shadow-lg">
              <Plus className="w-5 h-5" /> {t('testimony_btn_new')}
            </Button>
          )}
        </div>

        {/* Feed Tabs Navigation */}
        <div className="flex justify-center">
           <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
              {feedTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFeedTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    feedTab === tab.id 
                      ? 'bg-slate-100 text-slate-900 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon size={18} className={feedTab === tab.id ? 'stroke-[2.5px]' : ''} />
                  <span className="hidden sm:inline">{t(tab.labelKey as TranslationKey)}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* HIGHLIGHTS TAB */}
            {feedTab === 'highlights' && (
              <motion.div 
                key="highlights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredTestimonies.map((post, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      key={post.id} 
                      className="bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 rounded-[2rem] border border-amber-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                           <span className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-700 border border-amber-200 shadow-sm flex items-center gap-1">
                             <Star size={12} className="fill-amber-500 text-amber-500"/> {t('feed_highlight_tag' as TranslationKey)}
                           </span>
                           <span className="text-xs font-bold text-amber-900/40">{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        
                        <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight tracking-tight group-hover:text-amber-800 transition-colors">
                          <TranslatableText text={post.title || "Sem Título"} />
                        </h3>
                        
                        <div className="text-slate-600 text-lg font-medium leading-relaxed mb-8 line-clamp-4">
                          <TranslatableText text={`"${post.summary}"`} />
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-8">
                           {post.decisions.map(d => (
                             <span key={d} className="text-xs font-bold px-3 py-1.5 bg-white rounded-lg border border-amber-100 text-amber-900 flex items-center gap-1.5 shadow-sm">
                               {DECISION_ICONS[d]} {d}
                             </span>
                           ))}
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-amber-200/30">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                             {post.author.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">{post.author}</p>
                              <p className="text--[10px] uppercase font-bold text-amber-700/60">{t('feed_label_author' as TranslationKey)}</p>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STATS TAB */}
            {feedTab === 'stats' && (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <Card className="p-8 border-l-4 border-l-blue-500">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-8 flex items-center gap-2">
                    <Users className="w-4 h-4" /> {t('stats_reached_people' as TranslationKey)}
                  </h3>
                  <div className="grid grid-cols-2 gap-y-8 gap-x-4 text-center">
                    {Object.entries(stats.gender).map(([key, value]) => (
                      value > 0 && (
                        <div key={key} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                          <span className="text-3xl font-black text-slate-800">{value}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">{key}s</span>
                        </div>
                      )
                    ))}
                  </div>
                </Card>

                <Card className="p-8 border-l-4 border-l-purple-500">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-8 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> {t('stats_nationalities' as TranslationKey)} ({stats.nationalities.size})
                  </h3>
                  <div className="flex flex-wrap gap-3 content-start">
                    {Array.from(stats.nationalities).map(([nat, count]) => (
                      <span key={nat} className="px-4 py-2 bg-white text-slate-700 rounded-xl text-sm font-bold border border-slate-200 flex items-center gap-2 shadow-sm">
                        {nat} <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-xs">{count}</span>
                      </span>
                    ))}
                    {stats.nationalities.size === 0 && <span className="text-sm text-slate-400 italic">{t('stats_no_data' as TranslationKey)}</span>}
                  </div>
                </Card>

                <Card className="p-8 border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50/30">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-8 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Impacto do Reino
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-sm font-medium text-slate-600 flex items-center gap-2">❤️ Salvações</span> 
                      <span className="font-black text-xl text-slate-900">{stats.impact.salvations}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-sm font-medium text-slate-600 flex items-center gap-2">💚 Curas Físicas</span> 
                      <span className="font-black text-xl text-slate-900">{stats.impact.physicalHealings}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-sm font-medium text-slate-600 flex items-center gap-2">💙 Curas Emocionais</span> 
                      <span className="font-black text-xl text-slate-900">{stats.impact.emotionalHealings}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-sm font-medium text-slate-600 flex items-center gap-2">💧 Batismos</span> 
                      <span className="font-black text-xl text-slate-900">{stats.impact.baptisms}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* WALL (FEED) TAB */}
            {feedTab === 'wall' && (
              <motion.div 
                key="wall"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Filter Toolbar */}
                <div className="bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-2 items-center sticky top-20 z-20">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-2">
                    <Filter className="w-4 h-4" />
                  </div>
                  
                  <select 
                    value={filters.team} 
                    onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
                    className="px-4 py-2.5 rounded-xl border-none bg-slate-50 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-100 hover:bg-slate-100 transition-colors w-full md:w-auto cursor-pointer outline-none"
                  >
                    <option value="">{t('testimony_filter_team')}</option>
                    {TEAMS_MOCK.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                  </select>
        
                  <select 
                    value={filters.decision} 
                    onChange={(e) => setFilters(prev => ({ ...prev, decision: e.target.value }))}
                    className="px-4 py-2.5 rounded-xl border-none bg-slate-50 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-100 hover:bg-slate-100 transition-colors w-full md:w-auto cursor-pointer outline-none"
                  >
                    <option value="">{t('testimony_filter_decision')}</option>
                    {Object.keys(DECISION_ICONS).map(d => <option key={d} value={d}>{DECISION_ICONS[d]} {d}</option>)}
                  </select>
        
                  <div className="flex-1"></div>
        
                  <div className="flex items-center gap-2 w-full md:w-auto border-l border-slate-100 pl-2">
                     <select 
                      value={filters.sort} 
                      onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border-none bg-transparent text-sm font-bold text-slate-600 hover:text-indigo-600 cursor-pointer outline-none text-right"
                    >
                      <option value="newest">{t('testimony_sort_newest')}</option>
                      <option value="oldest">{t('testimony_sort_oldest')}</option>
                    </select>
                  </div>
                </div>

                {/* List */}
                <div className="grid gap-6">
                  {filteredFeed.length === 0 ? (
                    <div className="text-center py-24 text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="font-medium">Nenhum testemunho encontrado com estes filtros.</p>
                    </div>
                  ) : (
                    filteredFeed.map((post, index) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={post.id} 
                        className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                              {post.author.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 transition-colors">
                                <TranslatableText text={post.title || "Sem Título"} />
                              </h3>
                              <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                                <span className="font-semibold text-slate-700">{post.author}</span> 
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 
                                {new Date(post.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                             {post.profiles?.map((p, idx) => (
                               <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold rounded-lg border border-slate-200">{p.type}</span>
                             ))}
                             {post.profiles?.some(p => p.nationality) && (
                               <span className="px-2.5 py-1 bg-white text-slate-600 font-semibold rounded-lg border border-slate-200 flex items-center gap-1 shadow-sm">
                                 <Globe className="w-3 h-3" /> {post.profiles[0].nationality}
                               </span>
                             )}
                          </div>
                        </div>
                        
                        <div className="pl-0 sm:pl-16">
                          <div className="text-slate-700 mb-6 whitespace-pre-line leading-relaxed">
                            <TranslatableText text={post.summary} />
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {post.decisions.map(d => (
                              <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-default group-hover:border-indigo-100">
                                <span>{DECISION_ICONS[d] || '✨'}</span>
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    );
  };

  // --- Render Form View ---
  
  const renderTabContent = () => {
     switch(activeTab) {
       case 'personal': return (
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-20">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Left Column: Basics */}
             <div className="lg:col-span-1 space-y-6">
               <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-500"/> {t('testimony_label_team')} & {t('testimony_label_date')}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label required>{t('testimony_label_team')}</Label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        value={formData.team_id}
                        onChange={(e) => setFormData({...formData, team_id: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        {TEAMS_MOCK.map(t => (
                          <option key={t.id} value={t.id}>{t.team_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label required>{t('testimony_label_date')}</Label>
                      <Input type="date" value={formData.date} onChange={(e: any) => setFormData({...formData, date: e.target.value})} />
                    </div>
                  </div>
               </Card>
               <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500"/> {t('btn_details')}</h3>
                  <div>
                    <Label required>{t('testimony_label_title')}</Label>
                    <Input 
                      placeholder="Ex: Encontro na praça" 
                      value={formData.testimony_title} 
                      onChange={(e: any) => setFormData({...formData, testimony_title: e.target.value})}
                    />
                  </div>
               </Card>
             </div>

             {/* Right Column: People */}
             <div className="lg:col-span-2 space-y-6">
               <div className="flex justify-between items-end px-1">
                  <Label required className="mb-0">{t('testimony_who_impacted')}</Label>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{formData.people_profiles.length} pessoa(s)</span>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                  {PROFILE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => addPersonProfile(opt)}
                      className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all bg-white shadow-sm active:scale-95 group"
                    >
                      <Plus size={20} className="text-slate-300 group-hover:text-indigo-500" /> 
                      <span className="font-bold text-xs uppercase tracking-wide">{opt}</span>
                    </button>
                  ))}
                </div>

                {/* People List */}
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {formData.people_profiles.map((person, idx) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={person.id} 
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-shadow"
                      >
                        <div className="absolute top-4 right-4 flex gap-2">
                           <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wider">{person.profile_type}</span>
                           <button onClick={() => removePerson(person.id)} className="p-1 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"><X size={16}/></button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-md">{idx + 1}</div>
                            <h4 className="font-bold text-slate-900">{t('testimony_person_data')}</h4>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div><Label>{t('testimony_name_opt')}</Label><Input placeholder="Nome..." value={person.name} onChange={(e: any) => updatePerson(person.id, 'name', e.target.value)} /></div>
                              <div><Label>{t('testimony_nationality')}</Label><Input placeholder="País..." value={person.nationality} onChange={(e: any) => updatePerson(person.id, 'nationality', e.target.value)} /></div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${person.living_in_europe ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <input type="checkbox" className="hidden" checked={person.living_in_europe || false} onChange={(e) => updatePerson(person.id, 'living_in_europe', e.target.checked)} />
                                {person.living_in_europe ? <CheckCircle size={16}/> : <div className="w-4 h-4 rounded-full border-2 border-slate-300"/>}
                                <span className="text-sm font-bold">{t('testimony_live_europe')}</span>
                              </label>
                              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${person.never_heard_jesus ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <input type="checkbox" className="hidden" checked={person.never_heard_jesus || false} onChange={(e) => updatePerson(person.id, 'never_heard_jesus', e.target.checked)} />
                                {person.never_heard_jesus ? <CheckCircle size={16}/> : <div className="w-4 h-4 rounded-full border-2 border-slate-300"/>}
                                <span className="text-sm font-bold">{t('testimony_never_heard')}</span>
                              </label>
                            </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {formData.people_profiles.length === 0 && (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">{t('testimony_select_profile_hint')}</p>
                    </div>
                  )}
                </div>
             </div>
           </div>
           <div className="flex justify-end pt-6 border-t border-slate-200">
              <Button onClick={handleSaveProgress} variant="ghost" className="text-slate-400 hover:text-indigo-600"><Save size={16} /> {t('btn_save')} Rascunho</Button>
           </div>
         </motion.div>
       );

       case 'profile': return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-20 max-w-4xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <Label className="text-sm">{t('testimony_emotional_state')}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {EMOTIONAL_STATES.map(state => (
                      <label key={state} className={`flex flex-col items-center justify-center p-4 rounded-2xl border cursor-pointer transition-all text-center h-24 relative overflow-hidden ${formData.emotional_states.includes(state) ? 'bg-slate-800 border-slate-800 text-white shadow-lg transform scale-[1.02]' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:shadow-md'}`}>
                        <input type="checkbox" className="hidden" checked={formData.emotional_states.includes(state)} onChange={() => toggleArrayItem('emotional_states', state)} />
                        {formData.emotional_states.includes(state) && <div className="absolute top-2 right-2"><CheckCircle size={16} className="text-green-400" /></div>}
                        <span className="text-xs font-bold leading-tight">{state}</span>
                      </label>
                    ))}
                  </div>
               </div>

               <div className="space-y-6">
                  <Label className="text-sm">{t('testimony_initial_action')}</Label>
                  <div className="space-y-3">
                    {INITIAL_ACTIONS.map(action => (
                      <div key={action} onClick={() => toggleArrayItem('initial_actions', action)} className={`px-5 py-4 rounded-2xl text-sm cursor-pointer transition-all border flex items-center justify-between group ${formData.initial_actions.includes(action) ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-md transform scale-[1.02]' : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-300 hover:shadow-sm'}`}>
                        {action}
                        {formData.initial_actions.includes(action) ? <CheckCircle size={18} className="text-white" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-indigo-300"/>}
                      </div>
                    ))}
                  </div>
               </div>
             </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
              <Label className="mb-3 block text-sm">{t('testimony_context')}</Label>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">{t('testimony_context_hint')}</p>
              <Textarea 
                value={formData.initial_context} 
                onChange={(e: any) => setFormData({...formData, initial_context: e.target.value})} 
                placeholder={activeRecordingField === 'initial_context' ? t('testimony_recording') : "Descreva aqui..."}
                className="bg-slate-50 border-slate-200 focus:bg-white min-h-[150px]" 
                disabled={isProcessing}
              />
              <div className="flex gap-3 mt-4 justify-end">
                <Button 
                  variant="secondary" 
                  className={`text-xs py-2 h-auto ${activeRecordingField === 'initial_context' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  onClick={() => handleTranscription('initial_context')} 
                  disabled={isProcessing || (activeRecordingField !== null && activeRecordingField !== 'initial_context')}
                >
                  {isProcessing && activeRecordingField === 'initial_context' ? <Loader2 className="animate-spin" size={14}/> : activeRecordingField === 'initial_context' ? <StopCircle size={14} /> : <Mic size={14} />} 
                  {activeRecordingField === 'initial_context' ? "Parar Gravação" : t('testimony_transcribe')}
                </Button>
                <Button variant="secondary" className="text-xs py-2 h-auto bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100" onClick={() => handleAICorrection('initial_context')} disabled={aiProcessing === 'initial_context' || !formData.initial_context}>
                  {aiProcessing === 'initial_context' ? <Loader2 className="animate-spin" size={14}/> : <Wand2 size={14} />} {t('testimony_improve_ai')}
                </Button>
              </div>
            </div>
          </motion.div>
       );

       case 'events': return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-20 max-w-4xl mx-auto">
            <Card className="p-8">
              <Label className="mb-6 block text-sm">{t('testimony_events_during')}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {EVENT_OPTIONS.map(evt => (
                  <label key={evt} className={`relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center justify-center h-28 group ${formData.events_during.includes(evt) ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'}`}>
                    <input type="checkbox" className="hidden" checked={formData.events_during.includes(evt)} onChange={() => toggleArrayItem('events_during', evt)} />
                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mb-2 transition-colors ${formData.events_during.includes(evt) ? 'bg-green-500 border-green-500' : 'border-slate-300 group-hover:border-green-400'}`}>
                       {formData.events_during.includes(evt) && <CheckCircle size={14} className="text-white" />}
                    </div>
                    <span className={`text-sm font-bold leading-tight ${formData.events_during.includes(evt) ? 'text-green-800' : 'text-slate-600'}`}>{evt}</span>
                  </label>
                ))}
              </div>
            </Card>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <Label className="mb-3 block text-sm">{t('testimony_approach_details')}</Label>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">{t('testimony_approach_hint')}</p>
              <Textarea 
                value={formData.during_approach} 
                onChange={(e: any) => setFormData({...formData, during_approach: e.target.value})} 
                placeholder={activeRecordingField === 'during_approach' ? t('testimony_recording') : "Detalhes aqui..."}
                className="bg-slate-50 border-slate-200 focus:bg-white min-h-[150px]" 
                disabled={isProcessing}
              />
              <div className="flex gap-3 mt-4 justify-end">
                <Button 
                  variant="secondary" 
                  className={`text-xs py-2 h-auto ${activeRecordingField === 'during_approach' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  onClick={() => handleTranscription('during_approach')} 
                  disabled={isProcessing || (activeRecordingField !== null && activeRecordingField !== 'during_approach')}
                >
                  {isProcessing && activeRecordingField === 'during_approach' ? <Loader2 className="animate-spin" size={14}/> : activeRecordingField === 'during_approach' ? <StopCircle size={14} /> : <Mic size={14} />} 
                  {activeRecordingField === 'during_approach' ? "Parar Gravação" : t('testimony_transcribe')}
                </Button>
                <Button variant="secondary" className="text-xs py-2 h-auto bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100" onClick={() => handleAICorrection('during_approach')} disabled={aiProcessing === 'during_approach' || !formData.during_approach}>
                  {aiProcessing === 'during_approach' ? <Loader2 className="animate-spin" size={14}/> : <Wand2 size={14} />} {t('testimony_improve_ai')}
                </Button>
              </div>
            </div>
          </motion.div>
       );

       case 'decisions': return (
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-20 max-w-4xl mx-auto">
           {formData.people_profiles.length === 0 ? (
              <div className="text-center p-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Users className="mx-auto text-slate-300 mb-4 h-12 w-12" />
                <h3 className="text-xl font-bold text-slate-700">{t('testimony_no_person')}</h3>
                <p className="text-slate-500 mb-8 text-sm mt-2">{t('testimony_add_person_hint')}</p>
                <Button variant="outline" onClick={() => setActiveTab('personal')}>{t('testimony_go_personal')}</Button>
              </div>
           ) : (
             formData.people_profiles.map((person, idx) => (
               <motion.div layout key={person.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                 <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                    <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-slate-200">{idx + 1}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl">{person.name || person.profile_type}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{t('testimony_select_decisions')}</p>
                    </div>
                  </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {DECISION_OPTIONS.map(d => {
                     const isSelected = person.decisions?.includes(d.label);
                     return (
                     <div 
                        key={d.label} 
                        onClick={() => toggleDecision(person.id, d.label)} 
                        className={`p-4 rounded-2xl cursor-pointer flex items-center justify-between transition-all border ${
                            isSelected
                            ? 'bg-green-50 border-green-200 shadow-inner' 
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                     >
                       <div className="flex items-center gap-3">
                           <span className="text-2xl filter drop-shadow-sm">{d.emoji}</span>
                           <span className={`text-sm font-bold ${isSelected ? 'text-green-900' : 'text-slate-700'}`}>{d.label}</span>
                       </div>
                       {isSelected ? <CheckCircle size={20} className="text-green-600"/> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                     </div>
                   )})}
                 </div>
               </motion.div>
             ))
           )}
           
           <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 rounded-3xl text-white shadow-xl shadow-slate-200">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Sparkles className="text-yellow-400 fill-yellow-400"/> {t('testimony_personal_account')}</h3>
              <p className="text-xs text-slate-400 mb-6 uppercase tracking-wider font-bold">{t('testimony_personal_hint')}</p>
              <textarea 
                value={formData.testimony_witnessed} 
                onChange={(e: any) => setFormData({...formData, testimony_witnessed: e.target.value})} 
                placeholder={activeRecordingField === 'testimony_witnessed' ? t('testimony_recording') : "Escreva seu relato pessoal..."} 
                className="w-full bg-white/10 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[180px] leading-relaxed"
                disabled={isProcessing}
              />
               <div className="flex gap-3 mt-4 justify-end">
                <button 
                    onClick={() => handleTranscription('testimony_witnessed')} 
                    disabled={isProcessing || (activeRecordingField !== null && activeRecordingField !== 'testimony_witnessed')}
                    className={`text-xs font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeRecordingField === 'testimony_witnessed' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                >
                  {isProcessing && activeRecordingField === 'testimony_witnessed' ? <Loader2 className="animate-spin w-3 h-3"/> : activeRecordingField === 'testimony_witnessed' ? <StopCircle className="w-3 h-3" /> : <Mic className="w-3 h-3" />} 
                  {activeRecordingField === 'testimony_witnessed' ? "Parar Gravação" : t('testimony_transcribe')}
                </button>
                <button 
                    onClick={() => handleAICorrection('testimony_witnessed')} 
                    disabled={aiProcessing === 'testimony_witnessed' || !formData.testimony_witnessed}
                    className="text-xs font-bold text-purple-300 hover:text-purple-100 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {aiProcessing === 'testimony_witnessed' ? <Loader2 className="animate-spin w-3 h-3"/> : <Wand2 className="w-3 h-3" />} {t('testimony_improve_ai')}
                </button>
              </div>
            </div>
         </motion.div>
       );

       case 'summary': return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-20 animate-fadeIn max-w-3xl mx-auto">
            <div className="text-center py-12">
               <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500 shadow-sm">
                 <Wand2 size={40} />
               </div>
               <h3 className="text-2xl font-extrabold text-slate-900">{t('testimony_ready')}</h3>
               <p className="text-slate-500 font-medium mb-8 mt-2 max-w-md mx-auto">{t('testimony_ai_desc')}</p>
               <Button onClick={handleGenerateSummary} className="w-full max-w-xs mx-auto py-4 text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 bg-indigo-600 hover:bg-indigo-700" disabled={aiProcessing === 'final_summary'}>
                 {aiProcessing === 'final_summary' ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 fill-yellow-400 text-yellow-400" />} {t('testimony_generate_summary')}
               </Button>
             </div>

            {formData.final_summary && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg relative">
                <div className="absolute -top-3 -right-3 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold border border-green-200 shadow-sm flex items-center gap-1">
                    <CheckCircle size={14}/> {t('testimony_generated_success')}
                </div>
                <Label className="text-lg mb-4">{t('testimony_official_summary')}</Label>
                <div className="whitespace-pre-wrap text-slate-700 leading-loose bg-slate-50 p-8 rounded-2xl border border-slate-100 font-serif text-lg">
                  {formData.final_summary}
                </div>
              </motion.div>
            )}

             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <Label className="mb-6 block text-sm">{t('testimony_media')}</Label>
                <div className="grid grid-cols-3 gap-4">
                  {['Sim', 'Não', 'Enviar Depois'].map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, has_media: opt})} className={`py-4 rounded-2xl text-sm font-bold border transition-all ${formData.has_media === opt ? 'bg-slate-900 text-white border-slate-900 shadow-lg transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
                {formData.has_media === 'Sim' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 border-2 border-dashed border-indigo-200 rounded-3xl p-12 text-center bg-indigo-50/30 cursor-pointer hover:bg-indigo-50 transition-colors group">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <Upload className="text-indigo-500 w-8 h-8" />
                    </div>
                    <p className="text-indigo-900 font-bold text-lg">{t('testimony_upload_click')}</p>
                    <p className="text-xs text-indigo-400 mt-2 font-bold uppercase tracking-wide">{t('testimony_upload_formats')}: JPG, PNG, MP4</p>
                  </motion.div>
                )}
             </div>
          </motion.div>
       );
       default: return null;
     }
  };

  const tabs = [
    { id: 'personal', icon: User, label: t('testimony_tab_personal') },
    { id: 'profile', icon: Heart, label: 'Perfil' },
    { id: 'events', icon: MessageSquare, label: 'Eventos' },
    { id: 'decisions', icon: Sparkles, label: t('testimony_tab_decisions') },
    { id: 'summary', icon: FileText, label: t('testimony_tab_summary') },
  ];

  return (
    <div className="bg-slate-50/50 text-slate-800 font-sans min-h-[calc(100vh-100px)]">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 bg-slate-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3"
          >
            <CheckCircle size={18} className="text-green-400" />
            <span className="font-medium text-sm">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Navigation */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {viewMode === 'form' && (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors" onClick={() => setViewMode('feed')}>
                    <ChevronLeft className="w-5 h-5 text-slate-600"/>
                  </motion.button>
                )}
                <h1 className="text-lg font-bold text-slate-900">
                {viewMode === 'form' ? t('testimony_new_title') : t('testimony_feed_title_short')}
                </h1>
            </div>
            
            {viewMode === 'form' && (
                <div className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                    Passo {tabs.findIndex(t => t.id === activeTab) + 1} de {tabs.length}
                </div>
            )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Stepper for Form Mode */}
        {viewMode === 'form' && (
            <div className="flex justify-center mb-12">
                <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto no-scrollbar max-w-full">
                    {tabs.map((t, idx) => {
                        const isActive = activeTab === t.id;
                        const isCompleted = tabs.findIndex(tab => tab.id === activeTab) > idx;
                        
                        return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap relative ${
                            isActive 
                                ? 'bg-slate-900 text-white shadow-md z-10' 
                                : isCompleted 
                                ? 'text-slate-800 bg-slate-50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <t.icon size={16} className={isActive ? 'fill-current' : ''} />
                            <span className="hidden sm:inline">{t.label}</span>
                            {isCompleted && <CheckCircle size={12} className="text-green-500 ml-1" />}
                        </button>
                        )
                    })}
                </div>
            </div>
        )}

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {viewMode === 'feed' ? renderFeedView() : renderTabContent()}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Actions for Form */}
      {viewMode === 'form' && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 lg:left-72 bg-white border-t border-slate-200 p-4 z-40 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
            <div className="max-w-3xl mx-auto flex gap-4 justify-between">
            <Button variant="ghost" className="flex-1 border border-slate-200" onClick={() => setViewMode('feed')}>
                {t('btn_cancel')}
            </Button>
            
            {activeTab === 'summary' ? (
                <Button 
                className="flex-[2] py-3 text-lg bg-green-600 hover:bg-green-700 shadow-green-200" 
                onClick={handleFinalSave}
                disabled={loading}
                >
                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />} 
                {t('btn_save')}
                </Button>
            ) : (
                <Button 
                className="flex-[2]" 
                onClick={() => {
                    const idx = tabs.findIndex(t => t.id === activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
                }}
                >
                {t('btn_next')} <ChevronRight size={18} />
                </Button>
            )}
            </div>
        </motion.div>
      )}
    </div>
  );
}
