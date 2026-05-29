import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, XCircle } from 'lucide-react';

export function WarningOverlay({ reason, countdown }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#1a0a0a] border-2 border-red-500/60 rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_60px_rgba(239,68,68,0.3)]"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-yellow-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">⚠️ WARNING</h2>
        <p className="text-red-300 text-sm mb-4">{reason}</p>
        <div className="text-4xl font-black text-yellow-400 mb-3">{countdown}</div>
        <p className="text-xs text-gray-500">Next violation will immediately terminate your interview.</p>
      </motion.div>
    </motion.div>
  );
}

export function TerminatedScreen({ reason, onAcknowledge }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0d0203]"
    >
      <motion.div
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="max-w-lg w-full text-center px-8"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center"
        >
          <XCircle className="w-12 h-12 text-red-500" />
        </motion.div>
        <h1 className="text-5xl font-black text-red-500 mb-3 tracking-tight">TERMINATED</h1>
        <div className="w-16 h-1 bg-red-500/50 mx-auto mb-6 rounded-full" />
        <p className="text-red-300 text-lg font-semibold mb-2">Interview Disqualified</p>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-300"><span className="text-red-400 font-semibold">Reason:</span> {reason}</p>
        </div>
        <p className="text-xs text-gray-500 mb-8">
          Your interview has been flagged and submitted to HR for review.
          Cheating is taken very seriously. This incident has been recorded.
        </p>
        <button
          onClick={onAcknowledge}
          className="px-8 py-3 bg-red-600/20 border border-red-500/40 text-red-400 rounded-xl font-semibold hover:bg-red-600/30 transition-all"
        >
          Return to Portal
        </button>
      </motion.div>
    </motion.div>
  );
}
