import React from "react";

function InfoText() {
  return (
    <div>
      {" "}
      <p>
        If your install number is over 8000 you need to ask us for a NN (Network
        Number)
      </p>
      <p>
        You can check your NN{" "}
        <a
          href="https://docs.nycmesh.net/installs/nn/"
          target="_"
          className="blue"
        >
          here
        </a>
      </p>
    </div>
  );
}

export default InfoText;
