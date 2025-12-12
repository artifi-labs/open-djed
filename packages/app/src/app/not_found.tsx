import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center text-gray-800 dark:text-white">
      <h1 className="text-primary mb-4 text-6xl font-extrabold md:text-8xl">
        404
      </h1>
      <h2 className="mb-6 text-2xl font-bold md:text-4xl">Page Not Found</h2>
      <p className="mb-8 text-lg">
        Sorry, we couldn’t find the page you were looking for.
      </p>

      <Link
        href="/"
        className="bg-primary hover:bg-primary-hover rounded-lg px-6 py-3 text-base font-medium text-white shadow-md transition duration-150 ease-in-out"
      >
        Go back home
      </Link>
    </main>
  )
}
