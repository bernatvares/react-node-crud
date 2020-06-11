import {
  NumericInput,
  InputGroup,
  TextArea,
  TextField,
} from "formik-blueprint";
import * as Yup from "yup";
import moment from "moment";
import RadioInput from "components/radioinput";

export const DATE_FORMAT = "YYYY/MM/DD";

export const RECORD_FIELDS = {
  name: {
    label: "Timezone Name",
    form_label: "Name",
    placeholder: "Name (required)",
    id: "timezone-name",
    type: "text",
    name: "name",
    component: InputGroup,
    validate: Yup.string().required("Required"),
    large: true,
  },
  difference: {
    label: "Time difference to GMT. (Hours)",
    form_label: "Time difference to GMT. (Hours)",
    placeholder: "Hours (required)",
    id: "timezone-name",
    type: "text",
    name: "difference",
    component: NumericInput,
    validate: Yup.number()
      .min(-24, "Difference must be over -24!")
      .max(24, "Difference must be less than 24!")
      .required("Required"),
    initialValue: 0,
  },
  city: {
    label: "City",
    form_label: "City",
    placeholder: "City (required)",
    id: "city",
    type: "text",
    name: "city",
    component: InputGroup,
    validate: Yup.string().required("Required"),
    initialValue: "",
    large: true,
  },
};

export const USER_FIELDS = {
  firstName: {
    label: "First Name",
    form_label: "First Name",
    placeholder: "First Name (Required)",
    id: "firstName",
    type: "text",
    name: "firstName",
    component: InputGroup,
    validate: Yup.string().required("Required"),
    initialValue: "",
    large: true,
  },
  lastName: {
    label: "Last Name",
    form_label: "Last Name",
    placeholder: "Last Name (Required)",
    id: "lastName",
    type: "text",
    name: "lastName",
    component: InputGroup,
    validate: Yup.string().required("Required"),
    initialValue: "",
    large: true,
  },
  email: {
    label: "Email Address",
    form_label: "Email Address",
    placeholder: "Email (Required)",
    id: "email",
    type: "email",
    name: "email",
    component: InputGroup,
    validate: Yup.string()
      .email("Invalid email")
      .required("Required"),
    initialValue: "",
    large: true,
  },
  password: {
    label: "Password",
    form_label: "Password",
    placeholder: "Password (Required)",
    id: "password",
    type: "password",
    name: "password",
    component: InputGroup,
    validate: Yup.string()
      .min(8, "Length must be at least 8 letters!")
      .max(50, "Length must be less than 50 letters!")
      .required("Required"),
    initialValue: "",
    large: true,
  },
  passwordConfirm: {
    label: "Confirm Password",
    form_label: "Confirm Password",
    placeholder: "Password (Required)",
    id: "passwordConfirm",
    type: "password",
    name: "passwordConfirm",
    component: InputGroup,
    validate: Yup.string()
      .when("password", {
        is: (val) => (val && val.length > 0 ? true : false),
        then: Yup.string().oneOf(
          [Yup.ref("password")],
          "Both password need to be the same"
        ),
      })
      .min(8, "Length must be at least 8 letters!")
      .max(50, "Length must be less than 50 letters!")
      .required("Required"),
    initialValue: "",
    large: true,
  },
  role: {
    label: "Role",
    form_label: null,
    placeholder: "Role (Required)",
    id: "role",
    type: "text",
    name: "role",
    component: RadioInput,
    validate: null,
    initialValue: 0,
    inline: true,
  },
};

export const ROLES = {
  USER: 0,
  MANAGER: 1,
  ADMIN: 2,
};
