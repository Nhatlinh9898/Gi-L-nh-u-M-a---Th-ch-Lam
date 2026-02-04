
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  MessageSquare, 
  Info, 
  Menu, 
  X, 
  ChevronRight,
  Send,
  Loader2,
  Wind,
  Coffee,
  Heart
} from 'lucide-react';
import { STORY_CONTENT, STORY_TITLE, AUTHOR } from './constants';
import { getStoryAnalysis, chatWithAI } from './services/gemini';
import { AnalysisResult, Message } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'read' | 'analysis' | 'chat'>('read');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const runAnalysis = async () => {
    if (analysis) return;
    setIsAnalyzing(true);
    try {
      const result = await getStoryAnalysis();
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isChatting) return;
    const newMsg: Message = { role: 'user', content: userInput };
    setChatHistory(prev => [...prev, newMsg]);
    setUserInput('');
    setIsChatting(true);

    try {
      const aiResponse = await chatWithAI(chatHistory, userInput);
      setChatHistory(prev => [...prev, { role: 'model', content: aiResponse }]);
    } catch (error) {
      console.error("Chat failed", error);
      setChatHistory(prev => [...prev, { role: 'model', content: "Xin lỗi, tôi gặp chút trục trặc trong lúc suy nghĩ. Hãy thử lại nhé." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg text-white shadow-lg shadow-orange-200">
              <Wind size={24} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-orange-900 tracking-tight leading-none">{STORY_TITLE}</h1>
              <p className="text-xs text-orange-700 font-medium uppercase tracking-widest mt-1">Tác giả: {AUTHOR}</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full">
            <NavButton 
              active={activeTab === 'read'} 
              onClick={() => setActiveTab('read')}
              icon={<BookOpen size={18} />}
              label="Đọc tác phẩm"
            />
            <NavButton 
              active={activeTab === 'analysis'} 
              onClick={() => { setActiveTab('analysis'); runAnalysis(); }}
              icon={<Sparkles size={18} />}
              label="Phân tích AI"
            />
            <NavButton 
              active={activeTab === 'chat'} 
              onClick={() => setActiveTab('chat')}
              icon={<MessageSquare size={18} />}
              label="Thảo luận"
            />
          </nav>

          <button 
            className="md:hidden p-2 text-orange-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 px-6">
          <div className="flex flex-col gap-4">
            <button 
              className={`flex items-center gap-3 p-4 rounded-xl text-lg font-medium ${activeTab === 'read' ? 'bg-orange-50 text-orange-600' : 'text-slate-600'}`}
              onClick={() => { setActiveTab('read'); setIsMobileMenuOpen(false); }}
            >
              <BookOpen size={24} /> Đọc tác phẩm
            </button>
            <button 
              className={`flex items-center gap-3 p-4 rounded-xl text-lg font-medium ${activeTab === 'analysis' ? 'bg-orange-50 text-orange-600' : 'text-slate-600'}`}
              onClick={() => { setActiveTab('analysis'); runAnalysis(); setIsMobileMenuOpen(false); }}
            >
              <Sparkles size={24} /> Phân tích AI
            </button>
            <button 
              className={`flex items-center gap-3 p-4 rounded-xl text-lg font-medium ${activeTab === 'chat' ? 'bg-orange-50 text-orange-600' : 'text-slate-600'}`}
              onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }}
            >
              <MessageSquare size={24} /> Thảo luận
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
        {activeTab === 'read' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="prose prose-lg max-w-none">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-4">Truyện ngắn kinh điển</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-2">{STORY_TITLE}</h2>
                <div className="w-24 h-1 bg-orange-600 mx-auto my-6 rounded-full opacity-30"></div>
              </div>
              
              <div className="font-serif-literary text-xl leading-relaxed text-slate-700 whitespace-pre-wrap drop-shadow-sm bg-white/40 p-6 md:p-12 rounded-3xl border border-orange-50">
                {STORY_CONTENT}
              </div>

              <div className="mt-16 flex flex-col items-center gap-6 text-center">
                <p className="italic text-slate-500 max-w-md">"Văn Thạch Lam không phải là thứ văn để người ta đọc lấy cốt truyện, mà là thứ văn để người ta cảm, người ta thấu."</p>
                <button 
                  onClick={() => { setActiveTab('analysis'); runAnalysis(); }}
                  className="flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-orange-200"
                >
                  Phân tích cùng AI <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <SectionHeader 
              title="Phân tích tác phẩm" 
              subtitle="Khám phá chiều sâu nội dung và nghệ thuật qua lăng kính trí tuệ nhân tạo"
              icon={<Sparkles className="text-orange-600" size={28} />}
            />

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="animate-spin text-orange-600" size={48} />
                <p className="text-orange-800 font-medium animate-pulse">Gemini đang phân tích tầng sâu ý nghĩa...</p>
              </div>
            ) : analysis ? (
              <div className="grid gap-8">
                <Card title="Tóm tắt cốt truyện" icon={<Info size={20} className="text-blue-500" />}>
                  <p className="text-slate-600 leading-relaxed italic">{analysis.summary}</p>
                </Card>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card title="Nhân vật tiêu biểu" icon={<Heart size={20} className="text-red-500" />}>
                    <div className="space-y-4">
                      {analysis.characters.map((char, i) => (
                        <div key={i} className="border-l-2 border-orange-200 pl-4 py-1">
                          <h4 className="font-bold text-slate-900">{char.name}</h4>
                          <p className="text-sm text-slate-600">{char.description}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card title="Chủ đề tư tưởng" icon={<Coffee size={20} className="text-orange-500" />}>
                    <div className="space-y-4">
                      {analysis.themes.map((theme, i) => (
                        <div key={i}>
                          <h4 className="font-bold text-slate-900 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                             {theme.title}
                          </h4>
                          <p className="text-sm text-slate-600 ml-3.5">{theme.description}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <Card title="Giá trị nghệ thuật & Nhân đạo" icon={<Sparkles size={20} className="text-yellow-500" />}>
                  <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                    <p className="text-slate-700 leading-relaxed font-serif-literary text-lg">
                      {analysis.literaryValue}
                    </p>
                  </div>
                </Card>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-[75vh] flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader 
              title="Đàm đạo văn chương" 
              subtitle="Cùng AI thảo luận về những chi tiết, tâm lý nhân vật hay phong cách nghệ thuật của Thạch Lam"
              icon={<MessageSquare className="text-orange-600" size={28} />}
            />

            <div className="flex-1 bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {chatHistory.length === 0 && (
                  <div className="text-center py-12 px-8">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="text-orange-300" />
                    </div>
                    <h3 className="text-slate-900 font-bold mb-2">Chào bạn, tôi là trợ lý văn học</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Bạn có thể hỏi về ý nghĩa của chiếc áo bông, tâm trạng của mẹ Sơn, hay cách Thạch Lam miêu tả gió lạnh đầu mùa...
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                      <button 
                        onClick={() => setUserInput("Tại sao chi tiết chiếc áo bông cũ lại quan trọng?")}
                        className="text-xs p-3 border border-orange-100 rounded-xl hover:bg-orange-50 transition-colors text-slate-600 text-left"
                      >
                        Tại sao chi tiết chiếc áo bông cũ lại quan trọng?
                      </button>
                      <button 
                        onClick={() => setUserInput("Phong cách của Thạch Lam qua tác phẩm này là gì?")}
                        className="text-xs p-3 border border-orange-100 rounded-xl hover:bg-orange-50 transition-colors text-slate-600 text-left"
                      >
                        Phong cách của Thạch Lam qua tác phẩm này là gì?
                      </button>
                    </div>
                  </div>
                )}
                
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-orange-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-orange-100 bg-orange-50/30">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Gõ câu hỏi của bạn tại đây..."
                    className="w-full bg-white pl-4 pr-12 py-3 rounded-2xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-inner"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isChatting}
                    className={`absolute right-2 p-2 rounded-xl transition-all ${
                      userInput.trim() && !isChatting 
                        ? 'bg-orange-600 text-white shadow-md hover:scale-105' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-orange-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">© 2024 Appreciation of Thạch Lam's Literature. Powered by Gemini API.</p>
        </div>
      </footer>
    </div>
  );
};

// Sub-components for cleaner code
const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold ${
      active ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

const SectionHeader: React.FC<{ title: string, subtitle: string, icon: React.ReactNode }> = ({ title, subtitle, icon }) => (
  <div className="mb-10 text-center flex flex-col items-center">
    <div className="mb-4 bg-orange-100 p-4 rounded-3xl">
      {icon}
    </div>
    <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">{title}</h2>
    <p className="text-slate-500 max-w-xl">{subtitle}</p>
  </div>
);

const Card: React.FC<{ title: string, children: React.ReactNode, icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-white rounded-3xl border border-orange-100 p-8 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-slate-50 p-2 rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    </div>
    {children}
  </div>
);

export default App;
