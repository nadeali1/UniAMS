const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: String,
  actorRole: String,
  action: {
    type: String,
    enum: ['submitted', 'approved', 'rejected', 'forwarded', 'reviewed']
  },
  comment: String,
  timestamp: { type: Date, default: Date.now }
});

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: String,
  studentEmail: String,
  studentId: String,

  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['fee_waiver', 'scholarship', 'leave', 'transcript', 'enrollment', 'other'],
    default: 'other'
  },
  attachmentUrl: String,

  visibleTo: {
    type: [String],
    default: ['admin', 'vc']
  },

  currentRole: {
    type: String,
    enum: ['admin', 'controller', 'coordinator', 'vc'],
    default: 'admin'
  },

  lastActionRole: {
    type: String,
    enum: ['admin', 'controller', 'coordinator', 'vc', null],
    default: null
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'forwarded'],
    default: 'pending'
  },

  adminStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'forwarded'], default: 'pending' },
  controllerStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'forwarded', 'not_reached'], default: 'not_reached' },
  coordinatorStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'forwarded', 'not_reached'], default: 'not_reached' },
  vcStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'not_reached'], default: 'pending' },

  history: [actionSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

applicationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  // next();
});

// module.exports = mongoose.model('Application', applicationSchema);
module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);




// line no 60 ka next band karna agar next is not a function aye khin bhi 