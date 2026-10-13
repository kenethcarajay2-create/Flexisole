
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";

import Product from "../models/Product.js";
import Order from "../models/Order.js";

function httpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function handleError(error, res, next) {
  if (error.status) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
}

function cleanText(value, maxLength = 200) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function validateCustomer(customer) {
  if (
    !customer ||
    typeof customer !== "object" ||
    Array.isArray(customer)
  ) {
    throw httpError("Customer information is required.");
  }

  const result = {
    fullName: cleanText(customer.fullName, 120),
    phone: cleanText(customer.phone, 30),
    email: cleanText(customer.email, 150),
    address: cleanText(customer.address, 250),
    city: cleanText(customer.city, 100),
    province: cleanText(customer.province, 100),
    postalCode: cleanText(customer.postalCode, 20),
    notes: cleanText(customer.notes, 500),
  };

  if (
    !result.fullName ||
    !result.phone ||
    !result.address ||
    !result.city ||
    !result.province
  ) {
    throw httpError(
      "Name, phone, address, city, and province are required."
    );
  }

  if (!/^[0-9+()\s-]{7,30}$/.test(result.phone)) {
    throw httpError("Enter a valid phone number.");
  }

  if (
    result.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)
  ) {
    throw httpError("Enter a valid email address.");
  }

  return result;
}

const allowedTransitions = {
  Pending: ["Accepted", "Cancelled"],
  Accepted: ["Preparing", "Cancelled"],
  Preparing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

// POST /api/orders
// Create an order and reserve inventory atomically.
export async function createOrder(req, res, next) {
  try {
    const customer = validateCustomer(req.body?.customer);
    const requestedItems = req.body?.items;

    if (
      !Array.isArray(requestedItems) ||
      requestedItems.length < 1 ||
      requestedItems.length > 30
    ) {
      throw httpError("Your cart must contain 1 to 30 items.");
    }

    const seen = new Set();

    for (const item of requestedItems) {
      if (
        !mongoose.isValidObjectId(item?.productId) ||
        !mongoose.isValidObjectId(item?.variantId) ||
        !Number.isInteger(item.size) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 10
      ) {
        throw httpError("Invalid cart item or quantity.");
      }

      const key =
        `${item.productId}:${item.variantId}:${item.size}`;

      if (seen.has(key)) {
        throw httpError("Duplicate cart items are not allowed.");
      }

      seen.add(key);
    }

    let createdOrder;

    await mongoose.connection.transaction(async (session) => {
      const orderItems = [];
      let subtotalCents = 0;

      for (const item of requestedItems) {
        const product = await Product.findOne({
          _id: item.productId,
          published: true,
        }).session(session);

        if (!product) {
          throw httpError(
            "A product in your cart is no longer available.",
            409
          );
        }

        const variant = product.variants.id(item.variantId);

        if (!variant || !variant.active) {
          throw httpError(
            `${product.name} has an unavailable color.`,
            409
          );
        }

        if (
          typeof variant.price !== "number" ||
          !Number.isFinite(variant.price) ||
          variant.price < 0
        ) {
          throw httpError(
            `${product.name} does not have a valid price.`,
            409
          );
        }

        const sizeItem = variant.sizes.find(
          (entry) => entry.size === item.size
        );

        if (!sizeItem || sizeItem.stock < item.quantity) {
          throw httpError(
            `Insufficient stock for ${product.name}, ` +
              `${variant.color}, size ${item.size}.`,
            409
          );
        }

        const stockUpdate = await Product.updateOne(
          {
            _id: product._id,
            published: true,
            variants: {
              $elemMatch: {
                _id: variant._id,
                active: true,
                sizes: {
                  $elemMatch: {
                    size: item.size,
                    stock: { $gte: item.quantity },
                  },
                },
              },
            },
          },
          {
            $inc: {
              "variants.$[variant].sizes.$[size].stock":
                -item.quantity,
            },
          },
          {
            session,
            arrayFilters: [
              { "variant._id": variant._id },
              {
                "size.size": item.size,
                "size.stock": { $gte: item.quantity },
              },
            ],
          }
        );

        if (stockUpdate.modifiedCount !== 1) {
          throw httpError(
            "Stock changed during checkout. Review your cart.",
            409
          );
        }

        const priceCents = Math.round(variant.price * 100);
        const lineCents = priceCents * item.quantity;
        subtotalCents += lineCents;

        orderItems.push({
          productId: product._id,
          variantId: variant._id,
          name: product.name,
          slug: product.slug,
          color: variant.color,
          size: item.size,
          image: variant.images?.[0] || "",
          quantity: item.quantity,
          price: priceCents / 100,
          subtotal: lineCents / 100,
        });
      }

      const orderNumber =
        "FS-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        randomBytes(5).toString("hex").toUpperCase();

      const orders = await Order.create(
        [
          {
            orderNumber,
            customer,
            items: orderItems,
            subtotal: subtotalCents / 100,
            shippingFee: null,
            paymentMethod: "COD",
            paymentStatus: "Unpaid",
            status: "Pending",
          },
        ],
        { session }
      );

      createdOrder = orders[0];
    });

    return res.status(201).json({
      success: true,
      message: "Order submitted successfully.",
      order: {
        id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status,
        items: createdOrder.items,
        subtotal: createdOrder.subtotal,
        shippingFee: createdOrder.shippingFee,
        paymentMethod: createdOrder.paymentMethod,
        createdAt: createdOrder.createdAt,
      },
    });
  } catch (error) {
    return handleError(error, res, next);
  }
}

// GET /api/admin/orders
export async function getAdminOrders(req, res, next) {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/orders/:id
export async function getAdminOrder(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw httpError("Invalid order ID.");
    }

    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      throw httpError("Order not found.", 404);
    }

    return res.json({ success: true, order });
  } catch (error) {
    return handleError(error, res, next);
  }
}

