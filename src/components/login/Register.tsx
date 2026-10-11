"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Fa } from "@/components/icons";
import { notify } from "@/lib/notifications";
import { FormButton, InputField, type FieldStatus } from "./form";
import { emailWarnings, NOT_AVAILABLE_MESSAGE, validateEmail, validateNewPassword, validateUsername } from "./validators";

type Values = {
  username: string;
  email: string;
  emailVerify: string;
  password: string;
  passwordVerify: string;
};
type Name = keyof Values;

const EMPTY: Values = { username: "", email: "", emailVerify: "", password: "", passwordVerify: "" };
const NAMES = Object.keys(EMPTY) as Name[];

function validate(v: Values): Record<Name, string[]> {
  return {
    username: validateUsername(v.username),
    email: validateEmail(v.email),
    emailVerify: v.emailVerify === v.email ? [] : ["verify email not matching email"],
    password: validateNewPassword(v.password),
    passwordVerify: v.passwordVerify === v.password ? [] : ["verify password not matching password"],
  };
}

export function Register() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Name, boolean>>>({});
  // username availability check is debounced 1s in the source; here every valid name is "available"
  const [checkedName, setCheckedName] = useState("");

  const errors = validate(values);
  const usernameValidating = errors.username.length === 0 && checkedName !== values.username;

  useEffect(() => {
    if (validateUsername(values.username).length > 0) return;
    const t = setTimeout(() => setCheckedName(values.username), 1000);
    return () => clearTimeout(t);
  }, [values.username]);

  const status = (name: Name): FieldStatus => ({
    validating: name === "username" && usernameValidating,
    touched: touched[name] === true,
    errors: errors[name],
    warnings: name === "email" && errors.email.length === 0 ? emailWarnings(values.email) : undefined,
    changed: values[name] !== "",
  });

  const isValid = NAMES.every((n) => errors[n].length === 0 && values[n] !== "") && !usernameValidating;
  const isDefault = NAMES.every((n) => values[n] === "");

  const field = (name: Name, placeholder: string, autoComplete: string, type?: "password") => (
    <InputField
      name={name}
      value={values[name]}
      onChange={(value) => setValues((prev) => ({ ...prev, [name]: value }))}
      onTouched={() => setTouched((prev) => ({ ...prev, [name]: true }))}
      placeholder={placeholder}
      autoComplete={autoComplete}
      type={type}
      status={status(name)}
    />
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      notify("Please fill in all fields", { level: "notice" });
      return;
    }
    notify(NOT_AVAILABLE_MESSAGE, { level: "notice" });
  };

  return (
    <div className="grid w-full grid-cols-1 justify-center gap-2 sm:w-80">
      <h3 className="flex place-items-center gap-[0.5em] p-0 text-[1em] text-sub">
        <Fa icon="user-plus" />
        register
      </h3>
      <form onSubmit={onSubmit} action="" autoComplete="off" className="grid w-full gap-2">
        {field("username", "username", "new-username")}
        {field("email", "email", "new-email")}
        {field("emailVerify", "verify email", "verify-email")}
        {field("password", "password", "new-password", "password")}
        {field("passwordVerify", "verify password", "verify-password", "password")}
        <FormButton type="submit" icon="user-plus" text="sign up" disabled={isDefault || !isValid} />
      </form>
    </div>
  );
}
