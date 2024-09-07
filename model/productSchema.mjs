import mongoose  from "mongoose";
import category from "./categoryScehema.mjs";

const productSchema = mongoose.Schema({

    product_name: {
        type: String,
        required: true
      },
      category: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Category model
        ref: 'category', // 'Category' is the name of the model we want to reference
        required: true
      },
      genere: {
        type: String,
        required: true
      },
      game_Play_hour: {
        type: Number,
        required: true
      },
      release_date: {
        type: Date,
        required: true
      },
      developer: {
        type: String,
        required: true
      },
      publisher: {
        type: String,
        required: true
      },
      country_of_orgin: {
        type: String,
        required: true
      },
      discription: {
        type: String,
        required: true
      },
      playable_on: {
        type: String,
        required: true
      },
      PEGI_rating: {
        type: Number,
        required: true
      },
      image: {
        type: [String],
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      stock: {
        type: Number,
        required: true
      },
      discount: {
        type: Number,
        default: 0
      },
      internet_requirement: {
        type: Boolean,
        required: true
      },
      trailer_link: {
        type: String,
        required: true
      },
      isDelete: {
        type: Boolean,
        default: false
      }

},{ timestamps: true })

const Product = mongoose.model('Product',productSchema);
export default Product