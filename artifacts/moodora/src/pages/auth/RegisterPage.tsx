import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { Field } from "@/components/Field";
import { registerSchema, type RegisterInput } from "@/lib/auth-schema";
import { notify } from "@/stores/toast-store";
import { useUserStore } from "@/stores/user-store";
import { AuthLayout } from "./AuthLayout";

export function RegisterPage() {
  const [, go] = useLocation();
  const signIn = useUserStore((state) => state.signIn);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const submit = handleSubmit(({ name, email }) => {
    signIn({ email, name });
    notify("Account created.");
    go("/dashboard");
  });

  return (
    <AuthLayout
      windowTitle="New account"
      heading="Make it yours"
      text="Your account and projects are saved in this browser, not on a server."
      switchText="Already have an account?"
      switchLabel="Log in"
      switchHref="/login"
    >
      <form className="form" onSubmit={submit} noValidate>
        <Field
          label="Display name"
          autoComplete="name"
          placeholder="Your name"
          error={errors.name?.message}
          {...register("name")}
        />
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
          autoComplete="new-password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <button className="btn btn--primary btn--full" disabled={isSubmitting}>
          Create account
        </button>
      </form>
    </AuthLayout>
  );
}
