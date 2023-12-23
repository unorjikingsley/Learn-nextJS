'use server'; 
//'use server' is needed only if you’re using React Server Components or building a library compatible with them.- https://react.dev/reference/react/use-server
// By adding the 'use server', you mark all the exported functions within the file as server functions. These server functions can then be imported into Client and Server components, making them extremely versatile.

import { z } from 'zod';
// To handle type validation, using a type validation library - ZOD can save you time and effort

import { sql } from '@vercel/postgres';
// create an SQL query to insert the new invoice into your database and pass in the variables:

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// define a schema that matches the shape of your form object. This schema will validate the formData before saving it to a database
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(), // set to coerce (change) from a string to a number while also validating its type.
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// create a new async function that accepts formData
export async function createInvoice(formData: FormData) {
  // const rawFormData = {
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // };

  // Test it out:
  // console.log(rawFormData); // see the data you just entered into the form logged in your terminal

  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  // Tip: If you're working with forms that have many fields, you may want to consider
  // using the entries() method with JavaScript's Object.fromEntries(). For example:
  // const rawFormData = Object.fromEntries(formData.entries())

  const amountInCents = amount * 100; // convert the amount into cents for accuracy
  const date = new Date().toISOString().split('T')[0]; // create a new date with the format "YYYY-MM-DD" for the invoice's creation

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `; // insert data to DB
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  // you want to clear this cache and trigger a new request to the server. You can do this with the revalidatePath function and fresh data will be fetched from the server.

  redirect('/dashboard/invoices'); // redirect the user back to the /dashboard/invoices page
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');  // intentionally throw an error

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
