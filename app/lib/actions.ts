'use server'; 
//'use server' is needed only if you’re using React Server Components or building a library compatible with them.- https://react.dev/reference/react/use-server
// By adding the 'use server', you mark all the exported functions within the file as server functions. These server functions can then be imported into Client and Server components, making them extremely versatile.

import { z } from 'zod';
// To handle type validation, using a type validation library - ZOD can save you time and effort

import { sql } from '@vercel/postgres';
// create an SQL query to insert the new invoice into your database and pass in the variables:

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// connect the auth logic with your login form
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// define a schema that matches the shape of your form object. This schema will validate the formData before saving it to a database
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number() // set to coerce (change) from a string to a number while also validating its type.
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// create a new async function that accepts formData
// export async function createInvoice(formData: FormData) {
  // const rawFormData = {
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // };

  // Tip: If you're working with forms that have many fields, you may want to consider
  // using the entries() method with JavaScript's Object.fromEntries(). For example:
  // const rawFormData = Object.fromEntries(formData.entries())

  // Test it out:
  // console.log(rawFormData); // see the data you just entered into the form logged in your terminal

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    // safeParse() will return an object containing either a success or error field. This will help handle validation more gracefully without having put this logic inside the try/catch block.
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100; // convert the amount into cents for accuracy
  const date = new Date().toISOString().split('T')[0]; // create a new date with the format "YYYY-MM-DD" for the invoice's creation

  // Insert data into the database
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `; // insert data to DB
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  // you want to clear this cache and trigger a new request to the server. You can do this with the revalidatePath function and fresh data will be fetched from the server.

  redirect('/dashboard/invoices'); // redirect the user back to the /dashboard/invoices page
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
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
  // throw new Error('Failed to Delete Invoice');  // intentionally throw an error

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

// If there's a 'CredentialsSignin' error, you want to show an appropriate error message. 
// You can learn about NextAuth.js errors in the documentation - https://authjs.dev/reference/core/errors/

// Finally, in your login-form.tsx component, you can use React's useFormState to call 
// the server action and handle form errors, and use useFormStatus to handle the pending 
// state of the form: aap/ui/login-form.tsx

