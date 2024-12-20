import express from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "QuXNS8byIc",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Signup Route
app.post("/signup", async (req: any, res: any) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    req.session.userId = user.id;

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login Route
app.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

    req.session.userId = user.id;

    res.status(200).json({ message: "Login successful", userId: user.id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Logout Route
app.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.status(200).json({ message: "Logout successful" });
  });
});

// TaskCard Routes
app.post("/task-card", async (req: Request, res: Response) => {
  const { name, userId } = req.body;

  try {
    const parsedUserId = parseInt(userId, 10);
    if (!name || isNaN(parsedUserId)) {
      return res.status(400).json({ error: "Invalid data provided" });
    }

    const taskCard = await prisma.taskCard.create({
      data: {
        name,
        userId: parsedUserId,
      },
    });

    res.status(201).json(taskCard);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while creating the task card" });
  }
});

app.get("/task-card/:userId", async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const taskCards = await prisma.taskCard.findMany({
      orderBy: {
        id: "asc",
      },
      where: {
        userId,
        deletedAt: null,
      } as Prisma.TaskCardWhereInput,
    });

    res.status(200).json(taskCards);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve task cards" });
  }
});

app.put("/task-card/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { name } = req.body;

  try {
    const id = parseInt(req.params.id, 10);
    if (!name || isNaN(id)) {
      return res.status(400).json({ error: "Invalid data provided" });
    }

    const taskCard = await prisma.taskCard.update({
      where: { id },
      data: { name },
    });

    res.status(200).json(taskCard);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task card" });
  }
});

//Soft Delete Task Cards
app.delete("/task-card/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task card ID" });
    }

    const taskCard = await prisma.taskCard.findUnique({
      where: { id },
    });

    if (!taskCard) {
      return res.status(404).json({ error: "Task card not found" });
    }

    const currentTimestamp = new Date();

    await prisma.taskCard.update({
      where: { id },
      data: { deletedAt: currentTimestamp } as Prisma.TaskCardUpdateInput,
    });

    await prisma.taskList.updateMany({
      where: { taskCardId: id },
      data: { deletedAt: currentTimestamp } as Prisma.TaskListUpdateManyMutationInput,
    });

    res.status(200).json({ message: "TaskCard and associated TaskLists soft deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to soft delete task card" });
  }
});

// TaskList Routes
app.post("/task-list", async (req: Request, res: Response) => {
  const { description, taskCardId } = req.body;

  try {
    const parsedTaskCardId = parseInt(taskCardId, 10);
    if (!description || isNaN(parsedTaskCardId)) {
      return res.status(400).json({ error: "Invalid data provided" });
    }

    const taskList = await prisma.taskList.create({
      data: {
        description,
        taskCardId: parsedTaskCardId,
      },
    });

    res.status(201).json(taskList);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while creating the task list" });
  }
});

app.get("/task-list/:taskCardId", async (req: Request<{ taskCardId: string }>, res: Response) => {
  try {
    const taskCardId = parseInt(req.params.taskCardId, 10);
    if (isNaN(taskCardId)) {
      return res.status(400).json({ error: "Invalid taskCardId" });
    }

    const taskLists = await prisma.taskList.findMany({
      where: { taskCardId },
    });

    res.status(200).json(taskLists);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve task lists" });
  }
});

// all task lists
app.get("/task-lists", async (req: Request, res: Response) => {
  try {
    const taskLists = await prisma.taskList.findMany({
      where: {
        deletedAt: null,
      } as Prisma.TaskListWhereInput,
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json(taskLists);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve task lists" });
  }
});

//update the task list description
app.put("/task-list/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { description } = req.body;

  try {
    const id = parseInt(req.params.id, 10);
    if (!description || isNaN(id)) {
      return res.status(400).json({ error: "Invalid data provided" });
    }

    const taskList = await prisma.taskList.update({
      where: { id },
      data: { description },
    });

    res.status(200).json(taskList);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task list" });
  }
});

// update the task list position changes
app.put("/task-list/position/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { taskCardId } = req.body;

  try {
    const id = parseInt(req.params.id, 10);
    if (!taskCardId || isNaN(id)) {
      return res.status(400).json({ error: "Invalid data provided" });
    }

    const taskList = await prisma.taskList.update({
      where: { id },
      data: { taskCardId },
    });

    res.status(200).json(taskList);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task list" });
  }
});

//Soft delete task lists
app.delete("/task-list/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task list ID" });
    }

    const taskList = await prisma.taskList.findUnique({
      where: { id },
    });

    if (!taskList) {
      return res.status(404).json({ error: "Task list not found" });
    }

    const currentTimestamp = new Date();

    await prisma.taskList.update({
      where: { id },
      data: { deletedAt: currentTimestamp } as Prisma.TaskListUpdateInput,
    });

    res.status(200).json({ message: "TaskList soft deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to soft delete task list" });
  }
});

// Test Route
app.get("/test", (req: Request, res: Response) => {
  res.send({ message: "Hello from Express.js!" });
});

// Start the server
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
