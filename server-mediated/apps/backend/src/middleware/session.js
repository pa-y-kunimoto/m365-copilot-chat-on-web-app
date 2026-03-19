import session from "express-session";

export function createSessionMiddleware(secret = "dev-secret") {
  return session({
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    },
  });
}
