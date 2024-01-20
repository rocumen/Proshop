import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const SearchBox = () => {
  const navigate = useNavigate();

  const { keyword: urlKeyword, id: productId } = useParams();
  const [keyword, setKeyword] = useState(urlKeyword || "");

  const submitHandler = (e) => {
    e.preventDefault();

    if (keyword.trim()) {
      setKeyword("");
      navigate(`/search/${keyword}`);
    } else {
      navigate("/");
    }
  };

  return (
    <Form onSubmit={submitHandler} className="d-flex">
      <Form.Control
        type="text"
        name="q"
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder="Search..."
        className="mr-sm-2 ml-sm-5"
      />
      <Button type="submit" variant="outline-light" className="p-2 mx-2">
        <FaSearch className="text-center" />
      </Button>
    </Form>
  );
};

export default SearchBox;
