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


export const removeCoupon =  async(req,res)=>{
    try {

        const {couponId} = req.params;

        const coupon = await Coupon.findById(couponId)

        if(!coupon){
            return res.status(404).json({status:'error',message:'Coupon not found'})
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();
        res.status(200).json({
            status:'success',
            message: "Coupon updated"
        })
        
    } catch (error) {
        console.log('Error in product removing: ',error);
        res.status(500).json({status:'error',message:`Server error ,${error}`})
    }
}

export const userCoupons = async(req,res)=>{
    try {

        if(req.session.user){
            
            const categories = await category.find({ isActive: true });
            const coupons = await Coupon.find({isActive:true})

            console.log(coupons);
            
    
            res.render('user/coupons',{
                categories,
                user:req.session.user,
                title:'Coupons',
                coupons:coupons
            })
        }else{
            res.redirect('/login')
        }


        
        
    } catch (error) {
        console.log('Error while rendering the  coupon page', error);
        
    }
}