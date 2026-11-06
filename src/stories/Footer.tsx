import "./Footer.css";

const Footer = () => {
  return (
    <div className="bg-purple-950 text-white">
      <div className="font-raleway grid grid-cols-2  gap-8 md:grid-cols-4 pt-1 px-2 pb-5 ">
        <div className="">
          <div className="font-bold text-lg">Company Name</div>
          <ul className="list-none flex gap-5 flex-col flex-wrap pt-2 text-gray-300">
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="">About</a>
            </li>
            <li>
              <a href="">Careers</a>
            </li>
          </ul>
        </div>
        <div className="">
          <div className="font-bold text-lg">Legal</div>
          <ul className="list-none flex gap-5 flex-col flex-wrap pt-2 text-gray-300">
            <li>
              <a href="">Privacy Policy</a>
            </li>
            <li>
              <a href="">Terms of Use</a>
            </li>
          </ul>
        </div>
        <div className="">
          <div className="font-bold text-lg">Support</div>
          <ul className="list-none flex gap-5 flex-col flex-wrap pt-2 text-gray-300">
            <li>
              <a href="">Help Center</a>
            </li>
            <li>
              <a href="">Contact</a>
            </li>
          </ul>
        </div>
        <div className="">
          <div className="font-bold text-lg">Downloads</div>
          <ul className="list-none flex gap-5 flex-col flex-wrap pt-2 text-gray-300">
            <li>
              <a href="">iOS</a>
            </li>
            <li>
              <a href="">Android</a>
            </li>
            <li>
              <a href="">Windows</a>
            </li>
            <li>
              <a href="">macOS</a>
            </li>
          </ul>
        </div>
        
      </div>
      <div className="p-2">&copy; Company Name</div>
    </div>
  );
};

export default Footer;
