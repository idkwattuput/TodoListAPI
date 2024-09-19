import db from "../database/db";

const findByEmail = async (email: string) => {
  const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return user.rows[0];
};

const findByRefreshToken = async (refreshToken: string) => {
  const user = await db.query("SELECT * FROM users WHERE refresh_token = $1", [
    refreshToken,
  ]);
  return user.rows[0];
};

const save = async (name: string, email: string, password: string) => {
  const newUser = await db.query(
    "INSERT INTO users (name, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, email, password, new Date(), new Date()],
  );
  return newUser.rows[0];
};

const updateRefresToken = async (refreshToken: string, userId: number) => {
  const updatedUser = await db.query(
    "UPDATE users SET refresh_token = $1 WHERE id = $2",
    [refreshToken, userId],
  );
  return updatedUser.rows[0];
};

export default { findByEmail, findByRefreshToken, save, updateRefresToken };
