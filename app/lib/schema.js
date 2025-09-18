import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      return response; // ✅ return so caller can use it
    } catch (err) {
      const message = err?.message || "Something went wrong";
      setError(message);
      toast.error(message);
      throw err; // ✅ rethrow if caller wants to handle it
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute, setData };
};

export default useFetch;
