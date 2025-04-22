import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import ProductActions from "./ProductActions";

const ProductCard = ({ product }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        <h3 className="text-lg font-semibold">{product.title}</h3>
        <p className="text-gray-600">{product.price} RON</p>
      </Link>
      <ProductActions product={product} />
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
};

export default ProductCard;
