import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, Users, Video, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

// Dashboard Sub-pages (Placeholders for now)
const Overview = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
        <h3 className="text-gray-400 font-medium mb-2">Total Candidates</h3>
        <p className="text-4xl font-bold text-white">128</p>
      </div>
      <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
        <h3 className="text-gray-400 font-medium mb-2">Pending Interviews</h3>
        <p className="text-4xl font-bold text-brand-400">12</p>
      </div>
      <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
        <h3 className="text-gray-400 font-medium mb-2">Avg. Match Score</h3>
        <p className="text-4xl font-bold text-blue-400">84%</p>
      </div>
    </div>
  </div>
);

const ResumeUpload = () => <div className="p-6"><h2 className="text-2xl font-bold">Resume Upload</h2></div>;
const Candidates = () => <div className="p-6"><h2 className="text-2xl font-bold">Candidates Analysis</h2></div>;
const Interviews = () => <div className="p-6"><h2 className="text-2xl font-bold">Video Interviews</h2></div>;

const NavItem = ({ to, icon: Icon, label, isActive }) => (
  <Link to={to} className="relative block">
    {isActive && (
      <motion.div
        layoutId="active-nav"
        className="absolute inset-0 bg-brand-500/10 border-r-2 border-brand-500"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
    <div className={`flex items-center gap-3 px-6 py-4 transition-colors ${isActive ? 'text-brand-400' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
  </Link>
);

const Dashboard = () => {
  const location = useLocation();
  
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-bg border-r border-dark-border flex flex-col">
        <div className="flex-1 py-6 space-y-1">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" isActive={location.pathname === '/dashboard'} />
          <NavItem to="/dashboard/upload" icon={Upload} label="Upload Resumes" isActive={location.pathname === '/dashboard/upload'} />
          <NavItem to="/dashboard/candidates" icon={Users} label="Candidates" isActive={location.pathname === '/dashboard/candidates'} />
          <NavItem to="/dashboard/interviews" icon={Video} label="Interviews" isActive={location.pathname === '/dashboard/interviews'} />
          <NavItem to="/dashboard/settings" icon={Settings} label="Settings" isActive={location.pathname === '/dashboard/settings'} />
        </div>
        <div className="p-4 border-t border-dark-border">
          <button className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 transition-colors w-full">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#0a0d14] overflow-y-auto">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/upload" element={<ResumeUpload />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/interviews" element={<Interviews />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
