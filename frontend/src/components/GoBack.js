import React from "react";
import { useNavigate } from "react-router-dom";

const GoBackButton = () => {
  const navigate = useNavigate();

  const goBackHandler = () => {
    navigate(-1); // Go back one step in the history
  };

  return (
    <button className="btn btn-light my-3" onClick={goBackHandler}>
      Go Back
    </button>
  );
};

export default GoBackButton;
