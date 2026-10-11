"use client";

import { useState, type FormEvent } from "react";
import { Fa } from "@/components/icons";
import { notify } from "@/lib/notifications";
import { Checkbox, FormButton, InputField, Separator } from "./form";
import { NOT_AVAILABLE_MESSAGE } from "./validators";

const notAvailable = () => notify(NOT_AVAILABLE_MESSAGE, { level: "notice" });

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const isValid = email !== "" && password !== "";
  const isDefault = email === "" && password === "" && rememberMe;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      notify("Please fill in all fields", { level: "notice" });
      return;
    }
    notAvailable();
  };

  return (
    <div className="grid w-full grid-cols-1 justify-center gap-2 sm:w-80">
      <h3 className="flex place-items-center gap-[0.5em] p-0 text-[1em] text-sub">
        <Fa icon="sign-in-alt" />
        login
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <FormButton icon="google" label="Sign in with Google" onClick={notAvailable} />
        <FormButton icon="github" label="Sign in with GitHub" onClick={notAvailable} />
      </div>
      <form onSubmit={onSubmit} className="grid w-full gap-2">
        <Separator text="or" />
        <InputField name="email" value={email} onChange={setEmail} placeholder="email" autoComplete="current-email" />
        <InputField
          name="password"
          value={password}
          onChange={setPassword}
          placeholder="password"
          autoComplete="current-password"
          type="password"
        />
        <Checkbox name="rememberMe" label="remember me" checked={rememberMe} onChange={setRememberMe} />
        <FormButton type="submit" icon="sign-in-alt" text="sign in" disabled={isDefault || !isValid} />
      </form>
      <FormButton text="forgot password?" variant="text" className="justify-end text-xs" onClick={notAvailable} />
    </div>
  );
}
