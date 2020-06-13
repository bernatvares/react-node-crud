import { createAction } from "redux-actions";
import {
  SIGNIN,
  SIGNUP,
  UPDATE_PROFILE,
  SIGNOUT,
  DELETE_PROFILE,
} from "store/constants";

export const signin = createAction(SIGNIN);
export const signup = createAction(SIGNUP);
export const updateProfile = createAction(UPDATE_PROFILE);
export const deleteProfile = createAction(DELETE_PROFILE);

export const signout = createAction(SIGNOUT, () => {
  localStorage.removeItem("auth_token");
});

export default {
  signin,
  signup,
  deleteProfile,
  updateProfile,
  signout,
};
