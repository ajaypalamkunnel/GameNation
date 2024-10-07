import OrderSchema from "../../model/orderSchema.mjs";
import xlsx from 'xlsx';
import PDFDocument from "pdfkit";

const applyDateFilter = (filter) => {
  const now = new Date();
  let dateFilter = {};

  if (filter === 'day') {
    dateFilter.createdAt = {
      $gte: new Date(now.setHours(0, 0, 0, 0)),
      $lt: new Date(now.setHours(23, 59, 59, 999)),
    };
  } else if (filter === 'week') {
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay(); 
    const distanceToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1); 
   
    startOfWeek.setDate(now.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Set end of the week 
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

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
    const filter = req.query.filter || ''; 
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

      
      
      
      
    const totalRecords = await OrderSchema.countDocuments(queryCondition);

    console.log("Total recodrd = ",totalRecords);
    console.log("sales recodrd = ",salesData);

    console.log("totalPages = ",Math.ceil(totalRecords / limit));

    const totSalesData = await OrderSchema.find(queryCondition)

    let orderAmount = totSalesData.reduce((tot,val)=>{
       return  tot += val.priceAfterCouponDiscount
    },0)
    let totalCouponDiscount = totSalesData.reduce((tot,val)=>{
       return  tot += val.couponDiscount
    },0)
    
    let totalSalesCount = totSalesData.length;

    console.log("Toal sales count : ",totalSalesCount);
    console.log("order amount : ",orderAmount);
    
    
    

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        data: salesData,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecordsCount: totalRecords,
        overallSalesCount:totalSalesCount,
        overallOrderAmount:orderAmount,
        totalCouponDiscount:totalCouponDiscount
      });
    } else {
      res.render('admin/salesReport', {
        data: salesData,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecordsCount: totalRecords,
        title: 'Sales Report',
        overallSalesCount:totalSalesCount,
        overallOrderAmount:orderAmount,
        totalCouponDiscount:totalCouponDiscount

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





export const exportReport = async(req,res)=>{

    try {

        const filter = req.query.filter || '';
        const format = req.query.format;


        let queryCondition = {}

        if(filter){
            const dateFilter = applyDateFilter(filter);
            queryCondition = {...queryCondition,...dateFilter}
        }

        const salesData = await OrderSchema.find(queryCondition).sort({createdAt:-1})

        if(format === 'excel'){

            const worksheetData = salesData.map(data => ({
                OrderID: data.order_id,
                UserID: data.customer_id,
                OrderDate: new Date(data.createdAt).toLocaleDateString('en-GB'),
                OrderAmount: `₹${data.priceAfterCouponDiscount.toFixed(2)}`,
                CouponDeduction: `₹${data.couponDiscount.toFixed(2)}`,
                PaymentStatus: data.paymentStatus,
                PaymentMethod: data.paymentMethod,
              }));

              const worksheet = xlsx.utils.json_to_sheet(worksheetData);
              const workbook = xlsx.utils.book_new();
              xlsx.utils.book_append_sheet(workbook,worksheet,'Sales Report');


              const excelBuffer = xlsx.write(workbook,{type:'buffer',bookType:'xlsx'})
              res.setHeader('Content-Disposition', 'attachment; filename="sales_report.xlsx"');
              res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
              return res.send(excelBuffer);
            
          
        }


        if(format === 'pdf'){

            const doc = new PDFDocument();
            res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"')
            res.setHeader('Content-Type', 'application/pdf');
            doc.pipe(res);


            salesData.forEach(data => {
                doc.fontSize(12).text(`Order ID: ${data.order_id}`);
                doc.text(`User ID: ${data.customer_id}`);
                doc.text(`Order Date: ${new Date(data.createdAt).toLocaleDateString('en-GB')}`);
                doc.text(`Order Amount: ₹${data.priceAfterCouponDiscount.toFixed(2)}`);
                doc.text(`Coupon Deduction: ₹${data.couponDiscount.toFixed(2)}`);
                doc.text(`Payment Status: ${data.paymentStatus}`);
                doc.text(`Payment Method: ${data.paymentMethod}`);
                doc.moveDown();
              });

              doc.end()


        }
       
    } catch (error) {

        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
  }
}
