import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onSuccess: (credentialResponse: any) => void;
  onError: () => void;
}

export default function Login({ onSuccess, onError }: LoginProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center"
      >
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="text-indigo-600" size={32} />
        </div>
        
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 mb-2">
          Unika Tranovel
        </h1>
        <p className="text-slate-500 mb-8">
          Sign in to access the novel translator and automatically configure API access.
        </p>

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            shape="pill"
            size="large"
            theme="filled_blue"
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={14} />
          <span>Secure Authentication</span>
        </div>
      </motion.div>
    </div>
  );
}
