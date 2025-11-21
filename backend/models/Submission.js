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
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;

