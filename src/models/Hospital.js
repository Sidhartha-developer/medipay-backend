const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const HospitalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ['hospital'],
      default: 'hospital',
    },

    registrationNo: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    specializations: {
      type: [String],
      default: [],
    },

    facilities: {
      type: [String],
      default: [],
    },

    logo: {
      url: String,
      publicId: String,
    },

    gallery: [
      {
        url: String,
        publicId: String,
        caption: String,
      },
    ],

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India',
      },

      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },

    timings: {
      monday: {
        open: String,
        close: String,
        isClosed: {
          type: Boolean,
          default: false,
        },
      },

      tuesday: {
        open: String,
        close: String,
        isClosed: {
          type: Boolean,
          default: false,
        },
      },

      wednesday: {
        open: String,
        close: String,
        isClosed: {
          type: Boolean,
          default: false,
        },
      },

      thursday: {
        open: String,
        close: String,
        isClosed: {
          type: Boolean,
          default: false,
        },
      },

      friday: {
        open: String,
        close: String,
        isClosed: {
          type: Boolean,
          default: false,
        },
      },

      saturday: {
        open: String,
        close: String,
        isClosed: {
          type: Boolean,
          default: false,
        },
      },

      sunday: {
        open: String,
        close: String,
        isClosed: {
          type: Boolean,
          default: true,
        },
      },
    },

    commissionRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },

    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },

    // 🔥 OLD FLAGS (KEEP FOR BACKWARD COMPATIBILITY)
    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔥 NEW PRODUCTION WORKFLOW SYSTEM
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    rejectionReason: {
      type: String,
      default: '',
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },

    verifiedAt: {
      type: Date,
    },

    suspensionReason: {
      type: String,
      default: '',
    },

    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },

    suspendedAt: {
      type: Date,
    },

    adminNotes: {
      type: String,
      default: '',
    },

    // 🔥 PUSH NOTIFICATIONS
    fcmToken: {
      type: String,
      default: '',
    },

    // 🔥 RATINGS
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // 🔥 PASSWORD RESET
    resetPasswordToken: String,

    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// 🔥 GEO INDEX
HospitalSchema.index({
  'address.coordinates': '2dsphere',
});

// 🔥 SPECIALIZATION INDEX
HospitalSchema.index({
  specializations: 1,
});

// 🔥 CITY INDEX
HospitalSchema.index({
  'address.city': 1,
});

// 🔥 SEARCH INDEX
HospitalSchema.index({
  name: 'text',
  description: 'text',
  specializations: 'text',
});

// 🔥 VERIFICATION INDEX
HospitalSchema.index({
  verificationStatus: 1,
});

// 🔥 ACTIVE INDEX
HospitalSchema.index({
  isActive: 1,
});

// 🔥 CREATED INDEX
HospitalSchema.index({
  createdAt: -1,
});

// 🔥 HASH PASSWORD
HospitalSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 12
    );
  }
});

// 🔥 PASSWORD COMPARE
HospitalSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Hospital', HospitalSchema);