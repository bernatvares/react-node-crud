const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { User } = require("../modules/users/user.model");
const { Record } = require("../modules/records/record.model");
const apiRoutes = require("../routes");

const app = express();

describe("api", () => {
  beforeAll((done) => {
    const config = {
      mongoURL: "mongodb://localhost:27017/timezone-management",
      port: 4000,
    };

    mongoose.Promise = global.Promise;
    mongoose.connect(config.mongoURL, {
      useNewUrlParser: true,
    });

    app.use(bodyParser.json({ limit: "20mb" }));
    app.use(bodyParser.urlencoded({ limit: "20mb", extended: false }));
    app.use("/", apiRoutes);
    done();
  });

  beforeAll((done) => {
    User.deleteMany({ email: "testuser@test.com" }).then(() => {
      done();
    });
  });

  describe("auth", () => {
    test("should successfully register", () =>
      request(app)
        .post("/auth/signup")
        .send({
          email: "testuser@test.com",
          password: "test123456",
          passwordConfirm: "test123456",
          firstName: "test",
          lastName: "user",
        })
        .then((resp) => {
          expect(resp.statusCode).toBe(201);
        }));

    test("should successfully login with correct credentials", () =>
      request(app)
        .post("/auth/login")
        .send({
          email: "testuser@test.com",
          password: "test123456",
        })
        .then((resp) => {
          expect(resp.statusCode).toBe(200);
        }));
  });

  describe("Record", () => {
    let authToken = "";
    let userId = "";
    let currentRecordId = 0;

    const user = new User({
      firstName: "User1",
      lastName: "Test1",
      email: "testuser@test1.com",
      password: "test1234567",
      passwordConfirm: "test1234567",
      role: 0,
    });

    beforeAll((done) => {
      user.save().then((newUser) => {
        userId = newUser._id;
        authToken = `Bearer ${jwt.sign(
          { _id: newUser._id, role: newUser.role },
          "secret",
          {
            expiresIn: "30d",
          }
        )}`;
        done();
      });
    });

    afterAll((done) => {
      Record.deleteMany({ user: userId }).then(() => {
        User.deleteOne({ _id: userId }).then(() => {
          done();
        });
      });
    });

    test("should create record", () =>
      request(app)
        .post("/records/")
        .set("Authorization", authToken)
        .send({
          name: "CST Timezone",
          difference: -5,
          city: "Jackson",
        })
        .then((resp) => {
          currentRecordId = resp.body._id;
          expect(resp.statusCode).toBe(201);
        }));

    test("should get records list", () =>
      request(app)
        .get("/records/?page=1&limit=5")
        .set("Authorization", authToken)
        .then((resp) => {
          expect(resp.statusCode).toBe(200);
        }));

    test("should update record", () => {
      request(app)
        .put(`/records/${currentRecordId}`)
        .set("Authorization", authToken)
        .send({
          name: "PST",
        })
        .then((resp) => {
          expect(resp.statusCode).toBe(200);
          expect(resp.body.name).toBe("PST");
        });
    });

    test("should delete record", () =>
      request(app)
        .delete(`/records/${currentRecordId}`)
        .set("Authorization", authToken)
        .then((resp) => {
          expect(resp.statusCode).toBe(200);
        }));
  });
  afterAll((done) => {
    User.deleteMany({ email: "testuser@test.com" }).then(() => {
      mongoose.disconnect();
      done();
    });
  });

  afterAll(() => mongoose.disconnect());
});
