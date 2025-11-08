import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { CharacterDashboard } from "./CharacterDashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <header className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm h-12 flex justify-between items-center border-b border-gray-700 shadow-sm px-3">
        <h2 className="text-base font-semibold text-gray-100">D&D 5e Character Manager</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-3">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Authenticated>
        <CharacterDashboard />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-100 mb-2">D&D 5e Character Manager</h1>
            <p className="text-sm text-gray-400">Sign in to manage your characters</p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
