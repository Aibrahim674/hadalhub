import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <SignIn routing="path" path="/auth/sign-in" />
    </main>
  );
}