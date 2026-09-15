import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [tasks, setTasks] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    dueDate: "",
  });

  const [editingTask, setEditingTask] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
  try {
    const response = await axios.get("/api/tasks");

    if (Array.isArray(response.data)) {
      setTasks(response.data);
    } else {
      console.error("API did not return an array:", response.data);
      setTasks([]);
    }
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    setTasks([]);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      status: "To Do",
      priority: "Medium",
      dueDate: "",
    });

    setEditingTask(null);
  };

  const addTask = async () => {
    if (!form.title.trim()) return;

    try {
      const response = await axios.post("/api/tasks", form);

      setTasks([response.data, ...tasks]);

      resetForm();
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const editTask = (task) => {
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status || "To Do",
      priority: task.priority || "Medium",
      dueDate: task.dueDate
        ? task.dueDate.split("T")[0]
        : "",
    });

    setEditingTask(task);
  };

  const updateTask = async () => {
    if (!form.title.trim() || !editingTask) return;

    try {
      const response = await axios.put(
        `/api/tasks/${editingTask._id}`,
        form
      );

      setTasks(
        tasks.map((task) =>
          task._id === editingTask._id
            ? response.data
            : task
        )
      );

      resetForm();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`);

      setTasks(
        tasks.filter((task) => task._id !== id)
      );
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const title = task.title || "";
    const description = task.description || "";

    const matchesSearch =
      title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" ||
      task.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  return (
    <div className="app">
      <header>
        <h1>DevOps Task Manager</h1>
        <p>Manage your development and DevOps tasks</p>
      </header>

      <section className="dashboard">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p>{tasks.length}</p>
        </div>

        <div className="stat-card">
          <h3>In Progress</h3>
          <p>
            {
              tasks.filter(
                (task) =>
                  task.status === "In Progress"
              ).length
            }
          </p>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <p>
            {
              tasks.filter(
                (task) =>
                  task.status === "Completed"
              ).length
            }
          </p>
        </div>
      </section>

      <section className="add-task">
        <input
          type="text"
          name="title"
          placeholder="Task title..."
          value={form.title}
          onChange={handleChange}
        />

        <input
          type="text"
          name="description"
          placeholder="Description..."
          value={form.description}
          onChange={handleChange}
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">
            In Progress
          </option>
          <option value="Completed">
            Completed
          </option>
        </select>

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
        />

        {editingTask ? (
          <>
            <button onClick={updateTask}>
              Update Task
            </button>

            <button onClick={resetForm}>
              Cancel
            </button>
          </>
        ) : (
          <button onClick={addTask}>
            + Add Task
          </button>
        )}
      </section>

      <section className="filters">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">
            In Progress
          </option>
          <option value="Completed">
            Completed
          </option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value)
          }
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </section>

      <section className="tasks">
        <h2>My Tasks</h2>

        {filteredTasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              className="task-card"
              key={task._id}
            >
              <div>
                <h3>{task.title}</h3>

                {task.description && (
                  <p>{task.description}</p>
                )}

                <span>
                  Priority: {task.priority}
                </span>

                <span>
                  Status: {task.status}
                </span>

                {task.dueDate && (
                  <span>
                    Due:{" "}
                    {new Date(
                      task.dueDate
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div>
                <button
                  onClick={() =>
                    editTask(task)
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteTask(task._id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default App;
