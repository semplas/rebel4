// Define common types for Next.js pages
export interface PageParams {
  [key: string]: string;
}

export interface PageProps<T = PageParams> {
  params: T;
}