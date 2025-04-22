import PropTypes from "prop-types";
import FavoriteButton from "./FavoriteButton";
import CartButton from "./CartButton";

const ProductActions = ({ product }) => {
  return (
    <div className="flex items-center space-x-4">
      <FavoriteButton product={product} showText={false} />
      <CartButton
        product={product}
        showText={false}
        className="hidden sm:block"
      />
    </div>
  );
};

ProductActions.propTypes = {
  product: PropTypes.object.isRequired,
};

export default ProductActions;
