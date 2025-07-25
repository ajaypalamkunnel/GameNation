import e from "connect-flash";
import category from "../../model/categoryScehema.mjs";
import OrderSchema from "../../model/orderSchema.mjs";
import Product from "../../model/productSchema.mjs";
import User from "../../model/userSchema.mjs";
import mongoose from "mongoose";
import Offer from "../../model/offerSchema.mjs";
import { orderStatus } from "../userController/orderController.mjs";
import HTTP_STATUS from "../../constants/statusCodes.mjs";
//---------------------- admin login get request ----------------------
export const getAdminLogin = (req, res) => {
  try {
    if (req.session.admin) {
      return res.redirect("/admin/dashboardAdmin");
    } else {
      return res.render("admin/loginAdmin", {
        msg: req.flash(),
        title: "AdminLogin",
      });
    }
  } catch (error) {
    console.error(`Error from admin login: ${error}`);
    req.flash("error", "An error occurred. Please try again.");
    return res.redirect("/admin/loginAdmin");
  }
};

//---------------------- admin login post request ----------------------

export const loginPost = (req, res) => {
  try {
    if (
      req.body.username === process.env.ADMINUSERNAME &&
      req.body.password === process.env.ADMINPASSWORD
    ) {
      req.session.admin = req.body.username;
      return res.redirect("/admin/dashboard");
    } else {
      req.flash("error", "invalid credential");
      return res.redirect("/admin/login");
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    req.flash("error", "An error occurred during login. Please try again.");
    return res.redirect("/admin/loginAdmin");
  }
};

export const adminLogout = (req,res)=>{
  try {

    req.session.destroy((err)=>{
      if(err){
        console.error('Error destroying session:', err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error logging out');
      }

      res.redirect('/login')
    })
    
  } catch (error) {
    console.log("Error while admin Logout",error);
    
  }
}


//---------------------- function for Date Filter   ----------------------

const applyDateFilter = (filter) => {
  console.log("filter");

  const now = new Date();
  let dateFilter = {};

  if (filter === "day") {
    dateFilter.createdAt = {
      $gte: new Date(now.setHours(0, 0, 0, 0)),
      $lt: new Date(now.setHours(23, 59, 59, 999)),
    };
  } else if (filter === "week") {
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    startOfWeek.setDate(now.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Set end of the week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    dateFilter.createdAt = { $gte: startOfWeek, $lt: endOfWeek };
  } else if (filter === "month") {
    dateFilter.createdAt = {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1), // Start of month
      $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1), // Start of next month
    };
  } else if (filter === "year") {
    dateFilter.createdAt = {
      $gte: new Date(now.getFullYear(), 0, 1), // Start of year
      $lt: new Date(now.getFullYear(), 12, 31), // End of year
    };
  }

  return dateFilter;
};

//---------------------- admin dashboard ----------------------

export const dashboard = async (req, res) => {
  try {
    
      //----------------------- Daily data---------------------

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const totalCustomers = await User.find();
      const totalUsers = totalCustomers.length;

      const dailyMetrics = await OrderSchema.aggregate([
        {
          // Match orders with specific statuses and not cancelled
          $match: {
            orderStatus: { $in: ["Delivered", "Pending", "Shipped"] },
            isCancelled: false,
            createdAt: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          // Group by year, month, and day to get daily metrics
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            totalDailyOrders: { $sum: 1 }, // Count of orders
            totalSales: { $sum: "$priceAfterCouponDiscount" }, // Total sales of the day
            totalDailyProfit: {
              $sum: { $multiply: ["$priceAfterCouponDiscount", 0.1] },
            }, // 10% of total sales
          },
        },
        {
          // Project fields for readability and format date field
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            },
            totalDailyOrders: 1,
            totalSales: 1,
            totalDailyProfit: 1,
          },
        },
        {
          // Sort by date in descending order
          $sort: { date: -1 },
        },
      ]);

      console.log("Daily data:", dailyMetrics);


      //----------------------- Daily data  end ---------------------

      //----------------------- Total sale amount -------------------

      const totalSaleAmount = await OrderSchema.aggregate([
        {
          $group:{
            _id:null,
            totalAmount:{$sum:"$priceAfterCouponDiscount"}
          }
        }
      ])

      const finalTotalSaleAmount = (totalSaleAmount.length > 0 ? totalSaleAmount[0].totalAmount : 0).toFixed(2)
      console.log("amt : ",finalTotalSaleAmount);
      

      //----------------------- Top selling products---------------------

      const filter = req.query.filter || "day";
      const dateFilter = applyDateFilter(filter);

      console.log("date filter********: ", filter);

      const topSellingProducts = await OrderSchema.aggregate([
        {
          $match: {
            orderStatus: { $in: ["Delivered", "Shipped", "Pending"] },
            isCancelled: false,
            createdAt: dateFilter.createdAt,
          },
        },
        {
          $unwind: "$products",
        },
        {
          $group: {
            _id: "$products.product_id",
            totalQuantitySold: {
              $sum: { $toInt: "$products.product_quantity" },
            },
            totalRevenue: { $sum: "$products.product_price" },
            productName: { $first: "$products.product_name" },
            productCategory: { $first: "$products.product_category" },
            productDiscount: { $first: "$products.product_discount" },
            productPrice: { $first: "$products.product_price" },
          },
        },
        {
          $sort: { totalQuantitySold: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      const productData = await Product.populate(
        topSellingProducts,
        { path: "_id", select: "publisher category discount product_name" },
        { path: "productCategory", model: "category" }
      );

      console.log("----------Product data: ", productData);

      //----------------------- Top selling products end---------------------

      //----------------------- pie chart categgory perfomance  ---------------------

      const categoryFilter = req.query.filter || "day";
      const CategoryDateFilter = applyDateFilter(categoryFilter);

      const categoryPerfomance = await OrderSchema.aggregate([
        {
          $match: {
            orderStatus: { $in: ["Delivered", "Shipped", "Pending"] },
            isCancelled: false,
            createdAt: CategoryDateFilter.createdAt,
          },
        },
        { $unwind: "$products" },

        {
          // First lookup: Join with the Product collection to get product details
          $lookup: {
            from: "products", // Name of the product collection
            localField: "products.product_id",
            foreignField: "_id",
            as: "productData",
          },
        },

        {
          // Unwind the productData array to have direct access to product details
          $unwind: "$productData",
        },

        {
          // Second lookup: Join with the Category collection to get category details
          $lookup: {
            from: "categories", // Name of the category collection
            localField: "productData.category",
            foreignField: "_id",
            as: "categoryData",
          },
        },

        {
          // Unwind the categoryData array to get direct access to category details
          $unwind: "$categoryData",
        },

        {
          // Group by the category name
          $group: {
            _id: "$categoryData.collectionName", // Group by category name
            totalQuantitySold: {
              $sum: { $toInt: "$products.product_quantity" },
            },
          },
        },
        {
          // Project the required fields
          $project: {
            _id: 0,
            category: "$_id", // Set category to the category name from the group _id
            totalQuantitySold: 1,
          },
        },
        { $sort: { totalQuantitySold: -1 } },
      ]);

      const categoryLabels = categoryPerfomance.map((item) => item.category);
      const categoryData = categoryPerfomance.map(
        (item) => item.totalQuantitySold
      );
      console.log(categoryLabels, "[][]][][[]", categoryData);



      //----------------------- pie chart categgory perfomance  end ---------------------

      //--------------- weekly dashboard data -----------------------

      const filterMain = req.query.filter || "week";

      const dateFilterMain = applyDateFilter(filterMain)

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date();
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to the end of the week (Saturday)
      endOfWeek.setHours(23, 59, 59, 999);

      const metrics = await OrderSchema.aggregate([
        {
          $match: {
            orderStatus: { $in: ["Delivered", "Pending", "Shipped"] },
            isCancelled: false,
            createdAt: dateFilter.createdAt, // Apply the filtered date range
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" }, // Group by day of the month for weekly data (modify based on filter)
            totalDailySales: { $sum: "$totalPrice" }, // Sum of total sales
            totalDailyProfit: { $sum: { $multiply: ["$totalPrice", 0.1] } }, // Assume profit is 10% of total sales
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
     

      const categories = metrics.map((metric) => `Day ${metric._id}`);
      const totalSalesData = metrics.map((metric) => metric.totalDailySales.toFixed(2));
      const totalProfitData = metrics.map((metric) => metric.totalDailyProfit.toFixed(2));

      console.log("category : ",categories);
      console.log("totalSalesData : ",totalSalesData);
      console.log("totalProfitData: ", totalProfitData);
      
      
      


      if (
        req.xhr ||
        req.headers["content-type"] === "application/json" ||
        req.headers.accept.indexOf("json") > -1
      ) {
        console.log("Fetch request detected");
        // Send JSON response for AJAX
        return res.json({
          topSellingProducts: productData,
          categoryLabels,
          categoryData,
          //main cart
          categories,
          totalSalesData,
          totalProfitData,
          finalTotalSaleAmount
        });
      }
      // Pass the data to the view
      res.render("admin/dashboardAdmin", {
        title: "AdminHome",
        dailyMetrics,
        totalUsers,
        topSellingProducts: productData,
        categories: JSON.stringify(categories), 
        totalSalesData: JSON.stringify(totalSalesData), 
        totalProfitData: JSON.stringify(totalProfitData),
        categoryLabels: JSON.stringify(categoryLabels),
        categoryData: JSON.stringify(categoryData),
        finalTotalSaleAmount
      });
    
  } catch (error) {
    console.error("Error in admin dashboard:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

export const dashboardFilter = async (req, res) => {
  try {
    //--------------- graph filtered data------------------

    const filter = req.query.filter;
    let matchCondition = {
      orderStatus: { $in: ["Delivered", "Pending", "Shipped"] },
      isCancelled: false,
    };
    let startDate, endDate;

    switch (filter) {
      case "yesterday":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "today":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;

      case "thisWeek":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of the week
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisMonth":
        startDate = new Date();
        startDate.setDate(1); // First day of the month
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisYear":
        startDate = new Date(new Date().getFullYear(), 0, 1); // First day of the year
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        // Default case can be today
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
    }

    matchCondition.createdAt = { $gte: startDate, $lt: endDate };

    const metrics = await OrderSchema.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$priceAfterCouponDiscount" },
          totalProfit: {
            $sum: { $multiply: ["$priceAfterCouponDiscount", 0.1] },
          },
        },
      },
    ]);

    res.json({
      totalSales: metrics[0]?.totalSales || 0,
      totalProfit: metrics[0]?.totalProfit || 0,
    });
  } catch (error) {
    console.error("Error in admin dashboard:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};



//---------------------------- add category page -------------------------------------

export const addCategory = (req, res) => {
  try {
    
      res.render("admin/addCategory", {
        title: "Add category",
        admin: req.session.admin,
        successMessage: req.flash("success"),
        errorMessage: req.flash("error"),
      });
    
  } catch (error) {
    console.log(`error while rendering add category ${error} `);
  }
};

//---------------------------- add category post -------------------------------------

export const addCategoryPost = async (req, res) => {
  try {
    const { categoryName, isBlocked } = req.body;

    const existingCategory = await category.findOne({
      collectionName: categoryName.trim().toLowerCase().replace(/\s+/g, ""),
    });

    if (existingCategory) {
      req.flash("error", "category already exist");
      return res.redirect("/admin/addCategory?success=false");
    }

    const newCategory = new category({
      collectionName: categoryName.trim().toLowerCase().replace(/\s+/g, ""),
      isActive: isBlocked === "true",
    });

    await newCategory.save();
    req.flash("success", "Category added successfully!");
    return res.redirect("addCategory/?success=true");
  } catch (error) {
    console.log("Error adding category:", error);

    res.redirect("/addCategory?success=false");
  }
};

//----------------------------category view -------------------------------------

export const categoryView = async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const searchFilter = searchQuery
      ? { collectionName: { $regex: searchQuery, $options: "i" } }
      : {};
    const categories = await category.find(searchFilter).skip(skip).limit(limit);
    const totalCategories = await category.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalCategories / limit);
    // Support AJAX/JSON requests for pagination
    if (
      req.xhr ||
      req.headers["content-type"] === "application/json" ||
      (req.headers.accept && req.headers.accept.indexOf("json") > -1)
    ) {
      return res.json({
        categories,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        searchQuery,
        totalRecordsCount: totalCategories,
      });
    }
    res.render("admin/category", {
      title: "Category",
      admin: req.session.admin,
      categories,
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      searchQuery,
      totalRecordsCount: totalCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
}

//----------------------------category update -------------------------------------

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, isBlocked } = req.body;

  try {

    const existingCategory = await category.findOne({
      collectionName: name.trim().toLowerCase().replace(/\s+/g, ""),
    });
    if (existingCategory) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Category already exists" });
    }

    const result = await category.findByIdAndUpdate(
      id,
      { collectionName: name, isActive: isBlocked },
      { new: true }
    );

    if (!result) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Category not found" });
    }

    res
      .status(HTTP_STATUS.OK)
      .json({ message: "category updated succesfully", category: result });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }
};

//----------------------------customers -------------------------------------

export const customers = async (req, res) => {
  try {
      const searchQuery = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      const searchFilter = {
        $or: [
          { username: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
        ],
      };
      const users = await User.find(searchFilter).skip(skip).limit(limit);
      const totalUsers = await User.countDocuments(searchFilter); // count only filtered users
      const totalPages = Math.ceil(totalUsers / limit);
      // Support AJAX/JSON requests for pagination
      if (
        req.xhr ||
        req.headers["content-type"] === "application/json" ||
        (req.headers.accept && req.headers.accept.indexOf("json") > -1)
      ) {
        return res.json({
          users,
          currentPage: page,
          totalPages: totalPages,
          limit: limit,
          searchQuery,
          totalRecordsCount: totalUsers,
        });
      }
      res.render("admin/customers", {
        title: "customers",
        users,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        searchQuery,
        totalRecordsCount: totalUsers, // <-- add this line
      });
  } catch (error) {
    console.log(`error while rendering add customers ${error} `);
  }
};

//----------------------------block/unblock user-------------------------------------

export const toggleVerification = async (req, res) => {
  const { userId, isVerified } = req.body;
  try {
    await User.updateOne({ _id: userId }, { $set: { isVerified: isVerified } });

    res.json({ success: true });
  } catch (error) {
    console.log(`Error while updating verification status: ${error}`);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Failed to update status" });
    res.json({ success: false });
  }
};

//----------------------------orders Listing poge -------------------------------------

export const ordersList = async (req, res) => {
  try {
    
      const {
        status,
        paymentMethod,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = req.query;

      const filter = {};

      if (status) {
        filter.orderStatus = status;
      }

      if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
      }

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
          filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          filter.createdAt.$lte = new Date(endDate);
        }
      }

      const skip = (page - 1) * limit;

      const orders = await OrderSchema.find(filter)
        .populate({
          path: "products.product_id",
          select: "name category",
        })
        .populate({
          path: "customer_id",
          select: "username",
          model: User,
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      // Get the total number of orders for pagination info
      const totalOrders = await OrderSchema.countDocuments(filter);
      const totalPages = Math.ceil(totalOrders / limit);

      res.render("admin/orders", {
        title: "Orders",
        admin: req.session.admin,
        orders,
        currentPage: page,
        totalPages,
        limit,
        totalOrders,
        filters: { status, paymentMethod, startDate, endDate },
      });
    
  } catch (error) {
    console.log("error while rendring orders", error);
  }
};

//----------------------------ordres view for admin-------------------------------------

export const orderViewAdmin = async (req, res) => {
  const { orderId } = req.query;
  try {
    const order = await OrderSchema.findOne({ _id: orderId })
      .populate("customer_id")
      .populate({
        path: "products.product_id",
        select: "product_name category price discount stock image",
        model: Product,
        options: { strictPopulate: false },
      });

    res.json(order);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Error fetching order details" });
  }
};

export const searchCustomer = async (req, res) => {};


//---------------- offer lisitng controler -------------------


export const offers = async (req, res) => {
  try {
    const categories = await category.find({ isActive: true });
    const offers = await Offer.find({ isActive: true }).populate(
      "offerCategory",
      "collectionName"
    );

    res.render("admin/offers", {
      categories,
      title: "offers",
      offers,
    });
  } catch (error) {
    console.log("Error while rendering offers : ", error);
  }
};


//---------------------- offer adding post controller ----------------------


export const addOfferPost = async (req, res) => {
  try {
    const { offerCategory, name, percentage } = req.body;

    console.log(offerCategory, "---", name, "----", percentage);
    if (!offerCategory || !name || !percentage) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ status: error, message: "All fields are required." });
    }

    const isCategory = await category.findById(offerCategory);

    if (!isCategory) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Category not found." });
    }

    const products = await Product.find({ category: offerCategory });

    if (products.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "No products found in this category." });
    }

    const newOffer = Offer({
      offerCategory: offerCategory,
      offerName: name,
      discountPercentage: parseInt(percentage),
      isActive: true,
    });

    const updatePromises = products.map((product) => {
      product.discount += parseInt(percentage);
      return product.save();
    });

    await Promise.all(updatePromises);
    await newOffer.save();

    console.log(products);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      message: "Offer created successfully!",
    });
  } catch (error) {
    console.error("Error while creating offer:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while creating the offer.",
      error: error.message,
    });
  }
};

//---------------------- Offer removing  ----------------------

export const removeOffer = async (req, res) => {
  try {
    const { offerId } = req.body;

    if (!offerId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Offer ID is required." });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Offer not found." });
    }

    offer.isActive = false;
    await offer.save();

    const products = await Product.find({ category: offer.offerCategory });

    const updatePromises = products.map((product) => {
      product.discount -= offer.discountPercentage; // Decrease the discount
      if (product.discount < 0) product.discount = 0; // Ensure discount doesn't go negative
      return product.save();
    });

    await Promise.all(updatePromises);

    return res.status(HTTP_STATUS.OK).json({
      status: "success",
      message: "Offer removed and products updated successfully!",
    });
  } catch (error) {
    console.error("Error while removing offer:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to remove offer. Please try again later.",
    });
  }
};
