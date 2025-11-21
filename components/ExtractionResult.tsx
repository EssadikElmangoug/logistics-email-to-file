import React from 'react';
import { ShipmentData, Dimension, ServiceType } from '../types';
import { FileText, Pencil, Truck, MapPin, Package, AlertTriangle, Thermometer, Calendar, Clipboard, FileSpreadsheet, FileIcon, User, Mail, Send } from 'lucide-react';

interface ExtractionResultProps {
  data: ShipmentData;
  onDownloadWord: () => void;
  onDownloadExcel: () => void;
  onDownloadPDF: () => void;
  onReset: () => void;
  onUpdate: (newData: ShipmentData) => void;
  onSendToPricingClick?: () => void;
  onSendToPricing?: () => void;
  sendToPricingMode?: boolean;
  pricingEmail?: string;
  onPricingEmailChange?: (email: string) => void;
  sendingEmail?: boolean;
}

export const ExtractionResult: React.FC<ExtractionResultProps> = ({ 
  data, 
  onDownloadWord, 
  onDownloadExcel, 
  onDownloadPDF,
  onReset, 
  onUpdate,
  onSendToPricingClick,
  onSendToPricing,
  sendToPricingMode = false,
  pricingEmail = '',
  onPricingEmailChange,
  sendingEmail = false,
}) => {
  
  const handleInputChange = (section: keyof ShipmentData, field: string, value: any) => {
    onUpdate({
      ...data,
      [section]: {
        ...data[section],
        [field]: value
      }
    });
  };

  const handleCustomerNameChange = (value: string) => {
    onUpdate({
      ...data,
      customerName: value
    });
  };

  const handleServiceTypeChange = (value: ServiceType) => {
    onUpdate({
      ...data,
      details: {
        ...data.details,
        serviceType: value
      }
    });
  };

  const isCustomerNameValid = data.customerName.trim().length > 0;

  const handleDimensionChange = (index: number, field: keyof Dimension, value: string) => {
    const newDimensions = [...data.details.dimensions];
    if (!newDimensions[index]) {
        newDimensions[index] = { quantity: '', length: '', width: '', height: '' };
    }
    newDimensions[index] = { ...newDimensions[index], [field]: value };
    onUpdate({
      ...data,
      details: {
        ...data.details,
        dimensions: newDimensions
      }
    });
  };

  const MAX_ROWS = 5;
  
  const renderDimensionRows = () => {
    const rows = [];
    for(let i = 0; i < MAX_ROWS; i++) {
       const dim = data.details.dimensions[i] || { quantity: '', length: '', width: '', height: '' };
       const isReal = i < data.details.dimensions.length;

       const handleChange = (field: keyof Dimension, val: string) => {
           // Always allow updating any row, extending the array if necessary
           const newDims = [...data.details.dimensions];
           // Fill gaps if user types in a row beyond current length
           for(let k = data.details.dimensions.length; k <= i; k++) {
               newDims[k] = { quantity: '', length: '', width: '', height: '' };
           }
           newDims[i][field] = val;
           onUpdate({ ...data, details: { ...data.details, dimensions: newDims } });
       };

       rows.push(
         <div key={i} className="grid grid-cols-4 gap-2 mb-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Qty</label>
                <input 
                  placeholder="0"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-300"
                  value={dim.quantity || ''}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                />
            </div>
            <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Len</label>
                <input 
                  placeholder='0"'
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-300"
                  value={dim.length || ''}
                  onChange={(e) => handleChange('length', e.target.value)}
                />
            </div>
            <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Wid</label>
                <input 
                  placeholder='0"'
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-300"
                  value={dim.width || ''}
                  onChange={(e) => handleChange('width', e.target.value)}
                />
            </div>
            <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Hgt</label>
                <input 
                  placeholder='0"'
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-300"
                  value={dim.height || ''}
                  onChange={(e) => handleChange('height', e.target.value)}
                />
            </div>
         </div>
       )
    }
    return rows;
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in mb-12">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center">
          <h2 className="text-slate-800 font-bold text-lg flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-blue-600" />
            Review & Edit Details
          </h2>
          <button 
            onClick={onReset}
            className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
          >
            Discard & Start Over
          </button>
        </div>

        <div className="p-8 space-y-8 bg-slate-50/50">
          {/* Customer Name Section */}
          <div className="space-y-3">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Customer Information
            </h3>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={data.customerName || ''}
                  onChange={(e) => handleCustomerNameChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Enter customer name"
                  required
                />
                {!isCustomerNameValid && (
                  <p className="text-xs text-red-500 mt-1">Customer name is required to download files</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipper Section */}
          <div className="space-y-3">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Shipper (Pickup)
            </h3>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">City</label>
                <input 
                  type="text" 
                  value={data.shipper.city || ''}
                  onChange={(e) => handleInputChange('shipper', 'city', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1">State/Prov</label>
                   <input 
                    type="text" 
                    value={data.shipper.stateOrProvince || ''}
                    onChange={(e) => handleInputChange('shipper', 'stateOrProvince', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                   />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Zip/Postal</label>
                   <input 
                    type="text" 
                    value={data.shipper.postalCode || ''}
                    onChange={(e) => handleInputChange('shipper', 'postalCode', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Optional"
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Receiver Section */}
          <div className="space-y-3">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Receiver (Delivery)
            </h3>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">City</label>
                <input 
                  type="text" 
                  value={data.receiver.city || ''}
                  onChange={(e) => handleInputChange('receiver', 'city', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1">State/Prov</label>
                   <input 
                    type="text" 
                    value={data.receiver.stateOrProvince || ''}
                    onChange={(e) => handleInputChange('receiver', 'stateOrProvince', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                   />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Zip/Postal</label>
                   <input 
                    type="text" 
                    value={data.receiver.postalCode || ''}
                    onChange={(e) => handleInputChange('receiver', 'postalCode', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Optional"
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" /> Shipment Details
            </h3>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Weight & Toggles */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><Truck className="w-3 h-3"/> Service Type</label>
                  <select
                    value={data.details.serviceType || 'FTL'}
                    onChange={(e) => handleServiceTypeChange(e.target.value as ServiceType)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="FTL">FTL</option>
                    <option value="LTL">LTL</option>
                    <option value="Intermodal">Intermodal</option>
                    <option value="Flatbed">Flatbed</option>
                    <option value="Dry Van">Dry Van</option>
                    <option value="Reefer">Reefer</option>
                    <option value="Step Deck">Step Deck</option>
                    <option value="Straight Truck">Straight Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><Package className="w-3 h-3"/> Total Weight (lbs)</label>
                  <input 
                    type="text" 
                    value={data.details.weightLbs || ''}
                    onChange={(e) => handleInputChange('details', 'weightLbs', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Hazmat</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleInputChange('details', 'isHazmat', true)}
                          className={`flex-1 py-1.5 text-sm rounded border transition-colors ${data.details.isHazmat ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => handleInputChange('details', 'isHazmat', false)}
                          className={`flex-1 py-1.5 text-sm rounded border transition-colors ${!data.details.isHazmat ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                        >
                          No
                        </button>
                      </div>
                   </div>
                   <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1"><Thermometer className="w-3 h-3"/> Reefer</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleInputChange('details', 'isReeferRequired', true)}
                          className={`flex-1 py-1.5 text-sm rounded border transition-colors ${data.details.isReeferRequired ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => handleInputChange('details', 'isReeferRequired', false)}
                          className={`flex-1 py-1.5 text-sm rounded border transition-colors ${!data.details.isReeferRequired ? 'bg-slate-100 border-slate-300 text-slate-600 font-bold' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                        >
                          No
                        </button>
                      </div>
                   </div>
                </div>

                 <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Appointments</label>
                  <input 
                    type="text" 
                    value={data.details.appointments || ''}
                    onChange={(e) => handleInputChange('details', 'appointments', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Optional (e.g. 9am - 5pm)"
                  />
                </div>
              </div>

              {/* Right Column: Dimensions & Notes */}
              <div className="space-y-4">
                <div className="bg-white border border-slate-100 rounded-lg p-1">
                    <label className="block text-xs font-bold text-slate-500 mb-3 uppercase px-2 mt-2">
                       Dimensions (Inches)
                    </label>
                    {renderDimensionRows()}
                </div>

                 <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><Pencil className="w-3 h-3"/> Additional Notes</label>
                  <textarea 
                    value={data.details.additionalNotes || ''}
                    onChange={(e) => handleInputChange('details', 'additionalNotes', e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Optional"
                  />
                </div>
              </div>

            </div>
          </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white px-8 py-6 flex flex-col border-t border-slate-100 gap-4">
          {sendToPricingMode ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-blue-900">Send to Pricing Team</h3>
                </div>
                <p className="text-xs text-blue-700 mb-4">
                  Review and edit the information above, then enter the pricing team's email address below.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pricing Team Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={pricingEmail}
                      onChange={(e) => onPricingEmailChange?.(e.target.value)}
                      placeholder="pricing@example.com"
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                      disabled={sendingEmail}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onSendToPricing}
                      disabled={!isCustomerNameValid || !pricingEmail.trim() || sendingEmail}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all ${
                        isCustomerNameValid && pricingEmail.trim() && !sendingEmail
                          ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {sendingEmail ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send PDF to Pricing
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onPricingEmailChange?.('');
                        // Exit send to pricing mode - toggle it off
                        if (onSendToPricingClick) {
                          onSendToPricingClick();
                        }
                      }}
                      disabled={sendingEmail}
                      className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-slate-400 text-sm hidden sm:block">
                  Review data above before downloading or sending.
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={onDownloadWord}
                    disabled={!isCustomerNameValid}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold shadow-sm transition-all ${
                      isCustomerNameValid 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow' 
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Word
                  </button>
                  <button
                    onClick={onDownloadExcel}
                    disabled={!isCustomerNameValid}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold shadow-sm transition-all ${
                      isCustomerNameValid 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow' 
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel
                  </button>
                  <button
                    onClick={onDownloadPDF}
                    disabled={!isCustomerNameValid}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold shadow-sm transition-all ${
                      isCustomerNameValid 
                        ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow' 
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <FileIcon className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={onSendToPricingClick}
                    disabled={!isCustomerNameValid}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold shadow-sm transition-all ${
                      isCustomerNameValid 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow' 
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Send to Pricing
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};