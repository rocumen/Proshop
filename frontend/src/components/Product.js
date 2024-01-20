import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import { useState, useEffect } from "react";

function Product({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (isHovered && product.image && product.image.length > 1) {
      // Show the second image when hovered
      setCurrentImage(product.image[1].url);
    } else {
      // Show the default image when not hovered
      setCurrentImage(
        product.image && product.image.length > 0
          ? product.image[0].url
          : "https://cdn.vox-cdn.com/thumbor/fTSCwFG5qxjEXaDJm4bU1ATqSQE=/0x0:628x287/1200x0/filters:focal(0x0:628x287):no_upscale()/cdn.vox-cdn.com/uploads/chorus_asset/file/13375469/file_not_found.jpg"
      );
    }
  }, [isHovered, product.image]);

  return (
    <>
      <Card
        className={`my-3 p-3 text-center ${isHovered ? "hovered" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link to={`/product/${product._id}`}>
          <Card.Img
            className="Image"
            src={
              product?.image && product?.image.length > 0
                ? product.image[0].url
                : "https://cdn.vox-cdn.com/thumbor/fTSCwFG5qxjEXaDJm4bU1ATqSQE=/0x0:628x287/1200x0/filters:focal(0x0:628x287):no_upscale()/cdn.vox-cdn.com/uploads/chorus_asset/file/13375469/file_not_found.jpg"
            }
            alt={product.name}
            // variant="top"
            style={{ width: 221, height: 176 }}
          />
        </Link>

        <Card.Body>
          <Link to={`/product/${product._id}`}>
            <Card.Title as="div" className="product-title">
              <strong>{product.name}</strong>
            </Card.Title>
          </Link>

          <Card.Text as="div">
            <Rating
              value={product.rating}
              text={`${product.numReviews} reviews`}
            />
          </Card.Text>

          <Card.Text as="h3">${product.price}</Card.Text>
        </Card.Body>
      </Card>
    </>
  );
}

export default Product;
