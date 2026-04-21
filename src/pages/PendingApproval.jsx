import React from 'react';
import { useAuthStore } from '../store/authStore';

const PendingApproval = () => {
  const { user, logout } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const isSubmitted = user?.profileStatus === 'SUBMITTED';

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-lg text-center">

        <div className="w-16 h-16 rounded-full bg-[#FDF8EE] border border-[#E8D9A0] flex items-center justify-center mx-auto mb-8 text-2xl">
          {isSubmitted ? '🕐' : '📋'}
        </div>

        <p className="text-[#C8931A] text-[9px] font-bold uppercase tracking-[0.3em] mb-3">
          {isSubmitted ? 'Under Review' : 'Onboarding In Progress'}
        </p>

        <h1 className="font-serif text-4xl text-[#1A1018] font-light mb-4">
          {isSubmitted ? `We've got your details, ${firstName}.` : `Almost there, ${firstName}.`}
        </h1>

        <p className="text-sm text-[#7A6E66] font-light leading-relaxed mb-10 max-w-md mx-auto">
          {isSubmitted
            ? 'Your profile is currently under review by the ILC team. You will receive an email once approved — typically within 48 hours.'
            : 'Your account is ready. Complete your member profile to unlock full access to the ILC Executive Portal.'
          }
        </p>

        {/* Progress steps */}
        <div className="bg-white border border-[#E8E2D9] p-6 text-left mb-8 rounded-sm">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#B0A89E] mb-5">
            Onboarding Progress
          </p>
          {[
            { label: 'Account created by ILC team', done: true },
            { label: 'Password reset completed', done: true },
            { label: 'Member profile form', done: isSubmitted, active: !isSubmitted },
            { label: 'Admin review & approval', done: false, active: isSubmitted },
            { label: 'Full dashboard access', done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4 mb-4 last:mb-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                step.done ? 'bg-green-100 text-green-700' :
                step.active ? 'bg-[#FDF8EE] text-[#C8931A] border border-[#E8D9A0]' :
                'bg-[#F2EEE8] text-[#B0A89E]'
              }`}>
                {step.done ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${
                step.done ? 'text-[#B0A89E] line-through' :
                step.active ? 'text-[#1A1018] font-medium' :
                'text-[#B0A89E]'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {!isSubmitted && (
          <button className="w-full bg-[#C8931A] hover:opacity-85 text-white py-4 text-[10px] font-bold tracking-[0.28em] uppercase transition-all mb-4 rounded-sm">
            Complete Profile Form →
          </button>
        )}

        <button
          onClick={logout}
          className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B0A89E] hover:text-red-400 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;