// PATCH /api/admin/orders/:id/status
// Update status and restore reserved stock upon cancellation.
export async function updateAdminOrderStatus(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw httpError("Invalid order ID.");
    }

    const newStatus = req.body?.status;

    if (
      typeof newStatus !== "string" ||
      ![
        "Accepted",
        "Preparing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ].includes(newStatus)
    ) {
      throw httpError("Invalid order status.");
    }

    let updatedOrder;

    await mongoose.connection.transaction(async (session) => {
      const order = await Order.findById(
        req.params.id
      ).session(session);

      if (!order) {
        throw httpError("Order not found.", 404);
      }

      const validNextStatuses =
        allowedTransitions[order.status] || [];

      if (!validNextStatuses.includes(newStatus)) {
        throw httpError(
          `Cannot change order from ${order.status} ` +
            `to ${newStatus}.`,
          409
        );
      }

      // Cancellation restores stock while in the same
      // transaction as the status update.
      if (newStatus === "Cancelled") {
        for (const item of order.items) {
          const result = await Product.updateOne(
            {
              _id: item.productId,
              variants: {
                $elemMatch: {
                  _id: item.variantId,
                  "sizes.size": item.size,
                },
              },
            },
            {
              $inc: {
                "variants.$[variant].sizes.$[size].stock":
                  item.quantity,
              },
            },
            {
              session,
              arrayFilters: [
                { "variant._id": item.variantId },
                { "size.size": item.size },
              ],
            }
          );

          if (result.modifiedCount !== 1) {
            throw httpError(
              `Unable to restore stock for ${item.name}, ` +
                `${item.color}, size ${item.size}. ` +
                "Check whether the product or variant was deleted.",
              409
            );
          }
        }
      }

      // Require the previous status to still match.
      updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          status: order.status,
        },
        { $set: { status: newStatus } },
        { new: true, session, runValidators: true }
      );

      if (!updatedOrder) {
        throw httpError(
          "This order was changed by another admin. Refresh and retry.",
          409
        );
      }
    });

    return res.json({
      success: true,
      message: `Order updated to ${newStatus}.`,
      order: updatedOrder,
    });
  } catch (error) {
    return handleError(error, res, next);
  }
}
