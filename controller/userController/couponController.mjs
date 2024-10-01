import category from "../../model/categoryScehema.mjs";
import Coupon from "../../model/couponSchema.mjs";

export const coupons = async(req,res)=>{

    try {
        const allCoupons = await Coupon.find();
        res.render('admin/coupons',{
            title:'Coupons',
            coupons:allCoupons
        })
        
    } catch (error) {
        console.log('Error while rendering coupons page',error);
        res.status(500).send("Error rendering the coupons page")
    }

}

export const addCoupon = async(req,res)=>{

    try {

        const categories = await category.find({ isActive: true });
        
        
        
        res.render('admin/addCoupon',{
            title:'Add Coupon',
            categories
        })
    } catch (error) {
        console.log('error while rendering the add coupon '),error;
        
        
    }


}

export const addCouponPost = async (req, res) => {
    try {
        console.log("Attempting to add coupon");

        const { couponCode, minAmount, discountValue, discountType, startDate, expiryDate, usageCount } = req.body;
        console.log(req.body);
        
        // Check if the coupon already exists
        const existCouponCode = await Coupon.findOne({ couponCode: couponCode });

        if (existCouponCode) {
            return res.status(400).json({
                status: 'alreadyFound',
                message: `Coupon code already exists: ${couponCode}`
            });
        }

        // Create a new coupon
        const newCoupon = new Coupon({
            couponCode,
            discountType,
            discountValue,
            minimumOrderAmount: minAmount,
            startDate,
            endDate: expiryDate,
            usageCount
        });

        await newCoupon.save();

        return res.status(200).json({
            status: 'success',
            message: 'Coupon created successfully'
        });

    } catch (error) {
        console.log("Error while adding coupon: ", error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to add coupon'
        });
    }
};
