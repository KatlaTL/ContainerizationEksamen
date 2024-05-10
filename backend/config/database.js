module.exports = {
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_DATABASE || "containerization",
  host: process.env.DB_HOSTNAME || "localhost",
  port: 3306,
  dialect: "mysql"
}
