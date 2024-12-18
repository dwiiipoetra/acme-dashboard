import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/data';
import { formatCurrency } from '@/app/lib/utils';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  const {
    customerCount,
    invoiceCount,
    paidInvoiceStatus,
    pendingInvoiceStatus
  } = await fetchCardData();
  const formattedPaidInvoiceStatus = formatCurrency(paidInvoiceStatus.reduce((acc ,item) => acc += item.amount, 0));
  const formattedPendingInvoiceStatus = formatCurrency(pendingInvoiceStatus.reduce((acc ,item) => acc += item.amount, 0));
  return (
    <>
      {/* NOTE: Uncomment this code in Chapter 9 */}

      <Card title="Collected" value={formattedPaidInvoiceStatus} type="collected" />
      <Card title="Pending" value={formattedPendingInvoiceStatus} type="pending" />
      <Card title="Total Invoices" value={invoiceCount} type="invoices" />
      <Card
        title="Total Customers"
        value={customerCount}
        type="customers"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
