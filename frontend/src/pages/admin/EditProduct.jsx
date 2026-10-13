
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";

import ProductForm from "./ProductForm";
import { getAdminProduct } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";

export default function EditProduct() {
  const { id } = useParams();
  const { token } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const data = await getAdminProduct(id, token);

        if (active) {
          setProduct(data.product);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load product."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center gap-3 text-brand-700">
        <Loader2 size={23} className="animate-spin" />
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-3xl border border-brand-200 bg-white p-8">
        <h1 className="text-xl font-semibold text-brand-900">
          Unable to open product
        </h1>

        <p className="mt-3 text-sm text-red-700">
          {error || "Product not found."}
        </p>

        <Link
          to="/admin/products"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-900"
        >
          <ArrowLeft size={17} />
          Back to Products
        </Link>
      </div>
    );
  }

  return <ProductForm key={id} product={product} />;
}
