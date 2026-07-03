import mongoose from 'mongoose';

export const PROPERTY_TYPES = ['house', 'apartment', 'villa', 'condo', 'land', 'commercial'];
export const PROPERTY_STATUSES = ['for-sale', 'for-rent', 'sold', 'rented'];

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Property type is required'],
      enum: { values: PROPERTY_TYPES, message: 'Invalid property type' },
    },
    status: {
      type: String,
      enum: { values: PROPERTY_STATUSES, message: 'Invalid property status' },
      default: 'for-sale',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [1, 'Area must be positive'],
    },
    yearBuilt: { type: Number, min: 1800, max: new Date().getFullYear() + 2 },
    address: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, trim: true, default: '' },
      zipCode: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: 'USA' },
    },
    amenities: { type: [String], default: [] },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 12,
        message: 'A property can have at most 12 images',
      },
    },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', description: 'text', 'address.city': 'text' });
propertySchema.index({ price: 1 });
propertySchema.index({ status: 1, type: 1 });
propertySchema.index({ featured: 1, createdAt: -1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;
