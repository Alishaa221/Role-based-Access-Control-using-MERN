import request from "supertest"
import jwt from "jsonwebtoken"
import app from "../server.js"

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"

describe("RBAC Access Control", () => {
  const adminToken = jwt.sign({ id: "1", role: "admin" }, JWT_SECRET, { expiresIn: "1h" })
  const editorToken = jwt.sign({ id: "2", role: "editor" }, JWT_SECRET, { expiresIn: "1h" })
  const userToken = jwt.sign({ id: "3", role: "user" }, JWT_SECRET, { expiresIn: "1h" })

  test("✅ Admin can access /api/users/all", async () => {
    const res = await request(app)
      .get("/api/users/all")
      .set("Authorization", `Bearer ${adminToken}`)
    expect([200, 204]).toContain(res.statusCode)
  })

  test("🚫 Editor cannot access /api/users/all", async () => {
    const res = await request(app)
      .get("/api/users/all")
      .set("Authorization", `Bearer ${editorToken}`)
    expect(res.statusCode).toBe(403)
  })

  test("🚫 Normal user cannot access /api/users/all", async () => {
    const res = await request(app)
      .get("/api/users/all")
      .set("Authorization", `Bearer ${userToken}`)
    expect(res.statusCode).toBe(403)
  })
})
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500))
})
