

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET não definido");
}

if (!process.env.JWT_EXPIRES_IN) {
  console.warn("JWT_EXPIRES_IN não definido, usando valor padrão de 1 hora");
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiration: process.env.JWT_EXPIRES_IN || "1h",
};