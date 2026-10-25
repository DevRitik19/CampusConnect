import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['LOST_FOUND', 'MARKETPLACE', 'COLLABORATION'],
        message: '{VALUE} is not a valid post type',
      },
      required: [true, 'Post type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'SOLD', 'CLOSED'],
      default: 'ACTIVE',
      index: true,
    },
    details: {
      // LOST_FOUND specific
      itemState: {
        type: String,
        enum: ['LOST', 'FOUND'],
        default: undefined,
      },
      dateOccurred: {
        type: Date,
        default: undefined,
      },

      // MARKETPLACE specific
      price: {
        type: Number,
        min: [0, 'Price must be 0 or higher'],
        default: undefined,
      },
      condition: {
        type: String,
        enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'],
        default: undefined,
      },
      itemType: {
        type: String,
        trim: true,
        default: undefined,
      },

      // COLLABORATION specific
      subject: {
        type: String,
        trim: true,
        default: undefined,
      },
      skills: {
        type: [String],
        default: undefined,
      },
      availability: {
        type: String,
        trim: true,
        default: undefined,
      },
      collaborationType: {
        type: String,
        enum: [
          'STUDY_PARTNER',
          'ASSIGNMENT_GROUP',
          'HACKATHON_TEAM',
          'PERSONAL_PROJECT',
          'RESEARCH_GROUP',
        ],
        default: undefined,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound and text indexes for search performance
postSchema.index({ type: 1, status: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  location: 'text',
});

postSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Post = mongoose.model('Post', postSchema);
