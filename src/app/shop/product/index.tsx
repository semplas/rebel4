export default function ProductsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((id) => (
          <div key={id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Product {id}</h2>
            <p className="text-gray-600 mb-4">This is a static product page.</p>
            <a 
              href={`/shop/product/${id}`} 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Details
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}