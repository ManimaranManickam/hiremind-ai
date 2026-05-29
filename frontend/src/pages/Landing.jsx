import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Target, Users, ArrowRight, CheckCircle, Lightbulb, Eye, BookOpen, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: Brain, title: 'AI Resume Parsing', desc: 'Instant extraction of skills, experience and ATS scoring from any PDF or DOCX using advanced models.' },
  { icon: Target, title: 'Deep Semantic Match', desc: 'Advanced vector similarity search between candidate profiles and job requirements.' },
  { icon: Lightbulb, title: 'Predictive Insights', desc: 'Get data-driven recommendations on strengths, weaknesses, and hire probabilities.' },
  { icon: Zap, title: 'Automated Interviews', desc: 'Anti-cheat AI video interviews that dynamically adapt to the candidate’s responses.' },
];

const STATS = [
  { value: '10x', label: 'Faster Screening' },
  { value: '94%', label: 'AI Accuracy' },
  { value: '60%', label: 'Cost Reduction' },
  { value: '2M+', label: 'Resumes Parsed' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans overflow-x-hidden selection:bg-brand-500/20 selection:text-brand-700">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-multiply"></div>
      
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-3xl font-extrabold tracking-tight text-gray-900">
              Aaba<span className="text-brand-600">soft</span>
              <sup className="text-xs text-brand-600 font-normal ml-1">®</sup>
            </span>
            <span className="ml-4 pl-4 border-l border-gray-300 text-sm font-semibold text-gray-500 hidden sm:block">Careers Platform</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <button onClick={() => navigate('/login')} className="hidden md:block text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors px-4 py-2">Sign In</button>
            <button onClick={() => navigate('/login')} className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-in-out bg-brand-600 border border-brand-600 rounded hover:bg-brand-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
              <span className="relative z-10 flex items-center gap-2">Start Hiring <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></span>
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 text-center z-10 bg-white border-b border-gray-200">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-[-1]">
            <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[100%] rounded-full bg-gradient-to-br from-brand-50 to-transparent blur-3xl opacity-60"></div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-sm font-bold mb-8 shadow-sm">
            <SparklesIcon className="w-4 h-4" /> Enterprise-Grade AI Recruitment
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 text-gray-900">
            Global Talent Acquisition <br className="hidden md:block" />
            Powered by <span className="text-brand-600">Aabasoft</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Empower your global enterprise recruitment with our proprietary AI platform. Source, analyze, and interview top-tier talent with unprecedented precision, scale, and zero bias.
          </p>

          {/* Main CTA */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 rounded bg-brand-600 text-white font-bold text-lg shadow-md hover:shadow-xl transition-all"
            >
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Why Aabasoft Section */}
      <section className="py-24 px-6 relative z-10 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
            <motion.div 
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1"
            >
                <h2 className="text-4xl md:text-5xl font-light mb-8 text-gray-800">Why <span className="font-bold text-brand-600">Aabasoft</span> <span className="text-brand-600">?</span><span className="inline-block w-16 h-[2px] bg-red-200 ml-4 align-middle"></span></h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Aabasoft Technologies (India) Private Limited is a global End-to-End IT/ITES services and solutions provider. We help our customers to conduct business better with our industry-wide experience, deep expertise in technology offered through our comprehensive portfolio of services. We believe in three important factors which are Quality, Value and Time. Our dedicated teams work round the clock to deliver you the best at the right time and at the right cost.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                    We are a pro-business, simple but efficient organization. We provide end to end consulting and solutions to our clients. We believe that IT infrastructure is the nervous system of any modern organization that connects the various systems and functions.
                </p>
                <button className="text-gray-900 font-bold flex items-center gap-2 hover:text-brand-600 transition-colors">
                    View More <ArrowRight className="w-4 h-4" />
                </button>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 bg-white p-8 rounded shadow-lg border border-gray-100 flex flex-col gap-10"
            >
                <div className="flex gap-6">
                    <div className="w-16 h-16 bg-brand-600 flex-shrink-0 flex items-center justify-center transform rotate-45">
                        <Eye className="w-8 h-8 text-white -rotate-45" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold mb-2">Vision</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Our vision at Aabasoft is to be the premier IT solutions company providing end to end solutions in a sustainable manner.</p>
                    </div>
                </div>

                <div className="flex gap-6">
                    <div className="w-16 h-16 bg-brand-600 flex-shrink-0 flex items-center justify-center transform rotate-45">
                        <svg className="w-8 h-8 text-white -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514" /></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold mb-2">Mission</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Aabasoft Technologies is dedicated to providing excellence to transform customers business to a modern era through digital innovations.</p>
                    </div>
                </div>

                <div className="flex gap-6">
                    <div className="w-16 h-16 bg-brand-600 flex-shrink-0 flex items-center justify-center transform rotate-45">
                        <BookOpen className="w-8 h-8 text-white -rotate-45" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold mb-2">Insights</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">We provide solutions that will help to build a robust IT Infrastructure by cultivating a legitimate work culture which has helped to push the envelope and become more prolific than what we were yesterday.</p>
                    </div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-gray-200 bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-gray-200">
          {STATS.map(({ value, label }, i) => (
            <motion.div 
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl md:text-5xl font-black text-brand-600 mb-2">{value}</div>
              <div className="text-sm md:text-base text-gray-500 uppercase tracking-widest font-bold">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative z-10 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gray-900">Enterprise AI Infrastructure</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Deploy a fleet of specialized, enterprise-ready AI agents working in perfect harmony to automate your end-to-end global recruitment lifecycle.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group p-8 rounded bg-white border border-gray-200 hover:border-brand-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-100 transition-all duration-300">
                  <Icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Anti-Cheat */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-50 border border-red-100 text-brand-600 text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-4 h-4" /> Enterprise Security
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-gray-900">Zero-compromise <br/><span className="text-brand-600">Interview Integrity</span></h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-lg">
              Our advanced anti-cheat engine monitors tab-switching, off-screen gazes, and multi-person detection in real-time, ensuring 100% academic and professional integrity during every AI interview.
            </p>
            <ul className="space-y-4">
              {['Real-time behavioral monitoring', 'Automated interview termination on violation', 'End-to-end encrypted video & transcripts'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full relative"
          >
            <div className="relative rounded bg-white border border-gray-200 shadow-2xl p-2">
              <div className="rounded overflow-hidden bg-gray-50 border border-gray-100">
                {/* Mock UI Frame */}
                <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-8 flex items-center justify-center h-[300px] relative bg-white">
                  <div className="absolute top-4 right-4 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded flex items-center gap-2 text-sm font-semibold animate-pulse shadow-sm">
                    <AlertCircle className="w-4 h-4" /> Tab Switch Detected
                  </div>
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center relative">
                     <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                       <Users className="w-12 h-12 text-gray-400" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 px-6 relative z-10 bg-brand-600">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center relative"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">Transform Your Enterprise Hiring</h2>
          <p className="text-red-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">Join industry leaders using Aabasoft to build their next-generation global workforce. Secure, scalable, and AI-powered.</p>
          <button onClick={() => navigate('/login')} className="px-10 py-4 rounded bg-white text-brand-700 font-bold text-lg hover:bg-gray-50 hover:shadow-lg transition-all">
            Get Started
          </button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-gray-200 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-white">Aaba<span className="text-brand-500">soft</span></span>
          </div>
          <p className="text-sm">
            © 2026 Aabasoft Technologies (India) Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Sparkles icon
function SparklesIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4M3 5h4M19 3v4M17 5h4M5 19v4M3 21h4"/>
    </svg>
  );
}

// Temporary icon to avoid import error
function AlertCircle(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
