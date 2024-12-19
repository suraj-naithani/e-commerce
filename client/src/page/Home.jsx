import ImageSlider from "../components/ImageSlider";
import { categories } from "../constants/data";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ImageSlider />

      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category.title}
                className="relative h-96 group cursor-pointer overflow-hidden rounded-lg"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute flex flex-col gap-[5px] inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white font-bold">{category.category}</h3>
                  <p className="text-white text-center">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
