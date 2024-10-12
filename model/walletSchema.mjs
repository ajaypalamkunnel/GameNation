import mongoose from "mongoose";

const wallet = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    balance:{
        type:Number,
        default:0
    },
    transactions:[
        {
            walletAmount:{
                type:Number,
                default:0
            },
            orderId:{
                type:String
            },
            transactionType:{
                type:String,
                enum:['Credited','Debited']
            },
            transactionDate:{
                type:Date,
                required:true,
                default:Date.now()
            }
        }
    ]

},{timestamps:true})

const Wallet = mongoose.model('Wallet',wallet)

export default Wallet