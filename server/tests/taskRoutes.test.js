const request = require("supertest");

jest.mock("../models/Task", () => {
  const Task = jest.fn();

  Task.find = jest.fn();
  Task.findByIdAndUpdate = jest.fn();
  Task.findByIdAndDelete = jest.fn();

  return Task;
});

const Task = require("../models/Task");
const app = require("../server");

describe("Task API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/tasks should return 200", async () => {
    Task.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    });

    const response = await request(app).get("/api/tasks");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /api/tasks should create a task", async () => {
    const savedTask = {
      _id: "123",
      title: "Test Task",
      status: "To Do",
      priority: "Medium",
    };

    Task.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(savedTask),
    }));

    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Test Task",
        status: "To Do",
        priority: "Medium",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Test Task");
  });

  test("PUT /api/tasks/:id should update a task", async () => {
    const updatedTask = {
      _id: "123",
      title: "Updated Task",
      status: "Completed",
      priority: "High",
    };

    Task.findByIdAndUpdate.mockResolvedValue(updatedTask);

    const response = await request(app)
      .put("/api/tasks/123")
      .send({
        title: "Updated Task",
        status: "Completed",
        priority: "High",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Updated Task");
  });

  test("DELETE /api/tasks/:id should delete a task", async () => {
    Task.findByIdAndDelete.mockResolvedValue({
      _id: "123",
      title: "Test Task",
    });

    const response = await request(app)
      .delete("/api/tasks/123");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "Task deleted successfully"
    );
  });
});