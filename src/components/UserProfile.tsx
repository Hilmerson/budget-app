'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useUserData } from '@/hooks/useDataFetching';
import { makeAccessibleButton } from '@/utils/accessibility';

interface ThemeOption {
  id: string;
  name: string;
  color: string;
}

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function UserProfile() {
  const { data: session } = useSession();
  const { userData, isLoadingUser, refetchUser } = useUserData();
  const { gamification: { level, experience, nextLevelExperience } } = useBudgetStore();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Mock data - would be customizable in a real app
  const themeOptions: ThemeOption[] = [
    { id: 'default', name: 'Default', color: 'bg-blue-600' },
    { id: 'emerald', name: 'Emerald', color: 'bg-emerald-600' },
    { id: 'amber', name: 'Amber', color: 'bg-amber-600' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-600' },
    { id: 'rose', name: 'Rose', color: 'bg-rose-600' },
  ];
  
  const notificationSettings: NotificationSetting[] = [
    { 
      id: 'budget-alerts', 
      name: 'Budget Alerts', 
      description: 'Get notified when you approach budget limits',
      enabled: true
    },
    { 
      id: 'goal-updates', 
      name: 'Goal Updates', 
      description: 'Receive updates on your savings goals progress',
      enabled: true
    },
    { 
      id: 'tips', 
      name: 'Financial Tips', 
      description: 'Weekly tips to improve your financial health',
      enabled: false
    },
    { 
      id: 'achievements', 
      name: 'Achievements', 
      description: 'Notifications about new badges and leveling up',
      enabled: true
    },
  ];
  
  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setBio(userData.bio || ''); // Add bio field to your user model in prisma
    }
  }, [userData]);
  
  const toggleNotification = (id: string) => {
    // In a real app, this would update the user's notification preferences
    console.log(`Toggled notification: ${id}`);
  };
  
  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    // In a real app, you would save this to the user's preferences
  };
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Update user profile via API
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
      
      // Refresh user data
      refetchUser();
      
      // Force a session refresh by redirecting the user - this is the most reliable method
      setTimeout(() => {
        window.location.href = '/dashboard'; // Redirect to dashboard to trigger complete session refresh
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Extract the accessibility props from the makeAccessibleButton utility
  const getAccessibilityProps = (onClickFn: () => void) => {
    const { onClick, onKeyDown, role, tabIndex } = makeAccessibleButton(onClickFn);
    return { onClick, onKeyDown, tabIndex };
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <a href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </a>
      </div>
      
      {/* Profile header with user info and stats */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile picture/avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-semibold">
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  className="w-32 h-32 rounded-full object-cover" 
                />
              ) : (
                getInitials(session?.user?.name || '')
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <span className="text-sm font-bold">{level}</span>
              </div>
            </div>
          </div>
          
          {/* User info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">
              {session?.user?.name || 'User'}
            </h2>
            <p className="text-gray-600 mb-4">
              {session?.user?.email || ''}
            </p>
            
            {/* User stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500">Level</div>
                <div className="font-bold text-xl">{level}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500">XP</div>
                <div className="font-bold text-xl">{experience} / {nextLevelExperience}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500">Member Since</div>
                <div className="font-bold text-lg">
                  {userData?.createdAt 
                    ? new Date(userData.createdAt).toLocaleDateString()
                    : (session?.user && 'Today') || 'Loading...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile content tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
        {/* Tab navigation */}
        <div className="flex border-b border-gray-200" role="tablist">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium cursor-pointer transition-colors ${
              activeTab === 'personal'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            role="tab"
            aria-selected={activeTab === 'personal'}
            aria-controls="personal-panel"
            id="personal-tab"
            {...getAccessibilityProps(() => setActiveTab('personal'))}
          >
            Personal Info
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium cursor-pointer transition-colors ${
              activeTab === 'appearance'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            role="tab"
            aria-selected={activeTab === 'appearance'}
            aria-controls="appearance-panel"
            id="appearance-tab"
            {...getAccessibilityProps(() => setActiveTab('appearance'))}
          >
            Appearance
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium cursor-pointer transition-colors ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            role="tab"
            aria-selected={activeTab === 'notifications'}
            aria-controls="notifications-panel"
            id="notifications-tab"
            {...getAccessibilityProps(() => setActiveTab('notifications'))}
          >
            Notifications
          </button>
        </div>
        
        {/* Tab content */}
        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div 
              role="tabpanel"
              id="personal-panel"
              aria-labelledby="personal-tab"
            >
              {message.text && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message.text}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about yourself"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                          isSaving ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div 
              role="tabpanel"
              id="appearance-panel"
              aria-labelledby="appearance-tab"
            >
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">App Theme</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {themeOptions.map((theme) => (
                    <div
                      key={theme.id}
                      className={`cursor-pointer rounded-lg p-4 flex flex-col items-center border-2 ${
                        selectedTheme === theme.id
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleThemeChange(theme.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleThemeChange(theme.id);
                        }
                      }}
                      role="radio"
                      aria-checked={selectedTheme === theme.id}
                      tabIndex={0}
                    >
                      <div className={`w-10 h-10 rounded-full ${theme.color} mb-2`}></div>
                      <span className="text-sm font-medium">{theme.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Currency</h3>
                <select
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div 
              role="tabpanel"
              id="notifications-panel"
              aria-labelledby="notifications-tab"
            >
              <div className="space-y-6">
                {notificationSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{setting.name}</h4>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={setting.enabled}
                        onChange={() => toggleNotification(setting.id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Email Frequency</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value="daily"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Daily digest</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value="weekly"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Weekly summary</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value="important"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Important updates only</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 