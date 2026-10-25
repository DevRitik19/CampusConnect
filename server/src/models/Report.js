import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
      index: true,
    },
    targetType: {
      type: String,
      enum: ['POST', 'USER', 'EVENT'],
      required: [true, 'Target type is required'],
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
      index: true,
    },
    reason: {
      type: String,
      enum: [
        'SPAM',
        'INAPPROPRIATE_CONTENT',
        'FRAUD_SCAM',
        'HARASSMENT',
        'DUPLICATE',
        'OTHER',
      ],
      required: [true, 'Reason is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['OPEN', 'REVIEWED', 'DISMISSED'],
      default: 'OPEN',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

reportSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Report = mongoose.model('Report', reportSchema);
