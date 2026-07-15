import { useEffect, useMemo, useState } from "react";
import list from "./data.js";

const CART_STORAGE_KEY = "eztechMovieCart";

function isSubscription(item) {
  return item.service.toLowerCase().includes("subscription");
}

function formatMoney(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function getInitialCart() {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error("Cart could not be loaded from local storage.", error);
    return [];
  }
}

function Navigation({ itemCount, cartTotal }) {
  return (
    <nav className="navBar">
      <div>
        <h1>EZTechMovie</h1>
        <p>Subscription and accessory cart system</p>
      </div>

      <div className="navLinks" aria-label="Main navigation">
        <a href="#subscriptions">Subscriptions</a>
        <a href="#cart">Cart</a>
      </div>

      <div className="cartBadge" aria-label={`${itemCount} cart items`}>
        <span>Cart Items</span>
        <strong>{itemCount}</strong>
        <small>{formatMoney(cartTotal)}</small>
      </div>
    </nav>
  );
}

function ProductCard({ item, onAdd }) {
  const itemType = isSubscription(item) ? "Subscription" : "Accessory";

  return (
    <article className="productCard">
      <div className="imageBox">
        <img src={item.img} alt={item.service} />
      </div>

      <div className="productContent">
        <span className="productTag">{itemType}</span>
        <h3>{item.service}</h3>
        <p>{item.serviceInfo}</p>
        <div className="productFooter">
          <strong>{formatMoney(item.price)}</strong>
          <button type="button" onClick={() => onAdd(item)}>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

function SubscriptionSection({ products, onAdd }) {
  return (
    <section id="subscriptions" className="sectionPanel">
      <div className="sectionHeader">
        <div>
          <h2>Subscriptions and EZTech Accessories</h2>
          <p>
            Choose one subscription plan and add as many accessories as needed.
          </p>
        </div>
      </div>

      <div className="productGrid">
        {products.map((item) => (
          <ProductCard key={item.id} item={item} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}

function QuantityControls({ item, onDecrease, onIncrease }) {
  const subscriptionItem = isSubscription(item);

  return (
    <div className="quantityControls" aria-label={`${item.service} quantity controls`}>
      <button
        type="button"
        onClick={() => onDecrease(item.id)}
        disabled={item.quantity <= 1}
        aria-label={`Decrease ${item.service} quantity`}
      >
        −
      </button>
      <span>{item.quantity}</span>
      <button
        type="button"
        onClick={() => onIncrease(item.id)}
        disabled={subscriptionItem}
        aria-label={`Increase ${item.service} quantity`}
      >
        +
      </button>
    </div>
  );
}

function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <article className="cartItem">
      <img src={item.img} alt={item.service} />

      <div className="cartItemDetails">
        <h3>{item.service}</h3>
        <p>{item.serviceInfo}</p>
        <span>{formatMoney(item.price)} each</span>
        {isSubscription(item) && (
          <small className="subscriptionNote">Limited to one subscription.</small>
        )}
      </div>

      <QuantityControls item={item} onDecrease={onDecrease} onIncrease={onIncrease} />

      <strong className="lineTotal">{formatMoney(item.price * item.quantity)}</strong>

      <button
        type="button"
        className="removeButton"
        onClick={() => onRemove(item.id)}
      >
        Remove
      </button>
    </article>
  );
}

function Cart({ cart, onIncrease, onDecrease, onRemove, onClear }) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <section id="cart" className="sectionPanel cartPanel">
      <div className="sectionHeader">
        <div>
          <h2>Shopping Cart Summary</h2>
          <p>Review items, update quantities, or remove products.</p>
        </div>
        {cart.length > 0 && (
          <button type="button" className="secondaryButton" onClick={onClear}>
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="emptyCart">
          <h3>Your cart is empty.</h3>
          <p>Add one subscription or an EZTech accessory to get started.</p>
        </div>
      ) : (
        <>
          <div className="cartList">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
              />
            ))}
          </div>

          <div className="cartSummary">
            <div>
              <span>Total Items</span>
              <strong>{itemCount}</strong>
            </div>
            <div>
              <span>Total Price</span>
              <strong>{formatMoney(cartTotal)}</strong>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default function App() {
  const [cart, setCart] = useState(getInitialCart);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  function addToCart(product) {
    setWarning("");

    const productIsSubscription = isSubscription(product);
    const cartHasSubscription = cart.some((item) => isSubscription(item));

    if (productIsSubscription && cartHasSubscription) {
      setWarning(
        "Only one subscription can be added at a time. Remove the current subscription before choosing another plan."
      );
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      return;
    }

    setCart((currentCart) => [
      ...currentCart,
      {
        ...product,
        quantity: 1,
      },
    ]);
  }

  function increaseQuantity(id) {
    setWarning("");
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (isSubscription(item)) {
          setWarning("Subscription quantity is limited to one.");
          return item;
        }

        return { ...item, quantity: item.quantity + 1 };
      })
    );
  }

  function decreaseQuantity(id) {
    setWarning("");
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  }

  function removeItem(id) {
    setWarning("");
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  }

  function clearCart() {
    setWarning("");
    setCart([]);
  }

  return (
    <main>
      <Navigation itemCount={itemCount} cartTotal={cartTotal} />

      <section className="heroSection">
        <div>
          <span className="eyebrow">StreamList Development Sprint</span>
          <h2>Build, review, and manage the EZTechMovie cart.</h2>
          <p>
            This React cart demonstrates subscription limits, accessory quantity
            updates, item removal, total pricing, and local storage persistence.
          </p>
        </div>
      </section>

      {warning && (
        <div className="warningLabel" role="alert">
          {warning}
        </div>
      )}

      <SubscriptionSection products={list} onAdd={addToCart} />

      <Cart
        cart={cart}
        onIncrease={increaseQuantity}
        onDecrease={decreaseQuantity}
        onRemove={removeItem}
        onClear={clearCart}
      />
    </main>
  );
}
