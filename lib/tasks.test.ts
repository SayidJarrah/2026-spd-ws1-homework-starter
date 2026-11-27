import { beforeEach, describe, expect, it } from "vitest";
import { openDb } from "./db";
import { createTask, listTasks, moveTask, RuleViolation } from "./tasks";
import type { DatabaseSync } from "node:sqlite";

let db: DatabaseSync;
beforeEach(() => {
  db = openDb(":memory:");
});

describe("tasks", () => {
  it("creates a task in todo", () => {
    const t = createTask(db, { title: "Write the team agreement", estimateHours: 2 });
    expect(t.status).toBe("todo");
    expect(listTasks(db)).toHaveLength(1);
  });

  it("rejects an empty title", () => {
    expect(() => createTask(db, { title: "  " })).toThrow(RuleViolation);
  });

  it("follows todo → doing → done and keeps done final", () => {
    const t = createTask(db, { title: "Add a hook" });
    moveTask(db, t.id, "doing");
    moveTask(db, t.id, "done");
    expect(() => moveTask(db, t.id, "todo")).toThrow(RuleViolation);
  });

  it("does not skip doing", () => {
    const t = createTask(db, { title: "Path rule" });
    expect(() => moveTask(db, t.id, "done")).toThrow(RuleViolation);
  });

  describe("estimateHours (TASK-7)", () => {
    it.each([1, 40])("accepts the boundary %s", (hours) => {
      expect(createTask(db, { title: "Estimate", estimateHours: hours }).estimateHours).toBe(hours);
    });

    it.each([
      ["0", 0],
      ["41", 41],
      ["-1", -1],
      ["1.5", 1.5],
      ['"3"', "3"],
      ['"abc"', "abc"],
      ["true", true],
      ["[]", []],
      ["{}", {}],
    ])("rejects %s and stores nothing", (_label, hours) => {
      expect(() => createTask(db, { title: "Estimate", estimateHours: hours })).toThrow(
        new RuleViolation("estimateHours must be a whole number 1..40"),
      );
      expect(listTasks(db)).toHaveLength(0);
    });

    it("rejects NaN and stores nothing", () => {
      expect(() => createTask(db, { title: "Estimate", estimateHours: NaN })).toThrow(
        new RuleViolation("estimateHours must be a whole number 1..40"),
      );
      expect(listTasks(db)).toHaveLength(0);
    });

    it("stores null when estimateHours is omitted", () => {
      expect(createTask(db, { title: "No estimate" }).estimateHours).toBeNull();
    });

    it("treats null like an omitted estimate", () => {
      expect(createTask(db, { title: "Null estimate", estimateHours: null }).estimateHours).toBeNull();
    });
  });
});
