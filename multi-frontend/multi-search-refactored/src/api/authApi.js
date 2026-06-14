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

export function signin(credentials) {
  return request("/authservice/signin", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function signup(customer) {
  return request("/authservice/signup", {
    method: "POST",
    body: JSON.stringify(customer),
  });
}

export function getUserInfo(token) {
  return request("/authservice/uinfo", { token });
}

export function getCustomers(token, page = 1, size = 10) {
  return request(`/authservice/getallusers/${page}/${size}`, { token });
}

export async function findCustomerByEmail(token, email) {
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;
  let totalpages = 1;

  do {
    const data = await getCustomers(token, page, 25);
    if (data.code !== 200) return data;

    const user = (data.users ?? []).find((customer) => (
      customer.email?.toLowerCase() === normalizedEmail
    ));
    if (user) return { code: 200, user };

    totalpages = data.totalpages || 1;
    page += 1;
  } while (page <= totalpages);

  return { code: 404, message: "No user found with that email address" };
}
