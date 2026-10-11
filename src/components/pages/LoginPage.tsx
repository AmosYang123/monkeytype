import { Login } from "@/components/login/Login";
import { Register } from "@/components/login/Register";

export function LoginPage() {
  return (
    <main className="full-width content-grid">
      <div className="flex h-full flex-col items-center justify-around gap-4 md:flex-row">
        <Register />
        <Login />
      </div>
    </main>
  );
}
