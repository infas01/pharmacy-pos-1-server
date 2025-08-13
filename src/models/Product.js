import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    batchNo: { type: String, trim: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0 },
    salePrice: { type: Number, required: true, min: 0 }
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, unique: true, sparse: true },
    barcode: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, trim: true },
    unit: { type: String, trim: true, default: 'pcs' },
    batches: { type: [batchSchema], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', sku: 'text', barcode: 'text' });

export default mongoose.model('Product', productSchema);