import React from "react";
import image from "../images/aboutimg.jpg";

/**
 * AboutUs Component
 * 
 * Displays information about the medical practice/organization with an image and
 * descriptive text. This component is used on the About Us page to provide
 * users with background information about the service.
 * 
 * @returns {JSX.Element} The rendered AboutUs component
 */
const AboutUs = () => {
  return (
    <section className="container">
      <h2 className="page-heading about-heading">Về chúng tôi</h2>
      
      <div className="about">
        {/* Left side - Image container */}
        <div className="hero-img">
          <img
            src={image}
            alt="Về dịch vụ y tế của chúng tôi"
            loading="lazy" // Optimize image loading
          />
        </div>
        
        {/* Right side - Text content */}
        <div className="hero-content">
          <p>
            Chào mừng đến với hệ thống đặt lịch khám bệnh trực tuyến của chúng tôi.
            Chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe tốt nhất với đội ngũ bác sĩ 
            chuyên nghiệp và kinh nghiệm. Hệ thống của chúng tôi giúp bạn dễ dàng đặt lịch hẹn 
            với các bác sĩ uy tín, tiết kiệm thời gian và đảm bảo chất lượng dịch vụ y tế.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;