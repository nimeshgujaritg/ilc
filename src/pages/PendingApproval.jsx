import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ChevronRight, ChevronLeft, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';

// ─────────────────────────────────────────────
// MEMBERSHIP PROGRESS TRACKER (top)
// ─────────────────────────────────────────────
const membershipSteps = [
  { id: 1, label: 'Account Created' },
  { id: 2, label: 'Password Set' },
  { id: 3, label: 'Profile Submitted' },
  { id: 4, label: 'Under Review' },
  { id: 5, label: 'Access Granted' },
];

const MembershipProgress = ({ status }) => {
  const currentStep = status === 'PENDING' ? 2 : status === 'SUBMITTED' ? 4 : 5;
  return (
    <div className="flex items-center gap-0 w-full max-w-2xl mx-auto mb-12">
      {membershipSteps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
              step.id < currentStep ? 'bg-emerald-500 text-white' :
              step.id === currentStep ? 'bg-[#2a0b38] text-white ring-4 ring-[#2a0b38]/20' :
              'bg-gray-100 text-gray-400'
            }`}>
              {step.id < currentStep ? <CheckCircle className="w-4 h-4" /> : step.id}
            </div>
            <p className={`text-[9px] font-bold uppercase tracking-wider text-center leading-tight ${
              step.id <= currentStep ? 'text-[#2a0b38]' : 'text-gray-300'
            }`}>{step.label}</p>
          </div>
          {idx < membershipSteps.length - 1 && (
            <div className={`h-[2px] flex-1 mb-6 transition-all ${
              step.id < currentStep ? 'bg-emerald-500' : 'bg-gray-100'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// STEP INDICATOR (inside form)
// ─────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center gap-3 mb-8">
    {[1, 2].map(s => (
      <React.Fragment key={s}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
            s < currentStep ? 'bg-emerald-500 text-white' :
            s === currentStep ? 'bg-[#2a0b38] text-white' :
            'bg-gray-100 text-gray-400'
          }`}>
            {s < currentStep ? <CheckCircle className="w-3.5 h-3.5" /> : s}
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-widest ${
            s === currentStep ? 'text-[#2a0b38]' : 'text-gray-300'
          }`}>
            {s === 1 ? 'Personal Info' : 'Preferences'}
          </span>
        </div>
        {s < 2 && <div className={`h-[2px] flex-1 transition-all ${s < currentStep ? 'bg-emerald-500' : 'bg-gray-100'}`} />}
      </React.Fragment>
    ))}
  </div>
);

