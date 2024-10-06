import OrderSchema from "../../model/orderSchema.mjs";
import category from "../../model/categoryScehema.mjs";
import User from "../../model/userSchema.mjs";
import Product from "../../model/productSchema.mjs";
import { razorpayInstance } from "../../services/razorpay.mjs";
import { loginPost } from "./userAuth.mjs";

export const orderSummary = async (req, res) => {
  if (req.session.user) {
    const orderId = req.query.orderId;
    console.log("Order ID from query:", orderId);

    const order = await OrderSchema.findOne({ order_id: orderId });
    const categories = await category.find({ isActive: true });

    if (!order) {
      return res.status(404).json({ message: "order not found" });
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

export const orders = async (req, res) => {
  try {
    if (req.session.user) {
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
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log("error while rendering orders ", error);
  }
};

// ---------------------------------- status change ------------------------------

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
      return res.status(404).send("Order not found");
    }

    if (
      validStatuses.indexOf(status) <=
      validStatuses.indexOf(currentOrder.status)
    ) {
      return res.status(400).send("Invalid status change");
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
    res.status(500).send("server error");
  }
};

export const orderView = async (req, res) => {
  console.log("I am in orderview");

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

export const cancelOrder = async (req, res) => {
  console.log("hiiiii cancelOrder");

  try {
    const user = req.session.user;
    const { orderId, cancelReason } = req.body;

    if (!orderId) {
      console.log(orderId);
      return res.status(400).json({ message: "Order ID not provided." });
    }

    const order = await OrderSchema.findByIdAndUpdate(orderId, {
      orderStatus: "Cancelled",
      isCancelled: true,
    });
    if (!order) {
      console.log("order");
      return res
        .status(404)
        .json({ message: "Order not found or access denied." });
    }
    return res.status(200).json({ message: "order cancelled successfully" });
  } catch (error) {
    console.log("error while cancelling order ", error);
  }
};

export const returnOrder = async (req, res) => {
  console.log("hi return order");

  try {
    const { orderId, returnReason } = req.body;

    if (!orderId || !returnReason) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "order Id and return reason are required",
        });
    }
    const order = await OrderSchema.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ status: "error", message: "Order not found" });
    }

    if (order.orderStatus === "Returned" || order.orderStatus === "Cancelled") {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Order is already return or cancelled",
        });
    }

    order.orderStatus = "Returned";
    order.isCancelled = true;

    await order.save();

    for (let product of order.products) {
      const productDoc = await Product.findById(product.product_id);

      if (productDoc) {
        productDoc.stock += parseInt(product.product_quantity, 10);
        await productDoc.save();
      }
    }

    return res
      .status(200)
      .json({ status: "success", message: "Order returned successfully" });
  } catch (error) {
    console.error("Error while returning order: ", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};



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
          .status(500)
          .json({ error: `Failed to create oreder : ${error.message}` });
      }
      console.log(order.id);
      
      return res.status(200).json({ orderId: order.id });
    });
  } catch (error) {
    console.error("Error order in checkout : ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};