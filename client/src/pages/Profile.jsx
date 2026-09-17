import { useState, useEffect } from 'react';
import { User, Lock, Camera, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/userService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { INDIAN_CITIES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';

const Profile = () => {
  const { user, loadUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || null);
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '', city: user.city || '' });
      if (user.profileImage) setPreview(user.profileImage);
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setProfileMsg('');
    setProfileError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileError('');
    setProfileMsg('');
    try {
      const formData = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => formData.append(k, v));
      if (profileImage) formData.append('profileImage', profileImage);
      await updateProfile(formData);
      await loadUser();
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileError(getErrorMessage(err, 'Failed to update profile'));
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSubmitting(true);
    setPasswordError('');
    setPasswordMsg('');
    try {
      await changePassword(passwordForm);
      setPasswordMsg('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(getErrorMessage(err, 'Failed to change password'));
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Profile Information</h2>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileMsg && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200">{profileMsg}</div>}
          {profileError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">{profileError}</div>}

          <div className="flex justify-center mb-4">
            <label className="cursor-pointer group relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group-hover:border-primary-400">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                required
                pattern="[6-9][0-9]{9}"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                name="city"
                value={profileForm.city}
                onChange={handleProfileChange}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
              >
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={profileSubmitting}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {profileSubmitting ? <LoadingSpinner size="small" /> : <><Save className="w-4 h-4" /> Save Profile</>}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Change Password
        </h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordMsg && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200">{passwordMsg}</div>}
          {passwordError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">{passwordError}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordSubmitting}
            className="flex items-center gap-2 bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50"
          >
            {passwordSubmitting ? <LoadingSpinner size="small" /> : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
