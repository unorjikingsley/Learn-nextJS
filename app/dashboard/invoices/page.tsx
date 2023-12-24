import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';

import { fetchInvoicesPages } from '@/app/lib/data';
// fetchInvoicesPages returns the total number of pages based on the search query.

import { Metadata } from 'next';
//  if you want to add a custom title for a specific page? You can do this by adding a 
// metadata object to the page itself. Metadata in nested pages will override the 
// metadata in the parent. but we are repeating the title of the application in every 
// page. If something changes, like the company name, you'd have to update it on every 
// page. 

// Instead, you can use the title.template field in the metadata object to define a 
// template for your page titles. this is done in the root layout
// Read more - https://nextjs.org/docs/app/api-reference/functions/generate-metadata

export const metadata: Metadata = {
  title: 'Invoices',
};

export default async function Page({
  // Page components accept a prop called searchParams, so you can pass the current URL params to the <Table> component.
  
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;

    const totalPages = await fetchInvoicesPages(query);  // pagination

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>

      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
    
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
