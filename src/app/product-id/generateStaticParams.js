// This file contains the generateStaticParams function for the [id] route

export async function generateStaticParams() {
  // Return an array of params to generate static pages for
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    // Add more IDs as needed
  ];
}