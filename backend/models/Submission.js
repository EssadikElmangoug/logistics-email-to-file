import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  shipper: {
    city: { type: String, required: true },
    stateOrProvince: { type: String, required: true },
    postalCode: { type: String, default: '' },
  },
  receiver: {
    city: { type: String, required: true },
    stateOrProvince: { type: String, required: true },
    postalCode: { type: String, default: '' },
  },
  details: {
    weightLbs: { type: String, required: true },
    dimensions: [{
      quantity: { type: String, default: '' },
      length: { type: String, default: '' },
      width: { type: String, default: '' },
      height: { type: String, default: '' },
    }],
    isHazmat: { type: Boolean, default: false },
    isReeferRequired: { type: Boolean, default: false },
    appointments: { type: String, default: '' },
    additionalNotes: { type: String, default: '' },
    serviceType: { 
      type: String, 
      enum: ['FTL', 'LTL', 'Intermodal', 'Flatbed', 'Dry Van', 'Reefer', 'Step Deck', 'Straight Truck'],
      required: true 
    },
    // New fields
    shipmentType: {
      type: String,
      enum: ['Business to Business', 'Business to Residential'],
      default: 'Business to Business'
    },
    crossBorderStatus: {
      type: String,
      enum: ['Cross Border', 'Domestic', 'Interstate'],
      default: 'Interstate'
    },
    commodity: { type: String, default: '' },
    unNumber: { type: String, default: '' },
    equipmentType: { type: String, default: '' },
    shipmentTiming: {
      type: String,
      enum: ['Ready Now', 'Ready Time', 'Future Quote'],
      default: 'Ready Now'
    },
    readyTime: { type: String, default: '' }
  },
  fileType: {
    type: String,
    enum: ['word', 'excel', 'pdf'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Post-submission fields (added after pricing response)
  postSubmission: {
    netCostCAD: { type: String, default: '' },
    sellRateCAD: { type: String, default: '' },
    marginCAD: { type: String, default: '' },
    wonLost: { 
      type: String, 
      enum: ['', 'Won', 'Lost'],
      default: '' 
    },
    carrierName: { type: String, default: '' },
    hlLoadNumber: { type: String, default: '' },
    pricingRep: { type: String, default: '' },
    dayOfWeek: { type: String, default: '' },
    month: { type: String, default: '' },
    timeReceived: { type: String, default: '' },
    timeQuoted: { type: String, default: '' },
    totalTime: { type: String, default: '' },
    customerFeedback: { type: String, default: '' },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
submissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;