// ─────────────────────────────────────────────
// UNDER REVIEW SCREEN
// ─────────────────────────────────────────────
const UnderReviewScreen = ({ user, onLogout }) => (
  <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center p-8">
    <div className="max-w-2xl w-full text-center space-y-8">
      <MembershipProgress status="SUBMITTED" />
      <div className="bg-white border border-gray-100 rounded-xl p-12 shadow-sm">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-3xl font-serif text-[#2a0b38] mb-3">Profile Under Review</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto mb-8">
          Thank you, <strong>{user?.name}</strong>. Your membership profile has been submitted
          and is currently being reviewed by the ILC team. You will receive an email once approved.
        </p>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-400 transition-colors mx-auto"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// FIELD IDs for step splitting
// Step 1: Personal Info
// Step 2: Preferences + Consent
// ─────────────────────────────────────────────
const STEP1_FIELDS = [50, 33, 62, 64, 63, 59, 68]; // name, dob, org, address, dietary, tshirt
// Everything else goes to step 2

// ─────────────────────────────────────────────
// SINGLE FIELD RENDERER
// ─────────────────────────────────────────────
const FieldRenderer = ({ field, value, error, onChange, onCheckbox }) => {
  const inputBase = `block w-full px-4 py-3 border rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 transition-all ${
    error ? 'border-red-300 focus:ring-red-300' : 'border-gray-100 focus:ring-[#2a0b38]'
  }`;

  return (
    <div data-error={!!error} className="space-y-2">
      <label className="text-[11px] font-bold tracking-[0.1em] text-gray-600 uppercase">
        {field.label}
        {field.isRequired && <span className="text-red-400 ml-1">*</span>}
      </label>

      {field.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(field.id, e.target.value)}
          className={inputBase}
        />
      )}

      {field.type === 'date' && (
        <input
          type="date"
          value={value || ''}
          onChange={e => onChange(field.id, e.target.value)}
          className={inputBase}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          value={value || ''}
          onChange={e => onChange(field.id, e.target.value)}
          rows={4}
          className={`${inputBase} resize-none`}
        />
      )}

      {field.type === 'select' && (
        <select
          value={value || ''}
          onChange={e => onChange(field.id, e.target.value)}
          className={inputBase}
        >
          <option value="">Select...</option>
          {field.choices?.filter(c => c.value !== 'Select').map(choice => (
            <option key={choice.value} value={choice.value}>{choice.text}</option>
          ))}
        </select>
      )}

      {field.type === 'radio' && (
        <div className="flex gap-6 flex-wrap">
          {field.choices?.map(choice => (
            <label key={choice.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`field_${field.id}`}
                value={choice.value}
                checked={value === choice.value}
                onChange={() => onChange(field.id, choice.value)}
                className="accent-[#2a0b38]"
              />
              <span className="text-sm text-gray-700">{choice.text}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && field.id !== 53 && (
        <div className="space-y-2">
          {field.choices?.map(choice => (
            <label key={choice.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={(value || []).includes(choice.value)}
                onChange={e => onCheckbox(field.id, choice.value, e.target.checked)}
                className="accent-[#2a0b38] w-4 h-4"
              />
              <span className="text-sm text-gray-700 group-hover:text-[#2a0b38] transition-colors">
                {choice.text}
              </span>
            </label>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && field.id === 53 && (
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={(value || []).length > 0}
            onChange={e => onCheckbox(field.id, field.choices[0].value, e.target.checked)}
            className="accent-[#2a0b38] w-4 h-4 mt-1 shrink-0"
          />
          <span className="text-[12px] text-gray-600 leading-relaxed">
            I/We hereby declare that the information provided is accurate to the best of my knowledge.
            I/We hereby consent to retain my/our information on the TSSL database or may be shared
            with partners/sponsors of TSSL Events. I/We accept the{' '}
            <a href="https://et-edge.com/policy/#privacy-policy" target="_blank" rel="noopener noreferrer"
              className="text-[#2a0b38] underline">Privacy Policy</a>{' '}
            &{' '}
            <a href="https://et-edge.com/policy/#privacy-policy" target="_blank" rel="noopener noreferrer"
              className="text-[#2a0b38] underline">Terms of Use</a>.
          </span>
        </label>
      )}

      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const PendingApproval = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [formFields, setFormFields] = useState([]);
  const [formLoading, setFormLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [profileStatus, setProfileStatus] = useState(user?.profileStatus || 'PENDING');
  const [statusLoading, setStatusLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await client.get('/auth/me');
        const freshStatus = res.data.user.profileStatus;
        setProfileStatus(freshStatus);

        // Auto redirect if approved
        if (freshStatus === 'APPROVED') {
          const role = res.data.user.role;
          navigate(role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
          return;
        }

        if (freshStatus !== 'SUBMITTED') fetchForm();
      } catch (err) {
        if ((user?.profileStatus || 'PENDING') !== 'SUBMITTED') fetchForm();
      } finally {
        setStatusLoading(false);
      }
    };

    // Check immediately on mount
    checkStatus();

    // Then poll every 30 seconds
    const interval = setInterval(async () => {
      try {
        const res = await client.get('/auth/me');
        const freshStatus = res.data.user.profileStatus;
        setProfileStatus(freshStatus);
        if (freshStatus === 'APPROVED') {
          const role = res.data.user.role;
          navigate(role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
        }
      } catch (err) {}
    }, 30000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchForm = async () => {
    setFormLoading(true);
    try {
      const res = await client.get('/gf/form');
      setFormFields(res.data.fields);
      const initial = {};
      res.data.fields.forEach(f => {
        if (f.type === 'checkbox') initial[f.id] = [];
        else initial[f.id] = '';
      });
      setValues(initial);
    } catch (err) {
      setFormError('Failed to load form. Please refresh the page.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (fieldId, value) => {
    setValues(p => ({ ...p, [fieldId]: value }));
    setErrors(p => ({ ...p, [fieldId]: null }));
  };

  const handleCheckbox = (fieldId, value, checked) => {
    setValues(p => {
      const current = p[fieldId] || [];
      return {
        ...p,
        [fieldId]: checked ? [...current, value] : current.filter(v => v !== value)
      };
    });
    setErrors(p => ({ ...p, [fieldId]: null }));
  };

  // Validate only the fields visible in the current step
  const validateStep = (stepFields) => {
    const errs = {};
    stepFields.forEach(field => {
      if (!field.isRequired) return;
      const val = values[field.id];
      if (field.type === 'checkbox') {
        if (!val || val.length === 0) errs[field.id] = 'Please select at least one option';
      } else {
        if (!val || !String(val).trim()) errs[field.id] = 'This field is required';
      }
    });
    return errs;
  };

  const step1Fields = formFields.filter(f => STEP1_FIELDS.includes(f.id));
  const step2Fields = formFields.filter(f => !STEP1_FIELDS.includes(f.id));

  const handleNext = () => {
    const errs = validateStep(step1Fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstErr = document.querySelector('[data-error="true"]');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    const errs = validateStep(step2Fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstErr = document.querySelector('[data-error="true"]');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      await client.post('/gf/submit', { values });
      setSubmitted(true);
      const updatedUser = { ...user, profileStatus: 'SUBMITTED' };
      localStorage.setItem('ilc_user', JSON.stringify(updatedUser));
    } catch (err) {
      setFormError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── GUARDS
  if (profileStatus === 'SUBMITTED' || submitted) {
    return <UnderReviewScreen user={user} onLogout={logout} />;
  }
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }
  if (formLoading) {
    return (
      <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your profile form...</p>
      </div>
    );
  }
  if (formError && formFields.length === 0) {
    return (
      <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-sm">{formError}</p>
          <button onClick={fetchForm} className="text-[#2a0b38] font-bold text-sm underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const activeFields = currentStep === 1 ? step1Fields : step2Fields;

  // ── RENDER
  return (
    <div className="min-h-screen bg-[#FCFBFA] py-12 px-8">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest">Membership</p>
          <h1 className="text-4xl font-serif text-[#2a0b38]">Complete Your Profile</h1>
          <p className="text-gray-500 text-sm">
            Step {currentStep} of 2 — {currentStep === 1 ? 'Personal Information' : 'Preferences & Consent'}
          </p>
        </div>

        <MembershipProgress status="PENDING" />

        {formError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
            <p className="text-[12px] text-red-600">{formError}</p>
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-6">

          <StepIndicator currentStep={currentStep} />

          {activeFields.map(field => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={values[field.id]}
              error={errors[field.id]}
              onChange={handleChange}
              onCheckbox={handleCheckbox}
            />
          ))}

          {/* Navigation buttons */}
          <div className="flex items-center gap-4 pt-4">
            {currentStep === 2 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-4 border border-gray-200 rounded-sm text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#2a0b38] hover:border-[#2a0b38] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {currentStep === 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-[#2a0b38] hover:bg-[#1a0525] text-white py-4 rounded-sm flex items-center justify-center gap-3 text-[12px] font-bold tracking-[0.3em] uppercase transition-all"
              >
                Next — Preferences
                <ChevronRight className="w-4 h-4 text-[#EDA300]" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white py-4 rounded-sm flex items-center justify-center gap-3 text-[12px] font-bold tracking-[0.3em] uppercase transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Profile'}
                <ChevronRight className="w-4 h-4 text-[#EDA300]" />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400">
          Need help?{' '}
          <a href="mailto:info@et-edge.com" className="text-[#2a0b38] font-bold hover:underline">
            Contact info@et-edge.com
          </a>
        </p>

        <div className="text-center">
          <button
            onClick={logout}
            className="text-[11px] text-gray-400 hover:text-red-400 font-bold uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;