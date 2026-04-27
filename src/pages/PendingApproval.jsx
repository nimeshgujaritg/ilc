import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ChevronRight, ChevronLeft, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';

const LOGO_URL = 'https://www.indialeadershipcouncil.com/wp-content/uploads/2026/04/ilc-faciliting.png';

const STEP1_FIELDS = [50, 33, 62, 64, 63, 59, 68];

// ─────────────────────────────────────────────
// LEFT PANEL
// ─────────────────────────────────────────────
const LeftPanel = ({ currentStep, user }) => (
  <div className="hidden lg:flex w-[420px] shrink-0 bg-[#1a0525] flex-col justify-between p-12 relative overflow-hidden">
    {/* Background decorations */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-[#EDA300] opacity-[0.03] rounded-full -translate-y-32 translate-x-32" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#EDA300] opacity-[0.03] rounded-full translate-y-24 -translate-x-24" />

    {/* Top */}
    <div>
      <img src={LOGO_URL} alt="ILC" className="h-12 object-contain mb-16" />

      <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
        Membership Onboarding
      </p>
      <h1 className="text-white font-serif text-4xl leading-tight mb-6">
        Welcome to the<br />Council,<br />
        <span className="text-[#EDA300]">{user?.name?.split(' ')[0] || 'Executive'}.</span>
      </h1>
      <p className="text-gray-400 text-sm leading-relaxed">
        Complete your membership profile to gain full access to the India Leadership Council portal.
      </p>
    </div>

    {/* Steps */}
    <div className="space-y-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6">Your Progress</p>

      {[
        { step: 1, label: 'Personal Information', desc: 'Name, DOB, Organization' },
        { step: 2, label: 'Preferences & Consent', desc: 'Interests, dietary, consent' },
      ].map(item => (
        <div key={item.step} className="flex items-start gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-all ${
            item.step < currentStep ? 'bg-emerald-500 text-white' :
            item.step === currentStep ? 'bg-[#EDA300] text-[#1a0525]' :
            'bg-white/10 text-gray-500'
          }`}>
            {item.step < currentStep ? <CheckCircle className="w-4 h-4" /> : item.step}
          </div>
          <div>
            <p className={`text-sm font-bold ${item.step === currentStep ? 'text-white' : 'text-gray-500'}`}>
              {item.label}
            </p>
            <p className="text-[11px] text-gray-600 mt-0.5">{item.desc}</p>
          </div>
        </div>
      ))}

      <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-3">
        <Shield className="w-4 h-4 text-[#EDA300]" />
        <p className="text-[11px] text-gray-500">Your data is encrypted and secure</p>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// UNDER REVIEW SCREEN
// ─────────────────────────────────────────────
const UnderReviewScreen = ({ user, onLogout }) => (
  <div className="min-h-screen flex">
    <div className="hidden lg:flex w-[420px] shrink-0 bg-[#1a0525] flex-col justify-between p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#EDA300] opacity-[0.03] rounded-full -translate-y-32 translate-x-32" />
      <div>
        <img src={LOGO_URL} alt="ILC" className="h-12 object-contain mb-16" />
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Status Update</p>
        <h1 className="text-white font-serif text-4xl leading-tight mb-6">
          Profile<br />Submitted<br />
          <span className="text-[#EDA300]">Successfully.</span>
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Our team is reviewing your membership profile. You will be notified via email once approved.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Shield className="w-4 h-4 text-[#EDA300]" />
        <p className="text-[11px] text-gray-500">Your data is encrypted and secure</p>
      </div>
    </div>

    <div className="flex-1 bg-[#FCFBFA] flex items-center justify-center p-12">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <div>
          <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-3">Under Review</p>
          <h2 className="text-3xl font-serif text-[#2a0b38] mb-4">We've Got Your Profile</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Thank you, <strong>{user?.name}</strong>. Your membership profile is currently being reviewed by the ILC team. This usually takes 1-2 business days.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 text-left space-y-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">What happens next?</p>
          {[
            'ILC team reviews your profile',
            'You receive an approval email',
            'Full portal access is granted',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#1a0525] text-[#EDA300] flex items-center justify-center text-[10px] font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-gray-600">{item}</p>
            </div>
          ))}
        </div>

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
// FIELD RENDERER
// ─────────────────────────────────────────────
const FieldRenderer = ({ field, value, error, onChange, onCheckbox }) => {
  const inputBase = `block w-full px-4 py-3 border rounded-lg bg-white text-sm text-gray-800 outline-none focus:ring-2 transition-all ${
    error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#EDA300]/30 focus:border-[#EDA300]'
  }`;

  return (
    <div data-error={!!error} className="space-y-2">
      <label className="text-[11px] font-bold tracking-[0.1em] text-gray-500 uppercase">
        {field.label}
        {field.isRequired && <span className="text-[#EDA300] ml-1">*</span>}
      </label>

      {field.type === 'text' && (
        <input type="text" value={value || ''} onChange={e => onChange(field.id, e.target.value)} className={inputBase} />
      )}
      {field.type === 'date' && (
        <input type="date" value={value || ''} onChange={e => onChange(field.id, e.target.value)} className={inputBase} />
      )}
      {field.type === 'textarea' && (
        <textarea value={value || ''} onChange={e => onChange(field.id, e.target.value)} rows={4} className={`${inputBase} resize-none`} />
      )}
      {field.type === 'select' && (
        <select value={value || ''} onChange={e => onChange(field.id, e.target.value)} className={inputBase}>
          <option value="">Select...</option>
          {field.choices?.filter(c => c.value !== 'Select').map(choice => (
            <option key={choice.value} value={choice.value}>{choice.text}</option>
          ))}
        </select>
      )}
      {field.type === 'radio' && (
        <div className="flex gap-4 flex-wrap">
          {field.choices?.map(choice => (
            <label key={choice.value} className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border transition-all ${
              value === choice.value ? 'border-[#EDA300] bg-[#EDA300]/10 text-[#1a0525]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name={`field_${field.id}`}
                value={choice.value}
                checked={value === choice.value}
                onChange={() => onChange(field.id, choice.value)}
                className="hidden"
              />
              <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                value === choice.value ? 'border-[#EDA300]' : 'border-gray-300'
              }`}>
                {value === choice.value && <div className="w-1.5 h-1.5 rounded-full bg-[#EDA300]" />}
              </div>
              <span className="text-sm font-medium">{choice.text}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === 'checkbox' && field.id !== 53 && (
        <div className="grid grid-cols-2 gap-2">
          {field.choices?.map(choice => {
            const checked = (value || []).includes(choice.value);
            return (
              <label key={choice.value} className={`flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border transition-all ${
                checked ? 'border-[#EDA300] bg-[#EDA300]/10 text-[#1a0525]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => onCheckbox(field.id, choice.value, e.target.checked)}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  checked ? 'border-[#EDA300] bg-[#EDA300]' : 'border-gray-300'
                }`}>
                  {checked && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs font-medium leading-tight">{choice.text}</span>
              </label>
            );
          })}
        </div>
      )}
      {field.type === 'checkbox' && field.id === 53 && (
        <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border transition-all ${
          (value || []).length > 0 ? 'border-[#EDA300] bg-[#EDA300]/5' : 'border-gray-200'
        }`}>
          <input
            type="checkbox"
            checked={(value || []).length > 0}
            onChange={e => onCheckbox(field.id, field.choices[0].value, e.target.checked)}
            className="hidden"
          />
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            (value || []).length > 0 ? 'border-[#EDA300] bg-[#EDA300]' : 'border-gray-300'
          }`}>
            {(value || []).length > 0 && <CheckCircle className="w-3.5 h-3.5 text-white" />}
          </div>
          <span className="text-[12px] text-gray-600 leading-relaxed">
            I/We hereby declare that the information provided is accurate to the best of my knowledge.
            I/We hereby consent to retain my/our information on the TSSL database or may be shared
            with partners/sponsors of TSSL Events. I/We accept the{' '}
            <a href="https://et-edge.com/policy/#privacy-policy" target="_blank" rel="noopener noreferrer"
              className="text-[#2a0b38] underline font-bold">Privacy Policy</a>{' '}
            &{' '}
            <a href="https://et-edge.com/policy/#privacy-policy" target="_blank" rel="noopener noreferrer"
              className="text-[#2a0b38] underline font-bold">Terms of Use</a>.
          </span>
        </label>
      )}
      {error && <p className="text-[11px] text-red-500 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const PendingApproval = () => {
  const { user, logout, updateUser } = useAuthStore();
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
        if (freshStatus === 'APPROVED') {
updateUser({ profileStatus: 'APPROVED' });
window.location.href = res.data.user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard';
  return;
}
        if (freshStatus !== 'SUBMITTED') fetchForm();
      } catch (err) {
        if ((user?.profileStatus || 'PENDING') !== 'SUBMITTED') fetchForm();
      } finally {
        setStatusLoading(false);
      }
    };
    checkStatus();
    const interval = setInterval(async () => {
  try {
    const res = await client.get('/auth/me');
    const freshStatus = res.data.user.profileStatus;
    setProfileStatus(freshStatus);
    if (freshStatus === 'APPROVED') {
      // Update localStorage so Zustand picks up new status
      updateUser({ profileStatus: 'APPROVED' });
window.location.href = '/dashboard';
    }
  } catch (err) {}
}, 30000);
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
      return { ...p, [fieldId]: checked ? [...current, value] : current.filter(v => v !== value) };
    });
    setErrors(p => ({ ...p, [fieldId]: null }));
  };

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
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
setSubmitting(true);
try {
  await client.post('/gf/submit', { values });
  setSubmitted(true);
  updateUser({ profileStatus: 'SUBMITTED' });
    } catch (err) {
      setFormError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

if (statusLoading) return (
    <div className="min-h-screen bg-[#1a0525] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#EDA300] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading your profile...</p>
      </div>
    </div>
  );

  if (profileStatus === 'SUBMITTED' || submitted) return <UnderReviewScreen user={user} onLogout={logout} />;

  if (formLoading) return (
    <div className="min-h-screen bg-[#1a0525] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#EDA300] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading your profile...</p>
      </div>
    </div>
  );

  if (formError && formFields.length === 0) return (
    <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <p className="text-red-500 text-sm">{formError}</p>
        <button onClick={fetchForm} className="text-[#2a0b38] font-bold text-sm underline">Try again</button>
      </div>
    </div>
  );

  const activeFields = currentStep === 1 ? step1Fields : step2Fields;

  return (
    <div className="min-h-screen flex">
      <LeftPanel currentStep={currentStep} user={user} />

      {/* Right side */}
      <div className="flex-1 bg-[#FCFBFA] overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-12 space-y-8">

          {/* Mobile header */}
          <div className="lg:hidden text-center">
            <img src={LOGO_URL} alt="ILC" className="h-10 object-contain mx-auto mb-4" />
          </div>

          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest">
                Step {currentStep} of 2
              </p>
              <h2 className="text-2xl font-serif text-[#2a0b38] mt-1">
                {currentStep === 1 ? 'Personal Information' : 'Preferences & Consent'}
              </h2>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-red-400 font-bold uppercase tracking-widest transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-[#EDA300] h-1.5 rounded-full transition-all duration-500"
              style={{ width: currentStep === 1 ? '50%' : '100%' }}
            />
          </div>

          {formError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-[12px] text-red-600">⚠ {formError}</p>
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-6">
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
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4 pt-4">
            {currentStep === 2 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-4 border border-gray-200 rounded-lg text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#2a0b38] hover:border-[#2a0b38] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {currentStep === 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-[#1a0525] hover:bg-[#2a0b38] text-white py-4 rounded-lg flex items-center justify-center gap-3 text-[12px] font-bold tracking-[0.2em] uppercase transition-all"
              >
                Continue to Preferences
                <ChevronRight className="w-4 h-4 text-[#EDA300]" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-[#EDA300] hover:bg-[#d4920a] disabled:opacity-50 text-[#1a0525] py-4 rounded-lg flex items-center justify-center gap-3 text-[12px] font-bold tracking-[0.2em] uppercase transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit My Profile'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-center text-[11px] text-gray-400 pb-8">
            Need help?{' '}
            <a href="mailto:info@et-edge.com" className="text-[#2a0b38] font-bold hover:underline">
              Contact info@et-edge.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;