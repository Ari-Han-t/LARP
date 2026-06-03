import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const session = await auth()
  
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <main className="z-10 max-w-3xl text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
          LARP.
        </h1>
        <p className="text-xl md:text-2xl text-neutral-400 font-medium">
          Convert casual daily updates into<br className="hidden md:block"/> LinkedIn-ready posts with minimal effort.
        </p>

        <div className="pt-8">
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/dashboard" })
            }}
          >
            <button
              type="submit"
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-neutral-100 px-8 font-medium text-neutral-950 transition-all hover:scale-105 active:scale-95"
            >
              <span className="mr-2">
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
              </span>
              Sign in with Google
            </button>
          </form>
        </div>
      </main>

      <footer className="absolute bottom-8 text-neutral-600 text-sm">
        Tell us what happened today. We'll handle the rest.
      </footer>
    </div>
  )
}
