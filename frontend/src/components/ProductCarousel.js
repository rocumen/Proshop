import { Link } from "react-router-dom";
import { Carousel, Image } from "react-bootstrap";
import Message from "./Message";
import { useGetTopProductsQuery } from "../slices/productsApiSlice";

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  return isLoading ? null : error ? (
    <Message variant="danger">{error?.data?.message || error.error}</Message>
  ) : (
    <Carousel pause="hover" className="car bg-primary mb-4">
      {products.map((product) => (
        <Carousel.Item key={product._id} className="car">
          <Link className="link" to={`/product/${product._id}`}>
            <Image
              src={product.image[0].url}
              alt={product.name}
              fluid
              style={{ width: "640px", height: "510px" }}
            />
          </Link>
          <div className="carousel-caption">
            <h2 className="text-white">
              {product.name} (${product.price})
            </h2>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ProductCarousel;
