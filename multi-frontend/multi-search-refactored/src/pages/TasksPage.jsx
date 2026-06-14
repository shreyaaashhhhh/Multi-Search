import { useEffect, useMemo, useState } from "react";
import { createTask, deleteTask, getTasks, searchTasks, updateTask } from "../api/taskApi.js";
import { findCustomerByEmail, getCustomers } from "../api/authApi.js";
import { useAuth } from "../auth/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const emptyTask = {
  title: "",
  description: "",
  assignedEmail: "",
  priority: 2,
  deadline: "",
  status: 1,
};

const priorityLabels = {
  1: "Low",
  2: "Normal",
  3: "High",
};

const statusLabels = {
  1: "Open",
  2: "In Progress",
  3: "Done",
};

export default function TasksPage() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [editingId, setEditingId] = useState(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalpages: 1 });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [showAssigneeSuggestions, setShowAssigneeSuggestions] = useState(false);

  const normalizedTasks = useMemo(() => tasks ?? [], [tasks]);
  const currentUserId = Number(user?.id);
  const assigneeQuery = form.assignedEmail.trim().toLowerCase();
  const assigneeSuggestions = useMemo(() => {
    if (assigneeQuery.length < 2) return [];

    return assignableUsers
      .filter((candidate) => {
        const email = candidate.email?.toLowerCase() ?? "";
        const name = candidate.fullname?.toLowerCase() ?? "";
        return email.includes(assigneeQuery) || name.includes(assigneeQuery);
      })
      .slice(0, 6);
  }, [assignableUsers, assigneeQuery]);

  async function loadTasks(page = pageInfo.page) {
    setStatus("loading");
    setError("");
    const data = await getTasks(token, page, 10);
    if (data.code !== 200) throw new Error(data.message ?? "Unable to load tasks");
    setTasks(data.tasks ?? []);
    setPageInfo({ page: data.page, totalpages: data.totalpages || 1 });
    setStatus("success");
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await loadTasks(pageInfo.page);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [pageInfo.page, token]);

  useEffect(() => {
    let cancelled = false;

    async function loadAssignableUsers() {
      if (usersLoaded || usersLoading || assigneeQuery.length < 2) return;

      setUsersLoading(true);
      try {
        const users = [];
        let page = 1;
        let totalpages = 1;

        do {
          const data = await getCustomers(token, page, 50);
          if (data.code !== 200) throw new Error(data.message ?? "Unable to load users");
          users.push(...(data.users ?? []));
          totalpages = data.totalpages || 1;
          page += 1;
        } while (page <= totalpages);

        if (!cancelled) {
          setAssignableUsers(users);
          setUsersLoaded(true);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    }

    loadAssignableUsers();
    return () => { cancelled = true; };
  }, [assigneeQuery.length, token, usersLoaded, usersLoading]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyTask);
    setShowAssigneeSuggestions(false);
  }

  function editTask(task) {
    setEditingId(task._id);
    setForm({
      title: task.title ?? "",
      description: task.description ?? "",
      assignedEmail: task.assignedEmail ?? "",
      priority: task.priority ?? 2,
      deadline: task.deadline ?? "",
      status: task.status ?? 1,
    });
    setNotice("");
    setError("");
    setShowAssigneeSuggestions(false);
  }

  function selectAssignee(user) {
    setForm((current) => ({ ...current, assignedEmail: user.email }));
    setShowAssigneeSuggestions(false);
  }

  async function submitTask(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const creatorId = Number(user?.id);
      if (!Number.isFinite(creatorId)) {
        throw new Error("Please logout and login again before creating tasks.");
      }

      const assigneeData = await findCustomerByEmail(token, form.assignedEmail);
      if (assigneeData.code !== 200) {
        throw new Error(assigneeData.message ?? "Unable to find assigned user");
      }

      const payload = {
        title: form.title,
        description: form.description,
        assignedto: Number(assigneeData.user.id),
        assignedEmail: assigneeData.user.email,
        createdby: creatorId,
        priority: Number(form.priority),
        deadline: form.deadline,
        status: Number(form.status),
      };

      const data = editingId
        ? await updateTask(token, editingId, payload)
        : await createTask(token, payload);
      if (data.code !== 200) throw new Error(data.message ?? "Unable to save task");
      setNotice(data.message);
      resetForm();
      await loadTasks(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeTask(id) {
    setError("");
    setNotice("");
    try {
      const data = await deleteTask(token, id);
      if (data.code !== 200) throw new Error(data.message ?? "Unable to delete task");
      setNotice(data.message);
      await loadTasks(pageInfo.page);
    } catch (err) {
      setError(err.message);
    }
  }

  async function runSearch(event) {
    event.preventDefault();
    if (!query.trim()) {
      await loadTasks(1);
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const data = await searchTasks(token, query.trim());
      if (data.code !== 200) throw new Error(data.message ?? "Unable to search tasks");
      setTasks(data.tasks ?? []);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[360px_1fr]">
      <section className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{editingId ? "Edit Task" : "New Task"}</h1>

        <form className="mt-5 space-y-4" onSubmit={submitTask}>
          <Field label="Title" name="title" value={form.title} onChange={updateField} required />
          <Field label="Description" name="description" value={form.description} onChange={updateField} textarea required />
          <AssigneeField
            value={form.assignedEmail}
            onChange={updateField}
            onFocus={() => setShowAssigneeSuggestions(true)}
            onBlur={() => setTimeout(() => setShowAssigneeSuggestions(false), 120)}
            suggestions={assigneeSuggestions}
            showSuggestions={showAssigneeSuggestions && assigneeQuery.length >= 2}
            loading={usersLoading}
            onSelect={selectAssignee}
          />
          <Field label="Deadline" name="deadline" type="date" value={form.deadline} onChange={updateField} required />

          <div className="grid grid-cols-2 gap-3">
            <Select label="Priority" name="priority" value={form.priority} onChange={updateField} options={priorityLabels} />
            <Select label="Status" name="status" value={form.status} onChange={updateField} options={statusLabels} />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update Task" : "Create Task"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Tasks</h2>
            <p className="mt-1 text-sm text-slate-500">Plan, assign, and search work items</p>
          </div>
          <form className="flex gap-2" onSubmit={runSearch}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Vector search tasks"
              className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Search
            </button>
          </form>
        </div>

        {notice && <Message tone="success">{notice}</Message>}
        {error && <Message tone="error">{error}</Message>}
        {status === "loading" && <LoadingSpinner />}

        {status === "success" && normalizedTasks.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
            No tasks found.
          </div>
        )}

        {status === "success" && normalizedTasks.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {normalizedTasks.map((task) => {
                  const canManageTask = Number(task.createdby) === currentUserId;

                  return (
                    <tr key={task._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{task.title}</p>
                        <p className="mt-1 max-w-md text-xs text-slate-500">{task.description}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{task.assignedEmail ?? `#${task.assignedto}`}</td>
                      <td className="px-4 py-3 text-slate-700">{priorityLabels[task.priority] ?? task.priority}</td>
                      <td className="px-4 py-3 text-slate-700">{task.deadline}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {statusLabels[task.status] ?? task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canManageTask ? (
                          <>
                            <button onClick={() => editTask(task)} className="mr-2 text-sm font-semibold text-slate-700 hover:text-slate-950">
                              Edit
                            </button>
                            <button onClick={() => removeTask(task._id)} className="text-sm font-semibold text-red-600 hover:text-red-700">
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">Assigned to you</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Field({ label, textarea = false, ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {textarea ? (
        <textarea {...props} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500" />
      ) : (
        <input {...props} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500" />
      )}
    </label>
  );
}

function AssigneeField({ value, onChange, onFocus, onBlur, suggestions, showSuggestions, loading, onSelect }) {
  return (
    <label className="relative block text-sm font-medium text-slate-700">
      Assigned User Email
      <input
        name="assignedEmail"
        type="email"
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required
        autoComplete="off"
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
      />

      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {loading && <div className="px-3 py-2 text-sm text-slate-500">Loading...</div>}
          {!loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-500">No matching users</div>
          )}
          {!loading && suggestions.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(candidate)}
              className="block w-full px-3 py-2 text-left hover:bg-slate-50"
            >
              <span className="block text-sm font-semibold text-slate-900">{candidate.email}</span>
              <span className="block text-xs text-slate-500">{candidate.fullname}</span>
            </button>
          ))}
        </div>
      )}
    </label>
  );
}

function Select({ label, options, ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <select {...props} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500">
        {Object.entries(options).map(([value, labelText]) => (
          <option key={value} value={value}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}

function Message({ tone, children }) {
  const classes = tone === "success"
    ? "mb-3 border-emerald-200 bg-emerald-50 text-emerald-700"
    : "mb-3 border-red-200 bg-red-50 text-red-700";
  return <div className={`rounded-lg border px-4 py-3 text-sm ${classes}`}>{children}</div>;
}
