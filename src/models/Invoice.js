import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String, // snapshot
    sku: String,  // snapshot
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, unique: true },
    customerName: { type: String, trim: true },
    items: [itemSchema],
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paid: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['CASH', 'CARD', 'MIXED'], default: 'CASH' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Invoice', invoiceSchema);