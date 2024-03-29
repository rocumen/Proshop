import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Form,
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Carousel,
  InputGroup,
} from "react-bootstrap";
import Rating from "../components/Rating";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../slices/productsApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { addToCart } from "../slices/cartSlice";

import { toast } from "react-toastify";
import Meta from "../components/Meta";
import GoBackButton from "../components/GoBack";

function ProductScreen() {
  const { id: productId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Product added to cart");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  const handleSmallImageClick = (index) => {
    setSelectedImage(index);
    setActiveIndex(index);
  };

  return (
    <>
      <GoBackButton />

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta title={product.name} />
          <Row>
            <Col md={5} className="text-center">
              {/* Display the main image */}
              {/* <Image
                rounded
                src={
                  product.image && product.image.length > 0
                    ? product.image[0].url
                    : ""
                }
                alt={product.name}
                fluid
                style={{ width: 451, height: 359 }}
              /> */}
              {/* Carousel for main image */}
              <Carousel
                activeIndex={activeIndex}
                onSelect={(index) => setActiveIndex(index)}
                interval={null} // Set interval to null to disable automatic transitions
                indicators={false} // Set indicators to false to hide the indicators
                controls={true} // Set controls to false to hide the next/prev controls
              >
                {product.image.map((image, index) => (
                  <Carousel.Item key={index}>
                    <Image
                      className="Image"
                      rounded
                      src={
                        product.image && product.image.length < 1
                          ? "https://cdn.vox-cdn.com/thumbor/fTSCwFG5qxjEXaDJm4bU1ATqSQE=/0x0:628x287/1200x0/filters:focal(0x0:628x287):no_upscale()/cdn.vox-cdn.com/uploads/chorus_asset/file/13375469/file_not_found.jpg"
                          : image.url
                      }
                      alt={product.name}
                      fluid
                      style={{ maxHeight: "450px", maxWidth: "100%" }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>

              {/* Small images */}
              <Col md={12}>
                <Row className="justify-content-center">
                  {product.image.slice(0, 4).map((image, index) => (
                    <Col key={index} md={3}>
                      <Image
                        className="Image my-3"
                        border
                        rounded
                        src={image.url}
                        alt={`${product.name} - Image ${index + 2}`}
                        fluid
                        style={{
                          cursor: "pointer", // Add cursor style to indicate it's clickable
                          border: `1px solid ${
                            selectedImage === index ? "blue" : "transparent"
                          }`,
                          maxHeight: "100px",
                        }}
                        onClick={() => handleSmallImageClick(index)}
                      />
                    </Col>
                  ))}
                </Row>
              </Col>
            </Col>

            <Col md={4}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>{product.name}</h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} reviews`}
                  />
                </ListGroup.Item>
                <ListGroup.Item>
                  {product.variant.length > 0 ? (
                    <>
                      <h6>Variant</h6>
                      <select>
                        {product.variant.map((x) => (
                          <option value={x}>{x}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    ""
                  )}
                </ListGroup.Item>

                <ListGroup.Item>
                  Description: {product.description}
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={3}>
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Price:</Col>
                      <Col>
                        <strong>${product.price}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Status:</Col>
                      <Col>
                        <strong>
                          {product.countInStock > 0 ? (
                            <p>{`Only ${product.countInStock} left`}</p>
                          ) : (
                            <p>Out of stock</p>
                          )}
                        </strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {product.countInStock > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Qty</Col>
                        <Col>
                          <InputGroup>
                            <Form.Control
                              type="text"
                              pattern="[0-9]*"
                              value={qty}
                              onChange={(e) => {
                                const enteredQty = Number(e.target.value);
                                setQty(
                                  Math.min(enteredQty, product.countInStock)
                                );
                              }}
                              min={1}
                              max={product.countInStock}
                            />
                            <Form.Control
                              as="select"
                              value={qty}
                              onChange={(e) => setQty(Number(e.target.value))}
                            >
                              {[...Array(product.countInStock).keys()].map(
                                (x) => (
                                  <option key={x + 1} value={x + 1}>
                                    {x + 1}
                                  </option>
                                )
                              )}
                            </Form.Control>
                          </InputGroup>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item className="mx-auto">
                    {userInfo && userInfo.isAdmin ? (
                      <Button
                        className="btn-block"
                        type="button"
                        disabled
                        onClick={addToCartHandler}
                        style={{
                          width: "150px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        Add to cart
                      </Button>
                    ) : (
                      <Button
                        className="btn-block"
                        type="button"
                        disabled={product.countInStock === 0}
                        onClick={addToCartHandler}
                      >
                        Add to cart
                      </Button>
                    )}
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>

          <Row className="review">
            <Col md={6} className="my-3">
              <h2>Reviews</h2>
              {product.reviews.length === 0 && <Message>No Reviews</Message>}
              <ListGroup variant="flush">
                {product.reviews.map((review) => (
                  <ListGroup.Item key={review._id}>
                    <strong>{review.name}</strong>
                    <Rating value={review.rating} />
                    <p>{review.createdAt.substring(0, 10)}</p>
                    <p>{review.comment}</p>
                  </ListGroup.Item>
                ))}

                <ListGroup.Item>
                  <h2>Write a Customer Review</h2>

                  {loadingProductReview && <Loader />}

                  {userInfo ? (
                    <Form onSubmit={submitHandler}>
                      <Form.Group controlId="rating" className="my-2">
                        <Form.Label>Rating</Form.Label>
                        <Form.Control
                          as={"select"}
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                        >
                          <option value={""}>Select...</option>
                          <option value="1">1 - Poor</option>
                          <option value="2">2 - Fair</option>
                          <option value="3">3 - Good</option>
                          <option value="4">4 - Very Good</option>
                          <option value="5">5 - Excellent</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group controlId="comment" className="my-2">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as={"textarea"}
                          rows="3"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                      <Button
                        disabled={loadingProductReview}
                        type="submit"
                        variant="primary"
                      >
                        {" "}
                        Submit
                      </Button>
                    </Form>
                  ) : (
                    <Message>
                      Please <Link to="/login">Sign in</Link> to write a review{" "}
                    </Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

export default ProductScreen;
