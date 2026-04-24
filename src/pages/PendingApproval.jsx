import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ChevronRight, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';

// ─────────────────────────────────────────────
// PROGRESS TRACKER
// ─────────────────────────────────────────────
const steps = [
  { id: 1, label: 'Account Created' },
  { id: 2, label: 'Password Set' },
  { id: 3, label: 'Profile Submitted' },
  { id: 4, label: 'Under Review' },
  { id: 5, label: 'Access Granted' },
];

const ProgressTracker = ({ status }) => {
  const currentStep = status === 'PENDING' ? 2 : status === 'SUBMITTED' ? 4 : 5;
  return (
    <div className="flex items-center gap-0 w-full max-w-2xl mx-auto mb-12">
      {steps.map((step, idx) => (
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
          {idx < steps.length - 1 && (
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
// UNDER REVIEW SCREEN
// ─────────────────────────────────────────────
const UnderReviewScreen = ({ user, onLogout }) => (
  <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center p-8">
    <div className="max-w-2xl w-full text-center space-y-8">
      <ProgressTracker status="SUBMITTED" />
      <div className="bg-white border border-gray-100 rounded-xl p-12 shadow-sm">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-3xl font-serif text-[#2a0b38] mb-3">Profile Under Review</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto mb-8">
          Thank you, <strong>{user?.name}</strong>. Your membership profile has been submitted and is currently being reviewed by the ILC team. You will receive an email once approved.
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

  // If already submitted, show under review
  const profileStatus = user?.profileStatus || 'PENDING';

  useEffect(() => {
    if (profileStatus === 'SUBMITTED') return;
    fetchForm();
  }, []);

  const fetchForm = async () => {
    setFormLoading(true);
    try {
      const res = await client.get('/gf/form');
      setFormFields(res.data.fields);

      // Initialize values
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
        [fieldId]: checked
          ? [...current, value]
          : current.filter(v => v !== value)
      };
    });
    setErrors(p => ({ ...p, [fieldId]: null }));
  };

  const validate = () => {
    const errs = {};
    formFields.forEach(field => {
      if (!field.isRequired) return;
      if (field.type === 'html' || field.type === 'captcha') return;
      const val = values[field.id];
      if (field.type === 'checkbox') {
        if (!val || val.length === 0) errs[field.id] = 'Please select at least one option';
      } else {
        if (!val || !String(val).trim()) errs[field.id] = 'This field is required';
      }
    });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Scroll to first error
      const firstErr = document.querySelector('[data-error="true"]');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      await client.post('/gf/submit', { values });
      setSubmitted(true);
      // Update local user state
      const updatedUser = { ...user, profileStatus: 'SUBMITTED' };
      localStorage.setItem('ilc_user', JSON.stringify(updatedUser));
    } catch (err) {
      setFormError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show under review if already submitted or just submitted
  if (profileStatus === 'SUBMITTED' || submitted) {
    return <UnderReviewScreen user={user} onLogout={logout} />;
  }

  // Loading state
  if (formLoading) {
    return (
      <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your profile form...</p>
      </div>
    );
  }

  // Error state
  if (formError && formFields.length === 0) {
    return (
      <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-sm">{formError}</p>
          <button onClick={fetchForm} className="text-[#2a0b38] font-bold text-sm underline">Try again</button>
        </div>
      </div>
    );
  }

  // ── RENDER FORM
  return (
    <div className="min-h-screen bg-[#FCFBFA] py-12 px-8">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest">Membership</p>
          <h1 className="text-4xl font-serif text-[#2a0b38]">Complete Your Profile</h1>
          <p className="text-gray-500 text-sm">Please fill in all required fields to complete your ILC membership.</p>
        </div>

        <ProgressTracker status="PENDING" />

        {formError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
            <p className="text-[12px] text-red-600">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-6">

            {formFields.map(field => {
              if (field.type === 'html' || field.type === 'captcha') return null;

              const hasError = !!errors[field.id];
              const inputBase = `block w-full px-4 py-3 border rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 transition-all ${
                hasError ? 'border-red-300 focus:ring-red-300' : 'border-gray-100 focus:ring-[#2a0b38]'
              }`;

              return (
                <div key={field.id} data-error={hasError} className="space-y-2">
                  <label className="text-[11px] font-bold tracking-[0.1em] text-gray-600 uppercase">
                    {field.label}
                    {field.isRequired && <span className="text-red-400 ml-1">*</span>}
                  </label>

                  {/* TEXT */}
                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={values[field.id] || ''}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className={inputBase}
                    />
                  )}

                  {/* DATE */}
                  {field.type === 'date' && (
                    <input
                      type="date"
                      value={values[field.id] || ''}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className={inputBase}
                    />
                  )}

                  {/* TEXTAREA */}
                  {field.type === 'textarea' && (
                    <textarea
                      value={values[field.id] || ''}
                      onChange={e => handleChange(field.id, e.target.value)}
                      rows={4}
                      className={`${inputBase} resize-none`}
                    />
                  )}

                  {/* SELECT / DROPDOWN */}
                  {field.type === 'select' && (
                    <select
                      value={values[field.id] || ''}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className={inputBase}
                    >
                      <option value="">Select...</option>
                      {field.choices?.filter(c => c.value !== 'Select').map(choice => (
                        <option key={choice.value} value={choice.value}>{choice.text}</option>
                      ))}
                    </select>
                  )}

                  {/* RADIO */}
                  {field.type === 'radio' && (
                    <div className="flex gap-6">
                      {field.choices?.map(choice => (
                        <label key={choice.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`field_${field.id}`}
                            value={choice.value}
                            checked={values[field.id] === choice.value}
                            onChange={() => handleChange(field.id, choice.value)}
                            className="accent-[#2a0b38]"
                          />
                          <span className="text-sm text-gray-700">{choice.text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* CHECKBOX */}
                  {field.type === 'checkbox' && field.id !== 53 && (
                    <div className="space-y-2">
                      {field.choices?.map(choice => (
                        <label key={choice.value} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={(values[field.id] || []).includes(choice.value)}
                            onChange={e => handleCheckbox(field.id, choice.value, e.target.checked)}
                            className="accent-[#2a0b38] w-4 h-4"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-[#2a0b38] transition-colors">
                            {choice.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* I AGREE — special consent checkbox */}
                  {field.type === 'checkbox' && field.id === 53 && (
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(values[field.id] || []).length > 0}
                        onChange={e => handleCheckbox(
                          field.id,
                          field.choices[0].value,
                          e.target.checked
                        )}
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

                  {hasError && <p className="text-[11px] text-red-500">{errors[field.id]}</p>}
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white py-5 rounded-sm flex items-center justify-center gap-3 text-[12px] font-bold tracking-[0.3em] uppercase transition-all"
          >
            {submitting ? 'Submitting...' : 'Submit Profile'}
            <ChevronRight className="w-4 h-4 text-[#EDA300]" />
          </button>

          <p className="text-center text-[11px] text-gray-400">
            Need help?{' '}
            <a href="mailto:info@et.edage.com" className="text-[#2a0b38] font-bold hover:underline">
              Contact info@et.edage.com
            </a>
          </p>
        </form>

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