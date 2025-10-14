import { useEffect } from "react";

export default function AdBanner () {
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
      data-ad-slot="3283791078"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};
