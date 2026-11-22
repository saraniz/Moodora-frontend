import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { Field } from "@/components/Field";
import { loginSchema, type LoginInput } from "@/lib/auth-schema";
import { notify } from "@/stores/toast-store";
import { useUserStore } from "@/stores/user-store";
import { AuthLayout } from "./AuthLayout";

export function LoginPage() {
  const [, go] = useLocation();
  const { user, signIn } = useUserStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(({ email }) => {
    // Coming back with the same email keeps the saved display name.
    const name = email === user.email ? user.name : email.split("@")[0];
    signIn({ email, name });
    notify("Logged in.");
    go("/dashboard");
  });

  return (
    <AuthLayout
      windowTitle="Log in"
      heading="Welcome back"
      text="This is a demo: any valid email and a password of 6 or more characters will work."
      switchText="New here?"
      switchLabel="Create account"
      switchHref="/register"
    >
      <form className="form" onSubmit={submit} noValidate>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <button className="btn btn--primary btn--full" disabled={isSubmitting}>
          Log in
        </button>
      </form>
    </AuthLayout>
  );
}
