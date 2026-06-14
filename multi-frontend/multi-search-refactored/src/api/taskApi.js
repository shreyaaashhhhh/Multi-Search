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

export function getTasks(token, page = 1, size = 10) {
  return request(`/taskservice/getalltasks/${page}/${size}`, { token });
}

export function createTask(token, task) {
  return request("/taskservice/createtask", {
    method: "POST",
    token,
    body: JSON.stringify(task),
  });
}

export function updateTask(token, id, task) {
  return request(`/taskservice/updatetask/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(task),
  });
}

export function deleteTask(token, id) {
  return request(`/taskservice/deletetask/${id}`, {
    method: "DELETE",
    token,
  });
}

export function searchTasks(token, query) {
  return request(`/taskservice/vectorsearch/${encodeURIComponent(query)}`, { token });
}
