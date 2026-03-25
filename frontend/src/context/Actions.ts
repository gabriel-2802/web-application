import { LoginAction, User } from "./Context";

export const LoginStart = (): LoginAction => ({
  type: "LOGIN_START",
});

export const LoginSuccess = (user: User, jwt: string): LoginAction => ({
  type: "LOGIN_SUCCESS",
  payload: {
    user,
    jwt,
  },
});

export const LoginFailure = (): LoginAction => ({
  type: "LOGIN_FAILURE",
});

export const Logout = (): LoginAction => ({
  type: "LOGOUT",
});
