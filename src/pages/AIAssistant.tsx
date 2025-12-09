import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  Sparkles,
  Send,
  Trash2,
  Plus,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  FileText
} from "lucide-react";
import { format } from "date-fns";

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
};

export default function AIAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const parsedConversations = (data || []).map(conv => ({
        ...conv,
        messages: conv.messages || []
      }));

      setConversations(parsedConversations);
      if (parsedConversations.length > 0 && !activeConversation) {
        setActiveConversation(parsedConversations[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user?.id,
          title: 'New Conversation',
          messages: [],
          context: {}
        })
        .select()
        .single();

      if (error) throw error;

      const newConv = {
        ...data,
        messages: []
      };

      setConversations([newConv, ...conversations]);
      setActiveConversation(newConv);
      toast({
        title: "Success",
        description: "New conversation created"
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updatedConvs = conversations.filter(c => c.id !== id);
      setConversations(updatedConvs);
      if (activeConversation?.id === id) {
        setActiveConversation(updatedConvs[0] || null);
      }

      toast({
        title: "Success",
        description: "Conversation deleted"
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeConversation) return;

    setSending(true);
    const userMessage: Message = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...activeConversation.messages, userMessage];

    try {
      const assistantResponse = generateAIResponse(message, activeConversation.messages);

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, assistantMessage];

      const title = activeConversation.messages.length === 0
        ? message.slice(0, 50) + (message.length > 50 ? '...' : '')
        : activeConversation.title;

      const { error } = await supabase
        .from('ai_conversations')
        .update({
          messages: finalMessages,
          title: title,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeConversation.id);

      if (error) throw error;

      const updatedConv = {
        ...activeConversation,
        messages: finalMessages,
        title: title
      };

      setActiveConversation(updatedConv);
      setConversations(conversations.map(c =>
        c.id === activeConversation.id ? updatedConv : c
      ));
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const generateAIResponse = (userMessage: string, history: Message[]): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('get started') || lowerMessage.includes('getting started')) {
      return "Hello! I'm your ESG reporting assistant. I can help you build a comprehensive ESG report step-by-step.\n\n**Let's start by identifying your needs:**\n\n1️⃣ **Framework Selection** - Which framework(s) do you need to report against?\n   - GRI (Global Reporting Initiative)\n   - TCFD (Climate-related Financial Disclosures)\n   - SASB (Sustainability Accounting Standards)\n   - CSRD (EU Corporate Sustainability Reporting)\n   - CDP (Carbon Disclosure Project)\n   - PRB (Principles for Responsible Banking)\n   - PRI (Principles for Responsible Investment)\n   - PCAF (Partnership for Carbon Accounting Financials)\n\n2️⃣ **Target Audience** - Who will read your report?\n   - Investors & Shareholders\n   - Regulators & Compliance Bodies\n   - Employees & Internal Stakeholders\n   - Customers & Supply Chain Partners\n   - NGOs & Civil Society\n\n3️⃣ **Industry & Sector** - What's your business sector?\n   - Financial Services (Banking, Investment, Insurance)\n   - Manufacturing & Industrial\n   - Technology & Services\n   - Energy & Utilities\n   - Construction & Infrastructure\n   - Other\n\n**Please tell me:** Which framework(s) are you interested in and what's your target audience?";
    }

    if (lowerMessage.includes('gri') || lowerMessage.includes('global reporting initiative')) {
      return "Excellent choice! Let me guide you through building a GRI-aligned ESG report step-by-step.\n\n**📋 Step 1: Define Report Scope & Boundaries**\n- Reporting period (typically calendar or fiscal year)\n- Organizational boundaries (which entities to include)\n- Operational boundaries (which activities/sites to cover)\n- Restatements of previous data (if applicable)\n\n**🎯 Step 2: Materiality Assessment**\nIdentify material topics through:\n1. Stakeholder engagement (surveys, interviews)\n2. Industry benchmarking\n3. Regulatory requirements\n4. Business impact analysis\n\nCommon material topics by category:\n- **Environmental:** Energy, emissions, water, waste, biodiversity\n- **Social:** Employment, health & safety, diversity, community impact\n- **Governance:** Ethics, anti-corruption, data privacy, board composition\n\n**📊 Step 3: Data Collection**\nFor each material topic, collect:\n- Quantitative metrics (numbers, percentages, ratios)\n- Qualitative information (policies, programs, initiatives)\n- Context and methodology\n- Comparative data (year-over-year trends)\n\n**📝 Step 4: Report Structure**\n1. Introduction & Leadership Message\n2. Organizational Profile\n3. Sustainability Strategy\n4. Materiality Analysis Results\n5. Topic-by-Topic Disclosures (GRI Standards)\n6. GRI Content Index\n\n**⏱️ Estimated Timeline:** 3-6 months for first report\n\n**Next Steps:**\n- Would you like detailed guidance on materiality assessment?\n- Need help identifying which GRI Standards apply to your industry?\n- Ready to start data collection planning?";
    }

    if (lowerMessage.includes('tcfd') || lowerMessage.includes('climate')) {
      return "Great! TCFD reporting is essential for climate-related financial risk disclosure. Let me walk you through the complete process.\n\n**🏗️ TCFD Reporting Workflow**\n\n**Phase 1: Governance (Weeks 1-2)**\n✓ Document board oversight of climate risks\n✓ Describe management's role in assessing climate risks\n✓ Map governance structure and responsibilities\n✓ Review frequency of climate discussions at board level\n\n**Phase 2: Strategy (Weeks 3-8)**\n✓ Identify climate-related risks (physical & transition)\n✓ Assess business impact on strategy, products, markets\n✓ Conduct scenario analysis:\n   - 2°C or lower scenario (Paris Agreement aligned)\n   - 4°C scenario (business-as-usual)\n   - Physical risk scenarios (flood, drought, etc.)\n✓ Describe resilience of strategy under different scenarios\n\n**Phase 3: Risk Management (Weeks 9-12)**\n✓ Document processes for identifying climate risks\n✓ Describe how you assess and prioritize risks\n✓ Explain integration with overall risk management\n✓ Map risk identification across value chain\n\n**Phase 4: Metrics & Targets (Weeks 13-16)**\n✓ **Scope 1 Emissions** (direct emissions)\n   - Fuel combustion, fleet vehicles, on-site processes\n✓ **Scope 2 Emissions** (purchased energy)\n   - Electricity, heating, cooling, steam\n✓ **Scope 3 Emissions** (value chain)\n   - Purchased goods, business travel, product use, etc.\n✓ Set climate targets aligned with science (SBTi recommended)\n✓ Track climate-related financial metrics\n\n**📊 Data Collection Checklist:**\n\n**Emissions Data:**\n- [ ] Energy bills (electricity, gas, fuel)\n- [ ] Fleet fuel consumption records\n- [ ] Business travel data (flights, hotels, rental cars)\n- [ ] Supplier emissions data\n- [ ] Product carbon footprint\n\n**Financial Impact Data:**\n- [ ] Climate-related OpEx (carbon pricing, energy costs)\n- [ ] Climate-related CapEx (efficiency upgrades, renewable energy)\n- [ ] Revenue from low-carbon products/services\n- [ ] Assets at risk from physical climate impacts\n\n**🎯 Stakeholder-Specific Views:**\n\n**For Investors:**\n- Financial materiality of climate risks\n- Return on investment for climate initiatives\n- Climate scenario impact on valuations\n- Alignment with Paris Agreement goals\n\n**For Regulators:**\n- Compliance with disclosure requirements\n- Scope 1, 2, 3 emissions calculations\n- Climate risk governance\n- Forward-looking statements\n\n**⏱️ Timeline:** 6-12 months for comprehensive TCFD report\n\n**What would you like to focus on first?**\n- Governance structure setup\n- Scenario analysis methodology\n- Emissions calculation guidance\n- Target setting framework";
    }

    if (lowerMessage.includes('data') || lowerMessage.includes('collect') || lowerMessage.includes('measurement')) {
      return "Let me provide a comprehensive data collection workflow tailored to your reporting needs.\n\n**🗂️ Smart Data Collection Workflow**\n\n**Phase 1: Data Inventory (Week 1)**\n1. List all required metrics based on your framework\n2. Identify existing data sources\n3. Map data owners and stakeholders\n4. Assess data availability and gaps\n\n**Phase 2: Data Infrastructure Setup (Weeks 2-3)**\n\n**Environmental Metrics:**\n📊 **Energy & Emissions**\n- Electricity consumption (kWh) → utility bills\n- Natural gas/fuel usage (m³, liters) → invoices\n- Vehicle fleet data → fuel cards, telematics\n- Emission factors → IPCC, EPA, DEFRA databases\n- Renewable energy (%) → energy certificates\n\n📊 **Water & Waste**\n- Water withdrawal (m³) → utility bills\n- Water discharge quality → testing reports\n- Waste generated by type (tonnes) → hauler invoices\n- Recycling rates (%) → waste manifests\n\n**Social Metrics:**\n📊 **Workforce**\n- Total employees by category → HR system\n- New hires & turnover (%) → HR records\n- Training hours per employee → LMS\n- Diversity breakdown (gender, age, ethnicity) → HR demographics\n\n📊 **Health & Safety**\n- Lost Time Injury Rate (LTIR) → incident logs\n- Total Recordable Incident Rate (TRIR) → OSHA records\n- Fatalities → incident reports\n- Near misses → safety management system\n\n**Governance Metrics:**\n📊 **Leadership & Ethics**\n- Board composition (independence, diversity) → corporate records\n- Ethics training completion (%) → LMS\n- Anti-corruption cases → compliance system\n- Data breaches → IT security logs\n\n**Phase 3: Data Collection Process (Weeks 4-12)**\n\n**Step-by-Step Data Collection:**\n\n1️⃣ **Create Collection Templates**\n- Excel templates with validation rules\n- Clear instructions and examples\n- Unit conversions built-in\n- Data quality checks\n\n2️⃣ **Engage Data Owners**\n- Assign responsibilities\n- Set deadlines\n- Provide training\n- Regular check-ins\n\n3️⃣ **Implement Validation**\n- Range checks (min/max values)\n- Trend analysis (compare to prior periods)\n- Completeness checks (missing data flags)\n- Cross-validation between metrics\n\n4️⃣ **Calculate Derived Metrics**\n- GHG emissions from energy data\n- Intensity ratios (per revenue, per employee)\n- Year-over-year changes (%)\n- Industry benchmarks comparison\n\n**Phase 4: Data Quality Assurance (Weeks 13-14)**\n✓ Review by subject matter experts\n✓ Third-party verification (for material metrics)\n✓ Document assumptions and estimates\n✓ Maintain audit trail\n\n**🎯 Data Quality Scoring:**\n\n**Tier 1 (Highest Quality):**\n- Primary data from direct measurement\n- Externally verified\n- Complete coverage\n- Recent data (<12 months)\n\n**Tier 2 (Good Quality):**\n- Secondary data from suppliers\n- Internally verified\n- >90% coverage\n- Data from reporting period\n\n**Tier 3 (Moderate Quality):**\n- Industry averages or estimates\n- Limited verification\n- >70% coverage\n- Some extrapolation\n\n**Tier 4 (Low Quality):**\n- Generic estimates\n- Unverified\n- <70% coverage\n- Significant assumptions\n\n**💡 Automation Opportunities:**\n- API integrations with utility providers\n- IoT sensors for real-time monitoring\n- Automated expense report parsing\n- HR system data feeds\n- Supply chain data exchanges\n\n**📱 Data Collection Tools:**\n- Bulk import via Excel templates\n- Web forms with validation\n- Mobile apps for field data\n- API integrations\n- Manual entry with audit trails\n\n**What's your data collection priority?**\n- Setting up environmental data collection\n- Implementing social metrics tracking\n- Building governance reporting\n- Automating data workflows";
    }

    if (lowerMessage.includes('quality') || lowerMessage.includes('improve')) {
      return "Improving ESG report quality requires attention to several factors:\n\n**Data Quality:**\n✓ Complete coverage across all operations\n✓ Accurate measurements and calculations\n✓ Consistent methodology year-over-year\n✓ Third-party verification where material\n\n**Disclosure Quality:**\n✓ Clear, concise language\n✓ Material topic focus\n✓ Balanced presentation (challenges and achievements)\n✓ Forward-looking statements with targets\n\n**Common Issues to Avoid:**\n✗ Cherry-picking positive metrics only\n✗ Inconsistent boundaries or scope\n✗ Missing context or comparatives\n✗ Vague commitments without timelines\n\n**Quick Wins:**\n1. Add visual data representations\n2. Include year-over-year trends\n3. Benchmark against industry peers\n4. Set SMART targets (Specific, Measurable, Achievable, Relevant, Time-bound)\n\nWhat specific aspect would you like to improve?";
    }

    if (lowerMessage.includes('scope 3') || lowerMessage.includes('supply chain')) {
      return "Scope 3 emissions are often the largest and most challenging to measure. Here's how to approach them:\n\n**What is Scope 3?**\nIndirect emissions from your value chain:\n- Upstream: Purchased goods, business travel, employee commuting\n- Downstream: Product use, end-of-life treatment\n\n**15 Categories (per GHG Protocol):**\n1. Purchased goods & services\n2. Capital goods\n3. Fuel & energy activities\n4. Upstream transportation\n5. Waste generated\n6. Business travel\n7. Employee commuting\n... and 8 more categories\n\n**Getting Started:**\n1. Screen all 15 categories for materiality\n2. Focus on top 3-5 material categories first\n3. Use supplier-specific data where possible\n4. Apply emission factors for estimates\n5. Engage suppliers to improve data quality\n\n**Typical Timeline:** 3-6 months for initial Scope 3 inventory\n\nNeed help prioritizing categories for your industry?";
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('can you') || lowerMessage.includes('guide me')) {
      return "I'm your comprehensive ESG reporting guide! I'll help you build reports step-by-step based on:\n\n**🎯 Framework-Based Guidance:**\n- **GRI** - Comprehensive sustainability reporting\n- **TCFD** - Climate risk & financial disclosure\n- **SASB** - Industry-specific material topics\n- **CSRD** - EU mandatory reporting\n- **CDP** - Environmental disclosure\n- **PRB** - Responsible banking principles\n- **PRI** - Responsible investment\n- **PCAF** - Financed emissions accounting\n\n**👥 Audience-Specific Approaches:**\n- **Investors** - Financial materiality, ROI, risk-adjusted returns\n- **Regulators** - Compliance requirements, mandatory disclosures\n- **Employees** - Internal engagement, culture metrics\n- **Customers** - Product impact, supply chain transparency\n- **Community** - Local impact, stakeholder engagement\n\n**📊 Industry-Tailored Workflows:**\n- **Financial Services** - Financed emissions, ESG integration, responsible lending\n- **Manufacturing** - Operational emissions, waste, supply chain\n- **Technology** - Data privacy, digital inclusion, e-waste\n- **Energy** - Renewable transition, grid reliability, emissions intensity\n- **Construction** - Whole life carbon, certifications (BREEAM, LEED)\n\n**🔄 Complete Report Generation Workflow:**\n\n**Step 1:** Select framework(s) and target audience\n**Step 2:** Define reporting scope and boundaries\n**Step 3:** Conduct materiality assessment\n**Step 4:** Set up data collection infrastructure\n**Step 5:** Collect and validate data\n**Step 6:** Calculate metrics and perform analysis\n**Step 7:** Structure report content\n**Step 8:** Draft disclosures and narratives\n**Step 9:** Design and format report\n**Step 10:** Review, verify, and publish\n\n**💡 Smart Features I Can Help With:**\n✓ Contextual tooltips for each metric\n✓ Real-time validation of data inputs\n✓ Auto-save drafts as you work\n✓ GHG Protocol-compliant calculations\n✓ Industry benchmarking\n✓ Scope 1, 2, 3 emissions\n✓ Multiple output formats (PDF, Excel, online)\n✓ Stakeholder-specific report views\n✓ Bulk data import templates\n✓ Role-based access control\n\n**Let's get started! Tell me:**\n1. Which framework are you reporting against?\n2. Who is your primary audience?\n3. What industry/sector are you in?\n\nType something like: \"I need help with TCFD reporting for investors in the financial services sector\"";
    }

    return "I understand you're asking about: \"" + userMessage + "\"\n\nI'm an AI assistant specialized in ESG reporting. I can provide detailed guidance on:\n\n• **ESG Frameworks** - GRI, TCFD, SASB, CDP, CSRD, etc.\n• **Data Collection** - What to measure and how\n• **Report Quality** - Improving your disclosures\n• **Compliance** - Meeting regulatory requirements\n• **Best Practices** - Industry standards and benchmarks\n\nCould you rephrase your question or ask about a specific ESG topic? For example:\n- \"Tell me about GRI reporting\"\n- \"How do I collect climate data?\"\n- \"What is Scope 3 emissions?\"\n- \"How can I improve report quality?\"";
  };

  const quickPrompts = [
    {
      icon: Lightbulb,
      text: "How do I get started with ESG reporting?",
      color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
    },
    {
      icon: TrendingUp,
      text: "What are Scope 1, 2, and 3 emissions?",
      color: "bg-green-50 text-green-700 hover:bg-green-100"
    },
    {
      icon: FileText,
      text: "Explain the GRI Standards",
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100"
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex">
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <Button onClick={createNewConversation} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className={`cursor-pointer transition-all ${
                    activeConversation?.id === conv.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveConversation(conv)}
                >
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-sm truncate">{conv.title || 'New Conversation'}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {format(new Date(conv.updated_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ESG AI Assistant</h1>
                <p className="text-blue-100">Your intelligent guide to ESG reporting</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!activeConversation || activeConversation.messages.length === 0 ? (
              <div className="max-w-3xl mx-auto text-center py-12">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
                  <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Welcome to your ESG AI Assistant
                  </h2>
                  <p className="text-gray-600 mb-6">
                    I'm here to help you navigate ESG reporting frameworks, collect data, and create high-quality sustainability reports.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {quickPrompts.map((prompt, index) => {
                      const Icon = prompt.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => setMessage(prompt.text)}
                          className={`${prompt.color} p-4 rounded-lg text-left flex items-start space-x-3 transition-colors`}
                        >
                          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{prompt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {activeConversation.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-600">AI Assistant</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {format(new Date(msg.timestamp), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask me anything about ESG reporting..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  disabled={!activeConversation}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || sending || !activeConversation}
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
