import mongoose from "mongoose";
import Counter from "./counter.js";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        default: () => Math.floor(Math.random() * 1000000).toString(), // generate a random number between 0 and 999999
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        // type: String,
        ref: 'DeliveryPartner',
        required: true,
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    },
    items: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            count: {
                type: Number,
                required: true,
            }
        }
    ],
    deliveryLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String },
    },
    pickupLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String },
    },
    deliveryPersonLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
    },
    status: {
        type: String,
        enum: ['availabel', 'confirmed', 'arriving', 'delivered', 'cancelled'],
        default: 'availabel',
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})

async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await Counter.findOneAndUpdate(
        { name: sequenceName },
        { $inc: {sequence_value: 1} },
        { new: true, upsert: true }
    );
    return sequenceDocument.sequence_value;
}

orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const sequenceValue = await getNextSequenceValue('orderId');
        this.orderId = `ORDR${sequenceValue.toString().padStart(5, "0")}`;
    }
    next();
})

const Order = mongoose.model('Order', orderSchema);
export default Order;