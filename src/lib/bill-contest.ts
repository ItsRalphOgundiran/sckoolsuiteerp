// Re-export all invoice-contest functions with Bill naming
// This provides a compatibility layer while transitioning from Invoice to Bill terminology

export {
  isOptionalFeeItem,
  getInvoiceContestByInvoice as getBillContestByBill,
  listInvoiceContestsBySchool as listBillContestsBySchool,
  listInvoiceContestsByParent as listBillContestsByParent,
  submitInvoiceContest as submitBillContest,
  reviewInvoiceContest as reviewBillContest,
  type InvoiceContestStatus as BillContestStatus,
  type InvoiceContestItem as BillContestItem,
  type InvoiceContestRecord as BillContestRecord,
} from "./invoice-contest";
