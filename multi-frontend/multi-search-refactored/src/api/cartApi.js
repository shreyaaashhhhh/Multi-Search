const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request(path, options = {}) {
  const { token, headers, ...fetchOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Token: token } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export function addCartItem(token, product, amount = 1) {
  return request("/cartservice/add", {
    method: "POST",
    token,
    body: JSON.stringify({
      productId: product.id,
      productName: product.name,
      actualAmount: product.price,
      amount,
    }),
  });
}

export function getCartItems(token) {
  return request("/cartservice/items", { token });
}
