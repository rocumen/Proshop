import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button, Image, Modal } from "react-bootstrap";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import FormContainer from "../../components/FormContainer";
import { toast } from "react-toastify";
import {
  useUpdateProductMutation,
  useGetProductDetailsQuery,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
} from "../../slices/productsApiSlice";

const ProductEditScreen = () => {
  const { id: productId } = useParams();

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [selectedImage, setSelectedImage] = useState([]);
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [variant, setVariant] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [updateProduct, { isLoading: loadingUpdate }] =
    useUpdateProductMutation();

  const [uploadProductImages, { isLoading: loadingUpload }] =
    useUploadProductImagesMutation();

  const [deleteProductImage, { isLoading: deleteLoading }] =
    useDeleteProductImageMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setImage(product.image);
      setBrand(product.brand);
      setCategory(product.category);
      setVariant(product.variant);
      setCountInStock(product.countInStock);
      setDescription(product.description);
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProduct({
        productId,
        name,
        price,
        image,
        brand,
        category,
        variant,
        description,
        countInStock,
      }).unwrap(); // NOTE: here we need to unwrap the Promise to catch any rejection in our catch block
      toast.success("Product updated");
      refetch();
      navigate("/admin/productlist");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // const uploadFileHandler = async (e) => {
  //   const formData = new FormData();
  //   formData.append("image", e.target.files[0]);

  //   try {
  //     const { message, imageUrl } = await uploadProductImage(formData).unwrap();
  //     toast.success(message);
  //     setImage(imageUrl);
  //   } catch (error) {
  //     toast.error(error?.data?.message || error.error);
  //   }
  // };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();

    // Append each selected file to the FormData object
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append("images", e.target.files[i]);
    }

    try {
      const { message, imageUrls } = await uploadProductImages(
        formData
      ).unwrap();
      toast.success(message);
      console.log(imageUrls);

      // Assuming setImage is a function to update the state of your images
      setImage(imageUrls);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const deleteImageHandler = async (imageIndex, productId) => {
    try {
      const props = {
        imageIndex: imageIndex.join("/"),
        productId: productId,
      };

      await deleteProductImage(props);
      refetch();
      toast.success("Deleted image");
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  const handleImageClick = (index) => {
    // Check if the image is already selected
    const isSelected = selectedImage.includes(index);
    console.log(isSelected);

    // Update the selected images state
    setSelectedImage((prevSelected) => {
      if (isSelected) {
        return prevSelected.filter((selected) => selected !== index);
      } else {
        return [...prevSelected, index];
      }
    });
  };

  return (
    <>
      <Link to="/admin/productlist" className="btn btn-light my-3">
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit Product</h1>
        {loadingUpdate && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger"> {error.data.message} </Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="name" className="my-2">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="price" className="my-2">
              <Form.Label>Product Price</Form.Label>
              <Form.Control
                type="price"
                placeholder="Enter product price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              ></Form.Control>
            </Form.Group>

            {/* Button to show modal */}
            <Button onClick={handleShowModal} className="mb-2">
              Show Images
            </Button>

            {/* Modal to display images */}
            {deleteLoading && <Loader />}
            <Modal show={showModal} onHide={handleCloseModal} centered>
              <Modal.Header closeButton>
                <Modal.Title>Images</Modal.Title>
              </Modal.Header>
              <h6 className="ms-3 mt-2">Select Images to Delete</h6>
              <Modal.Body>
                {product.image.map((image, index) => (
                  <div
                    key={index}
                    style={{ display: "inline-block", margin: "10px" }}
                  >
                    <Image
                      rounded
                      src={image.url}
                      alt={product.name}
                      fluid
                      style={{
                        width: 150,
                        height: 120,
                        cursor: "pointer",
                        border: selectedImage.includes(index)
                          ? "2px solid red"
                          : "2px solid transparent",
                      }}
                      onClick={() => handleImageClick(index)}
                    />
                  </div>
                ))}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
                {product.image.length <= 1 ||
                selectedImage.length === product.image.length ? (
                  <Button
                    variant="danger"
                    onClick={() => deleteImageHandler(selectedImage, productId)}
                    disabled
                  >
                    Delete Image
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    onClick={() => deleteImageHandler(selectedImage, productId)}
                  >
                    Delete Image
                  </Button>
                )}
              </Modal.Footer>
            </Modal>

            {/* File input for selecting multiple images */}
            <Form.Group>
              <Form.Control
                type="file"
                label="Choose file"
                onChange={uploadFileHandler}
                multiple // Allow multiple file selection
              ></Form.Control>
            </Form.Group>

            {loadingUpload && <Loader />}

            <Form.Group controlId="brand" className="my-2">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="countInStock" className="my-2">
              <Form.Label>Count In Stock</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter product countInStock"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="category" className="my-2">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="variant" className="my-2">
              <Form.Label>Variant</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product variant"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="description" className="my-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" className="my-2">
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;
