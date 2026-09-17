import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail, resendVerification } from '../services/authService';
import { getErrorMessage } from '../utils/helpers';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState(token ? 'verifying' : 'pending');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const { message: msg } = await verifyEmail({ token });
        setStatus('success');
        setMessage(msg || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(getErrorMessage(err, 'Verification failed. The link may have expired.'));
      }
    };

    verify();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendMessage('');
    setResending(true);

    try {
      const { message: msg } = await resendVerification({ email: resendEmail });
      setResendMessage(msg || 'Verification email sent!');
    } catch (err) {
      setResendMessage(getErrorMessage(err, 'Failed to resend verification email.'));
    } finally {
      setResending(false);
    }
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900">Verifying your email...</h1>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            to="/login"
            className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {status === 'error' ? (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          ) : (
            <Mail className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {status === 'error' ? 'Verification Failed' : 'Check Your Email'}
          </h1>
          <p className="text-gray-600 mt-2">
            {status === 'error'
              ? message
              : 'We sent a verification link to your email. Click the link to activate your account.'}
          </p>
        </div>

        <form onSubmit={handleResend} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <p className="text-sm text-gray-600">Didn&apos;t receive the email? Enter your address to resend.</p>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {resendMessage && (
            <p className={`text-sm ${resendMessage.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
              {resendMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={resending}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {resending ? <LoadingSpinner size="small" /> : 'Resend Verification Email'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
