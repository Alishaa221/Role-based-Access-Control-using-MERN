import request from "supertest"
import app from "../server.js"  // export app instead of app.listen() in server.js
import jwt from "jsonwebtoken"

describe("Auth Middleware", () => {
  it("should reject requests without token", async () => {
    const res = await request(app).get("/api/users/all")
    expect(res.statusCode).toBe(401)
  })

  it("should reject requests with invalid token", async () => {
    const res = await request(app)
      .get("/api/users/all")
      .set("Authorization", "Bearer invalidtoken")
    expect(res.statusCode).toBe(403)
  })
})

describe("JWT generation", () => {
  it("should create a valid token", () => {
    const user = { id: "123", role: "admin" }
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" })
    expect(token).toBeDefined()
  })
})
afterAll(async () => {
  await new Promise((resolve) => setTimeout(() => resolve(), 500))
})
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500))
})
