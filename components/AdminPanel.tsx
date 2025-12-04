import React, { useState, useEffect } from 'react';
import { adminAPI, User, CreateUserResponse, Submission, SubmissionStats, submissionAPI, PostSubmissionData } from '../services/apiService';
import { Users, Plus, Trash2, Shield, User as UserIcon, Copy, Check, AlertCircle, FileText, BarChart3, Filter, Eye, X, MapPin, Package, Truck, Calendar, Pencil, Download, FileSpreadsheet, FileIcon, Building2, Globe2, Box, Clock, AlertTriangle, Edit, Save, DollarSign, MessageSquare } from 'lucide-react';
import { generateAndDownloadWord } from '../services/wordService';
import { generateAndDownloadExcel } from '../services/excelService';
import { generateAndDownloadPDF } from '../services/pdfService';
import { ShipmentData } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'submissions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionStats, setSubmissionStats] = useState<SubmissionStats | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUserCredentials, setNewUserCredentials] = useState<CreateUserResponse | null>(null);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [viewingUserSubmissions, setViewingUserSubmissions] = useState<string | null>(null);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [loadingUserSubmissions, setLoadingUserSubmissions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedPostData, setEditedPostData] = useState<PostSubmissionData>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
    loadSubmissionStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'submissions') {
      // Reset viewing state when switching to submissions tab
      setViewingUserSubmissions(null);
      setUserSubmissions([]);
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      setError(null);
      const data = await adminAPI.getSubmissions(selectedUserId || undefined);
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const loadUserSubmissions = async (userId: string | null) => {
    if (!userId) {
      setError('Invalid user ID');
      return;
    }
    try {
      setLoadingUserSubmissions(true);
      setError(null);
      const data = await adminAPI.getSubmissions(userId);
      setUserSubmissions(data);
      setViewingUserSubmissions(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user submissions');
    } finally {
      setLoadingUserSubmissions(false);
    }
  };

  const closeUserSubmissions = () => {
    setViewingUserSubmissions(null);
    setUserSubmissions([]);
  };

  const loadSubmissionStats = async () => {
    try {
      const stats = await adminAPI.getSubmissionStats();
      setSubmissionStats(stats);
    } catch (err) {
      console.error('Failed to load submission stats:', err);
    }
  };

  const handleCreateUser = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // Use provided values or empty strings (backend will generate random if empty)
      const newUser = await adminAPI.createUser(
        newUsername.trim() || undefined,
        newPassword.trim() || undefined,
        newEmail.trim() || undefined
      );
      
      setNewUserCredentials(newUser);
      setShowCreateForm(false);
      // Reset form
      setNewUsername('');
      setNewPassword('');
      setNewEmail('');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await adminAPI.deleteUser(userId);
      await loadUsers();
      if (newUserCredentials && newUserCredentials._id === userId) {
        setNewUserCredentials(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const copyToClipboard = (text: string, userId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUserId(userId);
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const convertSubmissionToShipmentData = (submission: Submission): ShipmentData => {
    return {
      customerName: submission.customerName,
      shipper: submission.shipper,
      receiver: submission.receiver,
      details: {
        weightLbs: submission.details.weightLbs,
        dimensions: submission.details.dimensions || [],
        isHazmat: submission.details.isHazmat,
        isReeferRequired: submission.details.isReeferRequired,
        appointments: submission.details.appointments || '',
        additionalNotes: submission.details.additionalNotes || '',
        serviceType: submission.details.serviceType as ShipmentData['details']['serviceType'],
        shipmentType: (submission.details.shipmentType as ShipmentData['details']['shipmentType']) || 'Business to Business',
        crossBorderStatus: (submission.details.crossBorderStatus as ShipmentData['details']['crossBorderStatus']) || 'Interstate',
        commodity: submission.details.commodity || '',
        unNumber: submission.details.unNumber || '',
        equipmentType: submission.details.equipmentType || '',
        shipmentTiming: (submission.details.shipmentTiming as ShipmentData['details']['shipmentTiming']) || 'Ready Now',
        readyTime: submission.details.readyTime || '',
      },
    };
  };

  const handleDownloadWord = async () => {
    if (!selectedSubmission) return;
    try {
      const shipmentData = convertSubmissionToShipmentData(selectedSubmission);
      await generateAndDownloadWord(shipmentData);
    } catch (error) {
      console.error('Failed to download Word document:', error);
      setError('Failed to download Word document');
    }
  };

  const handleDownloadExcel = async () => {
    if (!selectedSubmission) return;
    try {
      const shipmentData = convertSubmissionToShipmentData(selectedSubmission);
      await generateAndDownloadExcel(shipmentData);
    } catch (error) {
      console.error('Failed to download Excel document:', error);
      setError('Failed to download Excel document');
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedSubmission) return;
    try {
      const shipmentData = convertSubmissionToShipmentData(selectedSubmission);
      await generateAndDownloadPDF(shipmentData);
    } catch (error) {
      console.error('Failed to download PDF document:', error);
      setError('Failed to download PDF document');
    }
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setEditMode(false);
    setEditedPostData(submission.postSubmission || {});
  };

  const handleEditPostData = () => {
    setEditMode(true);
  };

  const handleSavePostData = async () => {
    if (!selectedSubmission) return;

    try {
      setSaving(true);
      setError(null);
      const result = await submissionAPI.updateSubmission(selectedSubmission._id, editedPostData);
      
      // Update the submission in the userSubmissions list
      setUserSubmissions(prev => prev.map(s => s._id === selectedSubmission._id ? result.submission : s));
      setSelectedSubmission(result.submission);
      setEditMode(false);
      
      alert('Post-submission data updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedPostData(selectedSubmission?.postSubmission || {});
  };

  const handlePostDataChange = (field: keyof PostSubmissionData, value: string) => {
    setEditedPostData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in mb-12">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-slate-800 font-bold text-lg">Admin Panel - User Management</h2>
              <p className="text-xs text-slate-500 mt-1">Manage users and access</p>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Back to App
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </div>
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'submissions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Submissions
                {submissionStats && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    {submissionStats.totalSubmissions}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* New User Credentials Modal */}
          {newUserCredentials && (
            <div className="mb-6 bg-emerald-50 border-2 border-emerald-300 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 mb-2">✅ New User Created Successfully!</h3>
                  <p className="text-sm text-emerald-700">Please save these credentials. The password will not be shown again.</p>
                </div>
                <button
                  onClick={() => setNewUserCredentials(null)}
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <label className="block text-xs font-semibold text-emerald-700 mb-1">Username</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono text-slate-900 bg-slate-50 px-3 py-2 rounded">
                      {newUserCredentials.username}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newUserCredentials.username, 'username')}
                      className="p-2 hover:bg-slate-100 rounded transition-colors"
                      title="Copy username"
                    >
                      {copiedUserId === 'username' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <label className="block text-xs font-semibold text-emerald-700 mb-1">Password</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono text-slate-900 bg-slate-50 px-3 py-2 rounded">
                      {newUserCredentials.password}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newUserCredentials.password, 'password')}
                      className="p-2 hover:bg-slate-100 rounded transition-colors"
                      title="Copy password"
                    >
                      {copiedUserId === 'password' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' ? (
            <>
              {/* Create User Form */}
              {showCreateForm && (
                <div className="mb-6 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Create New User</h3>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewUsername('');
                        setNewPassword('');
                        setNewEmail('');
                        setError(null);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">
                          Username <span className="text-slate-400 text-xs">(optional - will generate if empty)</span>
                        </label>
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="Leave empty for random username"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          minLength={3}
                          maxLength={30}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">
                          Password <span className="text-slate-400 text-xs">(optional - will generate if empty)</span>
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Leave empty for random password"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          minLength={6}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">
                        Email <span className="text-slate-400 text-xs">(optional)</span>
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={creating}
                        className={`
                          flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all
                          ${creating
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow'}
                        `}
                      >
                        {creating ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Create User
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewUsername('');
                          setNewPassword('');
                          setNewEmail('');
                        }}
                        className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Actions Bar */}
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Users ({users.length})</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage user accounts and permissions</p>
                </div>
                {!showCreateForm && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create New User
                  </button>
                )}
              </div>

              {/* Users Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No users found</p>
              <p className="text-sm text-slate-500 mt-1">Create your first user to get started</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900">{user.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-600">{user.email || '—'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`
                            inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                            ${user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-slate-100 text-slate-700'}
                          `}>
                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-500">{formatDate(user.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteUser(user._id, user.username)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
            </>
          ) : (
            <>
              {/* Submissions Stats */}
              {submissionStats && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 mb-1">Total Submissions</p>
                        <p className="text-3xl font-bold text-blue-900">{submissionStats.totalSubmissions}</p>
                      </div>
                      <BarChart3 className="w-12 h-12 text-blue-400" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600 mb-1">Active Users</p>
                        <p className="text-3xl font-bold text-purple-900">{submissionStats.submissionsByUser.length}</p>
                      </div>
                      <Users className="w-12 h-12 text-purple-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Submissions by User
                </h3>
                <p className="text-sm text-slate-500 mt-1">View submissions grouped by user</p>
              </div>

              {/* Users with Submissions */}
              {submissionStats && submissionStats.submissionsByUser.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">No submissions found</p>
                  <p className="text-sm text-slate-500 mt-1">No submissions have been created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissionStats?.submissionsByUser.map((userStat) => {
                    const user = users.find(u => u._id === userStat.userId);
                    const isDeletedUser = userStat.username === '[Deleted User]';
                    
                    return (
                      <div
                        key={userStat.userId || 'deleted'}
                        className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-3 rounded-lg ${
                              isDeletedUser 
                                ? 'bg-slate-100' 
                                : 'bg-blue-100'
                            }`}>
                              <UserIcon className={`w-5 h-5 ${
                                isDeletedUser 
                                  ? 'text-slate-400' 
                                  : 'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-base font-semibold ${
                                  isDeletedUser 
                                    ? 'text-slate-400 italic' 
                                    : 'text-slate-900'
                                }`}>
                                  {userStat.username}
                                </h4>
                                {user && user.role === 'admin' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                    <Shield className="w-3 h-3" />
                                    Admin
                                  </span>
                                )}
                              </div>
                              {user && user.email && (
                                <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm text-slate-600">
                                  <span className="font-semibold text-blue-600">{userStat.count}</span> submission{userStat.count !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => userStat.userId && loadUserSubmissions(userStat.userId)}
                            disabled={!userStat.userId}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow transition-all ${
                              userStat.userId
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            See Submissions
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* User Submissions Modal */}
              {viewingUserSubmissions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {submissionStats?.submissionsByUser.find(s => s.userId === viewingUserSubmissions)?.username || 'User'} Submissions
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {userSubmissions.length} submission{userSubmissions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={closeUserSubmissions}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {loadingUserSubmissions ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-4 text-slate-600">Loading submissions...</p>
                        </div>
                      ) : userSubmissions.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600 font-medium">No submissions found</p>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Route</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Service Type</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">File Type</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {userSubmissions.map((submission) => (
                                  <tr key={submission._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm text-slate-900 font-medium">{submission.customerName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="text-sm">
                                        <div className="text-slate-900">
                                          {submission.shipper.city}, {submission.shipper.stateOrProvince}
                                        </div>
                                        <div className="text-slate-500 text-xs">
                                          → {submission.receiver.city}, {submission.receiver.stateOrProvince}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm text-slate-600">{submission.details.serviceType}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`
                                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                        ${submission.fileType === 'word' 
                                          ? 'bg-blue-100 text-blue-700'
                                          : submission.fileType === 'excel'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : 'bg-red-100 text-red-700'}
                                      `}>
                                        {submission.fileType.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm text-slate-500">{formatDate(submission.createdAt)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                      <button
                                        onClick={() => handleViewSubmission(submission)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                        title="View details"
                                      >
                                        <Eye className="w-4 h-4" />
                                        View / Edit
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
                      <button
                        onClick={closeUserSubmissions}
                        className="px-5 py-2.5 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submission Detail Modal */}
          {selectedSubmission && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Submission Details</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {editMode ? 'Edit post-submission data' : 'View and edit submission'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSubmission(null);
                      setEditMode(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* User Info */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-600">Created By</span>
                    </div>
                    <p className={`text-base font-medium ${
                      selectedSubmission.user.username === '[Deleted User]' 
                        ? 'text-slate-400 italic' 
                        : 'text-slate-900'
                    }`}>
                      {selectedSubmission.user.username}
                    </p>
                    {selectedSubmission.user.email && (
                      <p className="text-sm text-slate-500">{selectedSubmission.user.email}</p>
                    )}
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Customer Name</label>
                    <div className="bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 font-medium">
                      {selectedSubmission.customerName}
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Shipper (Pickup)
                      </label>
                      <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-2">
                        <div className="text-sm font-medium text-slate-900">
                          {selectedSubmission.shipper.city}, {selectedSubmission.shipper.stateOrProvince}
                        </div>
                        {selectedSubmission.shipper.postalCode && (
                          <div className="text-xs text-slate-500">
                            {selectedSubmission.shipper.postalCode}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Receiver (Delivery)
                      </label>
                      <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-2">
                        <div className="text-sm font-medium text-slate-900">
                          {selectedSubmission.receiver.city}, {selectedSubmission.receiver.stateOrProvince}
                        </div>
                        {selectedSubmission.receiver.postalCode && (
                          <div className="text-xs text-slate-500">
                            {selectedSubmission.receiver.postalCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Classification */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Classification
                    </label>
                    <div className="bg-white border border-slate-300 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Shipment Type</label>
                        <div className="text-sm font-medium text-slate-900">{selectedSubmission.details.shipmentType || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Cross Border Status</label>
                        <div className="text-sm font-medium text-slate-900">{selectedSubmission.details.crossBorderStatus || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Shipment Timing
                        </label>
                        <div className="text-sm font-medium text-slate-900">{selectedSubmission.details.shipmentTiming || 'N/A'}</div>
                      </div>
                      {selectedSubmission.details.readyTime && (
                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Ready Time</label>
                          <div className="text-sm text-slate-900">{selectedSubmission.details.readyTime}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Commodity Details */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase flex items-center gap-1">
                      <Box className="w-3 h-3" /> Commodity Details
                    </label>
                    <div className="bg-white border border-slate-300 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Commodity</label>
                        <div className="text-sm font-medium text-slate-900">{selectedSubmission.details.commodity || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Equipment Type</label>
                        <div className="text-sm font-medium text-slate-900">{selectedSubmission.details.equipmentType || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Hazmat
                        </label>
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          selectedSubmission.details.isHazmat 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {selectedSubmission.details.isHazmat ? 'YES' : 'NO'}
                        </div>
                      </div>
                      {selectedSubmission.details.isHazmat && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">UN Number</label>
                          <div className="text-sm font-medium text-slate-900">{selectedSubmission.details.unNumber || 'N/A'}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipment Details */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Shipment Details
                    </label>
                    <div className="bg-white border border-slate-300 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Service Type</label>
                        <div className="text-sm font-medium text-slate-900">{selectedSubmission.details.serviceType}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                          <Package className="w-3 h-3" /> Total Weight
                        </label>
                        <div className="text-sm font-medium text-slate-900">{selectedSubmission.details.weightLbs} lbs</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Reefer Required</label>
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          selectedSubmission.details.isReeferRequired 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {selectedSubmission.details.isReeferRequired ? 'YES' : 'NO'}
                        </div>
                      </div>
                      {selectedSubmission.details.appointments && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Appointments
                          </label>
                          <div className="text-sm text-slate-900">{selectedSubmission.details.appointments}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dimensions */}
                  {selectedSubmission.details.dimensions && selectedSubmission.details.dimensions.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase">Dimensions (Inches)</label>
                      <div className="bg-white border border-slate-300 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Qty</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Length</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Width</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Height</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {selectedSubmission.details.dimensions.map((dim, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-slate-900">{dim.quantity || '—'}</td>
                                <td className="px-4 py-2 text-sm text-slate-900">{dim.length || '—'}</td>
                                <td className="px-4 py-2 text-sm text-slate-900">{dim.width || '—'}</td>
                                <td className="px-4 py-2 text-sm text-slate-900">{dim.height || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {selectedSubmission.details.additionalNotes && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase flex items-center gap-1">
                        <Pencil className="w-3 h-3" /> Additional Notes
                      </label>
                      <div className="bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 whitespace-pre-wrap">
                        {selectedSubmission.details.additionalNotes}
                      </div>
                    </div>
                  )}

                  {/* Post-Submission Data Section */}
                  <div className="border-t-4 border-blue-500 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Post-Submission Data (Admin Editable)
                      </h4>
                      {!editMode && (
                        <button
                          onClick={handleEditPostData}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-all"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Data
                        </button>
                      )}
                    </div>

                    {/* Financial Data */}
                    <div className="bg-white border border-slate-300 rounded-lg p-5 mb-4">
                      <h5 className="text-sm font-bold text-slate-600 uppercase mb-4">Financial Information</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Net Cost (CAD)</label>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedPostData.netCostCAD || ''}
                              onChange={(e) => handlePostDataChange('netCostCAD', e.target.value)}
                              placeholder="$0.00"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-900">{editedPostData.netCostCAD || '—'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Sell Rate to Customer (CAD)</label>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedPostData.sellRateCAD || ''}
                              onChange={(e) => handlePostDataChange('sellRateCAD', e.target.value)}
                              placeholder="$0.00"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-900">{editedPostData.sellRateCAD || '—'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Margin (CAD)</label>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedPostData.marginCAD || ''}
                              onChange={(e) => handlePostDataChange('marginCAD', e.target.value)}
                              placeholder="$0.00"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-900">{editedPostData.marginCAD || '—'}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status & Carrier Info */}
                    <div className="bg-white border border-slate-300 rounded-lg p-5 mb-4">
                      <h5 className="text-sm font-bold text-slate-600 uppercase mb-4">Status & Carrier Information</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Won / Lost</label>
                          {editMode ? (
                            <select
                              value={editedPostData.wonLost || ''}
                              onChange={(e) => handlePostDataChange('wonLost', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                              <option value="">Select...</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                          ) : (
                            <div className="text-sm font-medium text-slate-900">
                              {editedPostData.wonLost ? (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  editedPostData.wonLost === 'Won' 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {editedPostData.wonLost}
                                </span>
                              ) : '—'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Carrier Name</label>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedPostData.carrierName || ''}
                              onChange={(e) => handlePostDataChange('carrierName', e.target.value)}
                              placeholder="Carrier name"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-900">{editedPostData.carrierName || '—'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">HL Load Number</label>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedPostData.hlLoadNumber || ''}
                              onChange={(e) => handlePostDataChange('hlLoadNumber', e.target.value)}
                              placeholder="Load number"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-900">{editedPostData.hlLoadNumber || '—'}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timing & Rep Info */}
                    <div className="bg-white border border-slate-300 rounded-lg p-5 mb-4">
                      <h5 className="text-sm font-bold text-slate-600 uppercase mb-4">Timing & Representative</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Pricing Rep</label>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedPostData.pricingRep || ''}
                              onChange={(e) => handlePostDataChange('pricingRep', e.target.value)}
                              placeholder="Representative name"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-900">{editedPostData.pricingRep || '—'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Day of Week</label>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedPostData.dayOfWeek || ''}
                              onChange={(e) => handlePostDataChange('dayOfWeek', e.target.value)}
                              placeholder="e.g., Monday"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-900">{editedPostData.dayOfWeek || '—'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Month</label>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedPostData.month || ''}
                              onChange={(e) => handlePostDataChange('month', e.target.value)}
                              placeholder="e.g., January"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-900">{editedPostData.month || '—'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Time Received</label>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedPostData.timeReceived || ''}
                              onChange={(e) => handlePostDataChange('timeReceived', e.target.value)}
                              placeholder="e.g., 09:30 AM"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-900">{editedPostData.timeReceived || '—'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Time Quoted</label>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedPostData.timeQuoted || ''}
                              onChange={(e) => handlePostDataChange('timeQuoted', e.target.value)}
                              placeholder="e.g., 10:15 AM"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-900">{editedPostData.timeQuoted || '—'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Total Time</label>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedPostData.totalTime || ''}
                              onChange={(e) => handlePostDataChange('totalTime', e.target.value)}
                              placeholder="e.g., 45 minutes"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-900">{editedPostData.totalTime || '—'}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customer Feedback */}
                    <div className="bg-white border border-slate-300 rounded-lg p-5 mb-4">
                      <h5 className="text-sm font-bold text-slate-600 uppercase mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Customer Feedback
                      </h5>
                      {editMode ? (
                        <textarea
                          value={editedPostData.customerFeedback || ''}
                          onChange={(e) => handlePostDataChange('customerFeedback', e.target.value)}
                          placeholder="Enter customer feedback..."
                          rows={4}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <div className="text-sm text-slate-900 whitespace-pre-wrap">
                          {editedPostData.customerFeedback || '—'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">File Type</label>
                        <span className={`
                          inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
                          ${selectedSubmission.fileType === 'word' 
                            ? 'bg-blue-100 text-blue-700'
                            : selectedSubmission.fileType === 'excel'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'}
                        `}>
                          {selectedSubmission.fileType.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Created</label>
                        <div className="text-sm text-slate-900">{formatDate(selectedSubmission.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
                  {editMode ? (
                    <div className="flex justify-end gap-3 w-full">
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePostData}
                        disabled={saving}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all ${
                          saving
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white hover:shadow'
                        }`}
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-600">Download as:</span>
                        <button
                          onClick={handleDownloadWord}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm hover:shadow transition-all"
                          title="Download as Word document"
                        >
                          <FileText className="w-4 h-4" />
                          Word
                        </button>
                        <button
                          onClick={handleDownloadExcel}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm hover:shadow transition-all"
                          title="Download as Excel spreadsheet"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          Excel
                        </button>
                        <button
                          onClick={handleDownloadPDF}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-sm hover:shadow transition-all"
                          title="Download as PDF document"
                        >
                          <FileIcon className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSubmission(null);
                          setEditMode(false);
                        }}
                        className="px-5 py-2.5 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

