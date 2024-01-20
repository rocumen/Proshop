import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Product from "../components/Product";
import { useGetProductsQuery } from "../slices/productsApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Paginate from "../components/Paginate";

const AllProductsScreen = () => {
  const { pageNumber, keyword } = useParams();
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedPrice, setSelectedPrice] = useState("Show All");

  const {
    data,
    isLoading,
    error,
    refetch: refetchProducts,
  } = useGetProductsQuery({
    pageNumber,
    keyword,
  });

  const allCategories = data?.products.flatMap((product) => product.category);
  const uniqueCategories = [...new Set(allCategories)];

  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (data) {
      setFilteredProducts(data.products);
    }
  }, [data]);

  const filterProductByCategory = (e) => {
    const selectedValue = e.target.value;

    setSelectedCategory(selectedValue);

    if (selectedValue === "Show All") {
      setFilteredProducts(data.products); // Show all products
    } else {
      const filteredProducts = data.products.filter((product) =>
        product.category.includes(selectedValue)
      );

      setFilteredProducts(filteredProducts);
    }
  };

  const filterProductByPrice = (e) => {
    const selectedValue = e.target.value;

    setSelectedPrice(selectedValue);

    if (selectedValue === "low to high") {
      // Sort the products array by price in ascending order
      const sortedProducts = [...filteredProducts].sort(
        (a, b) => a.price - b.price
      );
      setFilteredProducts(sortedProducts);
    } else if (selectedValue === "high to low") {
      // Sort the products array by price in descending order
      const sortedProducts = [...filteredProducts].sort(
        (a, b) => b.price - a.price
      );
      setFilteredProducts(sortedProducts);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Row>
            <Col md={2}>
              <h6>Filter by Category</h6>
              <select
                value={selectedCategory}
                onChange={filterProductByCategory}
              >
                <option value="Show All">Show All</option>
                {uniqueCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Col>
            <Col md={2}>
              <h6>Filter by Price</h6>
              <select value={selectedPrice} onChange={filterProductByPrice}>
                <option value="Show All">Show All</option>
                <option value="low to high">Price Low - High</option>
                <option value="high to low">Price High - Low</option>
              </select>
            </Col>
          </Row>

          <h1>All Products</h1>
          <Row>
            {filteredProducts.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <Paginate
            pages={data.pages}
            page={data.page}
            keyword={keyword ? keyword : ""}
          />
        </>
      )}
    </>
  );
};

export default AllProductsScreen;
