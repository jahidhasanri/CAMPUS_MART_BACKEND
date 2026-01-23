async function run() {
  try {
    await client.connect();

    const userCollaction = client
      .db("campusmart")
      .collection("users");

    // POST user
    app.post("/users", async (req, res) => {
      const user = req.body;

      try {
        const isExist = await userCollaction.findOne({ email: user.email });

        if (isExist) {
          return res.status(200).send(isExist);
        }

        const result = await userCollaction.insertOne({
          name: user.name,
          email: user.email,
          image: user.image,
          role: "user",
        });

        res.status(201).send(result);
      } catch (err) {
        console.error("POST /users error:", err);
        res.status(500).send({ message: "server error" });
      }
    });

    // GET user
    app.get("/users", async (req, res) => {
      try {
        const { email } = req.query;
        const user = await userCollaction.findOne({ email });

        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }

        res.send(user);
      } catch (error) {
        console.error("GET /users error:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error(error);
  }
}
run();
