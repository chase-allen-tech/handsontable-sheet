import React from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const toast_msg = ({ type, message }) =>
  toast[type](
    <div style={{ display: "flex", color: "white" }}>
      <div
        style={{
          fontSize: 15,
          paddingTop: 8,
          flexShrink: 0,
          textAlign: "center",
          width: "30px"
        }}
      >
      </div>
      <div style={{ flexGrow: 1, fontSize: 15, padding: "8px 12px" }}>
        {message}
      </div>
    </div>
  );

toast_msg.dismiss = toast.dismiss;

export default toast_msg;
