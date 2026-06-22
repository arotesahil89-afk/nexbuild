import { Carousel } from "react-bootstrap";
import "./HeroCarousel.css"; // We'll define image styles here

let hero1 = "https://www.mumbaicharaja.co/images/introbg.jpg";
let hero2 = "https://www.mumbaicharaja.co/devi-2023.jpg";
let hero3 =
  "https://www.mumbaicharaja.co/gallery-images/ganeshotsav/MumbaichaRaja2024.jpg";
let hero4 = "https://www.mumbaicharaja.co/images/introbg.jpg";
let hero5 = "https://www.mumbaicharaja.co/devi-2023.jpg";
let hero6 =
  "https://www.mumbaicharaja.co/gallery-images/ganeshotsav/MumbaichaRaja2024.jpg";
let hero7 = "https://www.mumbaicharaja.co/images/introbg.jpg";
let hero8 = "https://www.mumbaicharaja.co/devi-2023.jpg";

const HeroCarousel = () => {
  // const images = [
  //   "https://www.mumbaicharaja.co/images/introbg.jpg",
  //   "https://www.mumbaicharaja.co/devi-2023.jpg",
  //   "https://www.mumbaicharaja.co/gallery-images/ganeshotsav/MumbaichaRaja2024.jpg",
  // ];

  return (
    <Carousel>
      <Carousel.Item>
        <img className="d-block w-100" src={hero1} alt="First slide" />
        <Carousel.Caption>
          {/* <h3>First Slide Label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img className="d-block w-100" src={hero2} alt="Second slide" />
        <Carousel.Caption>
          {/* <h3>Second Slide Label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img className="d-block w-100" src={hero3} alt="Second slide" />
        <Carousel.Caption>
          {/* <h3>Third Slide Label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img className="d-block w-100" src={hero4} alt="Second slide" />
        <Carousel.Caption>
          {/* <h3>Third Slide Label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img className="d-block w-100" src={hero5} alt="Second slide" />
        <Carousel.Caption>
          {/* <h3>Third Slide Label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img className="d-block w-100" src={hero6} alt="Second slide" />
        <Carousel.Caption>
          {/* <h3>Third Slide Label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img className="d-block w-100" src={hero7} alt="Second slide" />
        <Carousel.Caption>
          {/* <h3>Third Slide Label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img className="d-block w-100" src={hero8} alt="Second slide" />
        <Carousel.Caption>
          {/* <h3>Third Slide Label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
};

export default HeroCarousel;
