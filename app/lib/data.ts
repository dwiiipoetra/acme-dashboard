// import { sql } from '@vercel/postgres';
// initiate supabase client
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://iptsgvvlxhiwkvrvzghf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdHNndnZseGhpd2t2cnZ6Z2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MTYzODAsImV4cCI6MjA0OTI5MjM4MH0.JzSmQBQl3SJwzEweGKBKlR7dokh4WsSwbiQyx1Moxi0';
const supabase = createClient(supabaseUrl, supabaseKey);
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

// export async function fetchRevenue() {
//   try {
//     // Artificially delay a response for demo purposes.
//     // Don't do this in production :)

//     // console.log('Fetching revenue data...');
//     // await new Promise((resolve) => setTimeout(resolve, 3000));

//     const data = await sql<Revenue>`SELECT * FROM revenue`;

//     // console.log('Data fetch completed after 3 seconds.');

//     return data.rows;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch revenue data.');
//   }
// }

export async function fetchRevenue():Promise<Revenue[]> {
  try {
    // Mengambil data dari tabel revenue
    // console.log('fetching data');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { data, error } = await supabase
      .from('revenue')
      .select('*');
    // console.log('Data fetch completed after 5 seconds.');
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// export async function fetchLatestInvoices() {
//   try {
//     const data = await sql<LatestInvoiceRaw>`
//       SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       ORDER BY invoices.date DESC
//       LIMIT 5`;

//     const latestInvoices = data.rows.map((invoice) => ({
//       ...invoice,
//       amount: formatCurrency(invoice.amount),
//     }));
//     return latestInvoices;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch the latest invoices.');
//   }
// }

export async function fetchLatestInvoices() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        amount,
        customers ( name, image_url, email ), id
      `)
      .order('date', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

// export async function fetchCardData() {
//   try {
//     // You can probably combine these into a single SQL query
//     // However, we are intentionally splitting them to demonstrate
//     // how to initialize multiple queries in parallel with JS.
//     const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
//     const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
//     const invoiceStatusPromise = sql`SELECT
//          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
//          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
//          FROM invoices`;

//     const data = await Promise.all([
//       invoiceCountPromise,
//       customerCountPromise,
//       invoiceStatusPromise,
//     ]);

//     const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
//     const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
//     const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
//     const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

//     return {
//       numberOfCustomers,
//       numberOfInvoices,
//       totalPaidInvoices,
//       totalPendingInvoices,
//     };
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch card data.');
//   }
// }

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const [
      customerResponse,
      invoiceResponse,
      paidInvoiceStatusResponse,
      pendingInvoiceStatusResponse
    ] = await Promise.all([
      supabase
        .from('customers').select('*', { count: 'exact', head: true }),
      supabase
        .from('invoices').select('*', { count: 'exact', head: true }),
      supabase
        .from('invoices').select('amount').eq('status', 'paid'),
      supabase
        .from('invoices').select('amount').eq('status', 'pending')
    ]);

    const { count: customerCount, error: customerError } = customerResponse;
    const { count: invoiceCount, error: invoiceError } = invoiceResponse;
    const { data: paidInvoiceStatus, error: paidInvoiceStatusError } = paidInvoiceStatusResponse;
    const { data: pendingInvoiceStatus, error: pendingInvoiceStatusError } = pendingInvoiceStatusResponse;

    if (customerError) throw customerError;
    if (invoiceError) throw invoiceError;
    if (paidInvoiceStatusError) throw paidInvoiceStatusError;
    if (pendingInvoiceStatusError) throw pendingInvoiceStatusError;
    
    return {
      customerCount,
      invoiceCount,
      paidInvoiceStatus,
      pendingInvoiceStatus
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 3;

// export async function fetchFilteredInvoices(
//   query: string,
//   currentPage: number,
// ) {
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;

//   try {
//     const invoices = await sql<InvoicesTable>`
//       SELECT
//         invoices.id,
//         invoices.amount,
//         invoices.date,
//         invoices.status,
//         customers.name,
//         customers.email,
//         customers.image_url
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       WHERE
//         customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`} OR
//         invoices.amount::text ILIKE ${`%${query}%`} OR
//         invoices.date::text ILIKE ${`%${query}%`} OR
//         invoices.status ILIKE ${`%${query}%`}
//       ORDER BY invoices.date DESC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `;

//     return invoices.rows;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch invoices.');
//   }
// }

export async function fetchFilteredInvoices(
  query: string | number,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const amountQuery = `amount.eq.${!isNaN(query) ? Number(query): 0}`;
  // const dateQuery = query === "" ? "date.is.null" : `date.ilike.%${query}%`;
  const statusQuery = `status.ilike.%${query}%`;
  try {
    const { data, error } = await supabase
    .from('invoices')
    .select(`
      id,
      amount,
      date,
      status,
      customers (name, email, image_url)
    `)
    // .or(`${amountQuery},${statusQuery}`)
    .or(`name.ilike.%${query}%`, { referencedTable: 'customers' })
    // .or(`email.ilike.%${query}%`, { referencedTable: 'customers' })
    .order('date', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);
    
    if (error) {
      throw error;
    }
    console.log({data});
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

// export async function fetchInvoicesPages(query: string) {
//   try {
//     const count = await sql`SELECT COUNT(*)
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id
//     WHERE
//       customers.name ILIKE ${`%${query}%`} OR
//       customers.email ILIKE ${`%${query}%`} OR
//       invoices.amount::text ILIKE ${`%${query}%`} OR
//       invoices.date::text ILIKE ${`%${query}%`} OR
//       invoices.status ILIKE ${`%${query}%`}
//   `;

//     const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
//     return totalPages;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch total number of invoices.');
//   }
// }

export async function fetchInvoicesPages(query: string) {
  const amountQuery = `amount.eq.${!isNaN(query) ? Number(query): 0}`;
  // const dateQuery = query === "" ? "date.is.null" : `date.ilike.%${query}%`;
  const statusQuery = `status.ilike.%${query}%`;
  try {
    const { count, error } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .or(`${amountQuery},${statusQuery}`)
    // .or(`name.ilike.%${query}%`, { referencedTable: 'customers' });
    // .or(`email.ilike.%${query}%`, { referencedTable: 'customers' })
    
    if (error) {
      throw error;
    }
    const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);
    console.log({totalPages});
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices');
  }

  // try {
  //   const count = await sql`SELECT COUNT(*)
  //   FROM invoices
  //   JOIN customers ON invoices.customer_id = customers.id
  //   WHERE
  //     customers.name ILIKE ${`%${query}%`} OR
  //     customers.email ILIKE ${`%${query}%`} OR
  //     invoices.amount::text ILIKE ${`%${query}%`} OR
  //     invoices.date::text ILIKE ${`%${query}%`} OR
  //     invoices.status ILIKE ${`%${query}%`}
  // `;

  //   const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
  //   return totalPages;
  // } catch (error) {
  //   console.error('Database Error:', error);
  //   throw new Error('Failed to fetch total number of invoices.');
  // }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
