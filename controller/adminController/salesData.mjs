import OrderSchema from "../../model/orderSchema.mjs";

const applyDateFilter = (filter) => {
  const now = new Date();
  let dateFilter = {};

  if (filter === 'day') {
    dateFilter.createdAt = {
      $gte: new Date(now.setHours(0, 0, 0, 0)),
      $lt: new Date(now.setHours(23, 59, 59, 999)),
    };
  } else if (filter === 'week') {
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    dateFilter.createdAt = { $gte: startOfWeek, $lt: endOfWeek };
  } else if (filter === 'month') {
    dateFilter.createdAt = {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1), // Start of month
      $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1), // Start of next month
    };
  } else if (filter === 'year') {
    dateFilter.createdAt = {
      $gte: new Date(now.getFullYear(), 0, 1), // Start of year
      $lt: new Date(now.getFullYear(), 12, 31), // End of year
    };
  }

  return dateFilter;
};

export const sales = async (req, res) => {
  try {
    const filter = req.query.filter || ''; // 'day', 'week', 'month', 'year'
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    console.log("page = ",page);
    console.log("limit = ",limit);
    

    let queryCondition = {};

    if (filter) {
      const dateFilter = applyDateFilter(filter);
      queryCondition = { ...queryCondition, ...dateFilter };
    }

    const salesData = await OrderSchema.find(queryCondition)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log("sales data length = ",salesData.length);
    

    const totalRecords = await OrderSchema.countDocuments(queryCondition);

    console.log("Total recodrd = ",totalRecords);
    console.log("sales recodrd = ",salesData);

    console.log("totalPages = ",Math.ceil(totalRecords / limit));
    
    

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        data: salesData,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecordsCount: totalRecords,
      });
    } else {
      res.render('admin/salesReport', {
        data: salesData,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecordsCount: totalRecords,
        title: 'Sales Report',
      });
    }
  } catch (error) {
    console.error('Error while rendering the sales report:', error);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    } else {
      res.status(500).render('error', { message: 'Server Error', error });
    }
  }
};
