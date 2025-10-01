import React, { useEffect } from "react";

const AdBanner = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  return (
    // <ins
    //   className="adsbygoogle"
    //   style={{ display: "block", width: "100%", height: "90px" }}
    //   data-ad-client="ca-pub-6575607972726435"
    //   data-ad-slot="9181995331"
    //   data-ad-format="auto"
    //   data-full-width-responsive="true"
    // ></ins>
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%", height: "90px" }}
      data-ad-client="ca-pub-6575607972726435"
      data-ad-slot="9181995331"
      data-adtest="on" // <- THIS MAKES IT A TEST AD
    ></ins>
  );
};

export default AdBanner;
