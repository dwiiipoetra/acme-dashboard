import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import { fetchRevenue, fetchLatestInvoices, fetchCardData } from '../lib/data';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { formatCurrency } from '../lib/utils';

export default async function Page() {
  const revenue = await fetchRevenue(); 
  const latestInvoices = await fetchLatestInvoices();
  const {
    customerCount,
    invoiceCount,
    paidInvoiceStatus,
    pendingInvoiceStatus
  } = await fetchCardData();
  const formattedPaidInvoiceStatus = formatCurrency(paidInvoiceStatus.reduce((acc ,item) => acc += item.amount, 0))
  const formattedPendingInvoiceStatus = formatCurrency(pendingInvoiceStatus.reduce((acc ,item) => acc += item.amount, 0))
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={formattedPaidInvoiceStatus} type="collected" />
        <Card title="Pending" value={formattedPendingInvoiceStatus} type="pending" />
        <Card title="Total Invoices" value={invoiceCount} type="invoices" />
        <Card
          title="Total Customers"
          value={customerCount}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChart revenue={revenue}  />
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}