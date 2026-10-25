import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [4000, 'Description cannot exceed 4000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Workshop', 'Hackathon', 'Cultural', 'Sports', 'Club Activity', 'Official Notice', 'Seminar', 'Other'],
      default: 'Workshop',
      index: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    startsAt: {
      type: Date,
      required: [true, 'Start date and time is required'],
      index: true,
    },
    endsAt: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return value >= this.startsAt;
        },
        message: 'End date/time must be after or equal to start date/time',
      },
    },
    registrationUrl: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['PUBLISHED', 'CANCELLED'],
      default: 'PUBLISHED',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ status: 1, startsAt: 1 });

eventSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Event = mongoose.model('Event', eventSchema);
