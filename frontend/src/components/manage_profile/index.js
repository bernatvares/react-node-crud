import React, { useState } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import classnames from "classnames";
import { Formik, Form, Field } from "formik";
import _ from "lodash-es";
import {
  Button,
  Dialog,
  Intent,
  Classes,
  ProgressBar,
  FormGroup,
} from "@blueprintjs/core";
import * as Yup from "yup";
import { updateProfile, deleteProfile } from "store/actions/auth";
import { showToast } from "store/actions/toast";
import withToast from "hoc/withToast";
import { USER_FIELDS, ROLES } from "constants/index";
import { getClassNamespace } from "@blueprintjs/core/lib/esm/common/classes";

const ManageProfile = (props) => {
  const {
    updateProfile,
    deleteProfile,
    isOpen,
    toggleDialog,
    me,
    showToast,
  } = props;

  const fieldList = [
    "firstName",
    "lastName",
    "email",
    "password",
    "passwordConfirm",
  ];

  const validation = {};
  _.toPairs(_.pick(USER_FIELDS, fieldList)).map(
    (a) => (validation[a[0]] = _.get(a[1], "validate", null))
  );
  const validateSchema = Yup.object().shape(validation);

  const [isRemoveProfileOpen, toggleRemoveProfile] = useState(false);

  const onDeleteProfile = () => {
    deleteProfile({
      success: () => {
        showToast({
          message: "Your account was removed permanently and logged out!",
          intent: Intent.SUCCESS,
        });
        toggleRemoveProfile(false);
      },
      fail: (err) => {
        showToast({
          message: err.response.data.message,
          status: Intent.DANGER,
        });
        toggleRemoveProfile(false);
      },
    });
  };

  const handleSubmit = (values, actions) => {
    if (
      values["password"].includes("********") &&
      values["passwordConfirm"].includes("********")
    ) {
      values = _.omit(values, ["password, passwordConfirm"]);
    }
    updateProfile({
      body: values,
      success: () => {
        actions.setSubmitting(false);
        showToast({
          message: "Your profile has been updated!",
          intent: Intent.SUCCESS,
          timeout: 3000,
        });
        toggleDialog(false);
      },
      fail: (err) => {
        actions.setSubmitting(false);
        showToast({
          message: err.response.data.message,
          status: Intent.DANGER,
        });
        toggleDialog(false);
      },
    });
  };

  const initialValue = {};
  _.toPairs(_.pick(USER_FIELDS, fieldList)).map(
    (a) => (initialValue[a[0]] = _.get(me, a[0], ""))
  );
  initialValue["password"] = "********";
  initialValue["passwordConfirm"] = "********";

  return (
    <>
      <Button
        icon="user"
        className={Classes.MINIMAL}
        onClick={() => {
          toggleDialog(true);
        }}
      ></Button>
      <Dialog
        icon="edit"
        isOpen={isOpen}
        onClose={() => toggleDialog(false)}
        title="Edit Profile"
      >
        <div className={Classes.DIALOG_BODY}>
          <Formik
            onSubmit={handleSubmit}
            initialValues={initialValue}
            validationSchema={validateSchema}
          >
            {({ submitForm, isSubmitting, touched, errors }) => {
              return (
                <Form>
                  {fieldList.map((field, index) => {
                    return (
                      <FormGroup
                        helperText={touched[field] && errors[field]}
                        intent={
                          touched[field] && errors[field]
                            ? Intent.DANGER
                            : Intent.NONE
                        }
                        label={USER_FIELDS[field].form_label}
                        labelFor={USER_FIELDS[field].id}
                        key={index}
                      >
                        <Field
                          {...USER_FIELDS[field]}
                          intent={
                            touched[field] && errors[field]
                              ? Intent.DANGER
                              : Intent.NONE
                          }
                        />
                      </FormGroup>
                    );
                  })}
                  {isSubmitting && <ProgressBar />}
                  <br />
                  <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button text="Cancel" onClick={() => toggleDialog(false)} />
                    <Button
                      icon="edit"
                      intent={Intent.PRIMARY}
                      onClick={submitForm}
                      text="Save"
                    />
                    <br />
                  </div>
                  <div
                    className={classnames(
                      Classes.DIALOG_FOOTER_ACTIONS,
                      "pt-3"
                    )}
                  >
                    <Button
                      icon="delete"
                      intent={Intent.DANGER}
                      onClick={() => {
                        toggleRemoveProfile(true);
                      }}
                      text="Remove"
                    />
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </Dialog>
      <Dialog
        icon="trash"
        isOpen={isRemoveProfileOpen}
        onClose={() => toggleRemoveProfile(false)}
        title="Delete Record"
      >
        <div className={Classes.DIALOG_BODY}>
          Would you like to delete your account permanently?
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button text="Cancel" onClick={() => toggleRemoveProfile(false)} />
            <Button
              icon="trash"
              intent={Intent.DANGER}
              onClick={onDeleteProfile}
              text="Remove"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

const mapStateToProps = (state) => ({
  params: state.user.params,
  me: state.auth.me,
});

const mapDispatchToProps = {
  updateProfile: updateProfile,
  showToast: showToast,
  deleteProfile: deleteProfile,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  withToast(ManageProfile)
);
