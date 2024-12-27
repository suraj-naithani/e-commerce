import { Link } from "react-router-dom";
import Card from "../components/Card";
import Filter from "../components/Filter";
import { useGetProductsQuery } from "../redux/api/productApi";
import { useState, useMemo, useEffect } from "react";

const Product = () => {
  const { data, isLoading, refetch } = useGetProductsQuery();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(data?.products?.map((product) => product.category))
    );
  }, [data]);

  const [minPrice, maxPrice] = useMemo(() => {
    const prices = data?.products?.map((product) => product.price) || [];
    return [Math.min(...prices), Math.max(...prices)];
  }, [data]);

   useEffect(() => {
     if (data) {
       setPriceRange([minPrice, maxPrice]);
     }
   }, [data, minPrice, maxPrice]);

  
  const filteredProducts = useMemo(() => {
    return data?.products?.filter(
      (product) =>
        (selectedCategory ? product.category === selectedCategory : true) &&
        product.price >= priceRange[0] &&
        product.price <= priceRange[1]
    );
  }, [data, selectedCategory, priceRange]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-screen-2xl flex flex-col lg:flex-row gap-0 lg:gap-10">
        <div className="flex-[2] w-full">
          <Filter
            categories={categories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </div>

        <div className="flex-[8] w-full">
          <div className="mb-8 text-center flex justify-between">
            <h3 className="text-2xl font-semibold text-gray-800">Products</h3>
            <p className="text-gray-600">
              <Link to="/" className="hover:underline">
                home
              </Link>{" "}
              /{" "}
              <Link to="/product" className="hover:underline">
                product
              </Link>
            </p>
          </div>
          {filteredProducts?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-xl font-medium text-gray-600">
                No Item Found
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
