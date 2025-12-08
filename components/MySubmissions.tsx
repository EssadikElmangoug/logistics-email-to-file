import React, { useState, useEffect } from 'react';
import { submissionAPI, Submission, PostSubmissionData } from '../services/apiService';
import { FileText, Eye, X, MapPin, Package, Truck, Calendar, Pencil, AlertCircle, Edit, Save, Building2, Globe2, Box, Clock, AlertTriangle, DollarSign, User as UserIcon, TrendingUp, MessageSquare } from 'lucide-react';

interface MySubmissionsProps {
  onBack: () => void;
}

export const MySubmissions: React.FC<MySubmissionsProps> = ({ onBack }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedPostData, setEditedPostData] = useState<PostSubmissionData>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await submissionAPI.getMySubmissions();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
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
      
      // Update the submission in the list
      setSubmissions(prev => prev.map(s => s._id === selectedSubmission._id ? result.submission : s));
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
            <div className="bg-blue-600 p-2 rounded-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-slate-800 font-bold text-lg">My Submissions</h2>
              <p className="text-xs text-slate-500 mt-1">View and edit your submission history</p>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Back to App
          </button>
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

          {/* Submissions List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No submissions found</p>
              <p className="text-sm text-slate-500 mt-1">Your submission history will appear here</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {submissions.map((submission) => (
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
                          {submission.postSubmission?.wonLost ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              submission.postSubmission.wonLost === 'Won' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {submission.postSubmission.wonLost}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-500">{formatDate(submission.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewSubmission(submission)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
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
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
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
              {/* Original Submission Data - Collapsed View */}
              <div className="bg-slate-50 rounded-lg border border-slate-200">
                <details className="group">
                  <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between hover:bg-slate-100 rounded-lg transition-colors">
                    <span className="text-sm font-semibold text-slate-700">Original Submission Details</span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-4 pt-2 space-y-4">
                    {/* Customer & Route - Compact */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-slate-600">Customer:</span> {selectedSubmission.customerName}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">Service:</span> {selectedSubmission.details.serviceType}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">From:</span> {selectedSubmission.shipper.city}, {selectedSubmission.shipper.stateOrProvince}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">To:</span> {selectedSubmission.receiver.city}, {selectedSubmission.receiver.stateOrProvince}
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              {/* Post-Submission Data - Editable */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Post-Submission Data
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
                <div className="bg-white border border-slate-300 rounded-lg p-5">
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
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              {editMode ? (
                <>
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
                </>
              ) : (
                <button
                  onClick={() => {
                    setSelectedSubmission(null);
                    setEditMode(false);
                  }}
                  className="px-5 py-2.5 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





