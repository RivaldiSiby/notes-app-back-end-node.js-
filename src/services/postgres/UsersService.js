const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const NotFoundError = require("../../exceptions/NotFoundError");

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  //   fungsi pengecekan
  async vertifyNewUsername(username) {
    const query = {
      text: "SELECT * FROM users WHERE username = $1",
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError(
        "Gagal menambahkan user. Username sudah digunakan."
      );
    }
  }

  async addUser({ username, password, fullname }) {
    await this.vertifyNewUsername(username);

    //   data
    const id = `user-${nanoid(16)}`;
    const hashPassword = await bcrypt.hash(password, 10);

    const query = {
      text: "INSERT INTO users VALUES($1,$2,$3,$4) RETURNING id",
      values: [id, username, hashPassword, fullname],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("User Gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getUserById(userid) {
    const query = {
      text: "SELECT * FROM users WHERE id = $1",
      values: [userid],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return result.rows[0];
  }
}

module.exports = UsersService;