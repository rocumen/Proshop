import React, { useState } from "react";
import axios from "axios";

const UploadFile = () => {
  const preset_key = "V7Xy4ZbUcN2wJAspX-l4d6KhIA0";
  const cloud_name = "dg60equpb";
  const [image, setImage] = useState();

  const handleFile = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset_key);
    axios
      .post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData
      )
      .then((res) => setImage(res.data.secure_url))
      .catch((err) => console.log(err));
  };
  return (
    <div className="d-flex justify-content-center bg-dark">
      <div className="w-25 bg-white mt-5 p-5">
        <input type="file" name="image" onChange={handleFile}></input>
        <img src={image} className="w-50 h-100" />
      </div>
    </div>
  );
};

export default UploadFile;
