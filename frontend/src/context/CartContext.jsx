
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "flexisole_cart_v1";

function readSavedCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        typeof item.productId === "string" &&
        typeof item.variantId === "string" &&
        Number.isInteger(item.size) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn("Could not save cart:", error);
  }
}

function makeCartKey(productId, variantId, size) {
  return `${productId}:${variantId}:${size}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readSavedCart);

  const updateItems = useCallback((updater) => {
    setItems((previous) => {
      const next =
        typeof updater === "function"
          ? updater(previous)
          : updater;

      saveCart(next);
      return next;
    });
  }, []);

  const addToCart = useCallback(
    ({
      productId,
      variantId,
      name,
      color,
      size,
      price,
      image,
      slug,
      quantity = 1,
      availableStock,
    }) => {
      const parsedSize = Number(size);
      const parsedQuantity = Number(quantity);
      const parsedStock = Number(availableStock);

      if (!productId || !variantId) {
        throw new Error("Please select a valid product.");
      }

      if (!Number.isInteger(parsedSize)) {
        throw new Error("Please select a size.");
      }

      if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        throw new Error("This product has no valid price yet.");
      }

      if (
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity < 1
      ) {
        throw new Error("Please choose a valid quantity.");
      }

      if (
        !Number.isInteger(parsedStock) ||
        parsedStock < 1
      ) {
        throw new Error("This size is out of stock.");
      }

      const key = makeCartKey(
        String(productId),
        String(variantId),
        parsedSize
      );

      const existing = items.find((item) => item.key === key);
      const currentQuantity = existing?.quantity || 0;

      if (currentQuantity + parsedQuantity > parsedStock) {
        throw new Error(
          `Only ${parsedStock} item(s) are currently available for this size.`
        );
      }

      updateItems((previous) => {
        const found = previous.find((item) => item.key === key);

        if (found) {
          return previous.map((item) =>
            item.key === key
              ? {
                  ...item,
                  quantity: Math.min(
                    parsedStock,
                    item.quantity + parsedQuantity
                  ),
                  availableStock: parsedStock,
                }
              : item
          );
        }

        return [
          ...previous,
          {
            key,
            productId: String(productId),
            variantId: String(variantId),
            name,
            color,
            size: parsedSize,
            price,
            image,
            slug,
            quantity: parsedQuantity,
            availableStock: parsedStock,
          },
        ];
      });

      return true;
    },
    [items, updateItems]
  );

  const removeFromCart = useCallback(
    (key) => {
      updateItems((previous) =>
        previous.filter((item) => item.key !== key)
      );
    },
    [updateItems]
  );

  const updateQuantity = useCallback(
    (key, quantity) => {
      const parsed = Number(quantity);

      if (!Number.isInteger(parsed)) return;

      updateItems((previous) =>
        previous.map((item) => {
          if (item.key !== key) return item;

          const maximum = Math.max(
            1,
            Number(item.availableStock) || 1
          );

          return {
            ...item,
            quantity: Math.max(
              1,
              Math.min(parsed, maximum)
            ),
          };
        })
      );
    },
    [updateItems]
  );

  const clearCart = useCallback(() => {
    updateItems([]);
  }, [updateItems]);

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider."
    );
  }

  return context;
}
