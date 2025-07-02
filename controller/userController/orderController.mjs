import OrderSchema from "../../model/orderSchema.mjs";
import category from "../../model/categoryScehema.mjs";
import User from "../../model/userSchema.mjs";
import Product from "../../model/productSchema.mjs";
import { razorpayInstance } from "../../services/razorpay.mjs";
import { loginPost } from "./userAuth.mjs";
import Wallet from "../../model/walletSchema.mjs";
import { wallet } from "./userController.mjs";
import HTTP_STATUS from "../../constants/statusCodes.mjs";

export const orderSummary = async (req, res) => {
  if (req.session.user) {
    const orderId = req.query.orderId;
    console.log("Order ID from query:", orderId);

    const order = await OrderSchema.findOne({ order_id: orderId });
    const categories = await category.find({ isActive: true });

    if (!order) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "order not found" });
    }

    res.render("user/orderSummary", {
      order: order,
      user: req.session.user,
      categories,
      title: "Summary",
    });
  } else {
    res.redirect("/login");
  }
};

//---------------------------- order list user side --------------------------------

export const orders = async (req, res) => {
  try {
   
      const email = req.session.user;

      const user = await User.findOne({ email });
      const categories = await category.find({ isActive: true });

      const orders = await OrderSchema.find({ customer_id: user._id })
        .sort({ createdAt: -1 })
        .populate({
          path: "products.product_id",
          select: "product_name category price stock image",
          model: Product,
          options: { strictPopulate: false },
        });

      res.render("user/orders", {
        orders: orders,
        user: req.session.user,
        categories,
        title: "Orders",
      });
   
  } catch (error) {
    console.log("error while rendering orders ", error);
  }
};

// ---------------------------------- order status changer ------------------------------

export const orderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = [
      "Pending",
      "Shipped",
      "Confirmed",
      "Delivered",
      "Cancelled",
      "Returned",
    ];

    const currentOrder = await OrderSchema.findOne({ _id: orderId });

    if (!currentOrder) {
      return res.status(HTTP_STATUS.NOT_FOUND).send("Order not found");
    }

    if (
      validStatuses.indexOf(status) <=
      validStatuses.indexOf(currentOrder.status)
    ) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send("Invalid status change");
    }

    if (status == "Delivered") {
      currentOrder.orderStatus = status;
      currentOrder.deliveredDate = Date.now();
      await currentOrder.save();
    } else {
      currentOrder.orderStatus = status;
      await currentOrder.save();
    }

    res.send("Order status updated");
  } catch (error) {
    console.log(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("server error");
  }
};


//----------------------------order view user side--------------------------------


export const orderView = async (req, res) => {

  try {
    const { orderId } = req.query;

    const email = req.session.user;
    const user = await User.findOne({ email });

    const order = await OrderSchema.findOne({ _id: orderId }).populate({
      path: "products.product_id",
      select: "product_name category price discount stock image",
      model: Product,
      options: { strictPopulate: false },
    });

    //console.log(orderId);
    const categories = await category.find({ isActive: true });

    res.render("user/orderView", {
      title: "Order Details",
      categories,
      user: req.session.user,
      order: order,
    });
  } catch (error) {
    console.log("error in orderview ", error);
  }
};


//---------------------------- sales report view controller --------------------------------


export const salesReoprtView = async (req, res) => {
  try {
    const { orderId } = req.query;

    const order = await OrderSchema.findOne({ _id: orderId }).populate({
      path: "products.product_id",
      select: "product_name category price discount stock image",
      model: Product,
      options: { strictPopulate: false },
    });

    res.render("admin/saleReportView", {
      title: "Order Details",
      order: order,
    });
  } catch (error) {
    console.log("error in orderview ", error);
  }
};



//---------------------------- order cancel controller --------------------------------

export const cancelOrder = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.user });
    const { orderId, cancelReason } = req.body;

    console.log(orderId);

    if (!orderId) {
      console.log(orderId);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Order ID not provided." });
    }

    const order = await OrderSchema.findByIdAndUpdate(orderId, {
      orderStatus: "Cancelled",
      isCancelled: true,
    });
    if (!order) {
      console.log("order");
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Order not found or access denied." });
    }
    const orderdetails = await OrderSchema.findById(orderId);

    if (
      orderdetails.paymentMethod === "razorpay" ||
      orderdetails.paymentMethod === "Wallet"
    ) {
      let wallet = await Wallet.findOne({ userId: user._id });
      if (!wallet) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ status: "error", message: "Wallet not avaliable" });
      }

      wallet.balance += orderdetails.priceAfterCouponDiscount;

      wallet.transactions.push({
        walletAmount: orderdetails.priceAfterCouponDiscount,
        orderId: orderdetails.orderId,
        transactionType: "Credited",
        transactionDate: new Date(),
      });

      await wallet.save();
    }

    return res.status(HTTP_STATUS.OK).json({ message: "order cancelled successfully" });
  } catch (error) {
    console.log("error while cancelling order ", error);
  }
};

//------------ order return controller ----------------------

export const returnOrder = async (req, res) => {
  console.log("hi return order");

  try {
    const { orderId, returnReason } = req.body;

    if (!orderId || !returnReason) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({
          status: "error",
          message: "order Id and return reason are required",
        });
    }
    const order = await OrderSchema.findById(orderId);
    if (!order) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: "error", message: "Order not found" });
    }

    if (order.orderStatus === "Returned" || order.orderStatus === "Cancelled") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({
          status: "error",
          message: "Order is already return or cancelled",
        });
    }

    order.orderStatus = "Returned";
    order.isCancelled = true;

    const refundAmount = order.priceAfterCouponDiscount
    const customer_id = order.customer_id

    let userWallet = await Wallet.findOne({userId:customer_id})

    console.log("customer Id : ",customer_id);
    console.log("wallet id : ",userWallet.userId);
    

    if(!userWallet){

      userWallet = new Wallet({
        userId:customer_id,
        balance:0,
        transactions:[]
      })

    }

    userWallet.balance += refundAmount;
    userWallet.transactions.push({
      walletAmount:refundAmount,
      orderId:orderId,
      transactionType:'Credited',
      transactionDate: new Date()
      
    })

    await userWallet.save()
    await order.save();

    for (let product of order.products) {
      const productDoc = await Product.findById(product.product_id);

      if (productDoc) {
        productDoc.stock += parseInt(product.product_quantity, 10);
        await productDoc.save();
      }
    }

    return res
      .status(HTTP_STATUS.OK)
      .json({ status: "success", message: "Order returned successfully" });
  } catch (error) {
    console.error("Error while returning order: ", error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};



//---------------------------- razorpay order creation --------------------------------

export const paymentRender = async (req, res) => {
  try {
    const totalAmount = req.params.amount;
    const instance = razorpayInstance;

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.error("Failed to create order:", error);
        return res
          .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .json({ error: `Failed to create oreder : ${error.message}` });
      }
      console.log(order.id);

      return res.status(HTTP_STATUS.OK).json({ orderId: order.id });
    });
  } catch (error) {
    console.error("Error order in checkout : ", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
  }
};